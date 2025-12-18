import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function BottomNav() {
    const location = useLocation();

    const items = [
        { path: '/live', label: 'البث', icon: '📡' },
        { path: '/bots', label: 'الروبوتات', icon: '🤖' },
        { path: '/portfolio', label: 'المحفظة', icon: '💼' },
        { path: '/live-events', label: 'الأحداث', icon: '⚡', badge: true },
        { path: '/more', label: 'المزيد', icon: '☰' }
    ];

    return (
        <nav style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
            backdropFilter: 'blur(10px)',
            borderTop: '1px solid #1e293b',
            display: 'flex',
            justifyContent: 'space-around',
            padding: '8px 0 max(8px, env(safe-area-inset-bottom))',
            zIndex: 1000,
            boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.3)'
        }}>
            {items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                    <Link
                        key={item.path}
                        to={item.path}
                        style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                            textDecoration: 'none',
                            color: isActive ? '#fbbf24' : '#94a3b8',
                            position: 'relative',
                            padding: '8px',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {/* Icon with Badge */}
                        <div style={{ position: 'relative', fontSize: '24px' }}>
                            {item.icon}
                            {item.badge && (
                                <div style={{
                                    position: 'absolute',
                                    top: '-4px',
                                    right: '-4px',
                                    width: '8px',
                                    height: '8px',
                                    background: '#ef4444',
                                    borderRadius: '50%',
                                    border: '2px solid #0f172a',
                                    animation: 'pulse 2s infinite'
                                }} />
                            )}
                        </div>

                        {/* Label */}
                        <span style={{
                            fontSize: '11px',
                            fontWeight: isActive ? 'bold' : 'normal',
                            transition: 'all 0.2s'
                        }}>
                            {item.label}
                        </span>

                        {/* Active Indicator */}
                        {isActive && (
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: '32px',
                                height: '3px',
                                background: '#fbbf24',
                                borderRadius: '0 0 4px 4px'
                            }} />
                        )}
                    </Link>
                );
            })}

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.8; transform: scale(1.1); }
                }
            `}</style>
        </nav>
    );
}
