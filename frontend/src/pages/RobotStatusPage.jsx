import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { styles } from '../styles/theme';
import BottomNav from '../components/BottomNav';

// Robot Status Messages
const ROBOT_STATUS = {
    'al_qannas': {
        watching: ['أراقب مؤشر RSI على 28 سهم', 'أتتبع حركة 32 سهم بعناية'],
        reasons: [
            'السوق في منطقة تشبع شرائي (RSI > 70) - انتظر الانخفاض',
            'معظم الأسهم في نطاق محايد (RSI 40-60) - لا فرص واضحة',
            'أبحث عن RSI أقل من 30 لفرصة شراء قوية'
        ],
        actions: ['سأراقب الفجوات السعرية صباح الغد', 'إذا هبط سهم 3% سأدخل فوراً']
    },
    'al_maestro': {
        watching: ['أتابع زخم 25 سهم', 'أراقب اتجاهات 30 فرصة'],
        reasons: [
            'السوق في حالة تذبذب جانبي - لا اتجاه واضح',
            'الزخم ضعيف (أقل من 2%) - انتظر قوة أكبر',
            'الحجم منخفض - انتظر دخول المؤسسات'
        ],
        actions: ['إذا كسر سهم المقاومة سأدخل بقوة', 'أنتظر ارتفاع الحجم فوق المعدل']
    },
    'sayyad_alfors': {
        watching: ['أراقب قيعان 24 سهم', 'أتتبع مستويات الدعم لـ27 فرصة'],
        reasons: [
            'لم نصل لقاع 24 ساعة بعد - السعر أعلى بـ5%',
            'القاع الحالي ليس قوياً - انتظر تأكيد',
            'الأسعار بعيدة عن مستويات الدعم'
        ],
        actions: ['إذا لمس سهم الدعم سأدخل مباشرة', 'أنتظر هبوط 4% على الأقل']
    },
    'al_jasour': {
        watching: ['أراقب انهيارات محتملة في 20 سهم', 'أتتبع هبوط حاد لـ18 فرصة'],
        reasons: [
            'السوق هادئ جداً - لا هبوط حاد (أقصاه -2%)',
            'آخر انخفاض كان بسيطاً - أبحث عن -5% فأكثر',
            'المستثمرون متفائلون - لا ذعر بيعي'
        ],
        actions: ['إذا انهار سهم 8% سأقتنص الفرصة', 'أترقب أخبار الفيدرالي غداً']
    },
    'al_hout': {
        watching: ['أتتبع أحجام تداول 22 سهم', 'أراقب تحركات المؤسسات في 19 فرصة'],
        reasons: [
            'الحجم عادي (500M) - انتظر 1B فأكثر',
            'لا حركات مؤسسية كبيرة حتى الآن',
            'الحيتان هادئة - لا إشارات قوية'
        ],
        actions: ['عندما يدخل حوت كبير سأتبعه فوراً', 'أنتظر حجم يتجاوز 2B']
    }
};

function getRobotStatus(robotId) {
    const status = ROBOT_STATUS[robotId] || {
        watching: ['أراقب السوق'],
        reasons: ['أبحث عن الفرصة المثالية'],
        actions: ['سأدخل عند الإشارة القوية']
    };

    const watching = status.watching[Math.floor(Math.random() * status.watching.length)];
    const reason = status.reasons[Math.floor(Math.random() * status.reasons.length)];
    const action = status.actions[Math.floor(Math.random() * status.actions.length)];

    return { watching, reason, action };
}

export default function RobotStatusPage() {
    const navigate = useNavigate();
    const [robotStatuses, setRobotStatuses] = useState({});

    useEffect(() => {
        const robots = ['al_qannas', 'al_maestro', 'sayyad_alfors', 'al_jasour', 'al_hout'];
        const statuses = {};
        robots.forEach(id => {
            statuses[id] = getRobotStatus(id);
        });
        setRobotStatuses(statuses);

        // Update every 30 seconds with new random messages
        const interval = setInterval(() => {
            const updated = {};
            robots.forEach(id => {
                updated[id] = getRobotStatus(id);
            });
            setRobotStatuses(updated);
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    const ROBOT_NAMES = {
        'al_qannas': { name: 'القناص', emoji: '🎯' },
        'al_maestro': { name: 'المايسترو', emoji: '🎭' },
        'sayyad_alfors': { name: 'صياد الفرص', emoji: '🏹' },
        'al_jasour': { name: 'الجسور', emoji: '🦅' },
        'al_hout': { name: 'الحوت', emoji: '🐋' }
    };

    return (
        <div style={styles.wrapper}>
            <div style={styles.container}>
                <div style={styles.page}>
                    {/* Header */}
                    <div style={{ marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <span style={{ fontSize: '32px' }}>🤖</span>
                            <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>حالة الروبوتات</h1>
                        </div>
                        <p style={{ color: '#94a3b8', fontSize: '14px' }}>
                            ماذا يفعل كل روبوت الآن؟
                        </p>
                    </div>

                    {/* Robot Cards */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {Object.keys(robotStatuses).map((robotId, idx) => {
                            const status = robotStatuses[robotId];
                            const info = ROBOT_NAMES[robotId];

                            return (
                                <div
                                    key={robotId}
                                    onClick={() => navigate(`/bot/${robotId}`)}
                                    style={{
                                        background: '#1e293b',
                                        borderRadius: '16px',
                                        padding: '20px',
                                        border: '1px solid #334155',
                                        cursor: 'pointer',
                                        opacity: 0,
                                        animation: `fadeIn 0.4s ease-out ${idx * 0.1}s forwards`,
                                        transition: 'transform 0.2s, borderColor 0.2s'
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.transform = 'translateX(-4px)';
                                        e.currentTarget.style.borderColor = styles.gold;
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.transform = 'translateX(0)';
                                        e.currentTarget.style.borderColor = '#334155';
                                    }}
                                >
                                    {/* Header */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                        <span style={{ fontSize: '40px' }}>{info.emoji}</span>
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>
                                                {info.name}
                                            </h3>
                                            <div style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                background: 'rgba(34, 197, 94, 0.1)',
                                                padding: '4px 10px',
                                                borderRadius: '8px',
                                                fontSize: '11px'
                                            }}>
                                                <div style={{
                                                    width: '6px',
                                                    height: '6px',
                                                    borderRadius: '50%',
                                                    background: styles.green,
                                                    animation: 'pulse 2s infinite'
                                                }} />
                                                <span style={{ color: styles.green, fontWeight: 'bold' }}>نشط</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status Messages */}
                                    <div style={{
                                        background: '#0f172a',
                                        padding: '16px',
                                        borderRadius: '12px',
                                        marginBottom: '12px'
                                    }}>
                                        {/* What I'm Watching */}
                                        <div style={{ marginBottom: '12px' }}>
                                            <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                                                📊 حالياً:
                                            </p>
                                            <p style={{ fontSize: '14px', color: 'white', margin: 0, lineHeight: '1.5' }}>
                                                {status.watching}
                                            </p>
                                        </div>

                                        {/* Why Waiting */}
                                        <div style={{ marginBottom: '12px' }}>
                                            <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                                                🔍 لماذا أنتظر:
                                            </p>
                                            <p style={{ fontSize: '14px', color: '#cbd5e1', margin: 0, lineHeight: '1.5' }}>
                                                {status.reason}
                                            </p>
                                        </div>

                                        {/* Next Action */}
                                        <div>
                                            <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                                                🎯 الخطة القادمة:
                                            </p>
                                            <p style={{ fontSize: '14px', color: styles.gold, margin: 0, lineHeight: '1.5', fontWeight: 'bold' }}>
                                                {status.action}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '11px', color: '#64748b' }}>
                                            آخر فحص: {new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <span style={{ fontSize: '12px', color: '#64748b' }}>
                                            اضغط للتفاصيل →
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
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
                            💡 الروبوتات تعمل 24/7 وتراقب السوق بذكاء. عندما تجد الفرصة المثالية، تدخل تلقائياً!
                        </p>
                    </div>
                </div>
                <BottomNav />
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>
        </div>
    );
}
