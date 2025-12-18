import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { styles } from '../styles/theme';
import BottomNav from '../components/BottomNav';

export default function OpportunitiesPage() {
    const navigate = useNavigate();
    const [opportunities, setOpportunities] = useState([]);
    const [lastUpdate, setLastUpdate] = useState('--:--:--');

    // Load opportunities from live_notifications.json
    useEffect(() => {
        const loadOpportunities = () => {
            try {
                import('../data/live_notifications.json')
                    .then(data => {
                        if (data.default && Array.isArray(data.default)) {
                            const opps = data.default
                                .filter(item => item.type === 'opportunity')
                                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                            setOpportunities(opps);
                            setLastUpdate(new Date().toLocaleTimeString('ar-SA'));
                        }
                    })
                    .catch(() => setOpportunities([]));
            } catch {
                setOpportunities([]);
            }
        };

        loadOpportunities();

        // Auto-refresh every 5 seconds for real-time feel
        const interval = setInterval(loadOpportunities, 5000);
        return () => clearInterval(interval);
    }, []);

    const getConfidenceColor = (confidence) => {
        if (confidence >= 80) return styles.green;
        if (confidence >= 70) return styles.gold;
        return '#f59e0b';
    };

    return (
        <div style={styles.wrapper}>
            <div style={styles.container}>
                <div style={styles.page}>
                    {/* Header */}
                    <div style={{
                        background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                        padding: '24px',
                        borderRadius: '16px',
                        marginBottom: '24px',
                        border: '1px solid #334155'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <span style={{ fontSize: '32px' }}>🚨</span>
                            <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>الفرص المباشرة</h1>
                        </div>
                        <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '12px' }}>
                            الروبوتات تفحص السوق كل 30 ثانية
                        </p>

                        {/* Live Indicator */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: '#0f172a',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            width: 'fit-content'
                        }}>
                            <div style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: styles.green,
                                animation: 'pulse 2s infinite'
                            }} />
                            <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                                آخر تحديث: {lastUpdate}
                            </span>
                        </div>
                    </div>

                    {/* Stats */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '12px',
                        marginBottom: '24px'
                    }}>
                        <div style={{ background: '#1e293b', padding: '16px', borderRadius: '16px', textAlign: 'center' }}>
                            <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>إجمالي الفرص</p>
                            <p style={{ fontSize: '28px', fontWeight: 'bold', color: styles.gold, margin: 0 }}>
                                {opportunities.length}
                            </p>
                        </div>
                        <div style={{ background: '#1e293b', padding: '16px', borderRadius: '16px', textAlign: 'center' }}>
                            <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>أحدث فرصة</p>
                            <p style={{ fontSize: '14px', fontWeight: 'bold', color: 'white', margin: 0 }}>
                                {opportunities[0]?.time || '--:--'}
                            </p>
                        </div>
                    </div>

                    {/* Opportunities List */}
                    {opportunities.length === 0 ? (
                        <div style={{
                            background: '#1e293b',
                            padding: '40px',
                            borderRadius: '16px',
                            textAlign: 'center',
                            border: '1px solid #334155'
                        }}>
                            <span style={{ fontSize: '64px', opacity: 0.5 }}>🔍</span>
                            <p style={{ color: '#94a3b8', marginTop: '16px', fontSize: '14px' }}>
                                لا توجد فرص حالياً...
                            </p>
                            <p style={{ color: '#64748b', fontSize: '12px', marginTop: '8px' }}>
                                يتم الفحص تلقائياً كل 30 ثانية
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {opportunities.map((opp, idx) => (
                                <div
                                    key={opp.id}
                                    onClick={() => navigate(`/bot/${opp.bot_id}`)}
                                    style={{
                                        background: '#1e293b',
                                        borderRadius: '16px',
                                        padding: '20px',
                                        border: `1px solid ${getConfidenceColor(opp.confidence)}`,
                                        cursor: 'pointer',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        opacity: 0,
                                        animation: `fadeIn 0.4s ease-out ${idx * 0.1}s forwards`
                                    }}
                                >
                                    {/* Glow Effect */}
                                    <div style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '4px',
                                        background: `linear-gradient(90deg, ${getConfidenceColor(opp.confidence)}, transparent)`
                                    }} />

                                    {/* Header */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        marginBottom: '12px'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ fontSize: '32px' }}>{opp.emoji}</span>
                                            <div>
                                                <p style={{
                                                    fontSize: '16px',
                                                    fontWeight: 'bold',
                                                    marginBottom: '4px',
                                                    color: 'white'
                                                }}>
                                                    {opp.stock_name}
                                                </p>
                                                <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
                                                    {opp.symbol}
                                                </p>
                                            </div>
                                        </div>

                                        <div style={{ textAlign: 'left' }}>
                                            <div style={{
                                                background: getConfidenceColor(opp.confidence) + '20',
                                                padding: '4px 12px',
                                                borderRadius: '8px',
                                                marginBottom: '4px'
                                            }}>
                                                <span style={{
                                                    fontSize: '14px',
                                                    fontWeight: 'bold',
                                                    color: getConfidenceColor(opp.confidence)
                                                }}>
                                                    {opp.confidence}% 🎯
                                                </span>
                                            </div>
                                            <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>
                                                {opp.time}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Bot Info */}
                                    <div style={{
                                        background: '#0f172a',
                                        padding: '12px',
                                        borderRadius: '12px',
                                        marginBottom: '12px'
                                    }}>
                                        <p style={{
                                            fontSize: '13px',
                                            color: styles.gold,
                                            marginBottom: '4px',
                                            fontWeight: 'bold'
                                        }}>
                                            🤖 {opp.bot_name}
                                        </p>
                                        <p style={{
                                            fontSize: '14px',
                                            color: '#cbd5e1',
                                            margin: 0,
                                            lineHeight: '1.5'
                                        }}>
                                            {opp.reason}
                                        </p>
                                    </div>

                                    {/* Signal Badge */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{
                                            background: 'rgba(34, 197, 94, 0.1)',
                                            padding: '8px 16px',
                                            borderRadius: '8px',
                                            border: '1px solid rgba(34, 197, 94, 0.3)'
                                        }}>
                                            <span style={{ fontSize: '14px', color: styles.green, fontWeight: 'bold' }}>
                                                📈 {opp.signal}
                                            </span>
                                        </div>

                                        <span style={{ fontSize: '12px', color: '#64748b' }}>
                                            اضغط للتفاصيل →
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Info Banner */}
                    <div style={{
                        background: 'rgba(139, 92, 246, 0.1)',
                        padding: '16px',
                        borderRadius: '12px',
                        marginTop: '24px',
                        border: '1px solid rgba(139, 92, 246, 0.3)'
                    }}>
                        <p style={{ fontSize: '13px', color: '#a78bfa', lineHeight: '1.6', margin: 0, textAlign: 'center' }}>
                            💡 <strong>كيف يعمل؟</strong> الروبوتات تفحص الأسعار تلقائياً وتكتشف الفرص بناءً على استراتيجياتها المتقدمة
                        </p>
                    </div>
                </div>
                <BottomNav />
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>
        </div>
    );
}
