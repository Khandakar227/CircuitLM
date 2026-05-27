let cachedPins: Record<string, any> | null = null;
let fetchPromise: Promise<Record<string, any>> | null = null;
// Backend API endpoint
const BACKEND_API_URL = process.env.CIRCUIT_API_URL || "http://localhost:8000"

/**
 * Fetches the component library from the local Python API.
 * Caches the result so multiple calls don't trigger multiple requests.
 */
export async function fetchComponentPins(): Promise<Record<string, any>> {
    if (cachedPins) {
        return cachedPins;
    }

    if (fetchPromise) {
        return fetchPromise;
    }

    fetchPromise = fetch(`${BACKEND_API_URL}/components`)
        .then(async (res) => {
            if (!res.ok) {
                throw new Error(`Failed to fetch component library: ${res.statusText}`);
            }
            const json = await res.json();
            if (!json.success || !json.data) {
                throw new Error("Invalid response format from API");
            }
            cachedPins = json.data;
            return cachedPins!;
        })
        .catch((error) => {
            console.error("Error fetching component library:", error);
            // Fallback to empty if the API is unreachable so app doesn't crash completely.
            // A better approach is to show a global error state.
            return {};
        })
        .finally(() => {
            fetchPromise = null;
        });

    return fetchPromise;
}

/**
 * A handy hook for React components to use componentPins
 */
import { useState, useEffect } from 'react';

export function useComponentPins() {
    const [componentPins, setComponentPins] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchComponentPins()
            .then(data => {
                setComponentPins(data);
                setError(null);
            })
            .catch(err => {
                setError(err.message);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    return { componentPins, loading, error };
}
