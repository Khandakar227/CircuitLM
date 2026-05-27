from rapidfuzz import fuzz
from src.config import Config
from typing import List, Dict, Any

def fuzzy_search_component(query: str, component_library: Dict[str, Any]) -> List[Dict[str, Any]]:
    matches = []
    query = query.lower()
    for key, data in component_library.items():
        # Match against key
        key_score = fuzz.ratio(query, key.lower())

        # Match against aliases
        alias_scores = [
            fuzz.token_sort_ratio(query, alias.lower())
            for alias in data.get("aliases", [])
        ]
        best_alias_score = max(alias_scores, default=0)

        best_score = max(key_score, best_alias_score)

        if best_score >= Config.FUZZY_THRESHOLD:
            matches.append({
                "key": key,
                "score": best_score,
                "matched_on": "alias" if best_alias_score > key_score else "key",
                "component": data,
            })

    # Sort best-first
    matches.sort(key=lambda x: x["score"], reverse=True)
    return matches

def fuzzy_search_components(component_names: List[str], component_library: Dict[str, Any]) -> Dict[str, Any]:
    results_map = {}
    for c in component_names:
        results = fuzzy_search_component(c, component_library)
        if results:
            r = results[0]
            results_map[r['key']] = r['component']
    return results_map
