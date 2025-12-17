
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { styles } from '../styles/theme';
import BottomNav from '../components/BottomNav';
import historyEventsData from '../data/history_events.json';

export default function HistoryPage() {
    const navigate = useNavigate();
    const [view, setView] = useState('awards'); // awards, legends
    const [events, setEvents] = useState({ awards: [], legends: [] });

    useEffect(() => {
        if (historyEventsData) {
            // Process Awards
            const awards = (historyEventsData.awards || []).map((a, i) => ({
                id: `award_${i}`,
                botId: a.bot_id,
                title: a.title_ar,
                description: a.description_ar,
                profit: a.profit,
                date: a.date,
                timestamp: new Date(a.date).getTime()
            })).sort((a, b) => b.timestamp - a.timestamp);

            // Process Legends
            const legends = (historyEventsData.legendary_trades || []).map((l, i) => ({
                id: `leg_${i}`,
                botId: l.bot_id,
                symbol: l.symbol,
                description: l.description_ar,
                profit: l.profit,
                date: l.date,
                timestamp: new Date(l.date).getTime()
            })).sort((a, b) => b.timestamp - a.timestamp);

            setEvents({ awards, legends });
        }
    }, []);

    const activeList = view === 'awards' ? events.awards : events.legends;

    return (
        <div style={styles.wrapper}>
            <div style={styles.container}>
                <div style={styles.page}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: styles.gold, fontSize: '32px', cursor: 'pointer' }}>→</button>
                        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>قاعة المشاهير 🏛️</h1>
                    </div>
                    <p style={{ color: styles.gray, marginBottom: '24px', fontSize: '14px' }}>
                        سجل الروبوتات الفائزة والصفقات التاريخية خلال العام الماضي.
                    </p>

                    {/* Toggle Switch */}
                    <div style={{
                        background: '#334155',
                        borderRadius: '12px',
                        padding: '4px',
                        display: 'flex',
                        marginBottom: '24px'
                    }}>
                        <button
                            onClick={() => setView('awards')}
                            style={{
                                flex: 1,
                                background: view === 'awards' ? styles.gold : 'transparent',
                                color: view === 'awards' ? '#0f172a' : '#94a3b8',
                                border: 'none', borderRadius: '8px', padding: '10px',
                                fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s'
                            }}
                        >
                            🏆 نجوم الأسبوع
                        </button>
                        <button
                            onClick={() => setView('legends')}
                            style={{
                                flex: 1,
                                background: view === 'legends' ? '#ef4444' : 'transparent',
                                color: view === 'legends' ? 'white' : '#94a3b8',
                                border: 'none', borderRadius: '8px', padding: '10px',
                                fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s'
                            }}
                        >
                            🔥 صفقات أسطورية
                        </button>
                    </div>

                    {/* Timeline Grid */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {activeList.map((item, i) => (
                            <div key={i} style={{
                                display: 'flex', gap: '16px',
                                opacity: 0,
                                animation: `fadeIn 0.5s ease-out ${i * 0.05}s forwards` // Staggered animation
                            }}>
                                {/* Date Column */}
                                <div style={{
                                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                                    minWidth: '60px', paddingTop: '8px'
                                }}>
                                    <span style={{ fontSize: '12px', color: styles.gray }}>{item.date}</span>
                                    <div style={{ width: '2px', flex: 1, background: '#334155', margin: '4px 0', minHeight: '30px' }}></div>
                                </div>

                                {/* Content Card */}
                                <div style={{
                                    flex: 1,
                                    background: '#1e293b',
                                    borderRadius: '16px',
                                    padding: '16px',
                                    border: view === 'awards' ? '1px solid #f59e0b' : '1px solid #ef4444',
                                    boxShadow: view === 'awards'
                                        ? '0 4px 15px rgba(245, 158, 11, 0.1)'
                                        : '0 4px 15px rgba(239, 68, 68, 0.15)',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    {/* Background Shine */}
                                    <div style={{
                                        position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%',
                                        background: `radial-gradient(circle, ${view === 'awards' ? 'rgba(245, 158, 11, 0.05)' : 'rgba(239, 68, 68, 0.05)'} 0%, transparent 70%)`
                                    }}></div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', position: 'relative' }}>
                                        <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: 'white' }}>
                                            {item.botId.replace('_', ' ')}
                                        </h3>
                                        <span style={{ fontSize: '24px' }}>{view === 'awards' ? '👑' : '🚀'}</span>
                                    </div>

                                    <p style={{ color: '#cbd5e1', fontSize: '14px', margin: '0 0 12px 0', lineHeight: '1.4' }}>
                                        {view === 'awards' ? item.title : `صفقة خيالية على ${item.symbol}`}
                                    </p>

                                    <div style={{
                                        display: 'inline-block',
                                        padding: '4px 12px',
                                        background: view === 'awards' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                        borderRadius: '8px',
                                        color: view === 'awards' ? styles.gold : '#fca5a5',
                                        fontWeight: 'bold',
                                        fontSize: '16px',
                                        direction: 'ltr'
                                    }}>
                                        +{item.profit}%
                                    </div>
                                </div>
                            </div>
                        ))}

                        {activeList.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '40px', color: styles.gray }}>
                                جاري استخراج البيانات من السجلات...
                            </div>
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
            `}</style>
        </div>
    );
}
