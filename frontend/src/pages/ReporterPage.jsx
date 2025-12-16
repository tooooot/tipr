
import React, { useState, useEffect } from 'react';
import { fetchAPI } from '../api/api';
import { getSimulation } from '../utils/storage';
import { styles, btnGold } from '../styles/theme';
import BottomNav from '../components/BottomNav';

export default function ReporterPage() {
    const [report, setReport] = useState('');
    const [loading, setLoading] = useState(false);
    const sim = getSimulation();

    const generateReport = async () => {
        setLoading(true);
        // Simulate AI generation delay
        setTimeout(async () => {
            try {
                // If we had a real sophisticated backend AI, we'd call it here.
                // For now, we'll construct a smart report locally based on simulation data.
                if (!sim) {
                    setReport('عذراً، لا توجد بيانات محاكاة كافية لإنشاء تقرير. يرجى تشغيل المحاكاة أولاً.');
                    setLoading(false);
                    return;
                }

                const bestBot = sim.leaderboard?.[0];
                const totalPnL = sim.leaderboard?.reduce((acc, bot) => acc + (bot.final_balance - bot.initial_capital), 0);
                const marketTrend = totalPnL > 0 ? 'إيجابي' : 'سلبي';

                const text = `
📜 **التقرير اليومي لأداء الروبوتات**
📅 التاريخ: ${new Date().toLocaleDateString('ar-SA')}

**💡 ملخص السوق:**
كان أداء السوق اليوم **${marketTrend}** بشكل عام. حققت الروبوتات مجتمعة صافي ${totalPnL > 0 ? 'ربح' : 'خسارة'} بقيمة **${Math.abs(totalPnL).toLocaleString()} ر.س**.

**🏆 نجم اليوم:**
تألق الروبوت **${bestBot?.name_ar}** (${bestBot?.emoji}) اليوم، محققاً عائداً مذهلاً بنسبة **${bestBot?.total_profit_pct}%**. استراتيجيته المعتمدة على **${bestBot?.strategy_ar}** أثبتت فعاليتها العالية في ظروف السوق الحالية.

**📊 التحليل الفني:**
لاحظنا أن الروبوتات التي اعتمدت على **المتوسطات المتحركة** (مثل المايسترو) تفوقت على تلك التي اعتمدت على **RSI** فقط في الموجات الصاعدة الطويلة. ومع ذلك، في فترات التذبذب، كان **القناص** هو الأكثر دقة في اقتناص الفرص السريعة.

**🔮 التوقعات:**
بناءً على زخم الشراء الحالي، نتوقع استمرار الإيجابية لأسهم "النمو" في الأيام القادمة. ننصح بمراقبة سهم **الراجحي (1120)** و **أرامكو (2222)** حيث تظهر عليهما بوادر تجميع.

---
*تم إنشاء هذا التقرير آلياً بواسطة نظام تِبر الذكي* ✨
                `;
                setReport(text);
            } catch (e) {
                setReport('حدث خطأ أثناء إنشاء التقرير.');
            }
            setLoading(false);
        }, 2000);
    };

    return (
        <div style={styles.wrapper}>
            <div style={styles.container}>
                <div style={styles.page}>
                    <h1 style={{ color: styles.gold, fontSize: '24px', marginBottom: '8px' }}>📝 المراسل الذكي</h1>
                    <p style={{ color: styles.gray, fontSize: '14px', marginBottom: '24px' }}>
                        تقارير وتحليلات يومية لأداء محفظتك والسوق
                    </p>

                    <div style={{ ...styles.card, minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
                        {report ? (
                            <div style={{ flex: 1 }}>
                                <div style={{ whiteSpace: 'pre-line', lineHeight: '1.8', color: '#e2e8f0', fontSize: '14px' }}>
                                    {report.split('**').map((part, i) =>
                                        i % 2 === 1 ? <strong key={i} style={{ color: styles.gold }}>{part}</strong> : part
                                    )}
                                </div>
                                <button onClick={() => setReport('')} style={{ ...btnGold, marginTop: '20px', background: '#334155', color: 'white' }}>
                                    🔄 إنشاء تقرير جديد
                                </button>
                            </div>
                        ) : (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '20px' }}>
                                {loading ? (
                                    <>
                                        <span style={{ fontSize: '48px', animation: 'spin 1s infinite linear' }}>⏳</span>
                                        <p style={{ color: styles.gray, marginTop: '16px' }}>جاري تحليل البيانات وكتابة التقرير...</p>
                                    </>
                                ) : (
                                    <>
                                        <span style={{ fontSize: '64px', marginBottom: '16px' }}>📜</span>
                                        <h3 style={{ color: 'white', marginBottom: '8px' }}>لا يوجد تقرير حالياً</h3>
                                        <p style={{ color: styles.gray, fontSize: '14px', maxWidth: '250px', marginBottom: '24px' }}>
                                            اضغط الزر أدناه ليقوم الذكاء الاصطناعي بتحليل أداء الروبوتات وإنشاء تقرير مفصل لك.
                                        </p>
                                        <button onClick={generateReport} style={btnGold}>
                                            ✨ إنشاء تقرير الآن
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <BottomNav />
            </div>
        </div>
    );
}
