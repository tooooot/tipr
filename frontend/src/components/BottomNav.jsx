import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { styles } from '../styles/theme';

export default function BottomNav() {
    const location = useLocation();
    const [unreadCount, setUnreadCount] = useState(0);

    // Simulate incoming notifications
    useEffect(() => {
        // In a real app, this would poll the backend or use a websocket.
        // Here we simulate alert to satisfy "Receive notifications now".
        setUnreadCount(3);
    }, []);

    // Ordered for LTR display (Left -> Right):
    // [More] [Time Machine] [BOTS] [Notifications] [Portfolio]
    // This places Portfolio on the far right (Arabic 'Start') and More on the far left.
    const items = [
        { icon: '⚙️', label: 'المزيد', path: '/more' },
        { icon: '⏱️', label: 'آلة الزمن', path: '/time-machine' },
        { icon: '🤖', label: 'الروبوتات', path: '/bots', isMain: true },
        { icon: '🔔', label: 'التنبيهات', path: '/notifications' },
        { icon: '💼', label: 'المحفظة', path: '/portfolio' },
    ];

    return (
        <nav style={{
            position: 'fixed',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            maxWidth: '430px',
            background: '#0f172a', // Solid dark for professional look
            borderTop: '1px solid #1e293b',
            padding: '12px 0 24px 0', // Extra bottom padding for iPhone handle
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 1000
        }}>
            {items.map((item, i) => {
                const isActive = location.pathname === item.path;
                const isNotif = item.path === '/notifications';

                return (
                    <Link key={i} to={item.path} style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textDecoration: 'none',
                        gap: '6px',
                        transition: 'all 0.2s',
                        opacity: isActive ? 1 : 0.6,
                        position: 'relative'
                    }}>
                        {/* Notification Badge */}
                        {isNotif && unreadCount > 0 && (
                            <div style={{
                                position: 'absolute',
                                top: '-2px',
                                right: '25%',
                                background: styles.red,
                                color: 'white',
                                fontSize: '8px',
                                width: '14px',
                                height: '14px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '2px solid #0f172a'
                            }}>
                                {unreadCount}
                            </div>
                        )}

                        {/* Icon */}
                        <div style={{
                            fontSize: '24px',
                            color: isActive ? styles.gold : '#94a3b8',
                            filter: isActive ? 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.4))' : 'none'
                        }}>
                            {item.icon}
                        </div>

                        {/* Label */}
                        <span style={{
                            fontSize: '10px',
                            fontWeight: isActive ? 'bold' : 'normal',
                            color: isActive ? styles.gold : '#94a3b8',
                            fontFamily: 'Cairo, sans-serif'
                        }}>
                            {item.label}
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
}
