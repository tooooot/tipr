
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { styles } from '../styles/theme';

export default function BottomNav() {
    const location = useLocation();
    const items = [
        { icon: '🏠', label: 'الرئيسية', path: '/' },
        { icon: '💼', label: 'المحفظة', path: '/portfolio' },
        { icon: '📋', label: 'الصفقات', path: '/trades' },
        { icon: '📊', label: 'الشارتات', path: '/charts' },
        { icon: '⚙️', label: 'المزيد', path: '/more' },
    ];

    return (
        <nav style={{
            position: 'fixed',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            maxWidth: '430px',
            background: 'rgba(15, 23, 42, 0.98)',
            borderTop: '1px solid rgba(251, 191, 36, 0.2)',
            padding: '12px 8px',
            display: 'flex',
            justifyContent: 'space-around',
            backdropFilter: 'blur(10px)',
            zIndex: 1000,
        }}>
            {items.map((item, i) => (
                <Link key={i} to={item.path} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textDecoration: 'none',
                    color: location.pathname === item.path ? styles.gold : styles.gray,
                    fontSize: '11px',
                    gap: '4px',
                }}>
                    <span style={{ fontSize: '20px', lineHeight: '1' }}>{item.icon}</span>
                    <span style={{ lineHeight: '1' }}>{item.label}</span>
                </Link>
            ))}
        </nav>
    );
}
