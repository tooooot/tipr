export const ROBOTS_DATA = [
    // --- Universal Strategies (Originally Saudi 🇸🇦) ---
    {
        id: 'al_maestro',
        name: 'المايسترو',
        emoji: '🤖',
        market: 'all',
        description: 'الاستراتيجية الهجينة الذكية: توازن بين النمو والأمان.',
        rule: "زخم صاعد > 2%",
        take_profit: "+8%",
        stop_loss: "-3%"
    },
    {
        id: 'al_qannas',
        name: 'القناص',
        emoji: '🦁',
        market: 'all',
        description: 'اقتناص الفرص السريعة والمضاربة اللحظية.',
        rule: "RSI < 30",
        take_profit: "+5%",
        stop_loss: "-2%"
    },
    {
        id: 'al_hout',
        name: 'الحوت',
        emoji: '🐋',
        market: 'all',
        description: 'تتبع السيولة الذكية وأوامر الهوامير.',
        rule: "حجم تداول > 1B",
        take_profit: "+4%",
        stop_loss: "-2%"
    },
    {
        id: 'sayyad_alfors',
        name: 'صياد الفرص',
        emoji: '🦅',
        market: 'all',
        description: 'الدخول عند الارتداد من القيعان السعرية.',
        rule: "السعر < 1% من قاع 24 ساعة",
        take_profit: "+3%",
        stop_loss: "-1.5%"
    },
    {
        id: 'smart_investor',
        name: 'المستثمر الذكي',
        emoji: '🧠',
        market: 'all',
        description: 'التركيز على الشركات ذات النمو المستدام والعوائد.',
        rule: "نمو سنوي > 15%",
        take_profit: "+20%",
        stop_loss: "-10%"
    },
    {
        id: 'wave_breaker',
        name: 'كاسر الأمواج',
        emoji: '🌊',
        market: 'all',
        description: 'الدخول مع اختراق نقاط المقاومة (Breakout).',
        rule: "اختراق مقاومة 50 يوم",
        take_profit: "+12%",
        stop_loss: "-4%"
    },
    {
        id: 'gap_hunter',
        name: 'صائد الفجوات',
        emoji: '🕳️',
        market: 'all',
        description: 'الاستفادة من الفجوات السعرية عند الافتتاح.',
        rule: "فجوة افتتاح > 1%",
        take_profit: "+2%",
        stop_loss: "-1%"
    },
    {
        id: 'momentum_tracker',
        name: 'متتبع الزخم',
        emoji: '🚀',
        market: 'all',
        description: 'ركوب موجة الصعود القوي (Momentum).',
        rule: "MACD > Signal",
        take_profit: "+15%",
        stop_loss: "-5%"
    },
    {
        id: 'shield_keeper',
        name: 'حارس المحفظة',
        emoji: '🛡️',
        market: 'all',
        description: 'استراتيجية التحوط وتقليل المخاطر (DCA).',
        rule: "DCA أسبوعي",
        take_profit: "+10% (سنوي)",
        stop_loss: "N/A"
    },
    {
        id: 'indicator_pro',
        name: 'خبير المؤشرات',
        emoji: '📊',
        market: 'all',
        description: 'الاعتماد الكلي على التحليل الفني (RSI, MACD, MA).',
        rule: "Golden Cross (MA50 > MA200)",
        take_profit: "+10%",
        stop_loss: "-5%"
    },
    {
        id: 'copy_cat',
        name: 'الناسخ',
        emoji: '👥',
        market: 'all',
        description: 'نسخ صفقات المحافظ الأعلى أداءً تلقائياً.',
        rule: "نسخ أعلى محفظة عائد",
        take_profit: "Variable",
        stop_loss: "Variable"
    },
    {
        id: 'wall_street_wolf',
        name: 'ذئب وول ستريت',
        emoji: '🐺',
        market: 'all',
        description: 'اقتناص الأسهم الأكثر تداولاً وجدلاً.',
        rule: "تداول غير اعتيادي (Unusual Volume)",
        take_profit: "+25%",
        stop_loss: "-15%"
    },
    {
        id: 'tech_titan',
        name: 'عملاق التقنية',
        emoji: '💻',
        market: 'all',
        description: 'متخصص في قطاع التكنولوجيا والذكاء الاصطناعي.',
        rule: "Sector Rotation -> Tech",
        take_profit: "+18%",
        stop_loss: "-8%"
    },
    {
        id: 'dividend_king',
        name: 'ملك التوزيعات',
        emoji: '👑',
        market: 'all',
        description: 'بناء دخل سلبي من توزيعات الأرباح.',
        rule: "Dividend Yield > 4%",
        take_profit: "Income",
        stop_loss: "-10%"
    },
    {
        id: 'crypto_king',
        name: 'ملك الكريبتو',
        emoji: '🤴',
        market: 'all',
        description: 'استراتيجيات خاصة للأصول الرقمية والبيتكوين.',
        rule: "Bitcoin Dominance Trend",
        take_profit: "+30%",
        stop_loss: "-15%"
    },
    {
        id: 'defi_wizard',
        name: 'ساحر الـDeFi',
        emoji: '🧙‍♂️',
        market: 'all',
        description: 'اكتشاف مشاريع التمويل اللامركزي المبكرة.',
        rule: "New Pool Liquidity > 100k",
        take_profit: "+50%",
        stop_loss: "-20%"
    },
    {
        id: 'al_jasour',
        name: "الجسور",
        emoji: "🦅",
        market: "all",
        rule: "هبوط > 5%",
        description: "يشتري عند الهبوط الحاد توقعاً للارتداد (مخاطرة عالية)",
        take_profit: "+10%",
        stop_loss: "-5%",
    }
];
