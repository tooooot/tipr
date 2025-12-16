
const API = 'http://localhost:8000';

export async function fetchAPI(endpoint) {
    try {
        const res = await fetch(`${API}${endpoint}`);
        return await res.json();
    } catch (e) {
        console.error('API Error:', e);
        return null;
    }
}

export async function fetchPOST(endpoint, body = {}) {
    try {
        const res = await fetch(`${API}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        return await res.json();
    } catch (e) {
        console.error('API Error:', e);
        return null;
    }
}

// ============ Storage ============
const STORAGE_KEY = 'tibr_simulation';

export function saveSimulation(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getSimulation() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null;
    } catch { return null; }
}

export function getBotData(botId) {
    const sim = getSimulation();
    return sim?.bot_portfolios?.[botId] || null;
}
