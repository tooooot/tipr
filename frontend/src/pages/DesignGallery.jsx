
import React, { useState, useEffect } from 'react';
import { styles } from '../styles/theme';

export default function DesignGallery() {

    // --- Global Pulse & Data ---
    const [tick, setTick] = useState(0);
    useEffect(() => {
        const i = setInterval(() => setTick(t => t + 1), 3000); // Rotate slides every 3s
        return () => clearInterval(i);
    }, []);

    // --- SHARED FRAME COMPONENT (The Skeleton) ---
    // This enforces the layout: Ticker -> Headline -> Carousel -> Feed
    const PhoneShell = ({ title, variantName, children }) => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '30px' }}>
            <h3 style={{ color: '#94a3b8', marginBottom: '10px', fontSize: '14px' }}>{variantName}</h3>

            {/* THE PHONE FRAME */}
            <div style={{
                width: '300px', height: '600px',
                background: '#0f172a', // Official Dark Blue
                borderRadius: '45px',
                border: '8px solid #1e293b',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                fontFamily: "'Cairo', sans-serif",
                display: 'flex', flexDirection: 'column'
            }}>
                {/* Notch */}
                <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '100px', height: '24px', background: '#1e293b', borderRadius: '0 0 16px 16px', zIndex: 50 }}></div>

                {/* 1. TICKER (Top) */}
                <div style={{ paddingTop: '30px', paddingBottom: '5px', background: '#1e293b', borderBottom: '1px solid #334155' }}>
                    <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', fontSize: '10px', color: '#cbd5e1' }}>
                        <div style={{ animation: 'ticker 10s linear infinite' }}>
                            <span style={{ color: styles.green }}>▲ ARAMCO 32.50</span> &nbsp; | &nbsp;
                            <span style={{ color: styles.red }}>▼ SABIC 78.20</span> &nbsp; | &nbsp;
                            <span style={{ color: styles.gold }}>● RAJHI 85.00</span>
                        </div>
                    </div>
                </div>

                {/* 2. HEADLINE (Rotating) */}
                <div style={{ padding: '20px 10px', textAlign: 'center', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <h2 key={tick} style={{
                        margin: 0, fontSize: '18px', lineHeight: '1.4',
                        background: 'linear-gradient(to right, #fff, #fbbf24)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        animation: 'fadeIn 0.5s'
                    }}>
                        {tick % 2 === 0 ? "شاهد الذكاء الاصطناعي 🧠" : "أرباح قياسية اليوم 💰"}
                    </h2>
                </div>

                {/* 3. CAROUSEL AREA (The Dynamic Stage) */}
                <div style={{
                    flex: 1, margin: '0 15px', position: 'relative',
                    borderRadius: '24px', overflow: 'hidden',
                    border: '1px solid #334155',
                    background: '#131c31' // Slightly lighter than bg
                }}>
                    {/* Render the specific design variation content here */}
                    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
                        {children}

                        {/* Fake Carousel Dots */}
                        <div style={{ position: 'absolute', bottom: '10px', width: '100%', display: 'flex', justifyContent: 'center', gap: '5px', zIndex: 10 }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: tick % 2 === 0 ? styles.gold : '#334155' }}></div>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: tick % 2 !== 0 ? styles.gold : '#334155' }}></div>
                        </div>
                    </div>
                </div>

                {/* 4. FEED (Bottom) */}
                <div style={{ padding: '15px', height: '100px', background: 'linear-gradient(to top, #0f172a 90%, transparent)' }}>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>أحدث العمليات:</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'white' }}>
                        <span>⚡</span>
                        <div style={{ background: '#1e293b', padding: '6px 12px', borderRadius: '12px', flex: 1 }}>
                            <span style={{ color: styles.gold }}>المايسترو</span>: اقتنص فرصة شراء
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );

    // --- 10 DISTINCT CAROUSEL CONTENT DESIGNS ---

    // 1. The Leaderboard (Focus on Rank)
    const ContentLeaderboard = () => (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>المتصدر الحالي</div>
            <div style={{ fontSize: '60px', margin: '10px 0' }}>🦁</div>
            <h2 style={{ margin: 0, color: styles.gold }}>القناص</h2>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: styles.green }}>+14.2%</div>
            <div style={{ fontSize: '10px', marginTop: '10px', padding: '4px 10px', background: 'rgba(34,197,94,0.1)', color: styles.green, borderRadius: '4px' }}>#1 Top Gainer</div>
        </div>
    );

    // 2. The Profit Graph (Focus on Numbers)
    const ContentGraph = () => (
        <div style={{ height: '100%', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: '40px', fontWeight: 'bold', color: styles.green }}>$24,500</div>
            <div style={{ fontSize: '14px', color: '#94a3b8' }}>إجمالي الربح المحقق</div>
            {/* Live Chart Simulation */}
            <div style={{ marginTop: '20px', height: '100px', display: 'flex', alignItems: 'flex-end', gap: '5px' }}>
                {[40, 60, 45, 70, 85, 60, 90, 100].map((h, i) => (
                    <div key={i} style={{ flex: 1, background: styles.green, height: `${h}%`, opacity: 0.5 + (i / 20), borderRadius: '4px 4px 0 0' }}></div>
                ))}
            </div>
        </div>
    );

    // 3. The Signal Card (Focus on Action)
    const ContentSignal = () => (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle, #1e293b 0%, transparent 70%)' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: `4px solid ${styles.green}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', boxShadow: `0 0 30px rgba(34,197,94,0.3)` }}>
                🔔
            </div>
            <h2 style={{ marginTop: '20px', marginBottom: '5px' }}>شراء قوي</h2>
            <h1 style={{ margin: 0, fontSize: '36px', letterSpacing: '2px' }}>NVIDIA</h1>
            <div style={{ color: '#94a3b8', marginTop: '5px' }}>@ 480.20</div>
        </div>
    );

    // 4. The Bot Battle (Comparison)
    const ContentBattle = () => (
        <div style={{ height: '100%', padding: '10px', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <div style={{ flex: 1, textAlign: 'center', }}>
                <div style={{ fontSize: '30px' }}>🐺</div>
                <div style={{ fontWeight: 'bold' }}>الذئب</div>
                <div style={{ color: styles.green }}>+4%</div>
            </div>
            <div style={{ fontSize: '20px', color: '#64748b', fontWeight: 'bold' }}>VS</div>
            <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: '30px' }}>🤖</div>
                <div style={{ fontWeight: 'bold' }}>المايسترو</div>
                <div style={{ color: styles.gold }}>+12%</div>
            </div>
        </div>
    );

    // 5. The Profile (Identity)
    const ContentProfile = () => (
        <div style={{ height: '100%', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '15px', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px' }}>🤖</div>
                <div>
                    <h3 style={{ margin: 0 }}>المايسترو</h3>
                    <span style={{ fontSize: '10px', background: styles.gold, color: 'black', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>Conservative</span>
                </div>
            </div>
            <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.6', marginTop: '15px' }}>
                يعتمد على استراتيجية كسر المتوسطات المتحركة مع إدارة مخاطر صارمة جداً.
            </p>
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1, background: '#1e293b', padding: '10px', borderRadius: '8px', textAlign: 'center', fontSize: '10px' }}>
                    Win Rate<br /><b style={{ fontSize: '14px', color: 'white' }}>85%</b>
                </div>
                <div style={{ flex: 1, background: '#1e293b', padding: '10px', borderRadius: '8px', textAlign: 'center', fontSize: '10px' }}>
                    Risk<br /><b style={{ fontSize: '14px', color: 'white' }}>Low</b>
                </div>
            </div>
        </div>
    );

    // 6. The Grid (Stats Overview)
    const ContentGrid = () => (
        <div style={{ height: '100%', padding: '15px', display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: '10px' }}>
            <div style={{ background: '#1e293b', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: '20px', color: styles.green }}>92%</div>
                <div style={{ fontSize: '10px', color: '#94a3b8' }}>الدقة</div>
            </div>
            <div style={{ background: '#1e293b', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: '20px', color: styles.gold }}>15</div>
                <div style={{ fontSize: '10px', color: '#94a3b8' }}>صفقات</div>
            </div>
            <div style={{ background: '#1e293b', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: '20px', color: 'white' }}>$40k</div>
                <div style={{ fontSize: '10px', color: '#94a3b8' }}>السيولة</div>
            </div>
            <div style={{ background: '#1e293b', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: '20px', color: styles.red }}>0</div>
                <div style={{ fontSize: '10px', color: '#94a3b8' }}>خسائر</div>
            </div>
        </div>
    );

    // 7. The Activity List (Timeline)
    const ContentList = () => (
        <div style={{ height: '100%', padding: '20px' }}>
            <h4 style={{ margin: '0 0 15px 0', fontSize: '12px', color: styles.gold }}>سجل اللحظات الأخيرة</h4>
            {[1, 2, 3].map(i => (
                <div key={i} style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                    <span>{i === 1 ? 'شراء ARAMCO' : i === 2 ? 'بيع SABIC' : 'تحديث STOP LOSS'}</span>
                    <span style={{ color: '#64748b' }}>منذ {i * 2} د</span>
                </div>
            ))}
        </div>
    );

    // 8. The Minimalist (Typography)
    const ContentMinimal = () => (
        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#020617' }}>
            <h1 style={{ fontSize: '50px', fontWeight: '900', color: 'transparent', WebkitTextStroke: `1px ${styles.gold}`, margin: 0, opacity: 0.5 }}>
                TIPR
            </h1>
            <div style={{ position: 'absolute', fontSize: '20px', fontWeight: 'bold', color: 'white' }}>
                AI TRADING
            </div>
        </div>
    );

    // 9. The Monthly Award (Bagde)
    const ContentAward = () => (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at top, #334155, #0f172a)' }}>
            <div style={{ fontSize: '80px', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))' }}>🏆</div>
            <h3 style={{ color: styles.gold, margin: '10px 0' }}>بطل الشهر</h3>
            <div style={{ padding: '5px 15px', background: 'white', color: 'black', borderRadius: '20px', fontWeight: 'bold', fontSize: '12px' }}>
                المايسترو
            </div>
        </div>
    );

    // 10. The CTA (Action)
    const ContentCTA = () => (
        <div style={{ height: '100%', padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
            <h2 style={{ fontSize: '22px', marginBottom: '10px' }}>لا تفوت الفرصة</h2>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '20px' }}>الروبوتات تعمل الآن. ابدأ النسخ وحقق الأرباح.</p>
            <button style={{
                background: styles.gold, color: 'black', border: 'none',
                padding: '12px 30px', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', width: '100%',
                boxShadow: '0 5px 15px rgba(251,191,36,0.4)'
            }}>
                ابدأ النسخ الآن
            </button>
        </div>
    );

    return (
        <div style={{ background: '#000', minHeight: '100vh', padding: '40px' }}>
            <h1 style={{ textAlign: 'center', color: 'white', marginBottom: '10px' }}>معرض المحتويات (Content Gallery)</h1>
            <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '40px' }}>10 أفكار مختلفة لنوع المحتوى داخل الدوار</p>

            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                <PhoneShell variantName="1. Leaderboard Rank" title=""><ContentLeaderboard /></PhoneShell>
                <PhoneShell variantName="2. Profit Graph" title=""><ContentGraph /></PhoneShell>
                <PhoneShell variantName="3. Live Signal" title=""><ContentSignal /></PhoneShell>
                <PhoneShell variantName="4. Bot Battle" title=""><ContentBattle /></PhoneShell>
                <PhoneShell variantName="5. Bot Profile" title=""><ContentProfile /></PhoneShell>
                <PhoneShell variantName="6. Stats Grid" title=""><ContentGrid /></PhoneShell>
                <PhoneShell variantName="7. Activity Log" title=""><ContentList /></PhoneShell>
                <PhoneShell variantName="8. Minimal Brand" title=""><ContentMinimal /></PhoneShell>
                <PhoneShell variantName="9. Trophy Award" title=""><ContentAward /></PhoneShell>
                <PhoneShell variantName="10. Call to Action" title=""><ContentCTA /></PhoneShell>
            </div>

            <style>{`
                @keyframes ticker { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            `}</style>
        </div>
    );
}
