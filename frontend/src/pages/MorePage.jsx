
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { styles } from '../styles/theme';
import BottomNav from '../components/BottomNav';
import { getSimulation } from '../utils/storage';

export default function MorePage() {
    const navigate = useNavigate();
    const sim = getSimulation();

    const pages = [
        { path: '/portfolio', icon: '💼', label: 'المحفظة', desc: 'نسخ الروبوتات وإدارة المحفظة' },
        { path: '/notifications', icon: '🔔', label: 'التنبيهات', desc: 'إشعارات وتوصيات ذكية' },
        { path: '/designs', icon: '🎨', label: 'معرض التصاميم', desc: '10 أفكار مختلفة للبث المباشر' },
        { path: '/trades', icon: '📋', label: 'الصفقات', desc: 'جميع الصفقات من كل الروبوتات' },
        { path: '/charts', icon: '📊', label: 'مركز الشارتات', desc: 'الأسعار التاريخية والرسوم البيانية' },
        { path: '/reporter', icon: '📝', label: 'المراسل', desc: 'تقرير شامل عن الأداء' },
        { path: '/bots', icon: '🤖', label: 'الروبوتات', desc: 'جميع الروبوتات الاستثمارية' },
        { path: '/live', icon: '📺', label: 'البث المباشر', desc: 'مراقبة الأسواق مباشرة' },
        { path: '/activity', icon: '📢', label: 'سجل الأحداث', desc: 'شريط زمني لجميع عمليات الروبوتات' },
        { path: '/news', icon: '📰', label: 'الأخبار', desc: 'آخر أخبار السوق' },
        { path: '/time-machine', icon: '⏱️', label: 'آلة الزمن', desc: 'اختبار الروبوتات على بيانات تاريخية' },
        { path: '/verification', icon: '🔍', label: 'التحقق', desc: 'التحقق من الأسعار الحقيقية' },
        { path: '/history', icon: '🏛️', label: 'قاعة المشاهير', desc: 'أفضل الروبوتات أداءً' }, // NEW
        { path: '/design-gallery', icon: '🎨', label: 'استوديو التصميم', desc: 'معرض التصاميم' },
    ];

    return (
        <div style={styles.wrapper}>
            <div style={styles.container}>
                <div style={styles.page}>
                    <h1 style={{ color: styles.gold, fontSize: '24px', marginBottom: '8px' }}>⚙️ المزيد</h1>
                    <p style={{ color: styles.gray, marginBottom: '24px', fontSize: '14px' }}>جميع صفحات التطبيق</p>

                    {/* App Info */}
                    <div style={{ ...styles.card, background: 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(245,158,11,0.05))', textAlign: 'center' }}>
                        <span style={{ fontSize: '48px' }}>🏆</span>
                        <h2 style={{ color: styles.gold, marginTop: '12px', fontSize: '20px' }}>تِبر</h2>
                        <p style={{ color: styles.gray, fontSize: '12px', marginTop: '4px' }}>روبوتات الاستثمار الذكية</p>
                        {sim && (
                            <p style={{ color: styles.green, fontSize: '14px', marginTop: '8px' }}>
                                ✅ المحاكاة نشطة
                            </p>
                        )}
                    </div>

                    {/* Pages Grid */}
                    <h3 style={{ marginBottom: '12px', marginTop: '24px' }}>📱 الصفحات</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {pages.map(page => (
                            <button key={page.path} onClick={() => navigate(page.path)} style={{
                                ...styles.card,
                                cursor: 'pointer',
                                border: '1px solid #334155',
                                padding: '16px',
                                marginBottom: 0,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                textAlign: 'right',
                                background: '#1e293b' // Reset background in case styles.card has specific one
                            }}>
                                <span style={{ fontSize: '32px' }}>{page.icon}</span>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 'bold', fontSize: '16px', color: 'white' }}>{page.label}</p>
                                    <p style={{ color: styles.gray, fontSize: '12px', marginTop: '4px' }}>{page.desc}</p>
                                </div>
                                <span style={{ color: styles.gold, fontSize: '20px' }}>←</span>
                            </button>
                        ))}
                    </div>

                    {/* Version */}
                    <div style={{ textAlign: 'center', marginTop: '24px', padding: '16px' }}>
                        <p style={{ color: styles.gray, fontSize: '11px' }}>الإصدار 2.0</p>
                        <p style={{ color: styles.gray, fontSize: '10px', marginTop: '4px' }}>بيانات حقيقية من Yahoo Finance</p>
                    </div>
                </div>
                <BottomNav />
            </div>
        </div>
    );
}
