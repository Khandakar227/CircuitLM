from typing import List, Dict, Any, Optional, Set, Type
import networkx as nx
from src.erc.kb import KB, PinType
from src.erc.graph import CircuitGraph
from pydantic import BaseModel, Field

class ERCIssue(BaseModel):
    severity: str  # fatal_error, major_error, minor_error, warning
    message: str
    involved_nodes: List[str] = []

    def to_string(self) -> str:
        return f"{self.severity}: {self.message}"

class BaseChecker:
    """Base class for all ERC rules."""
    name: str = "BaseChecker"
    
    def check(self, graph: CircuitGraph) -> List[ERCIssue]:
        raise NotImplementedError

class CheckerRegistry:
    """Registry to manage and execute ERC checkers."""
    def __init__(self):
        self.checkers: List[BaseChecker] = []

    def register(self, checker: BaseChecker):
        self.checkers.append(checker)

    def run_all(self, graph: CircuitGraph) -> List[ERCIssue]:
        all_issues = []
        for checker in self.checkers:
            all_issues.extend(checker.check(graph))
        return all_issues

# --- Helper Functions ---

def get_galvanic_net(graph: CircuitGraph, start_node: str) -> set:
    """Returns a set of nodes connected to start_node by only 0-weight edges (wires)."""
    visited = {start_node}
    stack = [start_node]
    while stack:
        curr = stack.pop()
        for neighbor in graph.G.neighbors(curr):
            if neighbor not in visited:
                # Only traverse edges with 0 weight (actual wires)
                edge_data = graph.G.get_edge_data(curr, neighbor)
                if edge_data.get("weight", 0.0) == 0.0:
                    visited.add(neighbor)
                    stack.append(neighbor)
    return visited

# --- Checker Implementations ---

class ShortCircuitChecker(BaseChecker):
    name = "Short Circuit"
    
    def check(self, graph: CircuitGraph) -> List[ERCIssue]:
        issues = []
        power_pins = []
        gnd_pins = []
        
        for node, data in graph.G.nodes(data=True):
            if data.get("type") == "pin":
                rule = data.get("pin_rule")
                if rule:
                    if rule.pin_type == PinType.POWER:
                        power_pins.append(node)
                    elif rule.pin_type == PinType.GND:
                        gnd_pins.append(node)

        if not power_pins or not gnd_pins:
            return issues

        def is_zero_resistance(u, v):
            d = graph.G[u][v]
            return d.get('weight', 0.0) == 0.0

        zero_res_graph = nx.subgraph_view(graph.G, filter_edge=is_zero_resistance)
        components = list(nx.connected_components(zero_res_graph))
        
        for component in components:
            has_pwr = any(p in component for p in power_pins)
            has_gnd = any(g in component for g in gnd_pins)
            
            if has_pwr and has_gnd:
                for p_pin in [p_node for p_node in power_pins if p_node in component]:
                    for g_pin in [g_node for g_node in gnd_pins if g_node in component]:
                        try:
                            path = nx.shortest_path(zero_res_graph, source=p_pin, target=g_pin)
                            issues.append(ERCIssue(
                                severity="fatal_error",
                                message=f"Short circuit detected between {p_pin} and {g_pin}. Path: {' -> '.join(path)}",
                                involved_nodes=path
                            ))
                        except nx.NetworkXNoPath:
                            pass
        return issues

class MissingPassiveChecker(BaseChecker):
    name = "Missing Passives"
    
    def check(self, graph: CircuitGraph) -> List[ERCIssue]:
        issues = []
        for node, data in graph.G.nodes(data=True):
             if data.get("type") == "pin" and data.get("comp_type") == "led":
                plus_pin = f"{data['part_id']}:+"
                minus_pin = f"{data['part_id']}:-"
                
                if graph.G.has_node(plus_pin) and graph.G.has_node(minus_pin):
                    def hits_rail(start_pin, target_type):
                        for target, t_data in graph.G.nodes(data=True):
                            if t_data.get("type") == "pin" and getattr(t_data.get("pin_rule"), 'pin_type', None) == target_type:
                                try:
                                    path_weight = nx.shortest_path_length(graph.G, source=start_pin, target=target, weight='weight')
                                    if path_weight == 0.0:
                                        return True
                                except nx.NetworkXNoPath:
                                    pass
                        return False
                        
                    hits_pwr_directly = hits_rail(plus_pin, PinType.POWER) or hits_rail(plus_pin, PinType.OUTPUT_DIGITAL)
                    hits_gnd_directly = hits_rail(minus_pin, PinType.GND)

                    if hits_pwr_directly and hits_gnd_directly:
                         issues.append(ERCIssue(
                             severity="major_error",
                             message=f"LED {data['part_id']} is connected directly across a power/signal source and ground without a current-limiting resistor.",
                             involved_nodes=[plus_pin, minus_pin]
                         ))
        return issues

class LogicLevelChecker(BaseChecker):
    name = "Logic Levels"
    
    def check(self, graph: CircuitGraph) -> List[ERCIssue]:
        issues = []
        for out_node, out_data in graph.G.nodes(data=True):
            if out_data.get("type") == "pin" and getattr(out_data.get("pin_rule"), 'pin_type', None) == PinType.OUTPUT_DIGITAL:
                out_max_v = out_data.get("pin_rule").max_voltage or 5.0
                if out_node not in graph.G: continue
                    
                connected = nx.node_connected_component(graph.G, out_node)
                for in_node in connected:
                    if in_node == out_node: continue
                    in_data = graph.G.nodes[in_node]
                    if in_data.get("type") == "pin" and getattr(in_data.get("pin_rule"), 'pin_type', None) == PinType.INPUT_DIGITAL:
                        in_max_v = in_data.get("pin_rule").max_voltage
                        if in_max_v:
                            if out_max_v > in_max_v:
                                issues.append(ERCIssue(
                                    severity="major_error",
                                    message=f"Logic level mismatch. {out_node} ({out_max_v}V) driving {in_node} (Max {in_max_v}V).",
                                    involved_nodes=[out_node, in_node]
                                ))
                            elif out_max_v < 4.0 and in_max_v >= 4.5: # 3.3V driving 5V logic
                                issues.append(ERCIssue(
                                    severity="minor_error",
                                    message=f"Marginal logic level. {out_node} ({out_max_v}V) likely driving 5V logic {in_node} with 3.3V signal.",
                                    involved_nodes=[out_node, in_node]
                                ))
        return issues

class InductiveProtectionChecker(BaseChecker):
    name = "Inductive Protection"
    
    def check(self, graph: CircuitGraph) -> List[ERCIssue]:
        issues = []
        for part_id, part in graph.parts.items():
            comp_type = part.get("type")
            kb_entry = KB.get(comp_type)
            if kb_entry and kb_entry.is_inductive and not kb_entry.has_internal_flyback:
                pins = list(kb_entry.pins.keys())
                if len(pins) >= 2:
                    p1 = f"{part_id}:{pins[0]}"
                    p2 = f"{part_id}:{pins[1]}"
                    
                    found_protection = False
                    p1_net = get_galvanic_net(graph, p1)
                    p2_net = get_galvanic_net(graph, p2)
                    
                    # External Diode
                    for d_id, d_part in graph.parts.items():
                        if d_part.get("type") == "diode":
                            d_pins = [n for n in graph.G.nodes if graph.G.nodes[n].get("part_id") == d_id]
                            if len(d_pins) < 2: continue
                            if any(dp in p1_net for dp in d_pins) and any(dp in p2_net for dp in d_pins):
                                found_protection = True; break
                    
                    # Protected Driver
                    if not found_protection:
                        for n in p1_net.union(p2_net):
                            n_data = graph.G.nodes[n]
                            if n_data.get("type") == "pin":
                                c_kb = KB.get(n_data.get("comp_type"))
                                if c_kb and c_kb.is_protected_driver:
                                    found_protection = True; break

                    if not found_protection:
                        issues.append(ERCIssue(
                            severity="major_error",
                            message=f"Inductive load {part_id} ({comp_type}) is missing a flyback diode.",
                            involved_nodes=[p1, p2]
                        ))
        return issues

class ProtocolChecker(BaseChecker):
    name = "Protocols"
    
    def check(self, graph: CircuitGraph) -> List[ERCIssue]:
        issues = []
        
        def get_net_intended_type(galvanic_nodes: set) -> Optional[PinType]:
            for node in galvanic_nodes:
                node_data = graph.G.nodes[node]
                if node_data.get("type") == "pin" and node_data.get("pin_rule"):
                    rule = node_data["pin_rule"]
                    if rule.pin_type in [PinType.I2C_SDA, PinType.I2C_SCL, PinType.UART_TX, PinType.UART_RX, PinType.SPI_MOSI, PinType.SPI_MISO, PinType.SPI_SCK]:
                        if not rule.alt_modes: return rule.pin_type
            return None

        visited_nodes = set()
        for node, data in graph.G.nodes(data=True):
            if data.get("type") == "pin" and node not in visited_nodes:
                logical_net = get_galvanic_net(graph, node)
                visited_nodes.update(logical_net)
                intended_type = get_net_intended_type(logical_net)
                if not intended_type: continue
                
                # 1. Capability Validation
                for net_node in logical_net:
                    n_data = graph.G.nodes[net_node]
                    if n_data.get("type") == "pin" and n_data.get("pin_rule"):
                        rule = n_data["pin_rule"]
                        if rule.pin_type == PinType.PASSIVE: continue
                        if intended_type not in ([rule.pin_type] + rule.alt_modes):
                            issues.append(ERCIssue(
                                severity="major_error",
                                message=f"Protocol Mismatch. Net {node} inferred as {intended_type.name}, but {net_node} does not support it.",
                                involved_nodes=list(logical_net)
                            ))

                # 2. UART Pairing
                if intended_type == PinType.UART_TX:
                    if not any(graph.G.nodes[n].get("pin_rule") and (graph.G.nodes[n]["pin_rule"].pin_type == PinType.UART_RX or PinType.UART_RX in graph.G.nodes[n]["pin_rule"].alt_modes) for n in logical_net):
                        issues.append(ERCIssue(severity="warning", message=f"UART TX net {node} has no RX capability connected.", involved_nodes=list(logical_net)))

                # 3. I2C Pull-ups
                if intended_type in [PinType.I2C_SDA, PinType.I2C_SCL]:
                    has_pu = False
                    for cluster_node in nx.node_connected_component(graph.G, node):
                        if graph.G.nodes[cluster_node].get("comp_type") == "resistor":
                            res_id = graph.G.nodes[cluster_node]["part_id"]
                            other = f"{res_id}:2" if cluster_node.endswith(":1") else f"{res_id}:1"
                            if other in graph.G:
                                for pwr in graph.get_pins_of_type(PinType.POWER):
                                    if nx.has_path(graph.G, other, pwr) and nx.shortest_path_length(graph.G, other, pwr, weight='weight') == 0:
                                        has_pu = True; break
                        if has_pu: break
                    
                    if not has_pu:
                        if not any(KB.get(graph.G.nodes[n].get("comp_type")) and KB.get(graph.G.nodes[n]["comp_type"]).has_internal_pullup for n in logical_net):
                             issues.append(ERCIssue(severity="warning", message=f"I2C net {node} ({intended_type.name}) is likely missing a pull-up resistor.", involved_nodes=list(logical_net)))
        return issues

class FloatingInputChecker(BaseChecker):
    name = "Floating Inputs"
    
    def check(self, graph: CircuitGraph) -> List[ERCIssue]:
        issues = []
        processed = set()
        for node, data in graph.G.nodes(data=True):
            if data.get("type") == "pin" and data.get("pin_rule") and data.get("pin_rule").pin_type == PinType.SWITCH and node not in processed:
                logical_net = get_galvanic_net(graph, node)
                processed.update(logical_net)
                inputs = [n for n in logical_net if graph.G.nodes[n].get("pin_rule") and (graph.G.nodes[n]["pin_rule"].pin_type == PinType.INPUT_DIGITAL or PinType.INPUT_DIGITAL in graph.G.nodes[n]["pin_rule"].alt_modes) and graph.G.nodes[n].get("comp_type") != "push-button"]
                
                if inputs:
                    has_pull = False
                    for n in nx.node_connected_component(graph.G, node):
                        if graph.G.nodes[n].get("comp_type") == "resistor":
                            res_id = graph.G.nodes[n]["part_id"]
                            other = f"{res_id}:2" if n.endswith(":1") else f"{res_id}:1"
                            if other in graph.G:
                                for rail in (graph.get_pins_of_type(PinType.POWER) + graph.get_pins_of_type(PinType.GND)):
                                    if nx.has_path(graph.G, other, rail) and nx.shortest_path_length(graph.G, other, rail, weight='weight') == 0:
                                        has_pull = True; break
                        if has_pull: break
                    
                    if not has_pull:
                        for ip in inputs:
                            issues.append(ERCIssue(severity="major_error", message=f"Floating Input. {ip} connected to switch without pull-up/down.", involved_nodes=[ip]))
        return issues

class UnconnectedInputChecker(BaseChecker):
    name = "Unconnected Inputs"
    
    def check(self, graph: CircuitGraph) -> List[ERCIssue]:
        issues = []
        for node, data in graph.G.nodes(data=True):
            if data.get("type") == "pin" and data.get("pin_rule"):
                rule = data["pin_rule"]
                if rule.pin_type in [PinType.INPUT_DIGITAL, PinType.INPUT_ANALOG]:
                    # Silence warnings for unused pins on microcontrollers
                    comp_type = data.get("comp_type", "")
                    if "arduino" in comp_type.lower() or "esp32" in comp_type.lower() or "raspberry" in comp_type.lower():
                        continue
                        
                    # Check if the node has any neighbors in the graph
                    if graph.G.degree(node) == 0:
                        issues.append(ERCIssue(
                            severity="warning",
                            message=f"Floating Input. {node} ({rule.pin_type.name}) is not connected to any net.",
                            involved_nodes=[node]
                        ))
        return issues

class DecouplingCapacitorChecker(BaseChecker):
    name = "Decoupling Capacitors"
    
    def check(self, graph: CircuitGraph) -> List[ERCIssue]:
        issues = []
        for part_id, part in graph.parts.items():
            comp_type = part.get("type")
            kb_entry = KB.get(comp_type)
            
            if kb_entry and kb_entry.is_active:
                # Find power pins for this component
                pwr_pins = [f"{part_id}:{p_name}" for p_name, p_rule in kb_entry.pins.items() 
                            if p_rule.pin_type == PinType.POWER]
                gnd_pins = [f"{part_id}:{p_name}" for p_name, p_rule in kb_entry.pins.items() 
                            if p_rule.pin_type == PinType.GND]
                
                if not pwr_pins or not gnd_pins:
                    continue
                
                missing_pins = []
                for pwr_pin in pwr_pins:
                    if pwr_pin not in graph.G: continue
                    pwr_net = get_galvanic_net(graph, pwr_pin)
                    
                    found_decoupling = False
                    for gnd_pin in gnd_pins:
                        if gnd_pin not in graph.G: continue
                        gnd_net = get_galvanic_net(graph, gnd_pin)
                        
                        # Check for a capacitor bridging these nets
                        for node, data in graph.G.nodes(data=True):
                            if data.get("comp_type") == "capacitor":
                                cap_id = data.get("part_id")
                                cap_pins = [n for n in graph.G.nodes if graph.G.nodes[n].get("part_id") == cap_id]
                                if len(cap_pins) >= 2:
                                    if (any(cp in pwr_net for cp in cap_pins) and 
                                        any(cp in gnd_net for cp in cap_pins)):
                                        found_decoupling = True; break
                        if found_decoupling: break
                    
                    if not found_decoupling:
                        missing_pins.append(pwr_pin)
                
                if missing_pins:
                    issues.append(ERCIssue(
                        severity="warning",
                        message=f"Active component {part_id} ({comp_type}) might be missing a decoupling capacitor on power pin(s): {', '.join(missing_pins)}.",
                        involved_nodes=missing_pins
                    ))
        return issues

class SuboptimalValueChecker(BaseChecker):
    name = "Suboptimal Values"
    
    def check(self, graph: CircuitGraph) -> List[ERCIssue]:
        issues = []
        # 1. Check LED resistors
        for node, data in graph.G.nodes(data=True):
            if data.get("type") == "pin" and data.get("comp_type") == "led" and node.endswith(":+"):
                part_id = data["part_id"]
                # Traverse through the net to find a resistor
                net = get_galvanic_net(graph, node)
                for net_node in net:
                    for neighbor in graph.G.neighbors(net_node):
                        # Pin nodes carry the 'value' for passives
                        n_data = graph.G.nodes[neighbor]
                        if n_data.get("comp_type") == "resistor":
                            num_val = n_data.get("value", 0)
                            if 0 < num_val < 100:
                                issues.append(ERCIssue(
                                    severity="minor_error",
                                    message=f"Suboptimal resistor value for {part_id}. {num_val} ohms is too low, risks overcurrent.",
                                    involved_nodes=[part_id, n_data["part_id"]]
                                ))
        return issues

class RedundantPullupChecker(BaseChecker):
    name = "Redundant Pull-ups"
    
    def check(self, graph: CircuitGraph) -> List[ERCIssue]:
        issues = []
        for node, data in graph.G.nodes(data=True):
            if data.get("type") == "pin" and data.get("pin_rule"):
                comp_type = data.get("comp_type")
                kb_entry = KB.get(comp_type)
                if kb_entry and kb_entry.has_internal_pullup:
                    # Check if there is an external resistor to VCC on this net
                    net = get_galvanic_net(graph, node)
                    for net_node in net:
                        for neighbor in graph.G.neighbors(net_node):
                            n_data = graph.G.nodes[neighbor]
                            if n_data.get("comp_type") == "resistor":
                                # Found a resistor. Check if the other side goes to POWER.
                                res_id = n_data["part_id"]
                                other_pin = "2" if neighbor.endswith(":1") else "1"
                                other_node = f"{res_id}:{other_pin}"
                                if other_node in graph.G:
                                    other_net = get_galvanic_net(graph, other_node)
                                    if any(graph.G.nodes[on].get("pin_rule") and graph.G.nodes[on]["pin_rule"].pin_type == PinType.POWER for on in other_net):
                                        issues.append(ERCIssue(
                                            severity="minor_error",
                                            message=f"Redundant external pull-up resistor {res_id} for {data['part_id']}. Component already has internal pull-ups.",
                                            involved_nodes=[res_id, data['part_id']]
                                        ))
        return issues

class NetContentionChecker(BaseChecker):
    name = "Net Contention"
    
    def check(self, graph: CircuitGraph) -> List[ERCIssue]:
        issues = []
        visited_nodes = set()
        
        for node, data in graph.G.nodes(data=True):
            if data.get("type") == "pin" and node not in visited_nodes:
                logical_net = get_galvanic_net(graph, node)
                visited_nodes.update(logical_net)
                
                sources = []
                for net_node in logical_net:
                    n_data = graph.G.nodes[net_node]
                    if n_data.get("type") == "pin" and n_data.get("pin_rule"):
                        rule = n_data["pin_rule"]
                        capabilities = [rule.pin_type] + rule.alt_modes
                        if any(t in capabilities for t in [PinType.POWER, PinType.OUTPUT_DIGITAL]):
                            sources.append((net_node, rule))
                
                if len(sources) > 1:
                    # Check for conflicts
                    has_pwr = any(s[1].pin_type == PinType.POWER for s in sources)
                    has_out = any(s[1].pin_type == PinType.OUTPUT_DIGITAL for s in sources)
                    
                    pwr_sources = [s for s in sources if s[1].pin_type == PinType.POWER]
                    out_sources = [s for s in sources if s[1].pin_type == PinType.OUTPUT_DIGITAL]
                    
                    involved = [s[0] for s in sources]
                    
                    # 1. Power fighting GPIO
                    if has_pwr and has_out:
                        issues.append(ERCIssue(
                            severity="fatal_error",
                            message=f"Net contention: Power rail(s) {[s[0] for s in pwr_sources]} connected directly to GPIO output(s) {[s[0] for s in out_sources]}. This will cause damage when GPIO drives opposite to the rail.",
                            involved_nodes=involved
                        ))
                    
                    # 2. GPIO fighting GPIO
                    elif len(out_sources) > 1:
                        issues.append(ERCIssue(
                            severity="major_error",
                            message=f"Output contention: Multiple GPIO outputs {[s[0] for s in out_sources]} connected together. Driving them to different logic levels will cause high current/damage.",
                            involved_nodes=involved
                        ))
                        
                    # 3. Power fighting Power (different voltages)
                    elif len(pwr_sources) > 1:
                        voltages = set(s[1].max_voltage for s in pwr_sources if s[1].max_voltage is not None)
                        if len(voltages) > 1:
                            issues.append(ERCIssue(
                                severity="fatal_error",
                                message=f"Power contention: Different voltage rails {list(voltages)}V connected together ({[s[0] for s in pwr_sources]}).",
                                involved_nodes=involved
                            ))
        return issues

class RedundantConnectionChecker(BaseChecker):
    name = "Redundant Connections"
    
    def check(self, graph: CircuitGraph) -> List[ERCIssue]:
        issues = []
        # Check for same pin appearing multiple times in the same connection array
        for idx, conn in enumerate(graph.connections):
            endpoints = [pin for pin in conn if isinstance(pin, str) and ":" in pin]
            if len(endpoints) != len(set(endpoints)):
                duplicated = set([p for p in endpoints if endpoints.count(p) > 1])
                issues.append(ERCIssue(
                    severity="minor_error",
                    message=f"Redundant connection in net {idx}: Pins {duplicated} are connected to the same net multiple times.",
                    involved_nodes=list(duplicated)
                ))
        return issues

# --- Global Registry ---

def get_default_registry() -> CheckerRegistry:
    reg = CheckerRegistry()
    reg.register(ShortCircuitChecker())
    reg.register(MissingPassiveChecker())
    reg.register(LogicLevelChecker())
    reg.register(InductiveProtectionChecker())
    reg.register(ProtocolChecker())
    reg.register(FloatingInputChecker())
    reg.register(UnconnectedInputChecker())
    reg.register(DecouplingCapacitorChecker())
    reg.register(SuboptimalValueChecker())
    reg.register(RedundantPullupChecker())
    reg.register(NetContentionChecker())
    reg.register(RedundantConnectionChecker())
    return reg
