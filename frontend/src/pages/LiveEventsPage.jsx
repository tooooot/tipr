import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { styles } from '../styles/theme';
import BottomNav from '../components/BottomNav';

export default function LiveEventsPage() {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [filter, setFilter] = useState('all'); // all, scans, trades, opportunities

    useEffect(() => {
        // Simulate live events - In production, this would come from backend
        const generateEvents = () => {
            const currentTime = new Date();
            const newEvents = [
                {
                    id: Date.now() + '_scan',
                    type: 'scan',
                    robot: 'al_qannas',
                    robotName: 'القناص',
                    emoji: '🎯',
                    message: 'يفحص 28 سهم... RSI طبيعي (45-60)',
                    time: currentTime.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                    timestamp: currentTime.getTime()
                },
                {
                    id: Date.now() + '_opportunity',
                    type: 'opportunity',
                    robot: 'al_maestro',
                    robotName: 'المايسترو',
                    emoji: '🎭',
                    message: '🚨 اكتشف فرصة في NVDA - زخم قوي +3.2%',
                    time: currentTime.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                    timestamp: currentTime.getTime(),
                    executed: false,
                    reason: 'لا يوجد رصيد كافٍ (يحتاج $2000)'
                },
                {
                    id: Date.now() + '_scan2',
                    type: 'scan',
                    robot: 'sayyad_alfors',
                    robotName: 'صياد الفرص',
                    emoji: '🏹',
                    message: 'يراقب القيعان... لا فرص واضحة',
                    time: currentTime.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                    timestamp: currentTime.getTime()
                },
                {
                    id: Date.now() + '_trade',
                    type: 'trade',
                    robot: 'al_qannas',
                    robotName: 'القناص',
                    emoji: '🎯',
                    message: '✅ فتح صفقة: AAPL @ $178.50',
                    time: currentTime.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                    timestamp: currentTime.getTime(),
                    executed: true
                },
                {
                    id: Date.now() + '_scan3',
                    type: 'scan',
                    robot: 'al_hout',
                    robotName: 'الحوت',
                    emoji: '🐋',
                    message: 'يتابع الأحجام... حجم منخفض (450M)',
                    time: currentTime.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                    timestamp: currentTime.getTime()
                }
            ];

            setEvents(prev => [...newEvents, ...prev].slice(0, 100)); // Keep last 100 events
        };

        generateEvents();

        // Update every 10 seconds with new events
        const interval = setInterval(generateEvents, 10000);
        return () => clearInterval(interval);
    }, []);

    const filteredEvents = filter === 'all'
        ? events
        : events.filter(e => e.type === filter);

    const getEventColor = (type) => {
        switch (type) {
            case 'scan': return '#64748b';
            case 'opportunity': return styles.gold;
            case 'trade': return styles.green;
            default: return '#94a3b8';
        }
    };

    const getEventIcon = (type) => {
        switch (type) {
            case 'scan': return '🔍';
            case 'opportunity': return '🚨';
            case 'trade': return '💼';
            default: return '•';
        }
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
                            <span style={{ fontSize: '32px' }}>📡</span>
                            <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>الأحداث المباشرة</h1>
                        </div>
                        <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '12px' }}>
                            سجل لحظي لكل ما يحدث من فحص وصفقات
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
                                مباشر - {events.length} حدث
                            </span>
                        </div>
                    </div>

                    {/* Filters */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto' }}>
                        {[
                            { id: 'all', label: 'الكل', icon: '📊' },
                            { id: 'scan', label: 'فحص', icon: '🔍' },
                            { id: 'opportunity', label: 'فرص', icon: '🚨' },
                            { id: 'trade', label: 'صفقات', icon: '💼' }
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

                    {/* Events Timeline */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {filteredEvents.length === 0 ? (
                            <div style={{
                                background: '#1e293b',
                                padding: '40px',
                                borderRadius: '16px',
                                textAlign: 'center'
                            }}>
                                <span style={{ fontSize: '48px', opacity: 0.5 }}>📭</span>
                                <p style={{ color: '#94a3b8', marginTop: '16px' }}>
                                    لا توجد أحداث {filter !== 'all' && `من نوع "${filter}"`}
                                </p>
                            </div>
                        ) : (
                            filteredEvents.map((event, idx) => (
                                <div
                                    key={event.id}
                                    style={{
                                        background: '#1e293b',
                                        borderRadius: '12px',
                                        padding: '16px',
                                        borderLeft: `4px solid ${getEventColor(event.type)}`,
                                        opacity: 0,
                                        animation: `fadeIn 0.3s ease-out ${idx * 0.05}s forwards`
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                        {/* Time Stamp */}
                                        <div style={{
                                            minWidth: '65px',
                                            textAlign: 'center',
                                            paddingTop: '4px'
                                        }}>
                                            <div style={{
                                                fontSize: '18px',
                                                marginBottom: '4px'
                                            }}>
                                                {getEventIcon(event.type)}
                                            </div>
                                            <div style={{
                                                fontSize: '10px',
                                                color: '#64748b',
                                                fontFamily: 'monospace'
                                            }}>
                                                {event.time}
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                                <span style={{ fontSize: '20px' }}>{event.emoji}</span>
                                                <span style={{ fontSize: '13px', fontWeight: 'bold', color: styles.gold }}>
                                                    {event.robotName}
                                                </span>
                                            </div>

                                            <p style={{
                                                fontSize: '14px',
                                                color: '#cbd5e1',
                                                margin: 0,
                                                lineHeight: '1.5'
                                            }}>
                                                {event.message}
                                            </p>

                                            {/* Execution Status */}
                                            {event.type === 'opportunity' && (
                                                <div style={{
                                                    marginTop: '8px',
                                                    padding: '8px 12px',
                                                    background: event.executed ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                    borderRadius: '8px',
                                                    fontSize: '12px'
                                                }}>
                                                    {event.executed ? (
                                                        <span style={{ color: styles.green }}>
                                                            ✅ تم الدخول في الصفقة
                                                        </span>
                                                    ) : (
                                                        <span style={{ color: styles.red }}>
                                                            ❌ لم يتم التنفيذ: {event.reason}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Info */}
                    <div style={{
                        background: 'rgba(139, 92, 246, 0.1)',
                        padding: '16px',
                        borderRadius: '12px',
                        marginTop: '24px',
                        border: '1px solid rgba(139, 92, 246, 0.3)'
                    }}>
                        <p style={{ fontSize: '13px', color: '#a78bfa', lineHeight: '1.6', margin: 0, textAlign: 'center' }}>
                            💡 يتم تحديث الأحداث كل 10 ثوانٍ تلقائياً
                        </p>
                    </div>
                </div>
                <BottomNav />
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateX(10px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>
        </div>
    );
}
