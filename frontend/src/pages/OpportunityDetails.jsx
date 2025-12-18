import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { styles } from '../styles/theme';
import BottomNav from '../components/BottomNav';

export default function OpportunityDetails() {
    const { opportunityId } = useParams();
    const navigate = useNavigate();
    const [opportunity, setOpportunity] = useState(null);

    useEffect(() => {
        // Load opportunity from live_notifications.json
        import('../data/live_notifications.json')
            .then(data => {
                if (data.default) {
                    const found = data.default.find(o => o.id == opportunityId);
                    if (found) {
                        setOpportunity(found);
                    }
                }
            })
            .catch(err => console.error('Failed to load opportunity:', err));
    }, [opportunityId]);

    if (!opportunity) {
        return (
            <div style={styles.wrapper}>
                <div style={{ color: 'white', textAlign: 'center', padding: '40px' }}>
                    جاري التحميل...
                </div>
            </div>
        );
    }

    // Calculate levels
    const entryPrice = opportunity.price;
    const targetPrice = entryPrice * 1.08; // 8% target
    const stopLoss = entryPrice * 0.95; // 5% stop loss
    const risk = ((entryPrice - stopLoss) / entryPrice * 100).toFixed(1);
    const reward = ((targetPrice - entryPrice) / entryPrice * 100).toFixed(1);
    const riskReward = (reward / risk).toFixed(1);

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
                        <h1 style={{ fontSize: '18px', margin: 0, color: 'white' }}>توصية احترافية</h1>
                        <div style={{ width: '24px' }}></div>
                    </div>

                    {/* Opportunity Header */}
                    <div style={{
                        background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                        padding: '24px',
                        borderRadius: '24px',
                        marginBottom: '24px',
                        border: '1px solid #334155',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '8px' }}>{opportunity.emoji}</div>
                        <h2 style={{ fontSize: '24px', margin: '0 0 8px 0', color: styles.gold }}>{opportunity.stock_name}</h2>
                        <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>{opportunity.symbol}</div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>{opportunity.bot_name}</div>

                        {/* Signal Badge */}
                        <div style={{
                            padding: '12px 24px',
                            background: 'rgba(34, 197, 94, 0.1)',
                            borderRadius: '16px',
                            border: `1px solid ${styles.green}`,
                            display: 'inline-block'
                        }}>
                            <div style={{ fontSize: '16px', fontWeight: 'bold', color: styles.green }}>
                                {opportunity.signal}
                            </div>
                            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                                ثقة {opportunity.confidence}%
                            </div>
                        </div>
                    </div>

                    {/* Alert Box */}
                    <div style={{
                        background: styles.gold,
                        padding: '12px 16px',
                        borderRadius: '12px',
                        marginBottom: '24px',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#000' }}>
                            ⚠️ هذه توصية محتملة - لم يتم التنفيذ بعد
                        </div>
                    </div>

                    {/* RECOMMENDATION SECTION */}
                    <div style={{ marginBottom: '32px' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '16px'
                        }}>
                            <span style={{ fontSize: '20px' }}>📝</span>
                            <h3 style={{ fontSize: '18px', color: styles.gold, margin: 0 }}>
                                الخطة المقترحة
                            </h3>
                        </div>

                        {/* Price Levels */}
                        <div style={{
                            background: '#1e293b',
                            borderRadius: '16px',
                            padding: '16px',
                            border: '1px solid #334155',
                            marginBottom: '16px'
                        }}>
                            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '12px' }}>
                                📊 المستويات المقترحة
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
                                        {targetPrice.toFixed(2)}
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
                                        <div style={{ fontSize: '11px', color: 'white' }}>📍 الدخول المقترح</div>
                                        <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                                            السعر الحالي - ادخل الآن
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'white' }}>
                                        {entryPrice.toFixed(2)}
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
                                        {stopLoss.toFixed(2)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Risk/Reward */}
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
                                        {risk}%
                                    </div>
                                </div>
                                <div style={{ background: '#0f172a', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '4px' }}>العائد المتوقع</div>
                                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: styles.green }}>
                                        {reward}%
                                    </div>
                                </div>
                                <div style={{ background: '#0f172a', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '4px' }}>النسبة</div>
                                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: styles.gold }}>
                                        1:{riskReward}
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
                                📈 سبب التوصية
                            </div>
                            <div style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.7', marginBottom: '12px' }}>
                                {opportunity.reason}
                            </div>

                            {/* Indicators Badges */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                <div style={{
                                    background: '#1e293b',
                                    padding: '6px 10px',
                                    borderRadius: '8px',
                                    fontSize: '11px',
                                    border: '1px solid #334155'
                                }}>
                                    <span style={{ color: '#64748b' }}>Signal:</span>{' '}
                                    <span style={{ color: styles.green, fontWeight: 'bold' }}>
                                        {opportunity.signal}
                                    </span>
                                </div>
                                <div style={{
                                    background: '#1e293b',
                                    padding: '6px 10px',
                                    borderRadius: '8px',
                                    fontSize: '11px',
                                    border: '1px solid #334155'
                                }}>
                                    <span style={{ color: '#64748b' }}>Confidence:</span>{' '}
                                    <span style={{ color: styles.gold, fontWeight: 'bold' }}>{opportunity.confidence}%</span>
                                </div>
                                <div style={{
                                    background: '#1e293b',
                                    padding: '6px 10px',
                                    borderRadius: '8px',
                                    fontSize: '11px',
                                    border: '1px solid #334155'
                                }}>
                                    <span style={{ color: '#64748b' }}>Market:</span>{' '}
                                    <span style={{ color: 'white', fontWeight: 'bold' }}>
                                        {opportunity.market === 'saudi' ? '🇸🇦' :
                                            opportunity.market === 'us' ? '🇺🇸' : '🪙'}
                                    </span>
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

                            {/* Positive */}
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
                                    استمرار الزخم الصاعد نحو الهدف {targetPrice.toFixed(2)} مع تحقيق ربح {reward}%.
                                </div>
                            </div>

                            {/* Negative */}
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
                                    فشل كسر المقاومة. سيتم تفعيل وقف الخسارة عند {stopLoss.toFixed(2)} تلقائياً.
                                </div>
                            </div>
                        </div>

                        {/* Timing */}
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
                                        {opportunity.timestamp ? new Date(opportunity.timestamp).toLocaleString('ar-SA') : opportunity.time}
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

                        {/* Sources */}
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
                                    href={`https://www.tradingview.com/symbols/${opportunity.symbol}/`}
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
                                    href={`https://www.investing.com/search/?q=${opportunity.symbol}`}
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

                    {/* Info Box */}
                    <div style={{
                        background: 'rgba(59, 130, 246, 0.1)',
                        padding: '16px',
                        borderRadius: '16px',
                        border: '1px dashed #3b82f6',
                        marginBottom: '100px',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '12px', color: '#60a5fa', lineHeight: '1.7' }}>
                            💡 هذه توصية تعليمية. تأكد من إجراء بحثك الخاص قبل اتخاذ أي قرار استثماري.
                        </div>
                    </div>
                </div>
            </div>
            <BottomNav />
        </div>
    );
}
