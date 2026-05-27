from enum import Enum, auto
from typing import Dict, List, Optional
from pydantic import BaseModel

class PinType(Enum):
    POWER = auto()        # VCC, 5V, 3.3V, VIN
    GND = auto()          # Ground
    INPUT_DIGITAL = auto()
    OUTPUT_DIGITAL = auto()
    INPUT_ANALOG = auto()
    OUTPUT_ANALOG = auto()
    I2C_SDA = auto()
    I2C_SCL = auto()
    SPI_MISO = auto()
    SPI_MOSI = auto()
    SPI_SCK = auto()
    UART_TX = auto()
    UART_RX = auto()
    PWM = auto()          # Pulse Width Modulation
    PASSIVE = auto()      # Resistor/Capacitor/Inductor legs
    SWITCH = auto()       # Push button legs
    NC = auto()           # Not Connected
    UNKNOWN = auto()      # Fallback

class PinConstraints(BaseModel):
    pin_name: str
    pin_type: PinType
    alt_modes: List[PinType] = [] # For multiplexed pins (e.g. GPIO can be I2C/PWM)
    max_voltage: Optional[float] = None
    min_voltage: Optional[float] = None
    max_current_ma: Optional[float] = None  # Maximum safe current (source/sink)

class ComponentConstraints(BaseModel):
    component_type: str
    is_active: bool = True     # False for resistors, caps, switches
    is_inductive: bool = False # True for motors, relays, solenoids
    has_internal_flyback: bool = False
    is_protected_driver: bool = False # True for H-bridges/driver ICs that handle flyback
    has_internal_pullup: bool = False # True for sensors that usually include pull-ups
    operating_voltage_min: Optional[float] = None
    operating_voltage_max: Optional[float] = None
    pins: Dict[str, PinConstraints]

def build_kb() -> Dict[str, ComponentConstraints]:
    """
    Returns a hardcoded dictionary mapping component types to their physical constraints.
    In a full production system, this could be loaded from an external JSON/YAML.
    """
    kb = {}
    
    # --- Microcontrollers ---
    kb["esp32-devkit-v1"] = ComponentConstraints(
        component_type="esp32-devkit-v1",
        operating_voltage_min=3.0,
        operating_voltage_max=3.6,
        pins={
            "VIN": PinConstraints(pin_name="VIN", pin_type=PinType.POWER, max_voltage=12.0, min_voltage=5.0),
            "5V": PinConstraints(pin_name="5V", pin_type=PinType.POWER, max_voltage=5.5, min_voltage=4.5),
            "3V3": PinConstraints(pin_name="3V3", pin_type=PinType.POWER, max_voltage=3.6, min_voltage=3.0),
            "GND": PinConstraints(pin_name="GND", pin_type=PinType.GND),
            # GPIOs on ESP32 are highly multiplexed
            **{f"D{i}": PinConstraints(
                pin_name=f"D{i}", 
                pin_type=PinType.INPUT_DIGITAL, 
                alt_modes=[PinType.OUTPUT_DIGITAL, PinType.I2C_SDA, PinType.I2C_SCL, PinType.UART_TX, PinType.UART_RX, PinType.SPI_MOSI, PinType.SPI_MISO, PinType.SPI_SCK],
                max_voltage=3.6, 
                max_current_ma=12.0) 
               for i in [2,4,5,12,13,14,15,18,19,21,22,23,25,26,27,32,33,34,35]},
            "RX0": PinConstraints(pin_name="RX0", pin_type=PinType.UART_RX, alt_modes=[PinType.INPUT_DIGITAL], max_voltage=3.6),
            "TX0": PinConstraints(pin_name="TX0", pin_type=PinType.UART_TX, alt_modes=[PinType.OUTPUT_DIGITAL], max_voltage=3.6),
            "RX2": PinConstraints(pin_name="RX2", pin_type=PinType.UART_RX, alt_modes=[PinType.INPUT_DIGITAL], max_voltage=3.6),
            "TX2": PinConstraints(pin_name="TX2", pin_type=PinType.UART_TX, alt_modes=[PinType.OUTPUT_DIGITAL], max_voltage=3.6),
        }
    )

    kb["arduino-uno"] = ComponentConstraints(
        component_type="arduino-uno",
        operating_voltage_min=4.5,
        operating_voltage_max=5.5,
        pins={
            "Vin": PinConstraints(pin_name="Vin", pin_type=PinType.POWER, max_voltage=12.0, min_voltage=7.0),
            "5V": PinConstraints(pin_name="5V", pin_type=PinType.POWER, max_voltage=5.5, min_voltage=4.5),
            "3.3V": PinConstraints(pin_name="3.3V", pin_type=PinType.POWER, max_voltage=3.6, min_voltage=3.0),
            "GND": PinConstraints(pin_name="GND", pin_type=PinType.GND),
            "AREF": PinConstraints(pin_name="AREF", pin_type=PinType.INPUT_ANALOG),
            "RESET": PinConstraints(pin_name="RESET", pin_type=PinType.INPUT_DIGITAL),
            **{f"D{i}": PinConstraints(
                pin_name=f"D{i}", 
                pin_type=PinType.INPUT_DIGITAL, 
                alt_modes=[PinType.OUTPUT_DIGITAL, PinType.PWM] if i in [3,5,6,9,10,11] else [PinType.OUTPUT_DIGITAL],
                max_voltage=5.5, 
                max_current_ma=20.0) 
               for i in range(2, 14)},
            **{f"A{i}": PinConstraints(
                pin_name=f"A{i}", 
                pin_type=PinType.INPUT_ANALOG, 
                alt_modes=[PinType.INPUT_DIGITAL, PinType.I2C_SDA if i==4 else PinType.I2C_SCL if i==5 else PinType.NC],
                max_voltage=5.5) 
               for i in range(0, 6)},
            "RX0": PinConstraints(pin_name="RX0", pin_type=PinType.UART_RX, alt_modes=[PinType.INPUT_DIGITAL], max_voltage=5.5),
            "TX0": PinConstraints(pin_name="TX0", pin_type=PinType.UART_TX, alt_modes=[PinType.OUTPUT_DIGITAL], max_voltage=5.5),
        }
    )

    # --- Passives ---
    kb["resistor"] = ComponentConstraints(
        component_type="resistor",
        is_active=False,
        pins={
            "1": PinConstraints(pin_name="1", pin_type=PinType.PASSIVE),
            "2": PinConstraints(pin_name="2", pin_type=PinType.PASSIVE)
        }
    )
    
    kb["capacitor"] = ComponentConstraints(
        component_type="capacitor",
        is_active=False,
        pins={
            "+": PinConstraints(pin_name="+", pin_type=PinType.PASSIVE),
            "-": PinConstraints(pin_name="-", pin_type=PinType.PASSIVE)
        }
    )

    kb["diode"] = ComponentConstraints(
        component_type="diode",
        is_active=False,
        pins={
            "A": PinConstraints(pin_name="A", pin_type=PinType.PASSIVE),
            "K": PinConstraints(pin_name="K", pin_type=PinType.PASSIVE),
            "+": PinConstraints(pin_name="+", pin_type=PinType.PASSIVE),
            "-": PinConstraints(pin_name="-", pin_type=PinType.PASSIVE)
        }
    )

    # --- Power Sources ---
    kb["battery-9v"] = ComponentConstraints(
        component_type="battery-9v",
        operating_voltage_min=9.0,
        operating_voltage_max=9.0,
        pins={
            "VCC": PinConstraints(pin_name="VCC", pin_type=PinType.POWER, max_voltage=9.0),
            "GND": PinConstraints(pin_name="GND", pin_type=PinType.GND)
        }
    )
    
    # --- Modifiers ---
    kb["push-button"] = ComponentConstraints(
        component_type="push-button",
        is_active=False,
        pins={
            "1": PinConstraints(pin_name="1", pin_type=PinType.SWITCH),
            "2": PinConstraints(pin_name="2", pin_type=PinType.SWITCH)
        }
    )
    
    kb["led"] = ComponentConstraints(
        component_type="led",
        is_active=False,
        pins={
            "+": PinConstraints(pin_name="+", pin_type=PinType.INPUT_DIGITAL, max_voltage=3.0, max_current_ma=20.0),
            "-": PinConstraints(pin_name="-", pin_type=PinType.GND)
        }
    )

    # --- I2C Sensors & Modules ---
    for i2c_comp in ["mpu6050", "ssd1306", "lcd-i2c", "ds1307", "bme280", "tca9548a", "mfrc522"]:
        kb[i2c_comp] = ComponentConstraints(
            component_type=i2c_comp,
            operating_voltage_min=3.0,
            operating_voltage_max=5.5,
            has_internal_pullup=True,
            pins={
                "VCC": PinConstraints(pin_name="VCC", pin_type=PinType.POWER),
                "3.3V": PinConstraints(pin_name="3.3V", pin_type=PinType.POWER),
                "5V": PinConstraints(pin_name="5V", pin_type=PinType.POWER),
                "GND": PinConstraints(pin_name="GND", pin_type=PinType.GND),
                "SDA": PinConstraints(pin_name="SDA", pin_type=PinType.I2C_SDA),
                "SCL": PinConstraints(pin_name="SCL", pin_type=PinType.I2C_SCL),
                "SCK": PinConstraints(pin_name="SCK", pin_type=PinType.I2C_SCL)
            }
        )

    # --- Inductive Loads ---
    kb["relay-module"] = ComponentConstraints(
        component_type="relay-module",
        is_active=True,
        is_inductive=True,
        has_internal_flyback=True, # Modern modules usually have optical isolation + diode
        pins={
            "VCC": PinConstraints(pin_name="VCC", pin_type=PinType.POWER),
            "GND": PinConstraints(pin_name="GND", pin_type=PinType.GND),
            "IN":  PinConstraints(pin_name="IN", pin_type=PinType.INPUT_DIGITAL)
        }
    )

    kb["dc-motor"] = ComponentConstraints(
        component_type="dc-motor",
        is_active=False,
        is_inductive=True,
        has_internal_flyback=False, # Raw coils need diodes
        pins={
            "+": PinConstraints(pin_name="+", pin_type=PinType.POWER, max_current_ma=500.0),
            "-": PinConstraints(pin_name="-", pin_type=PinType.GND)
        }
    )
    
    kb["pir-motion"] = ComponentConstraints(
        component_type="pir-motion",
        has_internal_pullup=True,
        pins={
            "+": PinConstraints(pin_name="+", pin_type=PinType.POWER),
            "-": PinConstraints(pin_name="-", pin_type=PinType.GND),
            "D": PinConstraints(pin_name="D", pin_type=PinType.OUTPUT_DIGITAL)
        }
    )

    kb["solenoid"] = ComponentConstraints(
        component_type="solenoid",
        is_active=False,
        is_inductive=True,
        has_internal_flyback=False,
        pins={
            "+": PinConstraints(pin_name="+", pin_type=PinType.POWER, max_current_ma=1000.0),
            "-": PinConstraints(pin_name="-", pin_type=PinType.GND)
        }
    )

    # --- Motor Drivers ---
    for driver in ["l298n", "l293d"]:
        kb[driver] = ComponentConstraints(
            component_type=driver,
            is_protected_driver=True,
            pins={
                "VCC": PinConstraints(pin_name="VCC", pin_type=PinType.POWER),
                "GND": PinConstraints(pin_name="GND", pin_type=PinType.GND),
                **{f"IN{i}": PinConstraints(pin_name=f"IN{i}", pin_type=PinType.INPUT_DIGITAL) for i in range(1, 5)},
                **{f"OUT{i}": PinConstraints(pin_name=f"OUT{i}", pin_type=PinType.OUTPUT_ANALOG) for i in range(1, 5)}
            }
        )

    # Return the built dictionary
    return kb

KB = build_kb()
