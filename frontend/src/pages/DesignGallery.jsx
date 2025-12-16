
import React, { useState, useEffect } from 'react';
import { styles } from '../styles/theme';
import BottomNav from '../components/BottomNav';

export default function DesignGallery() {
    const [selectedTheme, setSelectedTheme] = useState('modern');

    const themes = [
        { id: 'modern', name: 'المودرن (الافتراضي)', color: styles.gold },
        { id: 'glass', name: 'الزجاجي (Glassmorphism)', color: '#60a5fa' },
        { id: 'minimal', name: 'المينيمال (بسيط)', color: '#94a3b8' },
    ];

    return (
        <div style={styles.wrapper}>
            <div style={styles.container}>
                <div style={styles.page}>
                    <h1 style={{ color: styles.gold, fontSize: '24px', marginBottom: '8px' }}>🎨 استوديو التصميم</h1>
                    <p style={{ color: styles.gray, fontSize: '14px', marginBottom: '24px' }}>
                        اختر المظهر الذي يناسب ذوقك
                    </p>

                    <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px' }}>
                        {themes.map(theme => (
                            <button
                                key={theme.id}
                                onClick={() => setSelectedTheme(theme.id)}
                                style={{
                                    background: selectedTheme === theme.id ? theme.color : '#334155',
                                    color: selectedTheme === theme.id ? '#0f172a' : 'white',
                                    border: 'none',
                                    padding: '10px 20px',
                                    borderRadius: '999px',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    fontWeight: 'bold'
                                }}
                            >
                                {theme.name}
                            </button>
                        ))}
                    </div>

                    {/* Preview Area */}
                    <div style={{
                        border: `2px solid ${themes.find(t => t.id === selectedTheme).color}`,
                        borderRadius: '16px',
                        overflow: 'hidden',
                        height: '400px',
                        position: 'relative'
                    }}>
                        <div style={{
                            background: selectedTheme === 'glass' ? 'linear-gradient(135deg, #1e293b, #0f172a)' : '#0f172a',
                            height: '100%',
                            padding: '20px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            backdropFilter: selectedTheme === 'glass' ? 'blur(10px)' : 'none'
                        }}>
                            {/* Mock Content */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#334155' }}></div>
                                <div style={{ width: '100px', height: '20px', background: '#334155', borderRadius: '4px' }}></div>
                            </div>

                            <div style={{
                                height: '150px',
                                background: selectedTheme === 'glass' ? 'rgba(255,255,255,0.05)' : '#1e293b',
                                borderRadius: '12px',
                                border: selectedTheme === 'minimal' ? '1px solid #333' : 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#64748b'
                            }}>
                                منطقة المحتوى
                            </div>

                            <div style={{
                                height: '60px',
                                background: selectedTheme === 'glass' ? 'rgba(255,255,255,0.05)' : '#1e293b',
                                borderRadius: '12px'
                            }}></div>

                            <div style={{
                                height: '60px',
                                background: selectedTheme === 'glass' ? 'rgba(255,255,255,0.05)' : '#1e293b',
                                borderRadius: '12px'
                            }}></div>
                        </div>
                    </div>

                    <button style={{
                        width: '100%',
                        padding: '16px',
                        marginTop: '24px',
                        background: styles.gold,
                        color: '#0f172a',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}>
                        ✅ تطبيق المظهر
                    </button>

                </div>
                <BottomNav />
            </div>
        </div>
    );
}
