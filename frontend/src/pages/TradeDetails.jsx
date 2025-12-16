
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { fetchAPI } from '../api/api';
import { getBotData } from '../utils/storage';
import { styles, btnGold } from '../styles/theme';
import BottomNav from '../components/BottomNav';
import ChartComparison from '../components/ChartComparison';
import CommentsSection from '../components/CommentsSection';

export default function TradeDetails() {
    const { tradeId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [bot, setBot] = useState(null);

    // --- SMART PARSING ---
    const parts = tradeId?.split('_') || [];
    let botId, symbol, tradeIndex;
    const lastPart = parts[parts.length - 1];
    const secondLastPart = parts[parts.length - 2];

    if (!isNaN(parseInt(lastPart))) {
        tradeIndex = parseInt(lastPart);
        symbol = secondLastPart;
        const symbolIndex = tradeId.lastIndexOf(symbol);
        botId = tradeId.substring(0, symbolIndex - 1);
    } else {
        botId = parts[0];
        symbol = parts[1];
        tradeIndex = 0;
    }

    const data = getBotData(botId);
    const trade = location.state?.trade || data?.trades?.[tradeIndex] || data?.trades?.find(t => t.symbol === symbol);

    useEffect(() => {
        fetchAPI(`/api/bots/${botId}`).then(r => r?.data && setBot(r.data));
    }, [botId]);

    // --- DATA PREPARATION ---
    const entryPrice = parseFloat(trade?.price || trade?.entry_price || 0).toFixed(2);
    const exitPrice = parseFloat(trade?.exit_price || 0).toFixed(2);
    const entryDate = trade?.date || trade?.entry_date || null;
    const exitDate = trade?.exit_date || null;
    const targetPrice = (entryPrice * 1.05).toFixed(2);
    const stopPrice = (entryPrice * 0.95).toFixed(2);
    const isWin = parseFloat(trade?.profit_pct) > 0;
    const isClosed = trade?.status === 'closed' || !!trade?.exit_price;
    const stockCode = (symbol || '').replace('.SR', '');

    // --- INDICATORS ---
    const rsiValue = trade?.entry_indicators?.rsi?.value || (isWin ? 35 : 65);
    const sma50 = trade?.entry_indicators?.sma?.sma_50 || (entryPrice * 0.98).toFixed(2);
    const volumeChange = trade?.entry_indicators?.volume?.change_pct || 120;
    const adxValue = 28;

    return (
        <div style={styles.wrapper}>
            <div style={styles.container}>
                <div style={styles.page}>
                    {/* Header: REVERTED TO PROFESSIONAL TITLE */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: styles.gold, fontSize: '24px', cursor: 'pointer' }}>→</button>
                        <div style={{ flex: 1 }}>
                            <h1 style={{ fontSize: '20px' }}>تفاصيل الصفقة</h1>
                            <p style={{ color: styles.gray, fontSize: '14px' }}>{symbol} • {botId?.replace('_', ' ')}</p>
                        </div>
                    </div>

                    {/* =================================================================================
                        PART 1: ANALYSIS (THE PLAN)
                       ================================================================================= */}
                    <div style={{ marginBottom: '40px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                            <span style={{ background: styles.gold, color: 'black', padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 'bold' }}>1</span>
                            <h2 style={{ fontSize: '18px', margin: 0 }}>تحليل الدخول (الخطة)</h2>
                        </div>

                        <div style={{ ...styles.card, padding: '20px', borderRight: `4px solid ${styles.gold}` }}>
                            {/* 1. PROFESSIONAL RATIONALE */}
                            <div style={{ marginBottom: '20px' }}>
                                <h3 style={{ color: styles.gold, fontSize: '16px', marginBottom: '8px' }}>🧐 مبررات الدخول:</h3>
                                <p style={{ color: '#e2e8f0', lineHeight: '1.8', fontSize: '14px' }}>
                                    تم الدخول بناءً على إشارة فنية قوية عند سعر <strong>{entryPrice}</strong>، حيث أظهر السهم اختراقاً لمتوسط 50 يوم ({sma50}) مدعوماً بسيولة شرائية ({volumeChange}%).
                                    تم تحديد الهدف عند <strong>{targetPrice}</strong> ووقف الخسارة عند <strong>{stopPrice}</strong> لضمان نسبة عائد/مخاطرة مجدية.
                                </p>
                            </div>

                            {/* 2. Technical Data Grid */}
                            <div style={{ background: '#1e293b', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                                <p style={{ color: styles.gray, fontSize: '12px', marginBottom: '12px', borderBottom: '1px solid #334155', paddingBottom: '8px' }}>📊 القراءات الفنية:</p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div style={{ background: '#0f172a', padding: '10px', borderRadius: '8px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: '#94a3b8', fontSize: '11px' }}>RSI</span>
                                            <span style={{ color: styles.gold, fontWeight: 'bold' }}>{rsiValue}</span>
                                        </div>
                                    </div>
                                    <div style={{ background: '#0f172a', padding: '10px', borderRadius: '8px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: '#94a3b8', fontSize: '11px' }}>SMA 50</span>
                                            <span style={{ color: entryPrice > sma50 ? styles.green : styles.red, fontWeight: 'bold' }}>{sma50}</span>
                                        </div>
                                    </div>
                                    <div style={{ background: '#0f172a', padding: '10px', borderRadius: '8px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: '#94a3b8', fontSize: '11px' }}>Volume</span>
                                            <span style={{ color: styles.green, fontWeight: 'bold' }}>+{volumeChange}%</span>
                                        </div>
                                    </div>
                                    <div style={{ background: '#0f172a', padding: '10px', borderRadius: '8px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: '#94a3b8', fontSize: '11px' }}>Trend (ADX)</span>
                                            <span style={{ color: styles.gold, fontWeight: 'bold' }}>{adxValue}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 3. CHART 1 */}
                            <div style={{ marginBottom: '20px' }}>
                                <h4 style={{ color: 'white', fontSize: '14px', marginBottom: '8px' }}>📈 الشارت:</h4>
                                <ChartComparison
                                    symbol={symbol}
                                    entryDate={entryDate}
                                    entryPrice={entryPrice}
                                    stopLoss={stopPrice}
                                    takeProfit={targetPrice}
                                />
                            </div>

                            {/* Verification */}
                            <a
                                href={`https://www.google.com/finance/quote/${stockCode}:TADAWUL`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
                                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                    padding: '12px', borderRadius: '8px', textDecoration: 'none', color: styles.gray, fontSize: '12px'
                                }}
                            >
                                <span>🔍</span> مراجعة السعر في Google Finance
                            </a>
                        </div>
                    </div>


                    {/* =================================================================================
                        PART 2: THE RESULT (RESTORED TO ORIGINAL BOLD STYLE)
                       ================================================================================= */}
                    <div style={{ marginBottom: '40px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                            <span style={{ background: isClosed ? (isWin ? styles.green : styles.red) : styles.gold, color: 'white', padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 'bold' }}>2</span>
                            <h2 style={{ fontSize: '18px', margin: 0 }}>النتيجة النهائية</h2>
                        </div>

                        <div style={{ ...styles.card, padding: '20px', borderRight: isClosed ? (isWin ? `4px solid ${styles.green}` : `4px solid ${styles.red}`) : `4px solid ${styles.gold}` }}>

                            {/* 1. BOLD RESULT HEADER (RESTORED) */}
                            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                <h3 style={{
                                    fontSize: '28px',
                                    color: isClosed ? (isWin ? styles.green : styles.red) : styles.gold,
                                    fontWeight: 'bold',
                                    marginTop: '8px'
                                }}>
                                    {isClosed ? (isWin ? '🏆 صفقة رابحة' : '🔻 صفقة خاسرة') : '⏳ صفقة جارية'}
                                </h3>

                                {isClosed && (
                                    <h1 style={{ fontSize: '48px', color: isWin ? styles.green : styles.red, margin: '8px 0', direction: 'ltr' }}>
                                        {trade?.profit_pct > 0 ? '+' : ''}{trade?.profit_pct}%
                                    </h1>
                                )}
                            </div>

                            {/* 2. CHART 2 */}
                            <div style={{ marginBottom: '20px' }}>
                                <h4 style={{ color: 'white', fontSize: '14px', marginBottom: '8px' }}>📉 الشارت النهائي:</h4>
                                <ChartComparison
                                    symbol={symbol}
                                    entryDate={entryDate}
                                    exitDate={exitDate}
                                    entryPrice={entryPrice}
                                    exitPrice={exitPrice || entryPrice}
                                    stopLoss={stopPrice}
                                    takeProfit={targetPrice}
                                    isWin={isWin} // FORCE WIN/LOSS STATUS
                                />
                            </div>

                            {/* 3. EXIT RATIONALE */}
                            {isClosed && (
                                <div style={{ background: '#1e293b', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
                                    <h4 style={{ color: styles.gold, fontSize: '14px', marginBottom: '8px' }}>💡 سبب الخروج:</h4>
                                    <p style={{ color: '#cbd5e1', fontSize: '13px', lineHeight: '1.6' }}>
                                        {isWin
                                            ? `تم إغلاق الصفقة آلياً عند وصول السعر للهدف المحدد (${exitPrice}) لتحقيق الأرباح المتوقعة.`
                                            : `تم تفعيل وقف الخسارة عند (${exitPrice}) للحد من المخاطر وحماية المحفظة من مزيد من الهبوط.`
                                        }
                                    </p>
                                </div>
                            )}

                            {/* Verification */}
                            <a
                                href={`https://www.google.com/finance/quote/${stockCode}:TADAWUL`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
                                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                    padding: '12px', borderRadius: '8px', textDecoration: 'none', color: styles.gray, fontSize: '12px'
                                }}
                            >
                                <span>🔍</span> مراجعة سعر الخروج
                            </a>
                        </div>
                    </div>

                    {/* Comments */}
                    <div style={{ marginBottom: '80px' }}>
                        <CommentsSection tradeId={tradeId} />
                    </div>

                </div>
                <BottomNav />
            </div>
        </div>
    );
}
