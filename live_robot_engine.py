"""
🤖 TIPR Live Robot Engine
==========================
يربط الفرص المكتشفة بالروبوتات والصفقات

تشغيل: python live_robot_engine.py
"""

import requests
import json
import time
import os
from datetime import datetime
from bs4 import BeautifulSoup

# === إعدادات ===
SCAN_INTERVAL = 30
HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}

# === الروبوتات وإستراتيجياتهم ===
ROBOTS = {
    "al_qannas": {
        "name": "القناص",
        "emoji": "🎯",
        "strategy": "RSI_OVERSOLD",
        "description": "يصطاد الأسهم عندما تنخفض كثيراً (RSI < 30)",
        "take_profit": 0.05,  # 5%
        "stop_loss": 0.02,    # 2%
    },
    "sayyad_alfors": {
        "name": "صياد الفرص",
        "emoji": "🏹",
        "strategy": "NEAR_LOW",
        "description": "يدخل عندما يكون السعر قريب من القاع",
        "take_profit": 0.03,
        "stop_loss": 0.015,
    },
    "al_jasour": {
        "name": "الجسور",
        "emoji": "🦅",
        "strategy": "BIG_DIP",
        "description": "يشتري عند الهبوط الحاد مخاطرة عالية",
        "take_profit": 0.10,
        "stop_loss": 0.05,
    },
    "al_hout": {
        "name": "الحوت",
        "emoji": "🐋",
        "strategy": "VOLUME_SPIKE",
        "description": "يتتبع الحجم الكبير",
        "take_profit": 0.04,
        "stop_loss": 0.02,
    },
    "al_maestro": {
        "name": "المايسترو",
        "emoji": "🎭",
        "strategy": "MOMENTUM",
        "description": "يركب موجة الصعود",
        "take_profit": 0.08,
        "stop_loss": 0.03,
    },
}

# === الأسهم والعملات المراقبة ===
WATCHLIST = {
    "crypto": [
        # Top 20 Cryptocurrencies
        {"symbol": "BTCUSDT", "name": "Bitcoin", "emoji": "₿"},
        {"symbol": "ETHUSDT", "name": "Ethereum", "emoji": "Ξ"},
        {"symbol": "BNBUSDT", "name": "BNB", "emoji": "🔶"},
        {"symbol": "SOLUSDT", "name": "Solana", "emoji": "◎"},
        {"symbol": "XRPUSDT", "name": "XRP", "emoji": "💧"},
        {"symbol": "DOGEUSDT", "name": "Dogecoin", "emoji": "🐕"},
        {"symbol": "ADAUSDT", "name": "Cardano", "emoji": "🔵"},
        {"symbol": "AVAXUSDT", "name": "Avalanche", "emoji": "🔺"},
        {"symbol": "DOTUSDT", "name": "Polkadot", "emoji": "⚫"},
        {"symbol": "MATICUSDT", "name": "Polygon", "emoji": "💜"},
        {"symbol": "LINKUSDT", "name": "Chainlink", "emoji": "🔗"},
        {"symbol": "LTCUSDT", "name": "Litecoin", "emoji": "🥈"},
        {"symbol": "ATOMUSDT", "name": "Cosmos", "emoji": "⚛️"},
        {"symbol": "UNIUSDT", "name": "Uniswap", "emoji": "🦄"},
        {"symbol": "NEARUSDT", "name": "NEAR", "emoji": "🌐"},
        {"symbol": "APTUSDT", "name": "Aptos", "emoji": "🌀"},
        {"symbol": "ARBUSDT", "name": "Arbitrum", "emoji": "🔷"},
        {"symbol": "OPUSDT", "name": "Optimism", "emoji": "🔴"},
        {"symbol": "PEPEUSDT", "name": "PEPE", "emoji": "🐸"},
        {"symbol": "SHIBUSDT", "name": "Shiba Inu", "emoji": "🐕‍🦺"},
    ],
    "saudi": [
        # Top 20 Saudi Stocks
        {"symbol": "1120.SR", "name": "الراجحي", "emoji": "🏦"},
        {"symbol": "2222.SR", "name": "أرامكو", "emoji": "🛢️"},
        {"symbol": "2010.SR", "name": "سابك", "emoji": "🏭"},
        {"symbol": "7010.SR", "name": "STC", "emoji": "📱"},
        {"symbol": "1180.SR", "name": "الأهلي", "emoji": "🏛️"},
        {"symbol": "1150.SR", "name": "الإنماء", "emoji": "💳"},
        {"symbol": "2350.SR", "name": "كيان", "emoji": "⚗️"},
        {"symbol": "4200.SR", "name": "الدريس", "emoji": "⛽"},
        {"symbol": "1010.SR", "name": "الرياض", "emoji": "🏦"},
        {"symbol": "1060.SR", "name": "ساب", "emoji": "🏦"},
        {"symbol": "2380.SR", "name": "بترورابغ", "emoji": "🛢️"},
        {"symbol": "2020.SR", "name": "سافكو", "emoji": "🌿"},
        {"symbol": "4001.SR", "name": "أسمنت الجنوب", "emoji": "🏗️"},
        {"symbol": "4008.SR", "name": "أسمنت الشرقية", "emoji": "🏗️"},
        {"symbol": "2250.SR", "name": "المعادن", "emoji": "⚙️"},
        {"symbol": "2280.SR", "name": "المراعي", "emoji": "🥛"},
        {"symbol": "4003.SR", "name": "أسمنت العربية", "emoji": "🏗️"},
        {"symbol": "1140.SR", "name": "البلاد", "emoji": "🏦"},
        {"symbol": "2190.SR", "name": "سيسكو", "emoji": "🍔"},
        {"symbol": "4007.SR", "name": "أسمنت القصيم", "emoji": "🏗️"},
    ],
    "us": [
        # Top 20 US Stocks
        {"symbol": "AAPL", "name": "Apple", "emoji": "🍎"},
        {"symbol": "NVDA", "name": "NVIDIA", "emoji": "💚"},
        {"symbol": "TSLA", "name": "Tesla", "emoji": "🚗"},
        {"symbol": "MSFT", "name": "Microsoft", "emoji": "🪟"},
        {"symbol": "GOOGL", "name": "Google", "emoji": "🔍"},
        {"symbol": "AMZN", "name": "Amazon", "emoji": "📦"},
        {"symbol": "META", "name": "Meta", "emoji": "👤"},
        {"symbol": "AMD", "name": "AMD", "emoji": "🔴"},
        {"symbol": "NFLX", "name": "Netflix", "emoji": "🎬"},
        {"symbol": "DIS", "name": "Disney", "emoji": "🏰"},
        {"symbol": "COIN", "name": "Coinbase", "emoji": "🪙"},
        {"symbol": "PYPL", "name": "PayPal", "emoji": "💳"},
        {"symbol": "SQ", "name": "Block", "emoji": "⬛"},
        {"symbol": "UBER", "name": "Uber", "emoji": "🚕"},
        {"symbol": "INTC", "name": "Intel", "emoji": "💻"},
        {"symbol": "CRM", "name": "Salesforce", "emoji": "☁️"},
        {"symbol": "V", "name": "Visa", "emoji": "💳"},
        {"symbol": "MA", "name": "Mastercard", "emoji": "💳"},
        {"symbol": "JPM", "name": "JPMorgan", "emoji": "🏦"},
        {"symbol": "BAC", "name": "Bank of America", "emoji": "🏦"},
    ],
}

# === متغيرات التتبع ===
price_history = {}
active_trades = {}  # الصفقات المفتوحة
all_trades = []     # كل الصفقات
trade_counter = 1000


def get_binance_24h(symbol):
    """جلب بيانات الكريبتو"""
    try:
        url = f"https://api.binance.com/api/v3/ticker/24hr?symbol={symbol}"
        response = requests.get(url, timeout=5)
        data = response.json()
        return {
            'price': float(data['lastPrice']),
            'change_24h': float(data['priceChangePercent']),
            'high_24h': float(data['highPrice']),
            'low_24h': float(data['lowPrice']),
            'volume': float(data['volume'])
        }
    except:
        return None


def scrape_google_price(symbol):
    """جلب سعر السهم"""
    try:
        if ".SR" in symbol:
            g_symbol = f"{symbol.replace('.SR', '')}:TADAWUL"
        else:
            g_symbol = f"{symbol}:NASDAQ"
        
        url = f"https://www.google.com/finance/quote/{g_symbol}"
        response = requests.get(url, headers=HEADERS, timeout=10)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        price_div = soup.find('div', {'class': 'YMlKec fxKbKc'})
        if price_div:
            price_str = price_div.text.replace('SAR', '').replace('$', '').replace(',', '').strip()
            return float(price_str)
    except:
        pass
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


def check_robot_signals(symbol, data, history):
    """فحص إشارات الروبوتات"""
    
    signals = []
    price = data.get('price')
    change = data.get('change_24h', 0)
    high_24h = data.get('high_24h', price)
    low_24h = data.get('low_24h', price)
    
    if not price:
        return []
    
    rsi = calculate_rsi(history) if len(history) > 14 else 50
    
    # === القناص - RSI منخفض ===
    if rsi < 30:
        signals.append({
            "bot_id": "al_qannas",
            "signal_type": "BUY",
            "confidence": 85,
            "reason": f"RSI منخفض جداً ({rsi:.0f})",
        })
    
    # === الجسور - هبوط حاد ===
    if change < -5:
        signals.append({
            "bot_id": "al_jasour",
            "signal_type": "BUY",
            "confidence": 70,
            "reason": f"هبوط حاد {change:.1f}%",
        })
    
    # === صياد الفرص - قريب من القاع ===
    if low_24h > 0:
        distance = ((price - low_24h) / low_24h) * 100
        if distance < 1:
            signals.append({
                "bot_id": "sayyad_alfors",
                "signal_type": "BUY",
                "confidence": 75,
                "reason": f"قريب من قاع 24 ساعة ({distance:.2f}%)",
            })
    
    # === المايسترو - زخم صاعد ===
    if len(history) >= 5:
        trend = (history[-1] - history[-5]) / history[-5] * 100
        if trend > 2 and change > 0:
            signals.append({
                "bot_id": "al_maestro",
                "signal_type": "BUY",
                "confidence": 80,
                "reason": f"زخم صاعد ({trend:.1f}%)",
            })
    
    return signals


def create_trade(stock, market, signal, price):
    """إنشاء صفقة جديدة"""
    global trade_counter
    
    bot = ROBOTS[signal['bot_id']]
    trade_counter += 1
    
    trade = {
        "id": str(trade_counter),
        "bot_id": signal['bot_id'],
        "bot_name": bot['name'],
        "bot_emoji": bot['emoji'],
        "symbol": stock['symbol'],
        "stock_name": stock['name'],
        "stock_emoji": stock['emoji'],
        "market": market,
        "entry_date": datetime.now().strftime("%Y-%m-%d"),
        "entry_time": datetime.now().strftime("%H:%M:%S"),
        "entry_price": round(price, 2),
        "take_profit": round(price * (1 + bot['take_profit']), 2),
        "stop_loss": round(price * (1 - bot['stop_loss']), 2),
        "current_price": round(price, 2),
        "profit_pct": 0,
        "status": "open",
        "signal_reason": signal['reason'],
        "confidence": signal['confidence'],
    }
    
    return trade


def update_open_trades(current_prices):
    """تحديث الصفقات المفتوحة"""
    global active_trades, all_trades
    
    closed_this_round = []
    
    for trade_id, trade in list(active_trades.items()):
        symbol = trade['symbol']
        
        if symbol in current_prices:
            current_price = current_prices[symbol]
            trade['current_price'] = round(current_price, 2)
            
            # حساب الربح
            entry = trade['entry_price']
            profit_pct = ((current_price - entry) / entry) * 100
            trade['profit_pct'] = round(profit_pct, 2)
            
            # هل وصلنا للهدف؟
            if current_price >= trade['take_profit']:
                trade['status'] = 'closed'
                trade['exit_price'] = current_price
                trade['exit_date'] = datetime.now().strftime("%Y-%m-%d")
                trade['exit_reason'] = "✅ تم تحقيق الهدف"
                closed_this_round.append(trade)
                del active_trades[trade_id]
                all_trades.append(trade)
            
            # هل ضرب وقف الخسارة؟
            elif current_price <= trade['stop_loss']:
                trade['status'] = 'closed'
                trade['exit_price'] = current_price
                trade['exit_date'] = datetime.now().strftime("%Y-%m-%d")
                trade['exit_reason'] = "🛑 وقف خسارة"
                closed_this_round.append(trade)
                del active_trades[trade_id]
                all_trades.append(trade)
    
    return closed_this_round


def save_data():
    """حفظ البيانات"""
    base_path = os.path.dirname(__file__)
    
    # حفظ الصفقات المفتوحة
    open_trades_path = os.path.join(base_path, 'frontend', 'src', 'data', 'open_trades.json')
    os.makedirs(os.path.dirname(open_trades_path), exist_ok=True)
    with open(open_trades_path, 'w', encoding='utf-8') as f:
        json.dump(list(active_trades.values()), f, indent=2, ensure_ascii=False)
    
    # حفظ كل الصفقات
    all_trades_path = os.path.join(base_path, 'frontend', 'src', 'data', 'real_trades.json')
    with open(all_trades_path, 'w', encoding='utf-8') as f:
        # دمج الصفقات المفتوحة مع المغلقة
        combined = list(active_trades.values()) + all_trades
        combined.sort(key=lambda x: x.get('entry_date', ''), reverse=True)
        json.dump(combined[:100], f, indent=2, ensure_ascii=False)


def run_engine():
    """تشغيل المحرك"""
    global trade_counter
    
    print("=" * 60)
    print("🤖 TIPR LIVE ROBOT ENGINE")
    print("=" * 60)
    print(f"⏱️  الفحص كل {SCAN_INTERVAL} ثانية")
    print(f"🎯 عدد الروبوتات: {len(ROBOTS)}")
    print("=" * 60)
    
    scan_count = 0
    
    while True:
        try:
            scan_count += 1
            current_prices = {}
            new_trades = []
            
            print(f"\n📡 الفحص #{scan_count} - {datetime.now().strftime('%H:%M:%S')}")
            
            # === فحص الكريبتو ===
            for stock in WATCHLIST["crypto"]:
                data = get_binance_24h(stock["symbol"])
                if data:
                    current_prices[stock["symbol"]] = data['price']
                    
                    if stock["symbol"] not in price_history:
                        price_history[stock["symbol"]] = []
                    price_history[stock["symbol"]].append(data['price'])
                    price_history[stock["symbol"]] = price_history[stock["symbol"]][-100:]
                    
                    # فحص الإشارات
                    signals = check_robot_signals(stock["symbol"], data, price_history[stock["symbol"]])
                    
                    for signal in signals:
                        # تجنب فتح صفقة مكررة
                        existing = [t for t in active_trades.values() 
                                   if t['symbol'] == stock['symbol'] and t['bot_id'] == signal['bot_id']]
                        if not existing:
                            trade = create_trade(stock, "crypto", signal, data['price'])
                            active_trades[trade['id']] = trade
                            new_trades.append(trade)
            
            # === فحص الأسهم السعودية ===
            for stock in WATCHLIST["saudi"]:
                price = scrape_google_price(stock["symbol"])
                if price:
                    current_prices[stock["symbol"]] = price
                    
                    if stock["symbol"] not in price_history:
                        price_history[stock["symbol"]] = []
                    price_history[stock["symbol"]].append(price)
                    price_history[stock["symbol"]] = price_history[stock["symbol"]][-100:]
                    
                    data = {"price": price, "change_24h": 0, "low_24h": price, "high_24h": price}
                    signals = check_robot_signals(stock["symbol"], data, price_history[stock["symbol"]])
                    
                    for signal in signals:
                        existing = [t for t in active_trades.values() 
                                   if t['symbol'] == stock['symbol'] and t['bot_id'] == signal['bot_id']]
                        if not existing:
                            trade = create_trade(stock, "saudi", signal, price)
                            active_trades[trade['id']] = trade
                            new_trades.append(trade)
            
            # === فحص الأسهم الأمريكية ===
            for stock in WATCHLIST["us"]:
                price = scrape_google_price(stock["symbol"])
                if price:
                    current_prices[stock["symbol"]] = price
                    
                    if stock["symbol"] not in price_history:
                        price_history[stock["symbol"]] = []
                    price_history[stock["symbol"]].append(price)
                    price_history[stock["symbol"]] = price_history[stock["symbol"]][-100:]
                    
                    data = {"price": price, "change_24h": 0, "low_24h": price, "high_24h": price}
                    signals = check_robot_signals(stock["symbol"], data, price_history[stock["symbol"]])
                    
                    for signal in signals:
                        existing = [t for t in active_trades.values() 
                                   if t['symbol'] == stock['symbol'] and t['bot_id'] == signal['bot_id']]
                        if not existing:
                            trade = create_trade(stock, "us", signal, price)
                            active_trades[trade['id']] = trade
                            new_trades.append(trade)
            
            # === تحديث الصفقات المفتوحة ===
            closed = update_open_trades(current_prices)
            
            # === حفظ البيانات ===
            save_data()
            
            # === التقرير ===
            if new_trades:
                print(f"\n🚨 صفقات جديدة: {len(new_trades)}")
                for t in new_trades:
                    print(f"   • {t['bot_emoji']} {t['bot_name']}: {t['stock_emoji']} {t['stock_name']} @ {t['entry_price']}")
            
            if closed:
                print(f"\n✅ صفقات أُغلقت: {len(closed)}")
                for t in closed:
                    emoji = "💰" if t['profit_pct'] > 0 else "📉"
                    print(f"   • {emoji} {t['stock_name']}: {t['profit_pct']:+.2f}%")
            
            print(f"\n📊 صفقات مفتوحة: {len(active_trades)}")
            print(f"📈 إجمالي الصفقات: {len(all_trades) + len(active_trades)}")
            print("-" * 60)
            
            time.sleep(SCAN_INTERVAL)
            
        except KeyboardInterrupt:
            print("\n\n🛑 تم الإيقاف")
            save_data()
            break
        except Exception as e:
            print(f"\n❌ خطأ: {e}")
            time.sleep(5)


if __name__ == "__main__":
    run_engine()
