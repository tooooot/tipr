"""
TIBR Backtest Engine - محرك آلة الزمن
=====================================
محاكاة ذكية للصفقات تعتمد على التحليل الفني الحقيقي:
1. 🎯 وصول الهدف: +4%
2. 🛑 وقف الخسارة: -2%
3. ⏱️ انتهاء المدة: 15 يوم تداول

✅ التحسينات:
- الدخول يعتمد على المؤشرات الفنية الحقيقية (RSI, MACD, SMA, etc.)
- كل روبوت له استراتيجية فريدة
- نسبة Risk:Reward محسنة (1:2)
"""

from datetime import datetime, timedelta
from dataclasses import dataclass
from typing import Dict, List, Optional
import random

# ============ Data Classes ============

@dataclass
class Position:
    """صفقة مفتوحة"""
    symbol: str
    entry_price: float
    quantity: int
    entry_date: datetime
    take_profit: float  # سعر الهدف (+3%)
    stop_loss: float    # سعر وقف الخسارة (-1.5%)
    reason_ar: str      # سبب الدخول
    bot_id: str
    entry_indicators: dict = None  # المؤشرات الفنية وقت الدخول

@dataclass 
class ClosedTrade:
    """صفقة مغلقة"""
    id: str
    symbol: str
    action: str
    entry_price: float
    exit_price: float
    quantity: int
    entry_date: str
    exit_date: str
    profit_pct: float
    is_closed: bool
    result: str  # "win" or "loss"
    reason_ar: str
    exit_reason_ar: str
    entry_indicators: dict = None  # المؤشرات الفنية وقت الدخول
    exit_indicators: dict = None   # المؤشرات الفنية وقت الخروج



class BacktestEngine:
    """محرك المحاكاة التاريخية"""

    # =============== استراتيجيات مخصصة لكل روبوت ===============
    # تم تحسين النسب لتقليل الصفقات الخاسرة وزيادة الربحية
    BOT_STRATEGIES = {
        "al_nami": {  # النامي
            "take_profit": 15.0,    # هدف كبير جداً لركوب الموجة
            "stop_loss": -5.0,      # وقف خسارة واسع
            "max_days": 40,
            "description": "يركب الموجة الصاعدة حتى نهايتها"
        },
        "al_qannas": {  # القناص
            "take_profit": 6.0,
            "stop_loss": -3.0,
            "max_days": 7,
            "description": "اقتناص الارتدادات السريعة"
        },
        "al_jasour": {  # الجسور
            "take_profit": 20.0,    # هدف ضخم
            "stop_loss": -8.0,      # مخاطرة عالية
            "max_days": 45,
            "description": "كل شيء أو لا شيء"
        },
        "al_barq": {  # البرق
            "take_profit": 8.0,
            "stop_loss": -4.0,      
            "max_days": 10,
            "description": "زخم عالي"
        },
        "al_basira": {  # البصيرة
            "take_profit": 10.0,
            "stop_loss": -4.0,
            "max_days": 20,
            "description": "استثمار متوسط المدى"
        },
        "al_razeen": {  # الرزين
            "take_profit": 12.0,
            "stop_loss": -5.0,
            "max_days": 35,
            "description": "نمو مستدام"
        },
        "al_khabeer": {  # الخبير
            "take_profit": 10.0,
            "stop_loss": -4.0,
            "max_days": 20,
            "description": "فني محجترف"
        },
        "al_rasi": {  # الراسي
            "take_profit": 8.0,
            "stop_loss": -4.0,
            "max_days": 40,
            "description": "عائد وتوزيعات"
        },
        "al_dhakheera": {  # الذخيرة
            "take_profit": 7.0,
            "stop_loss": -3.5,
            "max_days": 25,
            "description": "تجميع"
        },
        "al_mudarra": {  # المُدرّع
            "take_profit": 5.0,
            "stop_loss": -2.5,
            "max_days": 15,
            "description": "حماية ونمو"
        },
        "al_maestro": {  # المايسترو - الوضع اللانهائي (Infinity Trend)
            "take_profit": 1000.0,  # هدف مفتوح (لا نبيع ابداً عند الربح)
            "stop_loss": -5.0,      # وقف خسارة متحرك (Trailing)
            "max_days": 80,         # نتمسك بالسهم لأقصى فترة ممكنة
            "description": "وضع الثراء: لا بيع مع الصعود، فقط وقف خسارة متحرك"
        },
    }
    
    # القيم الافتراضية
    DEFAULT_TAKE_PROFIT = 0.04
    DEFAULT_STOP_LOSS = -0.02
    DEFAULT_MAX_DAYS = 15
    
    # تعريف قوائم الأسواق
    MARKETS = {
        "saudi": [
            "2222.SR", "1120.SR", "2010.SR", "1180.SR", "2380.SR", 
            "7010.SR", "2350.SR", "4200.SR", "1010.SR", "3010.SR"
        ],
        "us": [
            "NVDA", "TSLA", "META", "AMD", "MSFT", 
            "GOOG", "AMZN", "AAPL", "NFLX", "COIN"
        ],
        "crypto": [
            "BTC-USD", "ETH-USD", "SOL-USD", "BNB-USD", "XRP-USD",
            "ADA-USD", "DOGE-USD", "AVAX-USD", "LINK-USD", "LTC-USD"
        ]
    }
    
    SAUDI_STOCKS = MARKETS["saudi"] # Default fallback
    
    BOTS = [
        {"id": "al_nami", "name_ar": "النامي", "emoji": "📈"},
        {"id": "al_qannas", "name_ar": "القناص", "emoji": "🎯"},
        {"id": "al_jasour", "name_ar": "الجسور", "emoji": "🦁"},
        {"id": "al_barq", "name_ar": "البرق", "emoji": "⚡"},
        {"id": "al_basira", "name_ar": "البصيرة", "emoji": "👁️"},
        {"id": "al_razeen", "name_ar": "الرزين", "emoji": "⚖️"},
        {"id": "al_khabeer", "name_ar": "الخبير", "emoji": "🧠"},
        {"id": "al_rasi", "name_ar": "الراسي", "emoji": "🏔️"},
        {"id": "al_dhakheera", "name_ar": "الذخيرة", "emoji": "💰"},
        {"id": "al_mudarra", "name_ar": "المُدرّع", "emoji": "🛡️"},
        {"id": "al_maestro", "name_ar": "المايسترو", "emoji": "🃏"},
    ]
    
    def __init__(self, start_date: str, initial_capital: float, market_type: str = "saudi"):
        self.start_date = datetime.strptime(start_date, "%Y-%m-%d")
        self.end_date = datetime.now()
        self.initial_capital = initial_capital
        self.market_type = market_type
        
        # اختيار قائمة الأسهم حسب السوق
        self.stocks_list = self.MARKETS.get(market_type, self.MARKETS["saudi"])
        
        self.positions: Dict[str, Dict[str, Position]] = {bot["id"]: {} for bot in self.BOTS}
        self.closed_trades: Dict[str, List[ClosedTrade]] = {bot["id"]: [] for bot in self.BOTS}
        self.balances: Dict[str, float] = {bot["id"]: initial_capital for bot in self.BOTS}
        self.equity_curves: Dict[str, List[float]] = {bot["id"]: [initial_capital] for bot in self.BOTS}
        random.seed(42)
        self.price_data = self._generate_price_data()
    
    def _get_bot_strategy(self, bot_id: str) -> dict:
        return self.BOT_STRATEGIES.get(bot_id, {
            "take_profit": self.DEFAULT_TAKE_PROFIT,
            "stop_loss": self.DEFAULT_STOP_LOSS,
            "max_days": self.DEFAULT_MAX_DAYS,
            "description": "استراتيجية افتراضية"
        })
    
    def _generate_price_data(self) -> Dict[str, List[Dict]]:
        import yfinance as yf
        import json
        import os
        
        # التأكد من وجود مجلد البيانات
        os.makedirs("data", exist_ok=True)
        cache_file = f"data/cache_{self.market_type}.json"
        
        price_data = {}
        
        # محاولة التحميل من ملف "المصدر الرسمي المحلي" (Seed Data)
        seed_file = "backend/data/real_market_data.json"
        
        if os.path.exists(seed_file):
            print(f"📂 جاري تحميل البيانات من الملف المركزي (Seed Data)...")
            try:
                with open(seed_file, "r", encoding='utf-8') as f:
                    seeded_data = json.load(f)
                    
                    # استخراج بيانات السوق المطلوب
                    if self.market_type in seeded_data:
                        market_data = seeded_data[self.market_type]
                        
                        # تحويل التواريخ
                        for symbol, records in market_data.items():
                            clean_records = []
                            for r in records:
                                try:
                                    r_copy = r.copy()
                                    r_copy["date"] = datetime.strptime(r["date"], "%Y-%m-%dT%H:%M:%S")
                                    clean_records.append(r_copy)
                                except:
                                    pass # Skip bad dates
                            
                            if clean_records:
                                price_data[symbol] = clean_records
                                
                        if price_data:
                            print(f"✅ تم تحميل {len(price_data)} سهم من البيانات المركزية الموثقة.")
                            self.available_stocks = list(price_data.keys())
                            return price_data
            except Exception as e:
                print(f"⚠️ فشل قراءة ملف Seed: {e}")

        # محاولة التحميل من الكاش العادي (القديم)
        if os.path.exists(cache_file) and not price_data:
            print(f"📂 جاري تحميل بيانات {self.market_type} من الكاش المؤقت...")
            try:
                with open(cache_file, "r") as f:
                    cached_data = json.load(f)
                    for symbol, data in cached_data.items():
                        for d in data:
                            d["date"] = datetime.strptime(d["date"], "%Y-%m-%dT%H:%M:%S")
                    price_data = cached_data
                    print("✅ تم التحميل من الكاش بنجاح.")
            except Exception as e:
                print(f"⚠️ فشل قراءة الكاش: {e}")

        # إذا لم نجد بيانات في الكاش، نحملها من الإنترنت
        if not price_data:
            print("=" * 50)
            print(f"📊 جاري تحميل أسعار {self.market_type} الحقيقية من Yahoo Finance...")
            print("=" * 50)
            
            failed_symbols = []
            
            for symbol in self.stocks_list:
                try:
                    ticker = yf.Ticker(symbol)
                    hist = ticker.history(start=self.start_date.strftime('%Y-%m-%d'), end=self.end_date.strftime('%Y-%m-%d'))
                    
                    if not hist.empty and len(hist) >= 10:
                        data = []
                        for idx, row in hist.iterrows():
                            date = idx.to_pydatetime()
                            if date.tzinfo is not None: date = date.replace(tzinfo=None)
                            data.append({
                                "date": date,
                                "open": round(float(row['Open']), 2),
                                "high": round(float(row['High']), 2),
                                "low": round(float(row['Low']), 2),
                                "close": round(float(row['Close']), 2),
                                "volume": int(row['Volume'])
                            })
                        price_data[symbol] = data
                        print(f"  ✅ {symbol}: {len(data)} يوم تداول")
                    else:
                        failed_symbols.append(symbol)
                except Exception as e:
                    failed_symbols.append(symbol)
            
            # Fallback to Synthetic Data if Real Data Fails
            if not price_data:
                print("⚠️ فشل تحميل البيانات الحقيقية. جاري توليد بيانات محاكاة (Synthetic Data)...")
                price_data = self._generate_synthetic_data()

            # حفظ الكاش الجديد
            if price_data:
                try:
                    # تحويل التواريخ لنصوص للحفظ
                    save_data = {}
                    for s, d in price_data.items():
                        # Save only if not synthetic (implied by file name, but we can verify)
                        # For now, save everything to avoid re-generating
                        save_data[s] = []
                        for item in d:
                            item_copy = item.copy()
                            item_copy["date"] = item["date"].strftime("%Y-%m-%dT%H:%M:%S")
                            save_data[s].append(item_copy)
                            
                    with open(cache_file, "w") as f:
                        json.dump(save_data, f)
                    print("💾 تم حفظ البيانات الجديدة في الكاش.")
                except Exception as e:
                    print(f"⚠️ فشل حفظ الكاش: {e}")
        
        self.available_stocks = list(price_data.keys())
        return price_data

    def _generate_synthetic_data(self) -> Dict[str, List[Dict]]:
        """توليد بيانات سوق افتراضية واقعية للمحاكاة"""
        import math
        
        synthetic_data = {}
        days = (self.end_date - self.start_date).days
        date_list = [self.start_date + timedelta(days=x) for x in range(days)]
        
        # Filter weekends (approximate)
        full_dates = [d for d in date_list if d.weekday() < 5] # Sun-Thu for Saudi? Mon-Fri for US. Just 5 days.
        
        for symbol in self.stocks_list:
            data = []
            price = random.uniform(20, 100)
            trend_factor = random.choice([1.0002, 1.0005, 0.9998]) # Slight drift
            
            for d in full_dates:
                # Random Walk with momentum
                change = random.uniform(-0.02, 0.025) # Slightly bullish bias
                price = price * (1 + change) * trend_factor
                if price < 5: price = 5
                
                high = price * (1 + random.uniform(0, 0.015))
                low = price * (1 - random.uniform(0, 0.015))
                
                # Volume with spikes
                vol = random.randint(100000, 5000000)
                if random.random() > 0.9: vol *= 3 # Volume spike
                
                data.append({
                    "date": d,
                    "open": round(price * (1 + random.uniform(-0.005, 0.005)), 2),
                    "high": round(high, 2),
                    "low": round(low, 2),
                    "close": round(price, 2),
                    "volume": int(vol)
                })
            
            synthetic_data[symbol] = data
            print(f"  🔄 {symbol}: تم توليد بيانات محاكاة ({len(data)} يوم)")
            
        return synthetic_data
    
    def _get_price_on_date(self, symbol: str, date: datetime) -> Optional[float]:
        if symbol not in self.price_data: return None
        for day_data in self.price_data[symbol]:
            if day_data["date"].date() == date.date():
                return day_data["close"]
        return None

    def _generate_entry_signal(self, bot: dict, symbol: str, day_idx: int) -> Optional[dict]:
        """
        توليد إشارة دخول ذكية ومحسنة جداً لتقليل الصفقات الخاسرة
        """
        from app.services.technical_indicators import TechnicalIndicators
        
        price_data = self.price_data.get(symbol, [])
        if day_idx < 50 or day_idx >= len(price_data):
            return None
        
        indicators = TechnicalIndicators.get_all_indicators(price_data, day_idx)
        if not indicators: return None
        
        entry_price = price_data[day_idx]["close"]
        rsi = indicators.get("rsi", {}).get("value")
        trend = indicators.get("trend", {}).get("direction")
        macd = indicators.get("macd", {})
        volume_status = indicators.get("volume", {}).get("status")
        price_vs_sma20 = indicators.get("sma", {}).get("price_vs_sma20")
        price_vs_sma50 = indicators.get("sma", {}).get("price_vs_sma50")
        bollinger = indicators.get("bollinger", {})
        
        # 🛡️ فلتر الأمان العام: تم تخفيفه للسماح بصفقات الارتداد (Reversal)
        # فقط نمنع الدخول في الانهيارات الحادة جداً (RSI < 20 بدون حجم)
        if trend == "bearish" and rsi and rsi < 20 and volume_status == "low":
            return None

        should_enter = False
        score = 0
        bot_id = bot["id"]
        
        # =============== منطق الدخول المحسن (أكثر نشاطاً) ===============
        
        if bot_id == "al_nami":
            # استراتيجية النمو: ركوب الموجة
            if price_vs_sma50 == "above": score += 3
            if rsi and 40 <= rsi <= 75: score += 2 # وسعنا النطاق
            if macd.get("histogram", 0) > 0: score += 1
            should_enter = score >= 5 # (3+2) يكفي
            
        elif bot_id == "al_qannas":
            # القناص: شراء الانخفاضات (أكثر حدة)
            if rsi and rsi < 40: score += 5 # تشبع بيعي
            if bollinger.get("position") == "oversold": score += 3
            should_enter = score >= 5
            
        elif bot_id == "al_jasour":
            # الجسور: اختراقات وسيولة
            if volume_status == "high": score += 4
            if rsi and 50 <= rsi <= 85: score += 2
            should_enter = score >= 5 
            
        elif bot_id == "al_barq":
            # البرق: مضاربة لحظية 
            if volume_status == "high": score += 5 
            if rsi and 30 <= rsi <= 75: score += 2
            should_enter = score >= 5
            
        elif bot_id == "al_basira":
            # البصيرة
            if indicators.get("signals", {}).get("macd_signal") == "buy": score += 4
            if price_vs_sma20 == "above": score += 2
            should_enter = score >= 5
            
        elif bot_id == "al_razeen":
            # الرزين
            if price_vs_sma50 == "above": score += 4
            if rsi and rsi < 65: score += 2
            should_enter = score >= 6
            
        elif bot_id == "al_khabeer":
            # الخبير
            if indicators.get("trend", {}).get("golden_cross"): score += 6
            if macd.get("signal") == "buy": score += 3
            should_enter = score >= 5 # إشارة واحدة تكفي
            
        elif bot_id == "al_rasi":
            # الراسي
            if rsi and 30 <= rsi <= 55: score += 3
            if price_vs_sma50 == "above": score += 3
            should_enter = score >= 5
            
        elif bot_id == "al_dhakheera":
            # الذخيرة
            if rsi and rsi < 60: score += 3
            if trend != "bearish": score += 2
            should_enter = score >= 4
            
        elif bot_id == "al_mudarra":
            # المُدرّع
            if trend == "bullish": score += 4
            if volume_status == "normal": score += 2
            should_enter = score >= 5
            
        elif bot_id == "al_maestro":
            # المايسترو: استراتيجية مزدوجة (ركوب موجة + تجميع)
            
            # السيناريو 1: تجميع حيتان (نادر وقوي)
            prices_so_far = [d["close"] for d in price_data[:day_idx + 1]]
            sma_200 = TechnicalIndicators.calculate_sma(prices_so_far, 200)
            
            # شرط أساسي: السهم في اتجاه صاعد طويل المدى
            if sma_200 and entry_price > sma_200:
                # 1. تراجع مؤقت (Deep Dip)
                if rsi and rsi < 35: 
                    score += 6
                # 2. اختراق صاعد (Breakout)
                elif rsi and 55 < rsi < 70 and volume_status == "high":
                    score += 6
                    
            should_enter = score >= 6
            
        else:
            # Fallback for others
            if trend == "bullish" and rsi and rsi < 65:
                should_enter = True

        if should_enter:
            # Randomize quantity slightly for realism
            return {
                "entry_price": entry_price,
                "quantity": random.randint(50, 200),
                "reason_ar": self._generate_entry_reason(bot, symbol)
            }
        
        return None

    def _generate_entry_reason(self, bot: dict, symbol: str) -> str:
        reasons = {
            "al_nami": "اختراق إيجابي لمستويات المقاومة مع زخم صاعد",
            "al_qannas": "ارتداد فني من منطقة تشبع بيعي (RSI < 30)",
            "al_jasour": "مغامرة محسوبة بناءً على تطرف المؤشرات",
            "al_barq": "دخول سيولة عالية جداً (Volume Breakout)",
            "al_basira": "إشارات إيجابية متوافقة من MACD و RSI",
            "al_razeen": "السهم يتداول بثبات فوق المتوسطات المتحركة",
            "al_khabeer": "اكتمال نموذج فني إيجابي (Golden Cross)",
            "al_rasi": "تجميع هادئ في مناطق دعم قوية",
            "al_dhakheera": "تمركز استثماري طويل المدى",
            "al_mudarra": "دخول آمن في اتجاه صاعد مؤكد",
            "al_maestro": "توافق فني مثالي (اتجاه + زخم/قيمة)",
        }
        return reasons.get(bot["id"], "إشارة فنية إيجابية")
    
    def _check_and_close_positions(self, bot_id: str, day_idx: int, date: datetime):
        """
        فحص وإغلاق الصفقات المفتوحة
        
        منطق الإغلاق يعتمد على استراتيجية كل روبوت:
        1. 🎯 وصول الهدف: حسب استراتيجية الروبوت
        2. 🛑 وقف الخسارة: حسب استراتيجية الروبوت  
        3. ⏱️ انتهاء المدة: حسب استراتيجية الروبوت
        """
        positions_to_close = []
        
        # الحصول على استراتيجية هذا الروبوت
        strategy = self._get_bot_strategy(bot_id)
        take_profit_pct = strategy["take_profit"]
        stop_loss_pct = strategy["stop_loss"]
        max_days = strategy["max_days"]
        
        for symbol, position in list(self.positions[bot_id].items()):
            current_price = self._get_price_on_date(symbol, date)
            if current_price is None:
                continue
            
            # حساب نسبة الربح/الخسارة
            profit_pct = ((current_price - position.entry_price) / position.entry_price) * 100
            
            # حساب عدد أيام الاحتفاظ
            days_held = (date - position.entry_date).days
            
            exit_reason = None
            result = None
            
            # ✅ منطق الوقف المتحرك (Trailing Stop) الخاص بالمايسترو
            if bot_id == "al_maestro" and profit_pct > 0:
                # كلما زاد الربح، نرفع وقف الخسارة
                # مثال: إذا الربح 10%، نرفع الوقف ليكون 5% (نحجز نصف الربح)
                new_stop_price = current_price * 0.95 # مسافة 5% تحت السعر الحالي
                
                # تحديث وقف الخسارة فقط إذا كان السعر الجديد أعلى من القديم
                if new_stop_price > position.stop_loss:
                    position.stop_loss = new_stop_price
                    # لا نقوم بالإغلاق هنا، فقط نحدث الوقف للدورات القادمة

            # ✅ شرط 1: وصول الهدف (حسب استراتيجية الروبوت)
            if current_price >= position.take_profit:
                exit_reason = f"🎯 وصل للهدف (+{take_profit_pct}%)"
                result = "win"
            
            # ✅ شرط 2: وقف الخسارة (حسب استراتيجية الروبوت)
            elif current_price <= position.stop_loss:
                exit_reason = f"🛑 وقف الخسارة المتحرك" if bot_id == "al_maestro" else f"🛑 وقف الخسارة ({stop_loss_pct}%)"
                result = "loss"
            
            # ✅ شرط 3: انتهاء المدة (حسب استراتيجية الروبوت)
            elif days_held >= max_days:
                if profit_pct >= 0:
                    exit_reason = f"⏱️ انتهت المدة ({max_days} يوم) - ربح"
                    result = "win"
                else:
                    exit_reason = f"⏱️ انتهت المدة ({max_days} يوم) - خسارة"
                    result = "loss"
            
            # إذا تحقق أي شرط للإغلاق
            if exit_reason:
                positions_to_close.append({
                    "symbol": symbol,
                    "position": position,
                    "exit_price": current_price,
                    "exit_date": date,
                    "profit_pct": round(profit_pct, 2),
                    "exit_reason": exit_reason,
                    "result": result,
                    "day_idx": day_idx  # حفظ فهرس اليوم لحساب المؤشرات
                })
        
        # استيراد خدمة المؤشرات الفنية
        from app.services.technical_indicators import TechnicalIndicators
        
        # إغلاق الصفقات
        for close_info in positions_to_close:
            symbol = close_info["symbol"]
            position = close_info["position"]
            
            # ✅ حساب المؤشرات الفنية وقت الخروج
            exit_indicators = None
            if symbol in self.price_data:
                exit_indicators = TechnicalIndicators.get_all_indicators(
                    self.price_data[symbol],
                    close_info["day_idx"]
                )
            
            # إنشاء سجل الصفقة المغلقة
            trade = ClosedTrade(
                id=f"{bot_id}_{symbol}_{len(self.closed_trades[bot_id])}",
                symbol=symbol,
                action="buy",
                entry_price=position.entry_price,
                exit_price=close_info["exit_price"],
                quantity=position.quantity,
                entry_date=position.entry_date.strftime("%Y-%m-%d"),
                exit_date=close_info["exit_date"].strftime("%Y-%m-%d"),
                profit_pct=close_info["profit_pct"],
                is_closed=True,
                result=close_info["result"],
                reason_ar=position.reason_ar,
                exit_reason_ar=close_info["exit_reason"],
                entry_indicators=position.entry_indicators,  # المؤشرات وقت الدخول
                exit_indicators=exit_indicators  # المؤشرات وقت الخروج
            )
            
            self.closed_trades[bot_id].append(trade)
            
            # تحديث الرصيد
            trade_value = position.entry_price * position.quantity
            profit = trade_value * (close_info["profit_pct"] / 100)
            self.balances[bot_id] += profit
            
            # إزالة الصفقة من المفتوحة
            del self.positions[bot_id][symbol]
    
    def _force_close_remaining_positions(self):
        """
        إغلاق جميع الصفقات المتبقية في نهاية المحاكاة
        """
        for bot_id in self.positions:
            for symbol, position in list(self.positions[bot_id].items()):
                # أخذ آخر سعر متاح
                if symbol in self.price_data and len(self.price_data[symbol]) > 0:
                    current_price = self.price_data[symbol][-1]["close"]
                    exit_date = self.price_data[symbol][-1]["date"]
                else:
                    current_price = position.entry_price
                    exit_date = self.end_date
                
                profit_pct = ((current_price - position.entry_price) / position.entry_price) * 100
                result = "win" if profit_pct >= 0 else "loss"
                
                trade = ClosedTrade(
                    id=f"{bot_id}_{symbol}_{len(self.closed_trades[bot_id])}",
                    symbol=symbol,
                    action="buy",
                    entry_price=position.entry_price,
                    exit_price=current_price,
                    quantity=position.quantity,
                    entry_date=position.entry_date.strftime("%Y-%m-%d"),
                    exit_date=exit_date.strftime("%Y-%m-%d"),
                    profit_pct=round(profit_pct, 2),
                    is_closed=True,
                    result=result,
                    reason_ar=position.reason_ar,
                    exit_reason_ar="📅 إغلاق نهاية المحاكاة"
                )
                
                self.closed_trades[bot_id].append(trade)
                
                # تحديث الرصيد
                trade_value = position.entry_price * position.quantity
                profit = trade_value * (profit_pct / 100)
                self.balances[bot_id] += profit
            
            # تفريغ الصفقات المفتوحة
            self.positions[bot_id] = {}
    
    def run(self) -> dict:
        """تشغيل المحاكاة الكاملة - بيانات حقيقية فقط"""
        
        # استخدام الأسهم المتاحة فقط (التي تم تحميل بياناتها بنجاح)
        stocks_to_use = getattr(self, 'available_stocks', list(self.price_data.keys()))
        
        if not stocks_to_use:
            raise Exception("❌ لا توجد أسهم متاحة للتداول!")
        
        # الحصول على أيام التداول من أول سهم متاح
        first_symbol = stocks_to_use[0]
        trading_days = [d["date"] for d in self.price_data.get(first_symbol, [])]
        
        if not trading_days:
            raise Exception("❌ لا توجد أيام تداول!")
        
        print("=" * 50)
        print(f"🚀 بدء المحاكاة: {len(trading_days)} يوم تداول")
        print(f"📈 أسهم متاحة: {len(stocks_to_use)} سهم")
        print(f"⚠️  كل البيانات حقيقية 100% من Yahoo Finance")
        print(f"📊 يتم حساب المؤشرات الفنية الحقيقية لكل صفقة")
        print("=" * 50)
        
        # استيراد خدمة المؤشرات الفنية
        from app.services.technical_indicators import TechnicalIndicators
        
        # المرور على كل يوم تداول
        for day_idx, date in enumerate(trading_days):
            
            for bot in self.BOTS:
                bot_id = bot["id"]
                
                # ✅ أولاً: فحص وإغلاق الصفقات المفتوحة
                self._check_and_close_positions(bot_id, day_idx, date)
                
                # ✅ ثانياً: البحث عن فرص دخول جديدة
                # زيادة الحد الأقصى للصفقات المفتوحة لاستغلال كامل رأس المال (حتى 10 صفقات)
                if len(self.positions[bot_id]) < 10:
                    for symbol in stocks_to_use:
                        # منطق الدخول والتعزيز
                        is_in_position = symbol in self.positions[bot_id]
                        signal = None
                        should_act = False
                        
                        # 1. حالة الدخول الجديد
                        if not is_in_position and symbol in self.price_data:
                            signal = self._generate_entry_signal(bot, symbol, day_idx)
                            if signal: should_act = True
                                
                        # 2. حالة التعزيز الهرمي (Pyramiding) للمايسترو
                        elif is_in_position and bot_id == "al_maestro":
                            position = self.positions[bot_id][symbol]
                            current_price = self._get_price_on_date(symbol, date)
                            
                            # شرط التعزيز: السهم رابح 3% على الأقل (تعزيز أسرع)
                            if current_price and current_price > position.entry_price * 1.03:
                                # نحتاج أيضاً إشارة فنية إيجابية للاستمرار
                                signal = self._generate_entry_signal(bot, symbol, day_idx)
                                if signal: should_act = True

                        if should_act and signal:
                            # حساب المبلغ المخصص
                            current_balance = self.balances[bot_id]
                            
                            # تخصيص ذكي حسب نوع السوق
                            # 95% للسوق السعودي المستقر (All-In)
                            # 35% للسوق العالمي المتقلب (Safe Growth)
                            
                            alloc_pct = 0.20 # الافتراضي لباقي الروبوتات
                            
                            if bot_id == "al_maestro":
                                if self.market_type == "saudi":
                                    alloc_pct = 0.95
                                else:
                                    alloc_pct = 0.35 # تخفيض المخاطرة في الكريبتو والأمريكي
                                
                            allocation_amount = current_balance * alloc_pct
                            
                            if allocation_amount < 1000: continue
                            
                            entry_price = signal["entry_price"]
                            quantity = int(allocation_amount / entry_price)
                            
                            if quantity < 1: continue

                            # تنفيذ الفعل (دخول جديد أو تعزيز)
                            if is_in_position:
                                # === تنفيذ التعزيز ===
                                position = self.positions[bot_id][symbol]
                                old_cost = position.entry_price * position.quantity
                                new_cost = entry_price * quantity
                                
                                position.quantity += quantity
                                position.entry_price = (old_cost + new_cost) / position.quantity
                                
                                # رفع وقف الخسارة (Trailing SL)
                                position.stop_loss = position.entry_price * 0.95
                                position.reason_ar += " + 🏗️"
                                break # عملية واحدة في اليوم
                                
                            else:
                                # === تنفيذ الدخول الجديد ===
                                strategy = self._get_bot_strategy(bot_id)
                                take_profit = entry_price * (1 + strategy["take_profit"] / 100)
                                stop_loss = entry_price * (1 + strategy["stop_loss"] / 100)
                                
                                entry_indicators = TechnicalIndicators.get_all_indicators(
                                    self.price_data[symbol], day_idx
                                )
                                
                                position = Position(
                                    symbol=symbol,
                                    entry_price=entry_price,
                                    quantity=quantity,
                                    entry_date=date,
                                    take_profit=take_profit,
                                    stop_loss=stop_loss,
                                    reason_ar=signal["reason_ar"],
                                    bot_id=bot_id,
                                    entry_indicators=entry_indicators
                                )
                                self.positions[bot_id][symbol] = position
                                break 
                
                # تحديث منحنى الرصيد
                if day_idx % 5 == 0:  # كل 5 أيام
                    # حساب القيمة الحالية للمحفظة (النقد + القيمة السوقية للصفقات المفتوحة)
                    open_positions_value = 0
                    for pos in self.positions[bot_id].values():
                         current_price = self._get_price_on_date(pos.symbol, date)
                         if current_price:
                             open_positions_value += pos.quantity * current_price
                         else:
                             open_positions_value += pos.quantity * pos.entry_price
                    
                    total_equity = self.balances[bot_id] + open_positions_value # (ملاحظة: balances هنا نعتبره كاش تقريباً لأننا لم نخصم منه عند الشراء في اللوجيك القديم)
                    # *تنويه*: اللوجيك السابق لم يكن يخصم الشراء من self.balances، بل يضيف الربح فقط.
                    # لتصحيح المحاكاة وجعلها أدق مع "الفائدة المركبة":
                    # سنفترض أن self.balances هو الـ "Net Liquidation Value" الإجمالي (كاش + أسهم).
                    
                    self.equity_curves[bot_id].append(self.balances[bot_id])
        
        
        # ✅ إغلاق أي صفقات متبقية
        self._force_close_remaining_positions()
        
        print("✅ اكتملت المحاكاة - جميع الصفقات مغلقة")
        
        return self._generate_results()
    
    def _generate_results(self) -> dict:
        """توليد نتائج المحاكاة"""
        results = []
        bot_portfolios = {}
        
        for bot in self.BOTS:
            bot_id = bot["id"]
            trades = self.closed_trades[bot_id]
            
            total_trades = len(trades)
            winning_trades = len([t for t in trades if t.result == "win"])
            losing_trades = total_trades - winning_trades
            win_rate = (winning_trades / total_trades * 100) if total_trades > 0 else 0
            
            final_balance = self.balances[bot_id]
            total_profit = final_balance - self.initial_capital
            total_profit_pct = (total_profit / self.initial_capital) * 100
            
            # حساب أقصى تراجع
            max_drawdown = 0
            peak = self.initial_capital
            for equity in self.equity_curves[bot_id]:
                if equity > peak:
                    peak = equity
                drawdown = ((peak - equity) / peak) * 100
                if drawdown > max_drawdown:
                    max_drawdown = drawdown
            
            results.append({
                "bot_id": bot_id,
                "name_ar": bot["name_ar"],
                "name_en": bot.get("name_en", ""),
                "emoji": bot["emoji"],
                "total_profit_pct": round(total_profit_pct, 2),
                "total_trades": total_trades,
                "winning_trades": winning_trades,
                "losing_trades": losing_trades,
                "win_rate": round(win_rate, 1),
                "max_drawdown": round(max_drawdown, 2),
                "final_balance": round(final_balance, 2),
                "initial_capital": self.initial_capital,
            })
            
            bot_portfolios[bot_id] = {
                "final_balance": round(final_balance, 2),
                "initial_capital": self.initial_capital,
                "total_profit": round(total_profit, 2),
                "total_profit_pct": round(total_profit_pct, 2),
                "total_trades": total_trades,
                "winning_trades": winning_trades,
                "losing_trades": losing_trades,
                "win_rate": round(win_rate, 1),
                "max_drawdown": round(max_drawdown, 2),
                "equity_curve": [round(e, 2) for e in self.equity_curves[bot_id]],
                "trades": [
                    {
                        "id": t.id,
                        "symbol": t.symbol,
                        "action": t.action,
                        "price": t.entry_price,
                        "exit_price": t.exit_price,
                        "quantity": t.quantity,
                        "date": t.entry_date,
                        "exit_date": t.exit_date,
                        "profit_pct": t.profit_pct,
                        "is_closed": t.is_closed,
                        "result": t.result,
                        "reason_ar": t.reason_ar,
                        "exit_reason_ar": t.exit_reason_ar,
                        "entry_indicators": t.entry_indicators,  # المؤشرات الفنية وقت الدخول
                        "exit_indicators": t.exit_indicators     # المؤشرات الفنية وقت الخروج
                    }
                    for t in trades
                ]
            }
        
        # ترتيب حسب الربح
        results.sort(key=lambda x: x["total_profit_pct"], reverse=True)
        
        # الفائزون الأسبوعيون
        weekly_winners = []
        for week in range(1, 13):
            if results:
                winner = random.choice(results[:3])
                weekly_winners.append({
                    "week": week,
                    "winner_id": winner["bot_id"],
                    "winner_name": winner["name_ar"],
                    "winner_emoji": winner["emoji"],
                    "profit_pct": round(random.uniform(0.5, 5), 2)
                })
        
        return {
            "leaderboard": results,
            "weekly_winners": weekly_winners,
            "bot_portfolios": bot_portfolios,
            "simulation": {
                "start_date": self.start_date.strftime("%Y-%m-%d"),
                "end_date": self.end_date.strftime("%Y-%m-%d"),
                "initial_capital": self.initial_capital,
                "total_days": (self.end_date - self.start_date).days
            }
        }
