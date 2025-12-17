
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { styles } from '../styles/theme';
import BottomNav from '../components/BottomNav';
import realTradesData from '../data/real_trades.json';
import historyEventsData from '../data/history_events.json'; // Import new history events

export default function ActivityPage() {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('all'); // all, buy, win, loss, award
    const [events, setEvents] = useState([]);

    useEffect(() => {
        let allEvents = [];

        // 1. Process Real Trades
        if (realTradesData) {
            const tradeEvents = realTradesData.map(t => ({
                id: t.id,
                bot: t.bot_id.replace('_', ' '),
                botId: t.bot_id,
                symbol: t.symbol,
                type: t.status === 'open' ? 'BUY' : (parseFloat(t.profit_pct) > 0 ? 'WIN' : 'LOSS'),
                price: t.status === 'open' ? t.entry_price : t.exit_price,
                profit: t.profit_pct,
                date: t.entry_date,
                timestamp: new Date(t.entry_date).getTime()
            }));
            allEvents = [...allEvents, ...tradeEvents];
        }

        // 2. Process History Awards & Milestones
        if (historyEventsData) {
            // Awards
            if (historyEventsData.awards) {
                const awardEvents = historyEventsData.awards.map((a, i) => ({
                    id: `award_${i}`,
                    bot: '',
                    botId: a.bot_id,
                    symbol: '🏆',
                    type: 'AWARD',
                    title: a.title_ar,
                    description: a.description_ar,
                    profit: a.profit,
                    date: a.date,
                    timestamp: new Date(a.date + '-01').getTime() // Approximation for sorting
                }));
                allEvents = [...allEvents, ...awardEvents];
            }

            // Legendary Trades
            if (historyEventsData.legendary_trades) {
                const legEvents = historyEventsData.legendary_trades.map((l, i) => ({
                    id: `leg_${i}`,
                    bot: '',
                    botId: l.bot_id,
                    symbol: '🔥',
                    type: 'LEGENDARY',
                    title: 'صفقة أسطورية',
                    description: `${l.description_ar} (${l.symbol})`,
                    profit: l.profit,
                    date: l.date,
                    timestamp: new Date(l.date).getTime()
                }));
                allEvents = [...allEvents, ...legEvents];
            }
        }

        // Sort by newness
        allEvents.sort((a, b) => b.timestamp - a.timestamp);
        setEvents(allEvents);
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
        if (type === 'AWARD') return '🏆';
        if (type === 'LEGENDARY') return '🔥';
        return '📢';
    };

    const getColor = (type) => {
        if (type === 'BUY') return styles.gold;
        if (type === 'WIN') return styles.green;
        if (type === 'LOSS') return styles.red;
        if (type === 'AWARD') return '#f59e0b'; // Amber
        if (type === 'LEGENDARY') return '#ef4444'; // Red-Orange
        return 'white';
    };

    return (
        <div style={styles.wrapper}>
            <div style={styles.container}>
                <div style={styles.page}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: styles.gold, fontSize: '32px', cursor: 'pointer' }}>→</button>
                        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>سجل الأحداث التاريخي</h1>
                    </div>

                    {/* Timeline */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {filteredEvents.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: styles.gray }}>
                                جاري تحميل السجل التاريخي...
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
                                        onClick={() => event.type === 'AWARD' ? null : navigate(`/trade/${event.botId}_${event.symbol}_${event.id}`)}
                                        style={{
                                            flex: 1,
                                            background: event.type === 'AWARD' ? 'linear-gradient(135deg, #451a03 0%, #1e293b 100%)' : '#1e293b',
                                            borderRadius: '16px', padding: '20px',
                                            border: event.type === 'AWARD' ? '2px solid #f59e0b' : '1px solid #334155',
                                            cursor: event.type === 'AWARD' ? 'default' : 'pointer',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span style={{ fontSize: '14px', color: styles.gray }}>{event.date}</span>
                                            {event.botId && <span style={{ fontSize: '14px', color: styles.gold, fontWeight: 'bold' }}>{event.botId}</span>}
                                        </div>

                                        {/* Title Logic */}
                                        <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 8px 0', color: 'white' }}>
                                            {event.type === 'BUY' ? 'تنفيذ عملية شراء جديدة' :
                                                event.type === 'WIN' ? 'إغلاق صفقة رابحة' :
                                                    event.type === 'LOSS' ? 'وقف خسارة' :
                                                        event.type === 'AWARD' ? event.title :
                                                            event.title}
                                        </h3>

                                        {/* Content Body */}
                                        {event.type === 'AWARD' || event.type === 'LEGENDARY' ? (
                                            // Award/Legendary Body
                                            <div>
                                                <p style={{ color: '#cbd5e1', fontSize: '14px', margin: '0 0 8px 0' }}>{event.description}</p>
                                                {event.profit && <span style={{ color: styles.green, fontWeight: 'bold', fontSize: '16px' }}>+{event.profit}% عوائد</span>}
                                            </div>
                                        ) : (
                                            // Regular Trade Body
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
                                        )}

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
