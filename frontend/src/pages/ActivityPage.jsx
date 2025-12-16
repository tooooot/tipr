
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { styles } from '../styles/theme';
import BottomNav from '../components/BottomNav';
import realTradesData from '../data/real_trades.json';

export default function ActivityPage() {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('all'); // all, buy, win, loss
    const [events, setEvents] = useState([]);

    useEffect(() => {
        if (realTradesData) {
            // Process raw trades into "Events"
            const processed = realTradesData.map(t => ({
                id: t.id,
                bot: t.bot_id.replace('_', ' '),
                botId: t.bot_id,
                symbol: t.symbol,
                type: t.status === 'open' ? 'BUY' : (parseFloat(t.profit_pct) > 0 ? 'WIN' : 'LOSS'),
                price: t.status === 'open' ? t.entry_price : t.exit_price,
                profit: t.profit_pct,
                date: t.entry_date, // Using entry date for simplicity, ideally needs accurate timestamp
                timestamp: new Date(t.entry_date).getTime()
            }));

            // Sort by newness
            processed.sort((a, b) => b.timestamp - a.timestamp);
            setEvents(processed);
        }
    }, []);

    const filteredEvents = events.filter(e => {
        if (filter === 'all') return true;
        if (filter === 'buy') return e.type === 'BUY';
        if (filter === 'win') return e.type === 'WIN';
        if (filter === 'loss') return e.type === 'LOSS';
        return true;
    });

    const getIcon = (type) => {
        if (type === 'BUY') return '🛒';
        if (type === 'WIN') return '💰';
        if (type === 'LOSS') return '💸';
        return '📢';
    };

    const getColor = (type) => {
        if (type === 'BUY') return styles.gold;
        if (type === 'WIN') return styles.green;
        if (type === 'LOSS') return styles.red;
        return 'white';
    };

    return (
        <div style={styles.wrapper}>
            <div style={styles.container}>
                <div style={styles.page}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: styles.gold, fontSize: '32px', cursor: 'pointer' }}>→</button>
                        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>سجل الأحداث</h1>
                    </div>

                    {/* Filters */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
                        {['all', 'buy', 'win', 'loss'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '20px',
                                    border: `1px solid ${filter === f ? styles.gold : '#334155'}`,
                                    background: filter === f ? 'rgba(251, 191, 36, 0.1)' : 'transparent',
                                    color: filter === f ? styles.gold : '#94a3b8',
                                    fontSize: '14px', whiteSpace: 'nowrap'
                                }}
                            >
                                {f === 'all' ? 'الكل' : f === 'buy' ? 'شراء' : f === 'win' ? 'ربح' : 'خسارة'}
                            </button>
                        ))}
                    </div>

                    {/* Timeline */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {filteredEvents.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: styles.gray }}>
                                لا توجد أحداث لعرضها حالياً
                            </div>
                        ) : (
                            filteredEvents.map((event, i) => (
                                <div key={i} style={{ display: 'flex', gap: '16px' }}>
                                    {/* Timeline Line */}
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <div style={{
                                            width: '32px', height: '32px', borderRadius: '50%',
                                            background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            zIndex: 2, border: `2px solid ${getColor(event.type)}`
                                        }}>
                                            <span style={{ fontSize: '14px' }}>{getIcon(event.type)}</span>
                                        </div>
                                        {i !== filteredEvents.length - 1 && (
                                            <div style={{ width: '2px', flex: 1, background: '#334155', margin: '4px 0' }}></div>
                                        )}
                                    </div>

                                    {/* Content Card */}
                                    <div
                                        onClick={() => navigate(`/trade/${event.botId}_${event.symbol}_${event.id}`)}
                                        style={{
                                            flex: 1, background: '#1e293b', borderRadius: '16px', padding: '20px',
                                            border: '1px solid #334155', cursor: 'pointer',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span style={{ fontSize: '14px', color: styles.gray }}>{event.date}</span>
                                            <span style={{ fontSize: '14px', color: styles.gold, fontWeight: 'bold' }}>{event.bot}</span>
                                        </div>
                                        <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 8px 0', color: 'white' }}>
                                            {event.type === 'BUY' ? 'تنفيذ عملية شراء جديدة' : event.type === 'WIN' ? 'إغلاق صفقة رابحة' : 'وقف خسارة'}
                                        </h3>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{event.symbol}</span>
                                            {event.type === 'BUY' ? (
                                                <span style={{ color: 'white', fontSize: '16px' }}>سعر الدخول: <span style={{ fontWeight: 'bold' }}>{event.price}</span></span>
                                            ) : (
                                                <span style={{ color: event.profit >= 0 ? styles.green : styles.red, direction: 'ltr', fontWeight: 'bold', fontSize: '20px' }}>
                                                    {event.profit >= 0 ? '+' : ''}{event.profit}%
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
                <BottomNav />
            </div>
        </div>
    );
}
