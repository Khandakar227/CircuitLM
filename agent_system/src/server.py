from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Dict, List, Any
from src.config import Config
from src.orchestrator import CircuitGenerator
from src.data.component_library import COMPONENT_LIBRARY
import time
import os
import json
import uvicorn

# Initialize FastAPI app
app = FastAPI(
    title="CircuitLM Generation API",
    description="REST API for AI-powered circuit generation",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store generator instances (can be optimized with caching)
generators = {}

# Pydantic models for request/response validation
class GenerateRequest(BaseModel):
    prompt: str = Field(..., description="Project idea or circuit description")
    model_id: str = Field(default="gemini", description="Model ID to use for generation")
    cot: bool = Field(default=False, description="Include chain of thoughts")
    eval: bool = Field(default=False, description="Include evaluation in output")
    save_output: bool = Field(default=False, description="Save output to file")
    output_path: Optional[str] = Field(default=None, description="Custom output path")

class EvaluateRequest(BaseModel):
    prompt: str = Field(default="", description="Original project idea or circuit description")
    schematic: Dict[str, Any] = Field(..., description="CircuitJSON schematic to evaluate")
    model_id: str = Field(default="deepseek", description="Generator to instantiate (the LLM judge always uses the configured eval model)")
    skip_llm: bool = Field(default=False, description="Skip the LLM-as-judge and run only deterministic ERC")

class HealthResponse(BaseModel):
    status: str
    service: str
    timestamp: float

class ModelsResponse(BaseModel):
    models: List[str]
    default: str
    description: str

class StatusResponse(BaseModel):
    loaded_models: List[str]
    active_models_count: int
    timestamp: float

class GenerateResponse(BaseModel):
    success: bool
    data: Dict[str, Any]
    metadata: Dict[str, Any]
    output_file: Optional[str] = None

class ErrorResponse(BaseModel):
    success: bool
    error: str
    timestamp: float

def get_generator(model_id: str = "deepseek") -> CircuitGenerator:
    """Get or create a CircuitGenerator instance for the given model_id"""
    if model_id not in generators:
        generators[model_id] = CircuitGenerator(model_id=model_id)
    return generators[model_id]

@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "CircuitLM Generation API",
        "timestamp": time.time()
    }

@app.post("/generate", response_model=GenerateResponse, tags=["Generation"])
def generate_circuit(request: GenerateRequest):
    """
    Generate circuit based on prompt
    
    - **prompt**: Project idea or circuit description (required)
    - **model_id**: Model ID to use (default: 'gemini')
    - **cot**: Include chain of thoughts (default: false)
    - **eval**: Include evaluation (default: false)
    - **save_output**: Save to file (default: false)
    - **output_path**: Custom output path (optional, auto-generated if not provided)
    """
    try:
        # Generate output path if not provided
        output_path = request.output_path or f"output/output_{time.time()}.json"
        
        # Get or create generator
        generator = get_generator(request.model_id)
        print(request)
        # Generate circuit
        if request.cot:
            result = generator.generate_circuit_pipeline(request.prompt, request.eval)
        else:
            result = generator.generate_circuit_no_cot_pipeline(request.prompt, request.eval)
        
        # Prepare output data
        output_data = {
            "user_prompt": request.prompt,
            "reasoning": result.get("reasoning", ""),
            "components": result.get("components", []),
            "schematic": result.get("schematic", "")
        }
        
        if request.eval and "evaluation" in result:
            output_data["evaluation"] = result["evaluation"]

        print(output_data.get("schematic", ""))

        # Prepare response
        response_data = {
            "success": True,
            "data": output_data,
            "metadata": {
                "components_count": len(result.get('components', [])),
                "matched_components_count": len(result.get('matched_components', [])),
                "model_id": request.model_id,
                "timestamp": time.time()
            }
        }
        
        # Save to file if requested
        if request.save_output:
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            with open(output_path, "w") as f:
                json.dump(output_data, f, indent=4)
            response_data["output_file"] = output_path
        
        return response_data
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "success": False,
                "error": str(e),
                "timestamp": time.time()
            }
        )

@app.post("/evaluate", response_model=GenerateResponse, tags=["Generation"])
def evaluate_circuit_endpoint(request: EvaluateRequest):
    """
    Evaluate an existing circuit schematic with the deterministic ERC engine
    and the LLM-as-a-judge meta-evaluator. Returns the evaluation report.

    - **schematic**: CircuitJSON to evaluate (required)
    - **prompt**: original request, used as context for the judge (optional)
    - **skip_llm**: run only deterministic ERC if true (default: false)
    """
    try:
        generator = get_generator(request.model_id)
        evaluation = generator.evaluate_circuit(
            request.prompt, request.schematic, skip_llm=request.skip_llm
        )
        return {
            "success": True,
            "data": {"evaluation": evaluation},
            "metadata": {
                "judge_model": Config.EVAL_LLM,
                "timestamp": time.time()
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "success": False,
                "error": str(e),
                "timestamp": time.time()
            }
        )

@app.get("/models", response_model=ModelsResponse, tags=["Info"])
async def list_models():
    """
    List available models for circuit generation
    """
    return {
        "models": ["deepseek", "gpt", "gemini"],
        "default": "deepseek",
        "description": "Available model IDs for circuit generation"
    }

@app.get("/components", tags=["Info"])
async def get_components():
    """
    Returns the full component library with pin definitions, dimensions, and specs.
    """
    return {
        "success": True,
        "data": COMPONENT_LIBRARY,
        "count": len(COMPONENT_LIBRARY)
    }

@app.get("/generate/status", response_model=StatusResponse, tags=["Info"])
async def get_status():
    """
    Get current server status and loaded models
    """
    return {
        "loaded_models": list(generators.keys()),
        "active_models_count": len(generators),
        "timestamp": time.time()
    }

def main(host: str = '0.0.0.0', port: int = 8000, reload: bool = False):
    """
    Start the FastAPI server using uvicorn
    
    Args:
        host: Host address (default: '0.0.0.0')
        port: Port number (default: 8000)
        reload: Auto-reload on code changes (default: False)
    """
    print(f"🚀 Starting CircuitLM Server with FastAPI...")
    print(f"📡 Server running on http://{host}:{port}")
    print(f"📖 API Documentation available at:")
    print(f"   - Swagger UI: http://{host}:{port}/docs")
    print(f"   - ReDoc: http://{host}:{port}/redoc")
    print(f"📍 Available endpoints:")
    print(f"   - GET  /health - Health check")
    print(f"   - POST /generate - Generate circuit")
    print(f"   - POST /evaluate - Evaluate a circuit (ERC + LLM judge)")
    print(f"   - GET  /models - List available models")
    print(f"   - GET  /generate/status - Server status")
    
    # Ensure output directory exists
    os.makedirs("output", exist_ok=True)
    
    uvicorn.run(
        "src.server:app",
        host=host,
        port=port,
        reload=reload
    )

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="CircuitLM Server - REST API for Circuit Generation")
    parser.add_argument("--host", type=str, default="0.0.0.0", help="Host address (default: 0.0.0.0)")
    parser.add_argument("--port", type=int, default=8000, help="Port number (default: 8000)")
    parser.add_argument("--reload", action="store_true", help="Enable auto-reload on code changes")
    
    args = parser.parse_args()
    main(host=args.host, port=args.port, reload=args.reload)
