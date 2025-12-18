import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { styles } from '../styles/theme';
import BottomNav from '../components/BottomNav';

export default function LiveEventsPage() {
    const navigate = useNavigate();
    const [opportunities, setOpportunities] = useState([]);
    const [filter, setFilter] = useState('all'); // all, high, medium, low

    useEffect(() => {
        // Load real opportunities from live_notifications.json
        import('../data/live_notifications.json')
            .then(data => {
                if (data.default) {
                    // Only show opportunities (not other event types)
                    const opps = data.default
                        .filter(item => item.type === 'opportunity')
                        .slice(0, 50); // Show latest 50
                    setOpportunities(opps);
                }
            })
            .catch(err => console.error('Failed to load opportunities:', err));
    }, []);

    const getConfidenceLevel = (conf) => {
        if (conf >= 80) return 'high';
        if (conf >= 70) return 'medium';
        return 'low';
    };

    const filteredOpportunities = filter === 'all'
        ? opportunities
        : opportunities.filter(o => getConfidenceLevel(o.confidence) === filter);

    const getConfidenceColor = (conf) => {
        if (conf >= 80) return styles.green;
        if (conf >= 70) return styles.gold;
        return '#94a3b8';
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
                            <span style={{ fontSize: '32px' }}>⚡</span>
                            <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>الفرص الحية</h1>
                        </div>
                        <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '12px' }}>
                            توصيات احترافية مكتشفة بواسطة الروبوتات
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
                                مباشر - {opportunities.length} فرصة
                            </span>
                        </div>
                    </div>

                    {/* Filters */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto' }}>
                        {[
                            { id: 'all', label: 'الكل', icon: '📊' },
                            { id: 'high', label: 'ثقة عالية', icon: '🔥' },
                            { id: 'medium', label: 'ثقة متوسطة', icon: '⭐' },
                            { id: 'low', label: 'ثقة منخفضة', icon: '💡' }
                        ].map(f => (
                            <button
                                key={f.id}
                                onClick={() => setFilter(f.id)}
                                style={{
                                    padding: '10px 16px',
                                    background: filter === f.id ? styles.gold : '#334155',
                                    color: filter === f.id ? '#0f172a' : '#cbd5e1',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontSize: '13px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {f.icon} {f.label}
                            </button>
                        ))}
                    </div>

                    {/* Opportunities List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '100px' }}>
                        {filteredOpportunities.length === 0 ? (
                            <div style={{
                                background: '#1e293b',
                                padding: '40px',
                                borderRadius: '16px',
                                textAlign: 'center'
                            }}>
                                <span style={{ fontSize: '48px', opacity: 0.5 }}>📭</span>
                                <p style={{ color: '#94a3b8', marginTop: '16px' }}>
                                    لا توجد فرص {filter !== 'all' && `بثقة "${filter}"`}
                                </p>
                            </div>
                        ) : (
                            filteredOpportunities.map((opp, idx) => (
                                <div
                                    key={opp.id}
                                    onClick={() => navigate(`/opportunity/${opp.id}`)}
                                    style={{
                                        background: '#1e293b',
                                        borderRadius: '16px',
                                        padding: '16px',
                                        border: '1px solid #334155',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        opacity: 0,
                                        animation: `fadeIn 0.3s ease-out ${idx * 0.05}s forwards`
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateX(-4px)';
                                        e.currentTarget.style.borderColor = styles.gold;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateX(0)';
                                        e.currentTarget.style.borderColor = '#334155';
                                    }}
                                >
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        {/* Icon */}
                                        <div style={{ fontSize: '40px' }}>{opp.emoji}</div>

                                        {/* Content */}
                                        <div style={{ flex: 1 }}>
                                            {/* Header */}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                                <div>
                                                    <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 4px 0', color: 'white' }}>
                                                        {opp.stock_name}
                                                    </h3>
                                                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                                                        {opp.symbol} • {opp.bot_name}
                                                    </div>
                                                </div>

                                                {/* Confidence Badge */}
                                                <div style={{
                                                    background: getConfidenceColor(opp.confidence) + '20',
                                                    border: `1px solid ${getConfidenceColor(opp.confidence)}`,
                                                    padding: '4px 10px',
                                                    borderRadius: '8px',
                                                    fontSize: '12px',
                                                    fontWeight: 'bold',
                                                    color: getConfidenceColor(opp.confidence)
                                                }}>
                                                    {opp.confidence}%
                                                </div>
                                            </div>

                                            {/* Signal */}
                                            <div style={{
                                                background: 'rgba(34, 197, 94, 0.1)',
                                                padding: '8px 12px',
                                                borderRadius: '8px',
                                                marginBottom: '8px',
                                                borderRight: `3px solid ${styles.green}`
                                            }}>
                                                <div style={{ fontSize: '12px', fontWeight: 'bold', color: styles.green, marginBottom: '4px' }}>
                                                    {opp.signal}
                                                </div>
                                                <div style={{ fontSize: '12px', color: '#cbd5e1' }}>
                                                    {opp.reason}
                                                </div>
                                            </div>

                                            {/* Price & Time */}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ fontSize: '14px', fontWeight: 'bold', color: styles.gold }}>
                                                    ${opp.price.toFixed(2)}
                                                </div>
                                                <div style={{ fontSize: '11px', color: '#64748b' }}>
                                                    {opp.time}
                                                </div>
                                            </div>

                                            {/* Click Hint */}
                                            <div style={{
                                                marginTop: '8px',
                                                fontSize: '11px',
                                                color: styles.gold,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                            }}>
                                                👉 اضغط لعرض التوصية الكاملة
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
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
