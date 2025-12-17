
const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function fetchAPI(endpoint) {
    try {
        const res = await fetch(`${API}${endpoint}`);
        return await res.json();
    } catch (e) {
        console.error('API Error:', e);
        return null;
    }
}

export async function fetchPOST(endpoint) {
    try {
        const res = await fetch(`${API}${endpoint}`, { method: 'POST' });
        return await res.json();
    } catch (e) {
        console.error('API Error:', e);
        return null;
    }
}
