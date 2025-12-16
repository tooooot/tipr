
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { styles } from '../styles/theme';
import { fetchAPI, getBotData } from '../utils/api';
import TradeCharts from '../components/TradeCharts';
import BottomNav from '../components/BottomNav';

export default function TradeDetails() {
    const { tradeId } = useParams();
    const navigate = useNavigate();
    const [bot, setBot] = useState(null);

    // Parse: botId_symbol_index
    const symbolMatch = tradeId?.match(/(\d+\.SR)/);
    let botId, symbol, tradeIndex;

    if (symbolMatch) {
        const symbolStart = tradeId.indexOf(symbolMatch[1]);
        botId = tradeId.substring(0, symbolStart - 1);
        const rest = tradeId.substring(symbolStart);
        const restParts = rest.split('_');
        symbol = restParts[0];
        tradeIndex = restParts.length > 1 ? parseInt(restParts[1]) : 0;
    } else {
        const parts = tradeId?.split('_') || [];
        botId = parts[0];
        symbol = parts.length > 2 ? `${parts[1]}.SR` : parts[1];
        tradeIndex = parts.length > 2 ? parseInt(parts[2]) : 0;
    }

    const data = getBotData(botId);
    const trade = data?.trades?.[tradeIndex] || data?.trades?.find(t => t.symbol === symbol);

    useEffect(() => {
        if (botId) {
            fetchAPI(`/api/bots/${botId}`).then(r => r?.data && setBot(r.data));
        }
    }, [botId]);

    if (!trade) {
        return <div style={{ ...styles.wrapper, color: 'white' }}>الصفقة غير موجودة</div>;
    }

    const entryPrice = trade.price || 45.20;
    const exitPrice = trade.exit_price || (entryPrice * 1.03).toFixed(2);
    const targetPrice = (entryPrice * 1.03).toFixed(2);
    const stopPrice = (entryPrice * 0.985).toFixed(2); // Example stop loss
    const isWin = trade.profit_pct > 0 || trade.result === 'win';
    const isClosed = trade.is_closed === true;
    const stockCode = (trade.symbol || symbol)?.replace('.SR', '') || '2222';

    // Indicators
    const entryIndicators = trade.entry_indicators || {};
    const rsiValue = entryIndicators.rsi?.value || 50;

    return (
        <div style={styles.wrapper}>
            <div style={styles.container}>
                <div style={styles.page}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: styles.gold, fontSize: '24px', cursor: 'pointer' }}>→</button>
                        <div style={{ flex: 1 }}>
                            <h1 style={{ fontSize: '20px', lineHeight: '1.4' }}>تفاصيل الصفقة</h1>
                            <p style={{ color: styles.gray, fontSize: '14px' }}>{symbol} • {bot?.name_ar || 'روبوت'}</p>
                        </div>
                    </div>

                    {/* Trade Info Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
                        <div style={{ background: '#334155', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                            <p style={{ color: styles.gray, fontSize: '11px', marginBottom: '4px' }}>سعر الدخول</p>
                            <p style={{ fontWeight: 'bold', color: 'white' }}>{entryPrice}</p>
                        </div>
                        <div style={{ background: '#334155', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                            <p style={{ color: styles.gray, fontSize: '11px', marginBottom: '4px' }}>الهدف</p>
                            <p style={{ fontWeight: 'bold', color: styles.green }}>{targetPrice}</p>
                        </div>
                        <div style={{ background: '#334155', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                            <p style={{ color: styles.gray, fontSize: '11px', marginBottom: '4px' }}>الوقف</p>
                            <p style={{ fontWeight: 'bold', color: styles.red }}>{stopPrice}</p>
                        </div>
                    </div>

                    {/* Charts Section */}
                    <TradeCharts
                        symbol={stockCode}
                        entryDate={trade.date}
                        exitDate={trade.exit_date}
                        entryPrice={entryPrice}
                        exitPrice={exitPrice}
                        targetPrice={targetPrice}
                        stopPrice={stopPrice}
                        botId={botId}
                    />

                    {/* Reason */}
                    <div style={{ ...styles.card, marginTop: '24px', borderRight: `4px solid ${styles.gold}` }}>
                        <h3 style={{ color: styles.gold, marginBottom: '12px' }}>🧠 لماذا دخل {bot?.name_ar || 'الروبوت'}؟</h3>
                        <p style={{ color: '#d1d5db', lineHeight: '1.8' }}>
                            {trade.reason_ar || `بناءً على استراتيجية ${bot?.strategy_ar || 'الفنية'}، ظهرت إشارة دخول قوية.`}
                        </p>
                    </div>

                </div>
                <BottomNav />
            </div>
        </div>
    );
}
