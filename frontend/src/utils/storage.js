
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
