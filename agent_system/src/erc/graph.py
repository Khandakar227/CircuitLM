import json
import networkx as nx
import re
from typing import Dict, Any, List, Tuple
from src.erc.kb import KB, PinType

class CircuitGraph:
    def __init__(self, circuit_json: Dict[str, Any]):
        self.raw_data = circuit_json
        self.parts = {p["id"]: p for p in circuit_json.get("parts", [])}
        self.connections = circuit_json.get("connections", [])
        
        # Bi-partite graph: 
        # Nodes can be ComponentPins (e.g., "arduino:D2") OR Nets (e.g., "Net_1")
        self.G = nx.Graph()
        self._build_graph()

    def _parse_passive_value(self, attrs: Dict[str, Any]) -> float:
        """Attempt to extract numerical resistance/capacitance/inductance from string."""
        val_str = str(attrs.get("value", "0")).lower().replace(" ", "")
        
        # Simple regex to grab number and multiplier
        match = re.match(r"([0-9\.]+)([kmunp]?)", val_str)
        if not match:
            return 0.0
            
        number = float(match.group(1))
        multiplier = match.group(2)
        
        mult_map = {
            'k': 1e3,
            'm': 1e6,  # Mega or Milli depending on context, usually Mega for resistors
            'u': 1e-6,
            'n': 1e-9,
            'p': 1e-12
        }
        return number * mult_map.get(multiplier, 1.0)

    def _build_graph(self):
        # 1. Add all pins as nodes
        for part_id, part in self.parts.items():
            comp_type = part.get("type")
            kb_entry = KB.get(comp_type)
            
            # Use pins from KB if available, else derive from physical connections later
            if kb_entry:
                for pin_name, pin_data in kb_entry.pins.items():
                    node_id = f"{part_id}:{pin_name}"
                    self.G.add_node(
                        node_id, 
                        type="pin",
                        part_id=part_id,
                        comp_type=comp_type,
                        pin_rule=pin_data,
                        # Passives get their value mapped to the node data for pathfinding
                        value=self._parse_passive_value(part.get("attrs", {})) if not kb_entry.is_active else 0
                    )
            else:
                 self.G.add_node(part_id, type="unknown_component")
        
        # 2. Add nets (connections)
        for idx, conn in enumerate(self.connections):
            if len(conn) < 2:
                continue
            
            # Wires short pins together. We treat the connection array as a set of edges.
            endpoints = [pin for pin in conn if isinstance(pin, str) and ":" in pin]
            
            # Create a virtual "Net" node to represent the wire
            net_id = f"NET_{idx}"
            self.G.add_node(net_id, type="net")
            
            for pin in endpoints:
                # If a pin is in connections but not in our KB, add it blindly so graph doesnt break
                if not self.G.has_node(pin):
                    part_id = pin.split(":")[0]
                    self.G.add_node(pin, type="pin", part_id=part_id, pin_rule=None)
                
                # Add 0-weight edge between pin and the Net
                self.G.add_edge(pin, net_id, weight=0.0)

        # 3. Add internal component edges for Passive bridging
        # A resistor bridges Pin 1 to Pin 2. We need pathfinding algorithms to flow *through* it
        for part_id, part in self.parts.items():
            comp_type = part.get("type")
            kb_entry = KB.get(comp_type)
            
            if kb_entry and not kb_entry.is_active:
                # Add high-weight edge between all passive pins so graph traversal sees a path,
                # but knows it's highly resistive.
                passive_pins = [f"{part_id}:{p}" for p in kb_entry.pins.keys()]
                if len(passive_pins) == 2:
                    val = self._parse_passive_value(part.get("attrs", {}))
                    # Prevent zero division / 0-ohm shorts
                    weight = val if val > 0 else 0.001 
                    self.G.add_edge(passive_pins[0], passive_pins[1], weight=weight, type="internal_passive")

    def get_pins_of_type(self, target_type: PinType) -> List[str]:
        """Returns a list of node IDs that match a specific PinType (primary or alt)."""
        matches = []
        for n, data in self.G.nodes(data=True):
            if data.get("type") == "pin":
                rule = data.get("pin_rule")
                if rule:
                    capabilities = [rule.pin_type] + rule.alt_modes
                    if target_type in capabilities:
                        matches.append(n)
        return matches

    def get_components_of_type(self, comp_type: str) -> List[str]:
        """Returns a list of part_ids matching a component type."""
        return [part_id for part_id, part in self.parts.items() if part.get("type") == comp_type]
