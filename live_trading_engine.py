"""
🚨 TIPR LIVE TRADING ENGINE
===========================
ربط الروبوتات بالتداول الفعلي على Binance

⚠️ تحذير: استخدم Paper Trading أولاً!
"""

import os
import json
import time
from datetime import datetime
from dotenv import load_dotenv
from binance.client import Client
from binance.enums import *
from binance.exceptions import BinanceAPIException

# تحميل الإعدادات
load_dotenv()

# === الإعدادات ===
TRADE_MODE = os.getenv('TRADE_MODE', 'TEST')  # TEST أو LIVE
MAX_POSITION_SIZE = float(os.getenv('MAX_POSITION_SIZE', 50))  # دولار
MAX_OPEN_TRADES = int(os.getenv('MAX_OPEN_TRADES', 3))
MAX_DAILY_LOSS = float(os.getenv('MAX_DAILY_LOSS', 100))  # دولار
SCAN_INTERVAL = 60  # ثانية

# === Binance API ===
api_key = os.getenv('BINANCE_API_KEY')
secret_key = os.getenv('BINANCE_SECRET_KEY')

if not api_key or not secret_key:
    print("❌ خطأ: لم يتم العثور على API Keys!")
    print("📌 أنشئ ملف .env وأضف:")
    print("   BINANCE_API_KEY=your_key")
    print("   BINANCE_SECRET_KEY=your_secret")
    exit(1)

# الاتصال بـ Binance
try:
    if TRADE_MODE == 'TEST':
        # Paper Trading (Testnet)
        client = Client(api_key, secret_key, testnet=True)
        print("🧪 وضع الاختبار - Paper Trading")
        print("📍 https://testnet.binance.vision/")
    else:
        # Live Trading
        client = Client(api_key, secret_key)
        print("🔴 وضع التداول الحقيقي - LIVE!")
        print("⚠️  تأكد من إعدادات إدارة المخاطر!")
except Exception as e:
    print(f"❌ خطأ في الاتصال: {e}")
    exit(1)

# === الروبوتات ===
ROBOTS = {
    "al_qannas": {
        "name": "القناص",
        "emoji": "🦁",
        "strategy": "RSI_OVERSOLD",
        "take_profit": 0.05,  # 5% (Increased slightly)
        "stop_loss": 0.02,   # 2%
    },
    "crypto_king": {
        "name": "ملك الكريبتو",
        "emoji": "🤴",
        "strategy": "AGGRESSIVE_TREND",
        "take_profit": 0.30, # 30% Target
        "stop_loss": 0.15,   # 15% Stop
    },
    "wall_street_wolf": {
        "name": "ذئب وول ستريت",
        "emoji": "🐺",
        "strategy": "BREAKOUT",
        "take_profit": 0.25, # 25% Target
        "stop_loss": 0.15,   # 15% Stop
    },
}

# === الأزواج المراقبة ===
WATCHLIST = [
    'BTCUSDT',
    'ETHUSDT',
    'BNBUSDT',
    'SOLUSDT',
    'DOGEUSDT', # Meme/High Volatility
    'PEPEUSDT', # Meme/High Volatility
    'SHIBUSDT', # Meme/High Volatility
    'XRPUSDT',
]

# === متغيرات التتبع ===
active_trades = {}
closed_trades = []
daily_loss = 0
price_history = {}


# === وظائف Binance ===

def get_balance(asset='USDT'):
    """الحصول على الرصيد"""
    try:
        balance = client.get_asset_balance(asset=asset)
        return float(balance['free'])
    except Exception as e:
        print(f"❌ خطأ في جلب الرصيد: {e}")
        return 0


def get_current_price(symbol):
    """الحصول على السعر الحالي"""
    try:
        ticker = client.get_symbol_ticker(symbol=symbol)
        return float(ticker['price'])
    except Exception as e:
        print(f"❌ خطأ في جلب السعر {symbol}: {e}")
        return None


def get_24h_data(symbol):
    """جلب بيانات 24 ساعة"""
    try:
        ticker = client.get_ticker(symbol=symbol)
        return {
            'price': float(ticker['lastPrice']),
            'change_24h': float(ticker['priceChangePercent']),
            'high_24h': float(ticker['highPrice']),
            'low_24h': float(ticker['lowPrice']),
            'volume': float(ticker['volume'])
        }
    except Exception as e:
        print(f"❌ خطأ في جلب بيانات {symbol}: {e}")
        return None


def calculate_rsi(prices, period=14):
    """حساب RSI"""
    if len(prices) < period + 1:
        return 50
    
    deltas = [prices[i] - prices[i-1] for i in range(1, len(prices))]
    gains = [d if d > 0 else 0 for d in deltas[-period:]]
    losses = [-d if d < 0 else 0 for d in deltas[-period:]]
    
    avg_gain = sum(gains) / period
    avg_loss = sum(losses) / period
    
    if avg_loss == 0:
        return 100
    
    rs = avg_gain / avg_loss
    return 100 - (100 / (1 + rs))


    # القناص - RSI منخفض (اقتناص الارتدادات)
    if rsi < 30:
        signals.append({
            'bot_id': 'al_qannas',
            'confidence': 85,
            'reason': f'RSI منخفض جداً ({rsi:.0f}) - ارتداد متوقع'
        })
    
    # ملك الكريبتو - ترند قوي وزخم عنيف
    if change > 3.0: # ارتفاع أكثر من 3% في 24 ساعة
        if len(history) >= 5:
            # التأكد أن الاتجاه العام صاعد في آخر فترة
            trend = (history[-1] - history[-5]) / history[-5] * 100
            if trend > 1.0:
                signals.append({
                    'bot_id': 'crypto_king',
                    'confidence': 90,
                    'reason': f'زخم قوي (24h: {change:.1f}%) 🚀'
                })

    # ذئب وول ستريت - اختراق القمة (Breakout)
    high_24h = data['high_24h']
    if high_24h > 0:
        # إذا السعر قريب جداً من قمة 24 ساعة (أعلى من 98%)
        dist_to_high = price / high_24h
        if dist_to_high > 0.98:
             signals.append({
                'bot_id': 'wall_street_wolf',
                'confidence': 88,
                'reason': f'اختراق وشيك للقمة ({dist_to_high*100:.1f}%) 🐺'
            })
    
    return signals


# === تنفيذ الصفقات ===

def execute_buy(symbol, amount_usd, bot_config, signal):
    """تنفيذ صفقة شراء"""
    global daily_loss
    
    try:
        # الحصول على السعر
        price = get_current_price(symbol)
        if not price:
            return None
        
        # حساب الكمية
        quantity = amount_usd / price
        
        # تقريب الكمية حسب متطلبات Binance
        # (كل زوج له دقة مختلفة - هذا مثال)
        if 'BTC' in symbol:
            quantity = round(quantity, 5)
        elif 'ETH' in symbol:
            quantity = round(quantity, 4)
        else:
            quantity = round(quantity, 2)
        
        # تنفيذ الأمر
        order = client.order_market_buy(
            symbol=symbol,
            quantity=quantity
        )
        
        # حساب أسعار الهدف والوقف
        entry_price = float(order['fills'][0]['price'])
        take_profit = entry_price * (1 + bot_config['take_profit'])
        stop_loss = entry_price * (1 - bot_config['stop_loss'])
        
        # إنشاء سجل الصفقة
        trade = {
            'id': order['orderId'],
            'symbol': symbol,
            'bot_id': signal['bot_id'],
            'bot_name': bot_config['name'],
            'bot_emoji': bot_config['emoji'],
            'entry_time': datetime.now().isoformat(),
            'entry_price': entry_price,
            'quantity': quantity,
            'take_profit': take_profit,
            'stop_loss': stop_loss,
            'current_price': entry_price,
            'profit_pct': 0,
            'status': 'open',
            'signal_reason': signal['reason'],
            'confidence': signal['confidence'],
        }
        
        active_trades[str(order['orderId'])] = trade
        
        print(f"✅ شراء ناجح:")
        print(f"   {bot_config['emoji']} {bot_config['name']}")
        print(f"   {symbol}: {quantity} @ ${entry_price:.2f}")
        print(f"   🎯 الهدف: ${take_profit:.2f}")
        print(f"   🛑 الوقف: ${stop_loss:.2f}")
        
        return trade
        
    except BinanceAPIException as e:
        print(f"❌ فشل الشراء - Binance Error: {e}")
        return None
    except Exception as e:
        print(f"❌ فشل الشراء: {e}")
        return None


def execute_sell(trade):
    """تنفيذ صفقة بيع"""
    global daily_loss, closed_trades
    
    try:
        symbol = trade['symbol']
        quantity = trade['quantity']
        
        # تنفيذ البيع
        order = client.order_market_sell(
            symbol=symbol,
            quantity=quantity
        )
        
        exit_price = float(order['fills'][0]['price'])
        profit_pct = ((exit_price - trade['entry_price']) / trade['entry_price']) * 100
        profit_usd = (exit_price - trade['entry_price']) * quantity
        
        # تحديث السجل
        trade['exit_time'] = datetime.now().isoformat()
        trade['exit_price'] = exit_price
        trade['profit_pct'] = profit_pct
        trade['profit_usd'] = profit_usd
        trade['status'] = 'closed'
        
        # تحديث الخسارة اليومية
        if profit_usd < 0:
            daily_loss += abs(profit_usd)
        
        closed_trades.append(trade)
        del active_trades[trade['id']]
        
        emoji = "💰" if profit_pct > 0 else "📉"
        print(f"{emoji} بيع ناجح:")
        print(f"   {symbol}: {profit_pct:+.2f}% (${profit_usd:+.2f})")
        
        return trade
        
    except Exception as e:
        print(f"❌ فشل البيع: {e}")
        return None


def update_trades():
    """تحديث الصفقات المفتوحة"""
    for trade_id, trade in list(active_trades.items()):
        symbol = trade['symbol']
        price = get_current_price(symbol)
        
        if not price:
            continue
        
        trade['current_price'] = price
        profit_pct = ((price - trade['entry_price']) / trade['entry_price']) * 100
        trade['profit_pct'] = profit_pct
        
        # فحص الهدف
        if price >= trade['take_profit']:
            trade['exit_reason'] = '✅ تحقيق الهدف'
            execute_sell(trade)
        
        # فحص وقف الخسارة
        elif price <= trade['stop_loss']:
            trade['exit_reason'] = '🛑 وقف الخسارة'
            execute_sell(trade)


def can_open_trade():
    """فحص إمكانية فتح صفقة جديدة"""
    if daily_loss >= MAX_DAILY_LOSS:
        print(f"🛑 تم الوصول للحد اليومي للخسارة: ${daily_loss:.2f}")
        return False
    
    if len(active_trades) >= MAX_OPEN_TRADES:
        print(f"🛑 الحد الأقصى للصفقات المفتوحة: {len(active_trades)}/{MAX_OPEN_TRADES}")
        return False
    
    balance = get_balance('USDT')
    if balance < MAX_POSITION_SIZE:
        print(f"🛑 رصيد غير كافٍ: ${balance:.2f}")
        return False
    
    return True


def save_data():
    """حفظ البيانات"""
    data = {
        'active_trades': list(active_trades.values()),
        'closed_trades': closed_trades,
        'daily_loss': daily_loss,
        'last_update': datetime.now().isoformat()
    }
    
    with open('live_trades_data.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


# === بيع الأصول الموجودة ===

def sell_all_assets_to_usdt():
    """
    بيع جميع الأصول الموجودة في الحساب وتحويلها إلى USDT
    ⚠️ هذه الدالة تعمل مرة واحدة عند بدء المحرك
    """
    print("\n" + "=" * 70)
    print("💰 فحص الأصول الموجودة في الحساب...")
    print("=" * 70)
    
    try:
        # جلب معلومات الحساب
        account = client.get_account()
        assets_to_sell = []
        total_value_usd = 0
        
        # فحص جميع الأصول
        for balance in account['balances']:
            asset = balance['asset']
            free = float(balance['free'])
            
            # تجاهل USDT والأصول الفارغة
            if asset == 'USDT' or free == 0:
                continue
            
            # محاولة الحصول على القيمة بالـ USDT
            try:
                symbol = f"{asset}USDT"
                price = get_current_price(symbol)
                if price:
                    value_usd = free * price
                    total_value_usd += value_usd
                    assets_to_sell.append({
                        'asset': asset,
                        'quantity': free,
                        'symbol': symbol,
                        'price': price,
                        'value_usd': value_usd
                    })
                    print(f"   📊 {asset}: {free:.8f} (~${value_usd:.2f})")
            except:
                print(f"   ⚠️  {asset}: {free:.8f} (لا يمكن تحديد القيمة)")
        
        if not assets_to_sell:
            print("\n✅ لا توجد أصول للبيع - الحساب جاهز!")
            return
        
        print(f"\n💵 إجمالي القيمة المقدرة: ${total_value_usd:.2f}")
        print("\n" + "=" * 70)
        print("⚠️  تحذير: سيتم بيع جميع الأصول أعلاه وتحويلها إلى USDT!")
        print("=" * 70)
        
        # طلب التأكيد
        confirmation = input("\n❓ هل تريد المتابعة؟ (اكتب 'نعم' للمتابعة): ").strip()
        
        if confirmation.lower() not in ['نعم', 'yes', 'y']:
            print("\n❌ تم الإلغاء - لن يتم بيع أي شيء")
            print("💡 لتعطيل هذه الميزة، احذف استدعاء sell_all_assets_to_usdt() من الكود")
            exit(0)
        
        # البيع
        print("\n🔄 بدء عملية البيع...\n")
        sold_count = 0
        total_received = 0
        
        for asset_info in assets_to_sell:
            try:
                symbol = asset_info['symbol']
                quantity = asset_info['quantity']
                asset = asset_info['asset']
                
                # تقريب الكمية حسب القواعد
                if 'BTC' in symbol:
                    quantity = round(quantity, 5)
                elif 'ETH' in symbol:
                    quantity = round(quantity, 4)
                else:
                    quantity = round(quantity, 2)
                
                # التأكد من أن الكمية أكبر من الحد الأدنى
                if quantity <= 0:
                    print(f"   ⚠️  {asset}: الكمية صغيرة جداً للبيع")
                    continue
                
                # تنفيذ البيع
                order = client.order_market_sell(
                    symbol=symbol,
                    quantity=quantity
                )
                
                # حساب القيمة المستلمة
                fills = order.get('fills', [])
                if fills:
                    avg_price = sum(float(f['price']) * float(f['qty']) for f in fills) / sum(float(f['qty']) for f in fills)
                    received = float(order['cummulativeQuoteQty'])
                    total_received += received
                    
                    print(f"   ✅ {asset}: تم البيع بنجاح! استلمت ${received:.2f} USDT")
                    sold_count += 1
                else:
                    print(f"   ✅ {asset}: تم البيع")
                    sold_count += 1
                
                time.sleep(0.5)  # تأخير صغير لتجنب Rate Limit
                
            except BinanceAPIException as e:
                if 'MIN_NOTIONAL' in str(e):
                    print(f"   ⚠️  {asset}: القيمة أقل من الحد الأدنى المسموح ({e})")
                elif 'LOT_SIZE' in str(e):
                    print(f"   ⚠️  {asset}: الكمية غير صالحة ({e})")
                else:
                    print(f"   ❌ {asset}: خطأ - {e}")
            except Exception as e:
                print(f"   ❌ {asset}: خطأ غير متوقع - {e}")
        
        print("\n" + "=" * 70)
        print(f"✅ تم بيع {sold_count} من أصل {len(assets_to_sell)} أصول")
        if total_received > 0:
            print(f"💵 إجمالي USDT المستلم: ${total_received:.2f}")
        
        # عرض الرصيد الجديد
        time.sleep(1)
        new_balance = get_balance('USDT')
        print(f"💰 الرصيد الجديد: ${new_balance:.2f} USDT")
        print("=" * 70)
        
        # انتظار قبل المتابعة
        input("\n✅ اضغط Enter للمتابعة إلى محرك التداول...")
        
    except Exception as e:
        print(f"\n❌ خطأ في عملية البيع: {e}")
        print("⚠️  سيتم المتابعة إلى محرك التداول...")
        time.sleep(3)


# === المحرك الرئيسي ===

def run_engine():
    """تشغيل محرك التداول"""
    global daily_loss
    
    print("=" * 70)
    print("🤖 TIPR LIVE TRADING ENGINE")
    print("=" * 70)
    print(f"{'🧪 Paper Trading' if TRADE_MODE == 'TEST' else '🔴 LIVE TRADING'}")
    print(f"💰 أقصى قيمة للصفقة: ${MAX_POSITION_SIZE}")
    print(f"📊 أقصى عدد صفقات: {MAX_OPEN_TRADES}")
    print(f"🛑 أقصى خسارة يومية: ${MAX_DAILY_LOSS}")
    print("=" * 70)
    
    # فحص الاتصال
    try:
        status = client.get_system_status()
        print(f"✅ الاتصال ناجح")
        balance = get_balance('USDT')
        print(f"💵 الرصيد: ${balance:.2f} USDT")
    except Exception as e:
        print(f"❌ فشل الاتصال: {e}")
        return
    
    # === بيع الأصول الموجودة وتحويلها إلى USDT ===
    sell_all_assets_to_usdt()
    
    print("\n🚀 بدء المسح...\n")
    
    scan_count = 0
    
    while True:
        try:
            scan_count += 1
            print(f"\n📡 المسح #{scan_count} - {datetime.now().strftime('%H:%M:%S')}")
            
            # تحديث الصfqات المفتوحة
            if active_trades:
                print(f"📊 تحديث {len(active_trades)} صفقة مفتوحة...")
                update_trades()
            
            # البحث عن فرص جديدة
            if can_open_trade():
                for symbol in WATCHLIST:
                    # جلب البيانات
                    data = get_24h_data(symbol)
                    if not data:
                        continue
                    
                    # تحديث التاريخ
                    if symbol not in price_history:
                        price_history[symbol] = []
                    price_history[symbol].append(data['price'])
                    price_history[symbol] = price_history[symbol][-100:]
                    
                    # فحص الإشارات
                    signals = check_signals(symbol, data, price_history[symbol])
                    
                    for signal in signals:
                        # تجنب التكرار
                        existing = [t for t in active_trades.values() 
                                   if t['symbol'] == symbol and t['bot_id'] == signal['bot_id']]
                        
                        if not existing:
                            bot = ROBOTS[signal['bot_id']]
                            print(f"\n🚨 إشارة من {bot['emoji']} {bot['name']}")
                            print(f"   {symbol}: {signal['reason']}")
                            
                            # تنفيذ الشراء
                            execute_buy(symbol, MAX_POSITION_SIZE, bot, signal)
            
            # حفظ البيانات
            save_data()
            
            # التقرير
            print(f"\n📊 الملخص:")
            print(f"   صفقات مفتوحة: {len(active_trades)}")
            print(f"   صفقات مغلقة: {len(closed_trades)}")
            print(f"   خسارة يومية: ${daily_loss:.2f}")
            print("-" * 70)
            
            time.sleep(SCAN_INTERVAL)
            
        except KeyboardInterrupt:
            print("\n\n🛑 إيقاف المحرك...")
            save_data()
            print(f"📊 إجمالي الصفقات: {len(closed_trades)}")
            break
            
        except Exception as e:
            print(f"\n❌ خطأ: {e}")
            time.sleep(5)


if __name__ == "__main__":
    run_engine()
