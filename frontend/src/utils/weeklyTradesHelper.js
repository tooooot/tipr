// Helper to group trades by market
export function groupTradesByMarket(trades) {
    const markets = {
        saudi: { name: 'السوق السعودي', emoji: '🇸🇦', trades: [] },
        us: { name: 'السوق الأمريكي', emoji: '🇺🇸', trades: [] },
        crypto: { name: 'الكريبتو', emoji: '🪙', trades: [] }
    };

    trades.forEach(trade => {
        const market = trade.market || 'us';
        if (markets[market]) {
            markets[market].trades.push(trade);
        }
    });

    // Calculate stats for each market
    Object.keys(markets).forEach(key => {
        const marketTrades = markets[key].trades;
        const totalProfit = marketTrades.reduce((sum, t) => sum + (t.profit_pct || 0), 0);
        const wins = marketTrades.filter(t => t.profit_pct > 0).length;

        markets[key].stats = {
            total: marketTrades.length,
            wins,
            losses: marketTrades.length - wins,
            winRate: marketTrades.length > 0 ? (wins / marketTrades.length) * 100 : 0,
            totalProfit: Math.round(totalProfit * 10) / 10,
            avgProfit: marketTrades.length > 0 ? Math.round((totalProfit / marketTrades.length) * 10) / 10 : 0
        };

        // Group by week within market
        markets[key].weeks = groupTradesByWeek(marketTrades);
    });

    return markets;
}

// Helper function to group trades by week
export function groupTradesByWeek(trades) {
    const weeks = {};

    trades.forEach(trade => {
        const date = new Date(trade.entry_date);
        const year = date.getFullYear();
        const week = getWeekNumber(date);
        const weekKey = `${year}-W${week.toString().padStart(2, '0')}`;

        if (!weeks[weekKey]) {
            weeks[weekKey] = {
                weekKey,
                year,
                weekNum: week,
                startDate: getMonday(date),
                trades: [],
                totalProfit: 0,
                wins: 0,
                losses: 0
            };
        }

        weeks[weekKey].trades.push(trade);
        weeks[weekKey].totalProfit += trade.profit_pct || 0;
        if (trade.profit_pct > 0) {
            weeks[weekKey].wins++;
        } else {
            weeks[weekKey].losses++;
        }
    });

    // Convert to array and sort by date (newest first)
    return Object.values(weeks)
        .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
        .map(week => ({
            ...week,
            winRate: week.trades.length > 0 ? (week.wins / week.trades.length) * 100 : 0,
            totalProfit: Math.round(week.totalProfit * 10) / 10
        }));
}

function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function getMonday(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
}

export function formatWeekRange(startDate) {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);

    const options = { month: 'short', day: 'numeric' };
    return `${start.toLocaleDateString('ar-SA', options)} - ${end.toLocaleDateString('ar-SA', options)}`;
}
