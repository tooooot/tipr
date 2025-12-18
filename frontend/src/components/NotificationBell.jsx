import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { styles } from '../styles/theme';

export default function NotificationBell() {
    const navigate = useNavigate();
    const [unreadCount, setUnreadCount] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        // Load notifications count
        try {
            import('../data/live_notifications.json')
                .then(data => {
                    if (data.default && Array.isArray(data.default)) {
                        // Count unread notifications (last 10 as example)
                        const recent = data.default.slice(0, 10);
                        setUnreadCount(recent.length);
                    }
                })
                .catch(() => setUnreadCount(0));
        } catch {
            setUnreadCount(0);
        }

        // Update every 30 seconds
        const interval = setInterval(() => {
            import('../data/live_notifications.json')
                .then(data => {
                    if (data.default && Array.isArray(data.default)) {
                        const recent = data.default.slice(0, 10);
                        setUnreadCount(recent.length);
                    }
                })
                .catch(() => { });
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div
            onClick={() => navigate('/notifications')}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                zIndex: 1000,
                cursor: 'pointer',
                transition: 'transform 0.2s',
                transform: isHovered ? 'scale(1.1)' : 'scale(1)'
            }}
        >
            {/* Bell Icon Container */}
            <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                border: `2px solid ${styles.gold}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isHovered
                    ? `0 0 20px ${styles.gold}`
                    : '0 4px 12px rgba(0,0,0,0.5)',
                position: 'relative',
                animation: unreadCount > 0 ? 'pulse 2s infinite' : 'none'
            }}>
                {/* Bell Icon */}
                <span style={{
                    fontSize: '24px',
                    filter: isHovered ? 'drop-shadow(0 0 4px rgba(251, 191, 36, 0.6))' : 'none'
                }}>
                    🔔
                </span>

                {/* Unread Badge */}
                {unreadCount > 0 && (
                    <div style={{
                        position: 'absolute',
                        top: '-4px',
                        right: '-4px',
                        background: styles.red,
                        color: 'white',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid #0f172a',
                        boxShadow: '0 2px 8px rgba(239, 68, 68, 0.5)'
                    }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </div>
                )}
            </div>

            {/* Tooltip on hover */}
            {isHovered && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: '0',
                    marginTop: '8px',
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    whiteSpace: 'nowrap',
                    fontSize: '12px',
                    color: '#cbd5e1',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}>
                    التنبيهات {unreadCount > 0 && `(${unreadCount})`}
                </div>
            )}

            <style>{`
                @keyframes pulse {
                    0%, 100% { 
                        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
                    }
                    50% { 
                        box-shadow: 0 0 20px ${styles.gold};
                    }
                }
            `}</style>
        </div>
    );
}
