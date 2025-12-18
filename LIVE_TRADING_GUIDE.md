# 🤖 دليل ربط Tipr بالتداول الفعلي (Live Trading)

## ⚠️ تحذير مهم جداً

**التداول بأموال حقيقية ينطوي على مخاطر كبيرة!**
- ابدأ دائماً بـ **Paper Trading** (محاكاة)
- لا تستثمر أكثر مما تستطيع خسارته
- اختبر الروبوت لمدة شهر على الأقل قبل استخدام أموال حقيقية

---

## 📍 الخطوات الأساسية

### 1️⃣ اختيار منصة التداول

#### للكريبتو (الأسهل):
- **Binance** ✅ الأفضل - حجم تداول كبير
- **Bybit** - بديل جيد
- **KuCoin** - خيار آخر

#### للأسهم الأمريكية:
- **Alpaca** ✅ مجاني + Paper Trading
- **Interactive Brokers** - احترافي

#### للأسهم السعودية:
- ⚠️ لا توجد منصات تدعم API مباشر للأفراد
- يمكن استخدام CFD brokers أو Interactive Brokers

---

## 2️⃣ إنشاء API Key في Binance

### الخطوات:

1. **إنشاء حساب في Binance**
   - اذهب إلى: https://www.binance.com
   - سجل حساب جديد
   - أكمل التحقق من الهوية (KYC)

2. **إنشاء API Key**
   - اذهب إلى: Account → API Management
   - اضغط "Create API"
   - اختر "System Generated"
   - احفظ الـ API Key و Secret Key في مكان آمن ❗

3. **تفعيل الصلاحيات الصحيحة**
   - ✅ Enable Reading
   - ✅ Enable Spot & Margin Trading
   - ❌ Enable Withdrawals (غير مستحسن للأمان)

4. **تقييد IP Address** (اختياري لكن مهم للأمان)
   - يمكنك تحديد IP الخاص بك فقط

---

## 3️⃣ تثبيت المكتبة

```bash
pip install python-binance ccxt
```

- **python-binance**: مكتبة رسمية من Binance
- **ccxt**: مكتبة موحدة تدعم أكثر من 100 منصة

---

## 4️⃣ ملف الإعدادات الآمن

**إنشاء ملف `.env` لحفظ المفاتيح بشكل آمن:**

```env
# ملف .env - لا ترفعه على GitHub أبداً!

# Binance API Keys
BINANCE_API_KEY=your_api_key_here
BINANCE_SECRET_KEY=your_secret_key_here

# Trading Settings
TRADE_MODE=TEST  # TEST أو LIVE
MAX_POSITION_SIZE=100  # أقصى قيمة للصفقة بالدولار
MAX_OPEN_TRADES=5  # أقصى عدد صفقات مفتوحة

# Risk Management
STOP_LOSS_PCT=0.02  # 2%
TAKE_PROFIT_PCT=0.05  # 5%
```

**تثبيت مكتبة لقراءة `.env`:**
```bash
pip install python-dotenv
```

---

## 5️⃣ كود الروبوت للتداول الحقيقي

إليك نموذج مبسط:

```python
"""
🚨 Tipr - Live Trading Engine
تحذير: استخدم بحذر شديد!
"""

import os
from binance.client import Client
from binance.enums import *
from dotenv import load_dotenv

# تحميل الإعدادات
load_dotenv()

# الاتصال بـ Binance
api_key = os.getenv('BINANCE_API_KEY')
secret_key = os.getenv('BINANCE_SECRET_KEY')
trade_mode = os.getenv('TRADE_MODE', 'TEST')

# إنشاء العميل
if trade_mode == 'TEST':
    client = Client(api_key, secret_key, testnet=True)  # Paper Trading
    print("🧪 وضع الاختبار - لا توجد أموال حقيقية")
else:
    client = Client(api_key, secret_key)
    print("🔴 وضع التداول الحقيقي - LIVE!")

# === مثال: شراء Bitcoin ===
def execute_buy_order(symbol, amount_usd):
    """
    تنفيذ صفقة شراء
    symbol: مثل 'BTCUSDT'
    amount_usd: القيمة بالدولار
    """
    try:
        # الحصول على السعر الحالي
        ticker = client.get_symbol_ticker(symbol=symbol)
        price = float(ticker['price'])
        
        # حساب الكمية
        quantity = amount_usd / price
        
        # تنفيذ الصفقة (Market Order)
        order = client.order_market_buy(
            symbol=symbol,
            quantity=round(quantity, 6)  # تقريب للعدد المسموح
        )
        
        print(f"✅ تم الشراء: {symbol}")
        print(f"   السعر: {price}")
        print(f"   الكمية: {quantity}")
        print(f"   Order ID: {order['orderId']}")
        
        return order
        
    except Exception as e:
        print(f"❌ خطأ في الشراء: {e}")
        return None


# === مثال: بيع ===
def execute_sell_order(symbol, quantity):
    """تنفيذ صفقة بيع"""
    try:
        order = client.order_market_sell(
            symbol=symbol,
            quantity=quantity
        )
        
        print(f"✅ تم البيع: {symbol}")
        return order
        
    except Exception as e:
        print(f"❌ خطأ في البيع: {e}")
        return None


# === مثال: وضع أوامر Stop Loss & Take Profit ===
def set_stop_loss_take_profit(symbol, quantity, stop_price, target_price):
    """
    وضع Stop Loss و Take Profit تلقائياً
    """
    try:
        # Stop Loss (OCO Order)
        order = client.create_oco_order(
            symbol=symbol,
            side=SIDE_SELL,
            quantity=quantity,
            price=str(target_price),  # Take Profit
            stopPrice=str(stop_price),  # Stop Loss
            stopLimitPrice=str(stop_price * 0.99),  # Stop Limit
            stopLimitTimeInForce=TIME_IN_FORCE_GTC
        )
        
        print(f"✅ تم وضع Stop Loss & Take Profit")
        return order
        
    except Exception as e:
        print(f"❌ خطأ: {e}")
        return None


# === فحص الرصيد ===
def get_balance(asset='USDT'):
    """الحصول على الرصيد"""
    try:
        balance = client.get_asset_balance(asset=asset)
        free = float(balance['free'])
        locked = float(balance['locked'])
        
        print(f"💰 {asset} Balance:")
        print(f"   متاح: {free}")
        print(f"   محجوز: {locked}")
        
        return free
        
    except Exception as e:
        print(f"❌ خطأ: {e}")
        return 0


# === اختبار الاتصال ===
if __name__ == "__main__":
    print("=" * 60)
    print("🤖 Tipr Live Trading Engine")
    print("=" * 60)
    
    # اختبار الاتصال
    try:
        status = client.get_system_status()
        print(f"✅ الاتصال ناجح - Status: {status}")
        
        # عرض الرصيد
        balance = get_balance('USDT')
        
        # مثال: شراء تجريبي بـ 10 دولار
        if trade_mode == 'TEST':
            print("\n📊 اختبار صفقة شراء...")
            # execute_buy_order('BTCUSDT', 10)
            
    except Exception as e:
        print(f"❌ خطأ في الاتصال: {e}")
```

---

## 6️⃣ دمج الروبوتات الموجودة

لربط `live_robot_engine.py` الحالي بالتداول الفعلي:

### التعديلات المطلوبة:

```python
# في ملف live_robot_engine.py

# بدلاً من:
def create_trade(stock, market, signal, price):
    # حفظ في JSON فقط...
    
# استخدم:
def create_trade(stock, market, signal, price):
    # 1. حفظ في JSON (كما هو)
    trade = {...}
    
    # 2. تنفيذ الصفقة الحقيقية
    if TRADE_MODE == 'LIVE':
        execute_buy_order(stock['symbol'], MAX_POSITION_SIZE)
        set_stop_loss_take_profit(
            symbol=stock['symbol'],
            quantity=...,
            stop_price=trade['stop_loss'],
            target_price=trade['take_profit']
        )
    
    return trade
```

---

## 7️⃣ خطة التنفيذ الموصى بها

### المرحلة 1: الاختبار (أسبوعين)
1. استخدم **Binance Testnet** (Paper Trading)
2. راقب أداء الروبوتات
3. سجل جميع الصفقات

### المرحلة 2: التداول الصغير (شهر)
1. ابدأ بـ **50-100 دولار فقط**
2. صفقات صغيرة (10 دولار لكل صفقة)
3. راقب النتائج بدقة

### المرحلة 3: التوسع التدريجي
1. إذا نجح الروبوت لمدة شهر
2. زد رأس المال تدريجياً
3. احتفظ بسجلات دقيقة

---

## 8️⃣ إدارة المخاطر (CRITICAL!)

```python
# قواعد حماية رأس المال

MAX_DAILY_LOSS = 50  # أقصى خسارة يومية بالدولار
MAX_POSITION_SIZE = 100  # أقصى قيمة للصفقة
MAX_OPEN_TRADES = 3  # أقصى عدد صفقات مفتوحة

daily_loss = 0

def should_trade():
    """فحص إذا يمكن فتح صفقة جديدة"""
    if daily_loss >= MAX_DAILY_LOSS:
        print("🛑 تم الوصول للحد اليومي!")
        return False
    
    if len(active_trades) >= MAX_OPEN_TRADES:
        print("🛑 الحد الأقصى للصفقات المفتوحة!")
        return False
    
    return True
```

---

## 9️⃣ الأمان

### ✅ افعل:
- احفظ API Keys في ملف `.env`
- أضف `.env` إلى `.gitignore`
- استخدم IP Whitelist في Binance
- ابدأ بـ Paper Trading
- فعّل 2FA على حسابك

### ❌ لا تفعل:
- لا ترفع API Keys على GitHub
- لا تفعّل صلاحية السحب (Withdrawal)
- لا تستثمر كل أموالك
- لا تترك الروبوت بدون مراقبة

---

## 🔟 موارد إضافية

- **Binance API Docs**: https://binance-docs.github.io/apidocs/spot/en/
- **python-binance**: https://python-binance.readthedocs.io/
- **Alpaca (للأسهم)**: https://alpaca.markets/docs/
- **CCXT (متعدد المنصات)**: https://docs.ccxt.com/

---

## 📞 هل تريد أن أساعدك في:

1. ✅ إنشاء ملف `live_trading_engine.py` كامل؟
2. ✅ دمج التداول الحقيقي مع الروبوتات الحالية؟
3. ✅ إعداد Binance Testnet للاختبار؟
4. ✅ إضافة نظام إدارة مخاطر متقدم؟

**أخبرني ماذا تريد أن نبدأ به! 🚀**
