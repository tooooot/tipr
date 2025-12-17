import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { styles } from '../styles/theme';
import BottomNav from '../components/BottomNav';
import staticNotifications from '../data/notifications.json';

// Tweak: Allow for missing file by using a try-catch for require if this was Node, but in Vite/ESM we can't easily conditional import at top level without async.
// We will assume the file exists as the backend generates it.
import liveNotifications from '../data/user_notifications.json';

export default function NotificationsPage() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        // 1. Get Copied Bots (User Preference)
        const rawCopied = JSON.parse(localStorage.getItem('copiedBots') || '[]');
        // Normalize: copiedBots stores objects {id: '...'} or strings (legacy)
        const copiedIds = rawCopied.map(b => (typeof b === 'string' ? b : b.id));

        // 2. Filter Live Notifications (Only from My Bots)
        const filteredLive = liveNotifications.filter(n => {
            // If notification belongs to a bot (has bot_id), check if I copy it
            if (n.bot_id) {
                return copiedIds.includes(n.bot_id);
            }
            // If no bot_id (System message), always show
            return true;
        });

        // 3. Merge with Static
        const combined = [...filteredLive, ...staticNotifications];

        // 4. Sort & Unique
        const unique = combined.map((n, i) => ({ ...n, uniqueKey: `notif-${i}` }));

        setNotifications(unique);
    }, []);

    const markAsRead = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const getIcon = (type) => {
        switch (type) {
            case 'win': return '💰';
            case 'loss': return '🛡️';
            case 'opportunity': return '🚀';
            case 'success': return '✅'; // For confirmed trades
            default: return '🔔';
        }
    };

    return (
        <div style={styles.wrapper}>
            <div style={styles.container}>
                <div style={styles.page}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer' }}>←</button>
                            <h1 style={{ fontSize: '22px', margin: 0 }}>التنبيهات</h1>
                        </div>
                        <button style={{ color: styles.gold, background: 'none', border: 'none', fontSize: '12px', cursor: 'pointer' }}>تحديد الكل كمقروء</button>
                    </div>

                    {/* List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {notifications.map((notif, index) => (
                            <div
                                key={notif.uniqueKey}
                                onClick={() => markAsRead(notif.id)}
                                style={{
                                    background: notif.read ? 'transparent' : 'rgba(30, 41, 59, 0.5)',
                                    border: '1px solid #334155',
                                    borderRadius: '16px',
                                    padding: '16px',
                                    display: 'flex',
                                    gap: '16px',
                                    position: 'relative',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s'
                                }}
                            >
                                {!notif.read && (
                                    <div style={{ position: 'absolute', top: '16px', right: '16px', width: '8px', height: '8px', background: styles.red, borderRadius: '50%' }}></div>
                                )}

                                <div style={{
                                    width: '48px', height: '48px',
                                    background: '#1e293b',
                                    borderRadius: '12px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '24px'
                                }}>
                                    {getIcon(notif.type)}
                                </div>

                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <h3 style={{ fontSize: '14px', margin: 0, fontWeight: notif.read ? 'normal' : 'bold', color: 'white' }}>{notif.title}</h3>
                                        <span style={{ fontSize: '10px', color: '#64748b' }}>{notif.time}</span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', lineHeight: '1.4' }}>
                                        {notif.message || notif.body}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {notifications.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '40px', color: styles.gray }}>
                                <span style={{ fontSize: '40px', display: 'block', marginBottom: '16px' }}>😴</span>
                                لا توجد تنبيهات جديدة
                            </div>
                        )}
                    </div>
                </div>
                <BottomNav />
            </div>
        </div>
    );
}
