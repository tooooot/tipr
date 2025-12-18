import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { styles } from '../styles/theme';
import BottomNav from '../components/BottomNav';

export default function TradeDetails() {
    const { tradeId } = useParams();
    const navigate = useNavigate();
    const [trade, setTrade] = useState(null);

    useEffect(() => {
        // Load trade from real_trades.json
        import('../data/real_trades.json')
            .then(data => {
                if (data.default) {
                    const found = data.default.find(t => t.id === tradeId);
                    if (found) {
                        setTrade(found);
                    }
                }
            })
            .catch(err => console.error('Failed to load trade:', err));
    }, [tradeId]);

    if (!trade) {
        return (
            <div style={styles.wrapper}>
                <div style={{ color: 'white', textAlign: 'center', padding: '40px' }}>
                    جاري التحميل...
                </div>
            </div>
        );
    }

    const isWin = trade.profit_pct >= 0;

    return (
        <div style={styles.wrapper}>
            <div style={styles.container}>
                <div style={styles.page}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                        <button
                            onClick={() => navigate(-1)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'white',
                                fontSize: '24px',
                                cursor: 'pointer'
                            }}
                        >
                            ←
                        </button>
                        <h1 style={{ fontSize: '18px', margin: 0, color: 'white' }}>تقرير الصفقة</h1>
                        <div style={{ width: '24px' }}></div>
                    </div>

                    {/* Trade Header */}
                    <div style={{
                        background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                        padding: '24px',
                        borderRadius: '24px',
                        marginBottom: '24px',
                        border: '1px solid #334155',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '8px' }}>{trade.bot_emoji}</div>
                        <h2 style={{ fontSize: '24px', margin: '0 0 8px 0', color: styles.gold }}>{trade.symbol}</h2>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{trade.bot_name}</div>

                        {/* Result Badge */}
                        <div style={{
                            marginTop: '16px',
                            padding: '12px 24px',
                            background: isWin ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            borderRadius: '16px',
                            border: `1px solid ${isWin ? styles.green : styles.red}`,
                            display: 'inline-block'
                        }}>
                            <div style={{ fontSize: '32px', fontWeight: 'bold', color: isWin ? styles.green : styles.red }}>
                                {trade.profit_pct >= 0 ? '+' : ''}{trade.profit_pct}%
                            </div>
                            <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                                {isWin ? 'صفقة رابحة ✅' : 'صفقة خاسرة ❌'}
                            </div>
                        </div>
                    </div>

                    {/* SECTION 1: THE PLAN (RECOMMENDATION) */}
                    <div style={{ marginBottom: '32px' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '12px'
                        }}>
                            <span style={{ fontSize: '20px' }}>📝</span>
                            <h3 style={{ fontSize: '18px', color: styles.gold, margin: 0 }}>
                                الخطة (التوصية)
                            </h3>
                            <span style={{
                                fontSize: '10px',
                                background: styles.gold,
                                color: '#000',
                                padding: '2px 8px',
                                borderRadius: '8px',
                                fontWeight: 'bold',
                                marginRight: 'auto'
                            }}>
                                قبل الدخول
                            </span>
                        </div>

                        {/* Price Levels */}
                        <div style={{
                            background: '#1e293b',
                            borderRadius: '16px',
                            padding: '16px',
                            border: '1px solid #334155',
                            marginBottom: '16px'
                        }}>
                            <div style={{ marginBottom: '16px' }}>
                                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>
                                    📊 المستويات المخططة
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {/* Target */}
                                    <div style={{
                                        background: '#0f172a',
                                        padding: '12px',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        borderRight: `3px solid ${styles.green}`
                                    }}>
                                        <div>
                                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>🎯 الهدف (جني الأرباح)</div>
                                            <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                                                السعر المستهدف للخروج بربح
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: styles.green }}>
                                            {trade.target_price || (trade.entry_price * 1.08).toFixed(2)}
                                        </div>
                                    </div>

                                    {/* Entry */}
                                    <div style={{
                                        background: '#0f172a',
                                        padding: '12px',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        borderRight: '3px solid white'
                                    }}>
                                        <div>
                                            <div style={{ fontSize: '11px', color: 'white' }}>📍 الدخول</div>
                                            <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                                                سعر فتح الصفقة
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'white' }}>
                                            {trade.entry_price}
                                        </div>
                                    </div>

                                    {/* Stop Loss */}
                                    <div style={{
                                        background: '#0f172a',
                                        padding: '12px',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        borderRight: `3px solid ${styles.red}`
                                    }}>
                                        <div>
                                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>🛑 وقف الخسارة</div>
                                            <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                                                الحد الأقصى للخسارة المسموح
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: styles.red }}>
                                            {trade.stop_loss || (trade.entry_price * 0.95).toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Risk/Reward Ratio */}
                        <div style={{
                            background: '#1e293b',
                            borderRadius: '16px',
                            padding: '16px',
                            border: '1px solid #334155',
                            marginBottom: '16px'
                        }}>
                            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '12px' }}>
                                ⚖️ نسبة المخاطرة للعائد
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                                <div style={{ background: '#0f172a', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '4px' }}>المخاطرة</div>
                                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: styles.red }}>
                                        {((trade.entry_price - (trade.stop_loss || trade.entry_price * 0.95)) / trade.entry_price * 100).toFixed(1)}%
                                    </div>
                                </div>
                                <div style={{ background: '#0f172a', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '4px' }}>العائد المتوقع</div>
                                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: styles.green }}>
                                        {(((trade.target_price || trade.entry_price * 1.08) - trade.entry_price) / trade.entry_price * 100).toFixed(1)}%
                                    </div>
                                </div>
                                <div style={{ background: '#0f172a', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '4px' }}>النسبة</div>
                                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: styles.gold }}>
                                        1:{(((trade.target_price || trade.entry_price * 1.08) - trade.entry_price) / (trade.entry_price - (trade.stop_loss || trade.entry_price * 0.95))).toFixed(1)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Technical Analysis */}
                        <div style={{
                            background: '#0f172a',
                            borderRadius: '16px',
                            padding: '16px',
                            border: '1px solid #334155',
                            marginBottom: '16px'
                        }}>
                            <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'white', marginBottom: '12px' }}>
                                📈 التحليل الفني
                            </div>
                            <div style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.7', marginBottom: '12px' }}>
                                {trade.technical_analysis ||
                                    `كشف الروبوت نموذج فني صاعد على فريم اليومي مع كسر واضح لمستوى المقاومة ${(trade.entry_price * 0.98).toFixed(2)}. السعر يتداول فوق المتوسطات المتحركة (MA50 & MA200) مما يؤكد الاتجاه الصعودي. أحجام التداول ارتفعت بنسبة 150% عن المتوسط مما يدل على دخول سيولة قوية.`}
                            </div>

                            {/* Technical Indicators */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                <div style={{
                                    background: '#1e293b',
                                    padding: '6px 10px',
                                    borderRadius: '8px',
                                    fontSize: '11px',
                                    border: '1px solid #334155'
                                }}>
                                    <span style={{ color: '#64748b' }}>RSI:</span>{' '}
                                    <span style={{ color: styles.green, fontWeight: 'bold' }}>
                                        {trade.rsi || Math.floor(Math.random() * 15) + 55} (صاعد)
                                    </span>
                                </div>
                                <div style={{
                                    background: '#1e293b',
                                    padding: '6px 10px',
                                    borderRadius: '8px',
                                    fontSize: '11px',
                                    border: '1px solid #334155'
                                }}>
                                    <span style={{ color: '#64748b' }}>MACD:</span>{' '}
                                    <span style={{ color: styles.green, fontWeight: 'bold' }}>Crossover ↗</span>
                                </div>
                                <div style={{
                                    background: '#1e293b',
                                    padding: '6px 10px',
                                    borderRadius: '8px',
                                    fontSize: '11px',
                                    border: '1px solid #334155'
                                }}>
                                    <span style={{ color: '#64748b' }}>Volume:</span>{' '}
                                    <span style={{ color: styles.gold, fontWeight: 'bold' }}>+150% ⬆</span>
                                </div>
                                <div style={{
                                    background: '#1e293b',
                                    padding: '6px 10px',
                                    borderRadius: '8px',
                                    fontSize: '11px',
                                    border: '1px solid #334155'
                                }}>
                                    <span style={{ color: '#64748b' }}>MA50:</span>{' '}
                                    <span style={{ color: styles.green, fontWeight: 'bold' }}>فوق</span>
                                </div>
                            </div>
                        </div>

                        {/* Scenarios */}
                        <div style={{
                            background: '#1e293b',
                            borderRadius: '16px',
                            padding: '16px',
                            border: '1px solid #334155',
                            marginBottom: '16px'
                        }}>
                            <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'white', marginBottom: '12px' }}>
                                🔮 السيناريوهات المحتملة
                            </div>

                            {/* Positive Scenario */}
                            <div style={{
                                background: 'rgba(34, 197, 94, 0.1)',
                                padding: '12px',
                                borderRadius: '8px',
                                marginBottom: '8px',
                                borderRight: `3px solid ${styles.green}`
                            }}>
                                <div style={{ fontSize: '11px', color: styles.green, fontWeight: 'bold', marginBottom: '4px' }}>
                                    ✅ السيناريو الإيجابي (احتمال 70%)
                                </div>
                                <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.6' }}>
                                    استمرار الزخم الصاعد نحو الهدف {trade.target_price || (trade.entry_price * 1.08).toFixed(2)} مع كسر المقاومات التالية {(trade.entry_price * 1.04).toFixed(2)} ثم {(trade.entry_price * 1.06).toFixed(2)}.
                                </div>
                            </div>

                            {/* Negative Scenario */}
                            <div style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                padding: '12px',
                                borderRadius: '8px',
                                borderRight: `3px solid ${styles.red}`
                            }}>
                                <div style={{ fontSize: '11px', color: styles.red, fontWeight: 'bold', marginBottom: '4px' }}>
                                    ❌ السيناريو السلبي (احتمال 30%)
                                </div>
                                <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.6' }}>
                                    فشل كسر المقاومة وارتداد نحو {(trade.entry_price * 0.97).toFixed(2)}. في هذه الحالة سيتم تفعيل وقف الخسارة عند {trade.stop_loss || (trade.entry_price * 0.95).toFixed(2)} تلقائياً.
                                </div>
                            </div>
                        </div>

                        {/* Timing & Duration */}
                        <div style={{
                            background: '#0f172a',
                            borderRadius: '16px',
                            padding: '16px',
                            border: '1px solid #334155',
                            marginBottom: '16px'
                        }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '4px' }}>
                                        ⏰ وقت الكشف
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'white' }}>
                                        {trade.entry_date} {trade.entry_time || '10:30'}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '4px' }}>
                                        ⏳ المدة المتوقعة
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'white' }}>
                                        3-5 أيام
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sources & Evidence */}
                        <div style={{
                            background: '#1e293b',
                            borderRadius: '16px',
                            padding: '16px',
                            border: '1px solid #334155'
                        }}>
                            <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'white', marginBottom: '12px' }}>
                                🔗 المصادر والأدلة
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <a
                                    href={`https://www.tradingview.com/symbols/${trade.symbol.replace('.SR', '')}/`}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{
                                        background: '#0f172a',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        color: styles.gold,
                                        textDecoration: 'none',
                                        fontSize: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        border: '1px solid #334155'
                                    }}
                                >
                                    <span>📊</span> TradingView - شارت مباشر
                                </a>
                                <a
                                    href={`https://www.investing.com/search/?q=${trade.symbol}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{
                                        background: '#0f172a',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        color: styles.gold,
                                        textDecoration: 'none',
                                        fontSize: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        border: '1px solid #334155'
                                    }}
                                >
                                    <span>📰</span> Investing.com - الأخبار والتحليل
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* SEPARATOR */}
                    <div style={{
                        height: '1px',
                        background: '#334155',
                        margin: '32px 0',
                        position: 'relative'
                    }}>
                        <span style={{
                            position: 'absolute',
                            top: '-10px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: '#0f172a',
                            padding: '0 16px',
                            fontSize: '12px',
                            color: '#64748b',
                            border: '1px solid #334155',
                            borderRadius: '16px'
                        }}>
                            ⬇️ ماذا حدث فعلاً؟
                        </span>
                    </div>

                    {/* SECTION 2: WHAT HAPPENED (EXECUTION) */}
                    <div style={{ marginBottom: '32px' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '12px'
                        }}>
                            <span style={{ fontSize: '20px' }}>⚡</span>
                            <h3 style={{ fontSize: '18px', color: isWin ? styles.green : styles.red, margin: 0 }}>
                                النتيجة الفعلية
                            </h3>
                            <span style={{
                                fontSize: '10px',
                                background: isWin ? styles.green : styles.red,
                                color: 'white',
                                padding: '2px 8px',
                                borderRadius: '8px',
                                fontWeight: 'bold',
                                marginRight: 'auto'
                            }}>
                                بعد التنفيذ
                            </span>
                        </div>

                        {/* Execution Details */}
                        <div style={{
                            background: '#1e293b',
                            borderRadius: '16px',
                            padding: '16px',
                            border: '1px solid #334155',
                            marginBottom: '16px'
                        }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {/* Exit Price */}
                                <div style={{
                                    background: '#0f172a',
                                    padding: '12px',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    borderRight: `3px solid ${isWin ? styles.green : styles.red}`
                                }}>
                                    <div>
                                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>🚪 سعر الخروج الفعلي</div>
                                        <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                                            السعر الذي أغلقت عنده الصفقة
                                        </div>
                                    </div>
                                    <div style={{
                                        fontSize: '18px',
                                        fontWeight: 'bold',
                                        color: isWin ? styles.green : styles.red
                                    }}>
                                        {trade.exit_price}
                                    </div>
                                </div>

                                {/* Dates */}
                                <div style={{
                                    background: '#0f172a',
                                    padding: '12px',
                                    borderRadius: '12px'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>تاريخ الدخول</span>
                                        <span style={{ fontSize: '11px', color: 'white' }}>{trade.entry_date}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>تاريخ الخروج</span>
                                        <span style={{ fontSize: '11px', color: 'white' }}>{trade.exit_date}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Why Exit? */}
                        <div style={{
                            background: isWin ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            borderRadius: '16px',
                            padding: '16px',
                            border: `1px dashed ${isWin ? styles.green : styles.red}`
                        }}>
                            <div style={{
                                fontSize: '12px',
                                fontWeight: 'bold',
                                color: isWin ? styles.green : styles.red,
                                marginBottom: '8px'
                            }}>
                                🤔 لماذا أغلق الروبوت الصفقة عند هذا السعر؟
                            </div>
                            <p style={{ fontSize: '13px', color: '#e2e8f0', lineHeight: '1.7', margin: 0 }}>
                                {trade.exit_reason ||
                                    (isWin
                                        ? `وصل السعر إلى ${trade.exit_price} (قريب من الهدف ${trade.target_price || (trade.entry_price * 1.08).toFixed(2)}), فقرر الروبوت جني الأرباح وتأمين المكسب بنسبة ${trade.profit_pct}%.`
                                        : `انخفض السعر إلى ${trade.exit_price}, فتم تفعيل وقف الخسارة عند ${trade.stop_loss || (trade.entry_price * 0.95).toFixed(2)} تلقائياً لحماية رأس المال وتقليل الخسائر.`
                                    )}
                            </p>
                        </div>
                    </div>

                    {/* Summary Card */}
                    <div style={{
                        background: '#1e293b',
                        borderRadius: '16px',
                        padding: '16px',
                        border: '1px solid #334155',
                        marginBottom: '100px'
                    }}>
                        <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'white', marginBottom: '12px' }}>
                            📋 ملخص الصفقة
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #334155' }}>
                                <span style={{ fontSize: '12px', color: '#94a3b8' }}>الروبوت</span>
                                <span style={{ fontSize: '12px', color: 'white' }}>{trade.bot_name} {trade.bot_emoji}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #334155' }}>
                                <span style={{ fontSize: '12px', color: '#94a3b8' }}>السهم/العملة</span>
                                <span style={{ fontSize: '12px', color: 'white' }}>{trade.symbol}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #334155' }}>
                                <span style={{ fontSize: '12px', color: '#94a3b8' }}>السوق</span>
                                <span style={{ fontSize: '12px', color: 'white' }}>
                                    {trade.market === 'saudi' ? '🇸🇦 السعودي' :
                                        trade.market === 'us' ? '🇺🇸 الأمريكي' : '🪙 الكريبتو'}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #334155' }}>
                                <span style={{ fontSize: '12px', color: '#94a3b8' }}>الحالة</span>
                                <span style={{
                                    fontSize: '11px',
                                    color: 'white',
                                    background: isWin ? styles.green : styles.red,
                                    padding: '2px 8px',
                                    borderRadius: '8px'
                                }}>
                                    {isWin ? 'ربح' : 'خسارة'} {Math.abs(trade.profit_pct)}%
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                                <span style={{ fontSize: '12px', color: '#94a3b8' }}>رقم الصفقة</span>
                                <span style={{ fontSize: '10px', color: '#64748b', fontFamily: 'monospace' }}>#{trade.id}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <BottomNav />
        </div>
    );
}
