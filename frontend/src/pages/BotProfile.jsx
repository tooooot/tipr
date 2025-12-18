
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { styles } from '../styles/theme';
import BottomNav from '../components/BottomNav';
import realTradesData from '../data/real_trades.json';

// --- الموسوعة الكاملة لجميع الروبوتات (16 روبوت) ---
const BOT_DETAILS = {
    // --- Legacy / Aliases Support (لضمان عمل الروابط القديمة) ---
    'al_dhakheera': {
        name_ar: 'الذخيرة (حارس المحفظة)', emoji: '🛡️', market: 'all', risk: 1, stop_loss: '2%', take_profit: '8%', drawdown: '-3%', subscribers: 4500,
        strategy_title: 'الدفاعي (Low Beta)',
        strategy_deep_dive: 'حماية رأس المال أولاً. نستثمر في القطاعات التي لا يستغني عنها الناس (دواء، غذاء، كهرباء).',
        indicators_explained: [
            { title: 'Low Beta', desc: 'أسهم حركتها أبطأ من السوق، لتقليل التذبذب.' },
            { title: 'Dividend Yield', desc: 'توزيعات نقدية مستمرة.' }
        ],
        exit_detailed: 'الخروج عند ارتفاع مخاطر السوق بشكل جنوني.'
    },
    // --- الروبوتات الأساسية (السوق السعودي) 🇸🇦 ---
    'al_maestro': {
        name_ar: 'المايسترو', emoji: '🤖', market: 'saudi', risk: 3, stop_loss: '5%', take_profit: '15%', drawdown: '-8%', subscribers: 1240,
        strategy_title: 'ركوب الموجة (Trend Following)',
        strategy_deep_dive: 'المايسترو لا يحاول التذاكا على السوق. استراتيجيته بسيطة: "Trend is your friend". يدخل عندما يؤكد السعر اتجاهاً صاعداً واضحاً بكسر قمم سابقة.',
        indicators_explained: [
            { title: 'التقاطع الذهبي', desc: 'متوسط 50 يقطع متوسط 200 للأعلى، إشارة قوية جداً لبدء سوق صاعد.' },
            { title: 'ADX > 25', desc: 'يستخدم لقياس "قوة" الاتجاه وليس الاتجاه نفسه.' }
        ],
        exit_detailed: 'الخروج عند كسر متوسط 50 يوم للأسفل.'
    },
    'al_qannas': {
        name_ar: 'القناص', emoji: '🦁', market: 'saudi', risk: 7, stop_loss: '3%', take_profit: '8%', drawdown: '-12%', subscribers: 850,
        strategy_title: 'الصيد في القاع (Mean Reversion)',
        strategy_deep_dive: 'يقتنص الأسهم التي "عوقبت" بشدة من السوق ونزلت أسعارها ظلماً. يراهن على أن السعر سيعود لمتوسطه الطبيعي.',
        indicators_explained: [
            { title: 'RSI < 30', desc: 'تشبع بيعي حاد. البائعون انتهوا، والمشترون يستعدون للدخول.' },
            { title: 'بولنجر باند', desc: 'ملامسة الحد السفلي للقناة السعرية.' }
        ],
        exit_detailed: 'بيع فوري عند العودة لخط المنتصف.'
    },
    'al_hout': {
        name_ar: 'الحوت', emoji: '🐋', market: 'saudi', risk: 2, stop_loss: '7%', take_profit: '20%', drawdown: '-5%', subscribers: 3100,
        strategy_title: 'تتبع السيولة الذكية (Smart Money)',
        strategy_deep_dive: 'الحوت لا يهمه السعر، يهمه الحجم (Volume). يراقب تدفق الأموال الكبيرة التي تدخل بهدوء قبل الأخبار.',
        indicators_explained: [
            { title: 'OBV', desc: 'تجميع خفي من الهوامير بينما السعر ثابت.' },
            { title: 'MFI', desc: 'تدفق السيولة المؤسساتية.' }
        ],
        exit_detailed: 'الخروج عند ظهور شمعة بيعية بحجم تداول ضخم.'
    },
    'sayyad_alfors': {
        name_ar: 'صياد الفرص', emoji: '🦅', market: 'saudi', risk: 6, stop_loss: '4%', take_profit: '10%', drawdown: '-9%', subscribers: 620,
        strategy_title: 'نماذج الشموع (Price Action)',
        strategy_deep_dive: 'يركز على "لغة الشموع". يبحث عن نماذج انعكاسية عند مناطق الدعم.',
        indicators_explained: [
            { title: 'Hammer', desc: 'شمعة المطرقة العاكسة للاتجاه.' },
            { title: 'Engulfing', desc: 'الابتلاع الشرائي القوي.' }
        ],
        exit_detailed: 'الخروج عند فشل النموذج.'
    },

    // --- الروبوتات الكلاسيكية (المفضلة) ⭐ ---
    'al_dhakheera': {
        name_ar: 'الذخيرة', emoji: '💰', market: 'all', risk: 1, stop_loss: '2%', take_profit: '10%', drawdown: '-3%', subscribers: 4500,
        strategy_title: 'متوسط التكلفة (DCA)',
        strategy_deep_dive: 'الذخيرة هو الروبوت الأكثر أماناً. لا يهتم بتوقيت السوق، بل يقوم بالشراء الدوري (يومياً/أسبوعياً) لتقليل متوسط التكلفة وبناء ثروة تراكمية.',
        indicators_explained: [
            { title: 'Fixed Intervals', desc: 'الشراء في توقيت محدد بغض النظر عن السعر.' },
            { title: 'Accumulation', desc: 'الاستفادة من انخفاض الأسعار لجمع كميات أكبر.' }
        ],
        exit_detailed: 'استراتيجية طويلة الأمد، الخروج عند تحقيق الهدف السنوي.'
    },
    'al_jasour': {
        name_ar: 'الجسور', emoji: '🦁', market: 'all', risk: 8, stop_loss: '10%', take_profit: '30%', drawdown: '-20%', subscribers: 1100,
        strategy_title: 'المخاطرة العالية (High Risk/Reward)',
        strategy_deep_dive: 'الجسور لا يخاف السقوط. يدخل في الأسهم التي تهبط بقوة (السكين الساقطة) مراهناً على ارتداد عنيف، أو الأسهم الصغيرة جداً.',
        indicators_explained: [
            { title: 'Volatility', desc: 'يبحث عن الأسهم الأكثر تذبذباً في السوق.' },
            { title: 'Support Crash', desc: 'الشراء عند كسر الدعم لخداع المتداولين.' }
        ],
        exit_detailed: 'الخروج السريع عند تحقيق ربح ضخم أو تفعيل وقف الخسارة.'
    },
    'al_barq': {
        name_ar: 'البرق', emoji: '⚡', market: 'all', risk: 9, stop_loss: '3%', take_profit: '6%', drawdown: '-5%', subscribers: 700,
        strategy_title: 'المضاربة اللحظية (Scalping)',
        strategy_deep_dive: 'البرق يعمل في إطار زمني بالدقائق. يدخل ويخرج عدة مرات في الجلسة الواحدة لاقتناص هللات سريعة تتراكم لتصبح ثروة.',
        indicators_explained: [
            { title: 'Order Flow', desc: 'قراءة تدفق الأوامر اللحظي.' },
            { title: '1-Min Breakout', desc: 'اختراقات على فريم الدقيقة.' }
        ],
        exit_detailed: 'إغلاق جميع الصفقات بنهاية الجلسة مهما كانت النتيجة.'
    },
    'al_basira': {
        name_ar: 'البصيرة', emoji: '👁️', market: 'all', risk: 4, stop_loss: '7%', take_profit: '20%', drawdown: '-10%', subscribers: 2100,
        strategy_title: 'التحليل الأساسي (Fundamental)',
        strategy_deep_dive: 'البصيرة هو "وارن بافيت" الفريق. يحلل القوائم المالية، مكررات الربحية، والنمو المستقبلي. لا يشتري سهماً إلا إذا كان سعره أقل من قيمته العادلة.',
        indicators_explained: [
            { title: 'P/E Ratio', desc: 'مكرر الربحية المنخفض مقارنة بالنمو.' },
            { title: 'Intrinsic Value', desc: 'القيمة الجوهرية للسهم.' }
        ],
        exit_detailed: 'الخروج عند وصول السعر للقيمة العادلة المقدرة.'
    },
    'al_razeen': {
        name_ar: 'الرزين', emoji: '⚖️', market: 'all', risk: 2, stop_loss: '5%', take_profit: '12%', drawdown: '-6%', subscribers: 3300,
        strategy_title: 'الاستثمار المتوازن (Balanced)',
        strategy_deep_dive: 'الرزين يمسك العصا من المنتصف. يوزع المحفظة بين أسهم العوائد وأسهم النمو لتقليل المخاطر مع الحفاظ على عائد مجزي.',
        indicators_explained: [
            { title: 'Diversification', desc: 'توزيع القطاعات (بنكي، اسمنت، تقنية...).' },
            { title: 'Beta ~ 1', desc: 'حركة المحفظة توازي حركة المؤشر العام.' }
        ],
        exit_detailed: 'إعادة التوازن (Rebalancing) كل ربع سنة.'
    },
    'al_khabeer': {
        name_ar: 'الخبير', emoji: '🧠', market: 'all', risk: 5, stop_loss: '4%', take_profit: '12%', drawdown: '-8%', subscribers: 1500,
        strategy_title: 'التحليل الفني الكلاسيكي',
        strategy_deep_dive: 'مدرسة التحليل الفني القديمة. يعتمد على المثلثات، القنوات السعرية، والرأس والكتفين. كلاسيكي وموثوق.',
        indicators_explained: [
            { title: 'Chart Patterns', desc: 'النماذج الفنية الشهيرة.' },
            { title: 'Fibonacci', desc: 'مستويات الدعم والمقاومة الذهبية.' }
        ],
        exit_detailed: 'الخروج عند اكتمال هدف النموذج الفني.'
    },
    'al_rasi': {
        name_ar: 'الراسي', emoji: '🏔️', market: 'all', risk: 1, stop_loss: '8%', take_profit: '15%', drawdown: '-4%', subscribers: 5000,
        strategy_title: 'ملك التوزيعات (Dividends)',
        strategy_deep_dive: 'اسمه يعكس استراتيجيته. راسي كالجبل. يستثمر فقط في الشركات الكبيرة التي توزع أرباحاً نقدية منذ سنوات طويلة.',
        indicators_explained: [
            { title: 'Dividend Yield', desc: 'عائد التوزيع السنوي > 4%.' },
            { title: 'Payout History', desc: 'تاريخ مستقر في دفع الأرباح.' }
        ],
        exit_detailed: 'لا يخرج غالباً، الاستثمار للدخل.'
    },
    'al_mudarra': {
        name_ar: 'المُدرّع', emoji: '🛡️', market: 'all', risk: 1, stop_loss: '3%', take_profit: '7%', drawdown: '-2%', subscribers: 2800,
        strategy_title: 'التحوط القصوى (Hedging)',
        strategy_deep_dive: 'هدفه الحفاظ على رأس المال بأي ثمن. يستخدم الذهب والسندات والأسهم الدفاعية لصد أي انهيار في السوق.',
        indicators_explained: [
            { title: 'Correlation', desc: 'أصول لا تتحرك معاً (ارتباط سلبي).' },
            { title: 'Safe Havens', desc: 'التركيز على الملاذات الآمنة.' }
        ],
        exit_detailed: 'الخروج عند استقرار الأسواق وعودة الشهية للمخاطرة.'
    },

    // --- الروبوتات العالمية والكريبتو 🌎 ---
    'smart_investor': {
        name_ar: 'المستثمر الذكي', emoji: '🧠', market: 'all', risk: 3, stop_loss: '10%', take_profit: '30%', drawdown: '-15%', subscribers: 2200,
        strategy_title: 'النمو العالمي (Global Growth)',
        strategy_deep_dive: 'نسخة عالمية من البصيرة. يبحث عن الفرص في الأسواق العالمية.',
        indicators_explained: [{ title: 'Global Trends', desc: 'الاتجاهات الاقتصادية العالمية.' }], exit_detailed: 'تغير المايكرو اقتصاد.'
    },
    'crypto_king': {
        name_ar: 'ملك الكريبتو', emoji: '🤴', market: 'crypto', risk: 10, stop_loss: '20%', take_profit: '100%', drawdown: '-40%', subscribers: 8000,
        strategy_title: 'الأصول الرقمية',
        strategy_deep_dive: 'المضاربة في سوق العملات الرقمية شديد التذبذب.',
        indicators_explained: [{ title: 'On-Chain', desc: 'بيانات البلوكتشين.' }], exit_detailed: 'نهاية الدورة الصاعدة.'
    },
    'wall_street_wolf': {
        name_ar: 'ذئب وول ستريت', emoji: '🐺', market: 'us', risk: 8, stop_loss: '8%', take_profit: '25%', drawdown: '-18%', subscribers: 5000,
        strategy_title: 'الزخم الأمريكي',
        strategy_deep_dive: 'المضاربة في الأسهم الأمريكية الأكثر شعبية.',
        indicators_explained: [{ title: 'Volume', desc: 'السيولة العالية.' }], exit_detailed: 'كسر الترند.'
    },

    // --- روبوتات النخبة والذكاء الاصطناعي (جديد) 🤖✨ ---
    'grid_master': {
        name_ar: 'سيد الشبكة', emoji: '🕸️', market: 'all', risk: 4, stop_loss: '-', take_profit: 'Fixed', drawdown: '-5%', subscribers: 950,
        strategy_title: 'التداول الشبكي (Grid Trading)',
        strategy_deep_dive: 'أذكى حل للسوق العرضي الممل. يقوم بوضع شبكة صيد من أوامر الشراء والبيع على مسافات متساوية.',
        indicators_explained: [
            { title: 'ATR Channel', desc: 'تحديد حدود الشبكة (السقف والقاع).' },
            { title: 'Range Identifier', desc: 'سكريبت يكشف دخول السهم في مسار عرضي.' }
        ],
        exit_detailed: 'حصاد مستمر للأرباح ما دام السعر داخل الشبكة.'
    },
    'sentiment_ai': {
        name_ar: 'قارئ الأفكار', emoji: '🔮', market: 'all', risk: 6, stop_loss: '5%', take_profit: '15%', drawdown: '-12%', subscribers: 1800,
        strategy_title: 'تحليل المشاعر (AI Sentiment)',
        strategy_deep_dive: 'روبوت مدعوم بالذكاء الاصطناعي يقرأ آلاف الأخبار والتغريدات يومياً. يشتري عندما يكون "الخوف" مسيطراً.',
        indicators_explained: [
            { title: 'NLP Score', desc: 'درجة إيجابية/سلبية النصوص.' },
            { title: 'Social Volume', desc: 'حجم الحديث عن السهم (الترند).' }
        ],
        exit_detailed: 'الخروج عند وصول التفاؤل لمستويات مبالغ فيها.'
    },
    'pair_trader': {
        name_ar: 'المرايا', emoji: '🎭', market: 'all', risk: 3, stop_loss: '4%', take_profit: '8%', drawdown: '-4%', subscribers: 600,
        strategy_title: 'تداول الأزواج (Pair Trading)',
        strategy_deep_dive: 'يشتري سهم قوي ويبيع سهم منافس ضعيف في نفس القطاع للربح من الفارق السعري.',
        indicators_explained: [
            { title: 'Correlation', desc: 'ارتباط تاريخي عالي بين السهمين.' },
            { title: 'Spread Z-Score', desc: 'انحراف الفارق عن المعدل الطبيعي.' }
        ],
        exit_detailed: 'إغلاق الصفقتين عند عودة الفارق لمستواه الطبيعي.'
    }
};

export default function BotProfile() {
    const { botId } = useParams();
    const navigate = useNavigate();
    const [bot, setBot] = useState(BOT_DETAILS['al_maestro']);
    const [trades, setTrades] = useState([]);
    const [isCopied, setIsCopied] = useState(false);
    const [showMarketModal, setShowMarketModal] = useState(false);
    const [selectedMarkets, setSelectedMarkets] = useState({ saudi: true, us: true, crypto: true });
    const [weeklyChampionships, setWeeklyChampionships] = useState([]);
    const [expandedWeek, setExpandedWeek] = useState(null);

    useEffect(() => {
        const details = BOT_DETAILS[botId] || BOT_DETAILS['al_maestro'];
        setBot(details);
        let botTrades = realTradesData ? realTradesData.filter(t => t.bot_id === botId) : [];
        botTrades.sort((a, b) => new Date(b.entry_date) - new Date(a.entry_date));
        setTrades(botTrades);

        // Load weekly championships from history_events.json
        import('../data/history_events.json').then(historyData => {
            if (historyData.default && historyData.default.awards) {
                const championships = historyData.default.awards
                    .filter(award => award.bot_id === botId)
                    .map(award => ({
                        date: award.date,
                        title: award.title_ar,
                        profit: award.profit,
                        description: award.description_ar
                    }))
                    .sort((a, b) => new Date(b.date) - new Date(a.date));
                setWeeklyChampionships(championships);
            }
        }).catch(() => {
            setWeeklyChampionships([]);
        });

        // Check if already copied (Legacy or New Object Format)
        const copiedBots = JSON.parse(localStorage.getItem('copied_bots') || '[]');
        const isAlreadyCopied = copiedBots.some(item =>
            (typeof item === 'string' && item === botId) || (item.id === botId)
        );

        if (isAlreadyCopied) {
            setIsCopied(true);
        }
    }, [botId]);

    // Save Bot Function
    const saveBot = (marketsToSave) => {
        const copiedBots = JSON.parse(localStorage.getItem('copied_bots') || '[]');

        // Remove old entry if exists to update it
        const currentList = copiedBots.filter(item =>
            (typeof item === 'string' ? item : item.id) !== botId
        );

        // Add new entry
        currentList.push({ id: botId, markets: marketsToSave });
        localStorage.setItem('copied_bots', JSON.stringify(currentList));

        setIsCopied(true);
        setShowMarketModal(false);

        // Notification
        const newNotif = {
            id: Date.now(),
            title: 'تم تفعيل الروبوت',
            body: `تم نسخ صفقات ${bot.name_ar} بنجاح إلى ${marketsToSave.length} محافظ.`,
            time: 'الآن',
            type: 'success',
            read: false
        };
        const currentNotifs = JSON.parse(localStorage.getItem('notifications') || '[]');
        localStorage.setItem('notifications', JSON.stringify([newNotif, ...currentNotifs]));
    };

    const handleCopyClick = () => {
        if (isCopied) {
            // If already copied, maybe allow editing? For now just toggle off/remove
            const copiedBots = JSON.parse(localStorage.getItem('copied_bots') || '[]');
            const filtered = copiedBots.filter(item =>
                (typeof item === 'string' ? item : item.id) !== botId
            );
            localStorage.setItem('copied_bots', JSON.stringify(filtered));
            setIsCopied(false);
            return;
        }

        // Check if Global/All Market Bot
        if (bot.market === 'all') {
            setShowMarketModal(true);
        } else {
            // Specific market, just save directly
            saveBot([bot.market]);
        }
    };

    const toggleMarketSelection = (market) => {
        setSelectedMarkets(prev => ({ ...prev, [market]: !prev[market] }));
    };

    const confirmGlobalCopy = () => {
        const finalMarkets = Object.keys(selectedMarkets).filter(k => selectedMarkets[k]);
        if (finalMarkets.length === 0) return; // Must select at least one
        saveBot(finalMarkets);
    };

    const getRiskColor = (level) => {
        if (level <= 3) return styles.green;
        if (level <= 7) return styles.gold;
        return styles.red;
    };

    return (
        <div style={styles.wrapper}>
            {/* Modal for Global Bots */}
            {showMarketModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', zIndex: 200,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
                }}>
                    <div style={{ background: '#1e293b', padding: '24px', borderRadius: '24px', width: '100%', maxWidth: '350px', textAlign: 'center' }}>
                        <h3 style={{ color: 'white', marginBottom: '8px' }}>تخصيص النسخ ⚙️</h3>
                        <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '20px' }}>
                            روبوت "{bot.name_ar}" يمكنه العمل في عدة أسواق. اختر المحافظ التي تريد تفعيله فيها:
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                            {[
                                { k: 'saudi', l: 'الأسهم السعودية 🇸🇦' },
                                { k: 'us', l: 'السوق الأمريكي 🇺🇸' },
                                { k: 'crypto', l: 'العملات رقمية 🪙' }
                            ].map(m => (
                                <div
                                    key={m.k} onClick={() => toggleMarketSelection(m.k)}
                                    style={{
                                        padding: '16px', borderRadius: '12px',
                                        background: selectedMarkets[m.k] ? styles.gold : '#334155',
                                        color: selectedMarkets[m.k] ? '#0f172a' : '#cbd5e1',
                                        fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'space-between'
                                    }}
                                >
                                    <span>{m.l}</span>
                                    {selectedMarkets[m.k] && <span>✔</span>}
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={() => setShowMarketModal(false)} style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid #475569', color: '#cbd5e1', borderRadius: '12px', cursor: 'pointer' }}>إلغاء</button>
                            <button onClick={confirmGlobalCopy} style={{ flex: 1, padding: '12px', background: styles.gold, border: 'none', color: '#0f172a', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>تأكيد النسخ</button>
                        </div>
                    </div>
                </div>
            )}

            <div style={styles.container}>
                <div style={styles.page}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer' }}>←</button>
                        <h1 style={{ fontSize: '20px', margin: 0 }}>ملف الروبوت</h1>
                    </div>

                    {/* Identity Card */}
                    <div style={{
                        background: '#1e293b', padding: '24px', borderRadius: '24px', marginBottom: '24px',
                        border: '1px solid #334155', textAlign: 'center', position: 'relative', overflow: 'hidden'
                    }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '6px', background: getRiskColor(bot.risk) }}></div>
                        <div style={{ fontSize: '64px', marginBottom: '8px' }}>{bot.emoji}</div>
                        <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0', color: 'white' }}>{bot.name_ar}</h2>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
                            <span style={{ fontSize: '12px', background: '#334155', padding: '6px 12px', borderRadius: '8px', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                👥 <strong style={{ color: 'white' }}>{bot.subscribers.toLocaleString()}</strong> ينسخون هذا الروبوت
                            </span>
                        </div>
                    </div>

                    {/* 2. THE Masterclass Section */}
                    <div style={{ marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <span style={{ fontSize: '20px' }}>🧠</span>
                            <h3 style={{ fontSize: '18px', color: styles.gold, margin: 0 }}>كيف أفكر؟ (الشرح التفصيلي)</h3>
                        </div>

                        <div style={{ background: '#0f172a', padding: '20px', borderRadius: '16px', border: '1px solid #334155' }}>
                            <h4 style={{ color: 'white', marginTop: 0, fontSize: '16px' }}>{bot.strategy_title}</h4>
                            <p style={{ lineHeight: '1.8', color: '#cbd5e1', fontSize: '14px', marginBottom: '20px', textAlign: 'justify' }}>
                                {bot.strategy_deep_dive}
                            </p>

                            <h5 style={{ color: '#93c5fd', margin: '0 0 10px 0', fontSize: '14px' }}>📊 المؤشرات التي أراقبها:</h5>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                                {bot.indicators_explained?.map((ind, i) => (
                                    <div key={i} style={{ background: '#1e293b', padding: '12px', borderRadius: '12px', borderRight: `3px solid ${styles.green}` }}>
                                        <span style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>{ind.title}</span>
                                        <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', lineHeight: '1.5' }}>{ind.desc}</p>
                                    </div>
                                ))}
                            </div>

                            <h5 style={{ color: '#fca5a5', margin: '0 0 10px 0', fontSize: '14px' }}>🚪 متى أقرر الخروج؟</h5>
                            <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '12px', border: '1px dashed #ef4444' }}>
                                <p style={{ margin: 0, fontSize: '13px', color: '#e2e8f0', lineHeight: '1.6' }}>
                                    {bot.exit_detailed}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 3. Historical Archives (The Proof) */}
                    <div style={{ marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '20px' }}>📜</span>
                                <h3 style={{ fontSize: '18px', color: '#cbd5e1', margin: 0 }}>الأرشيف الذهبي</h3>
                            </div>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>آخر 12 شهر</span>
                        </div>

                        <div style={{ background: '#1e293b', borderRadius: '16px', border: '1px solid #334155', overflow: 'hidden' }}>
                            {/* Header Row */}
                            <div style={{ display: 'flex', padding: '12px', background: '#0f172a', fontSize: '12px', color: '#94a3b8' }}>
                                <div style={{ flex: 2 }}>السهم</div>
                                <div style={{ flex: 2, textAlign: 'center' }}>التاريخ</div>
                                <div style={{ flex: 1, textAlign: 'left' }}>الربح</div>
                            </div>

                            {/* List Rows */}
                            {trades.length > 0 ? trades.slice(0, 10).map((t, i) => {
                                const isWin = t.profit_pct >= 0;
                                return (
                                    <div
                                        key={t.id || i}
                                        onClick={() => navigate(`/trade/${t.id}`)}
                                        style={{
                                            display: 'flex', alignItems: 'center', padding: '12px',
                                            borderTop: '1px solid #334155',
                                            fontSize: '13px',
                                            cursor: 'pointer',
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#334155'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <div style={{ flex: 2, fontWeight: 'bold' }}>{t.symbol.replace('.SR', '').replace('-USD', '')}</div>
                                        <div style={{ flex: 2, textAlign: 'center', color: '#94a3b8', fontSize: '11px' }}>{t.entry_date}</div>
                                        <div style={{ flex: 1, textAlign: 'left', fontWeight: 'bold', color: isWin ? styles.green : styles.red, direction: 'ltr' }}>
                                            {isWin ? '+' : ''}{t.profit_pct.toFixed(2)}%
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                                    لا توجد صفقات مسجلة بعد لهذا الروبوت.
                                </div>
                            )}

                            <div style={{ padding: '12px', textAlign: 'center', borderTop: '1px solid #334155' }}>
                                <button style={{ background: 'none', border: 'none', color: styles.gold, fontSize: '12px', cursor: 'pointer' }}>
                                    عرض السجل الكامل (145 صفقة) ⬇
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 3. Safety Matrix */}
                    <div style={{ marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <span style={{ fontSize: '20px' }}>🛡️</span>
                            <h3 style={{ fontSize: '18px', color: '#60a5fa', margin: 0 }}>صمامات الأمان</h3>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div style={{ background: '#1e293b', padding: '16px', borderRadius: '16px', textAlign: 'center' }}>
                                <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>وقف الخسارة الإلزامي</p>
                                <p style={{ fontSize: '24px', fontWeight: 'bold', color: styles.red, margin: 0 }}>{bot.stop_loss}</p>
                            </div>
                            <div style={{ background: '#1e293b', padding: '16px', borderRadius: '16px', textAlign: 'center' }}>
                                <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>الهدف الربحي</p>
                                <p style={{ fontSize: '24px', fontWeight: 'bold', color: styles.green, margin: 0 }}>{bot.take_profit}</p>
                            </div>
                        </div>
                    </div>

                    {/* Footer Action */}
                    <div style={{ position: 'fixed', bottom: '90px', left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '430px', padding: '0 16px', zIndex: 100 }}>
                        <button
                            onClick={handleCopyClick}
                            style={{
                                width: '100%',
                                padding: '16px',
                                background: isCopied ? styles.green : styles.gold,
                                color: isCopied ? 'white' : '#0f172a',
                                border: 'none',
                                borderRadius: '16px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                boxShadow: isCopied ? '0 4px 15px rgba(34, 197, 94, 0.4)' : '0 4px 15px rgba(245, 158, 11, 0.4)',
                                cursor: 'pointer',
                                transition: 'all 0.3s'
                            }}>
                            {isCopied ? '✅ تم نسخ الروبوت بنجاح' : 'نسخ صفقات هذا الروبوت ⚡'}
                        </button>
                    </div>

                </div>
                <BottomNav />
            </div>
        </div>
    );
}
