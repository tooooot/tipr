import React, { useState, useEffect } from 'react';

// Common Styles (Shared with App.jsx)
const styles = {
    gold: '#fbbf24',
    green: '#22c55e',
    red: '#ef4444',
    gray: '#9ca3af',
    blue: '#3b82f6',
    page: {
        background: '#0f172a',
        color: 'white',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Tajawal, sans-serif',
        overflow: 'hidden', // Contain within phone frame
        position: 'relative'
    }
};

// --- Mock Components for the Designs ---

const MockTicker = () => (
    <div style={{ background: 'black', padding: '4px', whiteSpace: 'nowrap', fontSize: '8px', color: 'white', borderBottom: '1px solid #333' }}>
        <span style={{ color: styles.green }}>🚀 المايسترو +5%</span> &nbsp;
        <span style={{ color: styles.gold }}>💰 الذهب صاعد</span> &nbsp;
        <span style={{ color: 'white' }}>🔴 بث مباشر</span>
    </div>
);

const MockHeader = ({ centered = true }) => (
    <div style={{ textAlign: centered ? 'center' : 'right', padding: '10px' }}>
        <h1 style={{ fontSize: '14px', margin: 0 }}>شاهد الذكاء الاصطناعي</h1>
        <p style={{ fontSize: '12px', color: styles.green, margin: 0 }}>يصنع الثروة 🔴</p>
    </div>
);

const MockCarousel = ({ height = '120px', dominant = false }) => (
    <div style={{
        margin: '10px',
        height: height,
        background: dominant ? 'linear-gradient(135deg, #1e293b, #020617)' : '#1e293b',
        borderRadius: '12px',
        border: '1px solid #3b82f6',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: dominant ? '0 10px 20px rgba(59,130,246,0.3)' : 'none',
        flexShrink: 0
    }}>
        <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '24px' }}>🏆</span>
            <p style={{ fontSize: '10px', color: styles.gold, margin: '4px 0' }}>تحدي الأسبوع</p>
        </div>
    </div>
);

const MockEventsList = ({ style = 'list' }) => (
    <div style={{ padding: '0 10px', flex: 1, overflowY: 'auto' }}>
        <div style={{ marginBottom: '8px', padding: '8px', background: 'rgba(30,41,59,0.5)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
                <p style={{ fontSize: '8px', color: styles.gray }}>الأرباح</p>
                <p style={{ fontSize: '14px', color: styles.gold, fontWeight: 'bold' }}>+12,450$</p>
            </div>
            <span style={{ fontSize: '16px' }}>💰</span>
        </div>
        {[1, 2, 3].map(i => (
            <div key={i} style={{
                marginBottom: '6px', padding: '8px', background: '#1e293b', borderRadius: '8px',
                borderLeft: `3px solid ${i === 1 ? styles.green : styles.gray}`,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: '#334155' }}></div>
                    <div>
                        <p style={{ fontSize: '10px', margin: 0 }}>السوق {i}</p>
                        <p style={{ fontSize: '8px', color: styles.gray, margin: 0 }}>جاري المسح...</p>
                    </div>
                </div>
                <span style={{ fontSize: '10px', color: styles.green }}>+2.5%</span>
            </div>
        ))}
    </div>
);

const MockGrid = () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px' }}>
        {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ background: '#1e293b', height: '80px', borderRadius: '10px', padding: '8px' }}>
                <span style={{ fontSize: '16px' }}>📊</span>
            </div>
        ))}
    </div>
);

// --- The Layout Engine ---
const LiveLayout = ({ layout }) => {
    return (
        <div style={styles.page}>
            {layout.map((item, index) => {
                switch (item) {
                    case 'ticker': return <MockTicker key={index} />;
                    case 'header': return <MockHeader key={index} />;
                    case 'header-left': return <MockHeader key={index} centered={false} />;
                    case 'carousel': return <MockCarousel key={index} />;
                    case 'carousel-dominant': return <MockCarousel key={index} height="180px" dominant={true} />;
                    case 'carousel-full': return <MockCarousel key={index} height="220px" dominant={true} />;
                    case 'events': return <MockEventsList key={index} />;
                    case 'grid': return <MockGrid key={index} />;
                    case 'spacer': return <div key={index} style={{ height: '20px' }}></div>;
                    default: return null;
                }
            })}
            {/* Fake Nav */}
            <div style={{ height: '40px', background: '#020617', marginTop: 'auto', borderTop: '1px solid #333', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                <div style={{ width: '20px', height: '20px', background: '#333', borderRadius: '50%' }}></div>
                <div style={{ width: '20px', height: '20px', background: styles.gold, borderRadius: '50%' }}></div>
                <div style={{ width: '20px', height: '20px', background: '#333', borderRadius: '50%' }}></div>
            </div>
        </div>
    );
};

// --- Configurations ---
const layoutConfigs = [
    { id: 1, name: 'التصميم الحالي', items: ['ticker', 'header', 'carousel-dominant', 'events'] },
    { id: 2, name: 'الكلاسيكي', items: ['header', 'carousel', 'events'] },
    { id: 3, name: 'التركيز على الحدث', items: ['carousel-full', 'header', 'events'] },
    { id: 4, name: 'شريط الأخبار أولاً', items: ['ticker', 'carousel', 'header', 'events'] },
    { id: 5, name: 'شبكة الأسواق', items: ['header', 'ticker', 'grid', 'carousel'] },
    { id: 6, name: 'تخطيط رسمي', items: ['header-left', 'events', 'carousel'] },
    { id: 7, name: 'الوضع الليلي العميق', items: ['spacer', 'carousel-dominant', 'events'] },
    { id: 8, name: 'أسلوب التيك توك', items: ['carousel-full', 'ticker', 'events'] }, // Heavy focus on visual
];

// --- Main Gallery Component ---
export default function DesignGallery() {
    const [selectedId, setSelectedId] = useState(1);

    return (
        <div style={{
            background: '#0f172a',
            minHeight: '100vh',
            padding: '20px',
            color: 'white',
            fontFamily: 'Tajawal, sans-serif'
        }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h1 style={{ color: styles.gold }}>🎨 استوديو التصميم</h1>
                <p>اختر التصميم الذي تراه مناسباً لصفحة البث المباشر</p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '40px',
                justifyItems: 'center'
            }}>
                {layoutConfigs.map((config) => (
                    <div key={config.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                        {/* iPhone Frame */}
                        <div
                            onClick={() => setSelectedId(config.id)}
                            style={{
                                width: '260px',
                                height: '520px',
                                border: `12px solid ${selectedId === config.id ? styles.gold : '#334155'}`,
                                borderRadius: '40px',
                                background: '#0f172a',
                                overflow: 'hidden',
                                position: 'relative',
                                cursor: 'pointer',
                                boxShadow: selectedId === config.id ? '0 0 50px rgba(251, 191, 36, 0.3)' : '0 10px 30px rgba(0,0,0,0.5)',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {/* Notch */}
                            <div style={{
                                position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                                width: '100px', height: '24px', background: '#334155',
                                borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px',
                                zIndex: 10
                            }}></div>

                            {/* Content */}
                            <LiveLayout layout={config.items} />
                        </div>

                        <h3 style={{ color: selectedId === config.id ? styles.gold : 'white' }}>
                            {config.id}. {config.name} {selectedId === config.id && '✅'}
                        </h3>
                    </div>
                ))}
            </div>

            {/* Action Bar */}
            <div style={{
                position: 'fixed', bottom: 0, left: 0, width: '100%',
                background: 'rgba(15, 23, 42, 0.95)', borderTop: '1px solid #333',
                padding: '20px', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '20px'
            }}>
                <button style={{
                    padding: '12px 32px', borderRadius: '12px', border: 'none',
                    background: '#334155', color: 'white', cursor: 'pointer', fontSize: '16px'
                }} onClick={() => window.location.href = '/'}>
                    إلغاء ❌
                </button>
                <button style={{
                    padding: '12px 32px', borderRadius: '12px', border: 'none',
                    background: styles.gold, color: 'black', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px',
                    boxShadow: '0 0 20px rgba(251, 191, 36, 0.4)'
                }}>
                    اعتماد التصميم رقم {selectedId} ✨
                </button>
            </div>
        </div>
    );
}
