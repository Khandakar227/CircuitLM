import json
import os
import requests
from typing import Optional
from src.config import Config


class LLMClient:
    def __init__(self, api_key: Optional[str] = None):
        self.provider = Config.LLM_PROVIDER  # "openrouter" or "replicate"

        if self.provider == "replicate":
            # Set the env var that the replicate SDK reads automatically
            os.environ["REPLICATE_API_TOKEN"] = (
                api_key or Config.REPLICATE_API_KEY or ""
            )
            import replicate as _replicate  # lazy import
            self._replicate = _replicate
        else:
            self.api_key = api_key or Config.OPEN_ROUTER_API_KEY
            self.base_url = "https://openrouter.ai/api/v1/chat/completions"

    # ── Public interface (unchanged signature) ────────────────────────────────
    def generate(
        self,
        prompt: str,
        system_prompt: str = "",
        model_name: Optional[str] = None,
        temperature: float = 0,
        max_tokens: int = 65535,
    ) -> str:
        if not model_name:
            model_name = Config.LLM_MODELS[Config.DEFAULT_LLM]

        print(f"[{self.provider}] Using model: {model_name}")

        if self.provider == "replicate":
            return self._generate_replicate(
                prompt, system_prompt, model_name, temperature, max_tokens
            )
        return self._generate_openrouter(
            prompt, system_prompt, model_name, temperature, max_tokens
        )

    # ── OpenRouter (existing logic) ───────────────────────────────────────────
    def _generate_openrouter(
        self, prompt, system_prompt, model_name, temperature, max_tokens
    ) -> str:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": model_name,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "top_p": 1,
        }

        try:
            response = requests.post(
                self.base_url, headers=headers, data=json.dumps(payload)
            )
            response.raise_for_status()
            res_json = response.json()
            return res_json["choices"][0]["message"]["content"]
        except Exception as e:
            print(f"Error calling LLM (OpenRouter): {e}")
            raise

    # ── Replicate ─────────────────────────────────────────────────────────────
    def _generate_replicate(
        self, prompt, system_prompt, model_name, temperature, max_tokens
    ) -> str:
        # Replicate text models accept a flat `prompt` string.
        # Concatenate system + user with clear delimiters.
        full_prompt = prompt
        if system_prompt:
            full_prompt = (
                f"[SYSTEM INSTRUCTIONS]\n{system_prompt}\n\n"
                f"[USER REQUEST]\n{prompt}"
            )

        try:
            output = self._replicate.run(
                model_name,
                input={
                    "prompt": full_prompt,
                    "max_new_tokens": max_tokens,
                    "temperature": max(temperature, 0.01),  # replicate needs > 0
                    "top_p": 0.01,
                    "presence_penalty": 0,
                    "frequency_penalty": 0,
                },
            )
            # output is a streaming iterator of text chunks
            return "".join(str(chunk) for chunk in output)
        except Exception as e:
            print(f"Error calling LLM (Replicate): {e}")
            raise