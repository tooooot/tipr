"""
🚨 TIPR Opportunity Detector
============================
يراقب الأسواق ويكتشف الفرص ويرسل إشعارات

تشغيل: python opportunity_detector.py
"""

import requests
import json
import time
import os
from datetime import datetime
from bs4 import BeautifulSoup

# === إعدادات ===
SCAN_INTERVAL = 30  # ثانية
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

# === الأسهم المراقبة ===
WATCHLIST = {
    "crypto": [
        {"symbol": "BTCUSDT", "name": "Bitcoin", "emoji": "₿"},
        {"symbol": "ETHUSDT", "name": "Ethereum", "emoji": "Ξ"},
        {"symbol": "BNBUSDT", "name": "BNB", "emoji": "🔶"},
        {"symbol": "SOLUSDT", "name": "Solana", "emoji": "◎"},
        {"symbol": "XRPUSDT", "name": "XRP", "emoji": "💧"},
        {"symbol": "DOGEUSDT", "name": "Dogecoin", "emoji": "🐕"},
    ],
    "saudi": [
        {"symbol": "1120.SR", "name": "الراجحي", "emoji": "🏦"},
        {"symbol": "2222.SR", "name": "أرامكو", "emoji": "🛢️"},
        {"symbol": "2010.SR", "name": "سابك", "emoji": "🏭"},
        {"symbol": "7010.SR", "name": "STC", "emoji": "📱"},
    ],
    "us": [
        {"symbol": "AAPL", "name": "Apple", "emoji": "🍎"},
        {"symbol": "NVDA", "name": "NVIDIA", "emoji": "💚"},
        {"symbol": "TSLA", "name": "Tesla", "emoji": "🚗"},
    ],
}

# === بيانات المتابعة ===
price_history = {}  # {symbol: [prices]}
alerts_sent = set()  # تجنب تكرار الإشعارات


def get_binance_24h(symbol):
    """جلب بيانات الكريبتو من Binance"""
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
    """جلب سعر من Google Finance"""
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
        return 50  # Default
    
    deltas = [prices[i] - prices[i-1] for i in range(1, len(prices))]
    gains = [d if d > 0 else 0 for d in deltas[-period:]]
    losses = [-d if d < 0 else 0 for d in deltas[-period:]]
    
    avg_gain = sum(gains) / period
    avg_loss = sum(losses) / period
    
    if avg_loss == 0:
        return 100
    
    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))
    return rsi


def detect_opportunity(symbol, data, history):
    """كشف فرصة تداول"""
    
    opportunities = []
    
    price = data.get('price')
    change = data.get('change_24h', 0)
    high_24h = data.get('high_24h', price)
    low_24h = data.get('low_24h', price)
    
    if not price:
        return []
    
    # حساب RSI
    rsi = calculate_rsi(history) if len(history) > 14 else 50
    
    # === استراتيجيات الكشف ===
    
    # 1. RSI Oversold (القناص) - RSI < 30
    if rsi < 30:
        opportunities.append({
            "bot": "al_qannas",
            "bot_name": "القناص 🎯",
            "signal": "شراء قوي",
            "reason": f"RSI منخفض جداً ({rsi:.0f}) - فرصة ارتداد",
            "confidence": 85
        })
    
    # 2. Big Dip (الجسور) - هبوط كبير
    if change < -5:
        opportunities.append({
            "bot": "al_jasour",
            "bot_name": "الجسور 🦅",
            "signal": "شراء مخاطر عالي",
            "reason": f"هبوط حاد {change:.1f}% - فرصة انعكاس",
            "confidence": 70
        })
    
    # 3. Near 24h Low (صياد الفرص) - قريب من أدنى سعر
    if low_24h > 0:
        distance_from_low = ((price - low_24h) / low_24h) * 100
        if distance_from_low < 1:  # أقل من 1% من القاع
            opportunities.append({
                "bot": "sayyad_alfors",
                "bot_name": "صياد الفرص 🏹",
                "signal": "شراء",
                "reason": f"السعر قريب من قاع 24 ساعة ({distance_from_low:.2f}%)",
                "confidence": 75
            })
    
    # 4. Volume Spike (الحوت) - حجم كبير
    volume = data.get('volume', 0)
    if volume > 1000000000:  # أكثر من مليار
        opportunities.append({
            "bot": "al_hout",
            "bot_name": "الحوت 🐋",
            "signal": "مراقبة",
            "reason": "حجم تداول ضخم - حركة قادمة",
            "confidence": 65
        })
    
    # 5. Momentum (المايسترو) - صعود قوي مستمر
    if len(history) >= 5:
        recent_trend = (history[-1] - history[-5]) / history[-5] * 100
        if recent_trend > 2 and change > 0:
            opportunities.append({
                "bot": "al_maestro",
                "bot_name": "المايسترو 🎭",
                "signal": "شراء - ركوب الموجة",
                "reason": f"زخم صاعد قوي ({recent_trend:.1f}%)",
                "confidence": 80
            })
    
    return opportunities


def save_opportunity(opp, stock, market, price):
    """حفظ الفرصة وإرسال إشعار"""
    
    alert_id = f"{stock['symbol']}_{opp['bot']}_{datetime.now().strftime('%Y%m%d_%H')}"
    
    if alert_id in alerts_sent:
        return False
    
    alerts_sent.add(alert_id)
    
    notification = {
        "id": len(alerts_sent),
        "timestamp": datetime.now().isoformat(),
        "time": datetime.now().strftime("%H:%M"),
        "bot_id": opp["bot"],
        "bot_name": opp["bot_name"],
        "symbol": stock["symbol"],
        "stock_name": stock["name"],
        "emoji": stock["emoji"],
        "market": market,
        "signal": opp["signal"],
        "reason": opp["reason"],
        "price": price,
        "confidence": opp["confidence"],
        "read": False,
        "type": "opportunity"
    }
    
    # حفظ الإشعارات
    notif_path = os.path.join(os.path.dirname(__file__), 'frontend', 'src', 'data', 'live_notifications.json')
    os.makedirs(os.path.dirname(notif_path), exist_ok=True)
    
    existing = []
    if os.path.exists(notif_path):
        try:
            with open(notif_path, 'r', encoding='utf-8') as f:
                existing = json.load(f)
        except:
            pass
    
    existing.insert(0, notification)
    existing = existing[:50]  # أبقِ آخر 50 فقط
    
    with open(notif_path, 'w', encoding='utf-8') as f:
        json.dump(existing, f, indent=2, ensure_ascii=False)
    
    return True


def scan_markets():
    """فحص جميع الأسواق"""
    
    found_opportunities = []
    
    # === الكريبتو ===
    print("\n🪙 فحص سوق الكريبتو...")
    for stock in WATCHLIST["crypto"]:
        data = get_binance_24h(stock["symbol"])
        if data:
            # تحديث التاريخ
            if stock["symbol"] not in price_history:
                price_history[stock["symbol"]] = []
            price_history[stock["symbol"]].append(data['price'])
            price_history[stock["symbol"]] = price_history[stock["symbol"]][-100:]
            
            # كشف الفرص
            opps = detect_opportunity(stock["symbol"], data, price_history[stock["symbol"]])
            
            for opp in opps:
                if save_opportunity(opp, stock, "crypto", data['price']):
                    found_opportunities.append({
                        "stock": stock,
                        "opp": opp,
                        "price": data['price']
                    })
                    print(f"   🚨 {stock['emoji']} {stock['name']}: {opp['signal']} - {opp['reason']}")
    
    # === السعودي ===
    print("\n🇸🇦 فحص السوق السعودي...")
    for stock in WATCHLIST["saudi"]:
        price = scrape_google_price(stock["symbol"])
        if price:
            if stock["symbol"] not in price_history:
                price_history[stock["symbol"]] = []
            price_history[stock["symbol"]].append(price)
            price_history[stock["symbol"]] = price_history[stock["symbol"]][-100:]
            
            data = {"price": price, "change_24h": 0}
            opps = detect_opportunity(stock["symbol"], data, price_history[stock["symbol"]])
            
            for opp in opps:
                if save_opportunity(opp, stock, "saudi", price):
                    found_opportunities.append({
                        "stock": stock,
                        "opp": opp,
                        "price": price
                    })
                    print(f"   🚨 {stock['emoji']} {stock['name']}: {opp['signal']}")
    
    # === الأمريكي ===
    print("\n🇺🇸 فحص السوق الأمريكي...")
    for stock in WATCHLIST["us"]:
        price = scrape_google_price(stock["symbol"])
        if price:
            if stock["symbol"] not in price_history:
                price_history[stock["symbol"]] = []
            price_history[stock["symbol"]].append(price)
            price_history[stock["symbol"]] = price_history[stock["symbol"]][-100:]
            
            data = {"price": price, "change_24h": 0}
            opps = detect_opportunity(stock["symbol"], data, price_history[stock["symbol"]])
            
            for opp in opps:
                if save_opportunity(opp, stock, "us", price):
                    found_opportunities.append({
                        "stock": stock,
                        "opp": opp,
                        "price": price
                    })
                    print(f"   🚨 {stock['emoji']} {stock['name']}: {opp['signal']}")
    
    return found_opportunities


def run_detector():
    """تشغيل الكاشف"""
    
    print("=" * 60)
    print("🚨 TIPR OPPORTUNITY DETECTOR")
    print("=" * 60)
    print(f"⏱️  الفحص كل {SCAN_INTERVAL} ثانية")
    print("💡 اضغط Ctrl+C للإيقاف")
    print("=" * 60)
    
    scan_count = 0
    total_opportunities = 0
    
    while True:
        try:
            scan_count += 1
            print(f"\n📡 الفحص رقم {scan_count} - {datetime.now().strftime('%H:%M:%S')}")
            
            opportunities = scan_markets()
            total_opportunities += len(opportunities)
            
            if opportunities:
                print(f"\n✅ تم اكتشاف {len(opportunities)} فرصة جديدة!")
                for o in opportunities:
                    print(f"   • {o['stock']['emoji']} {o['stock']['name']}: {o['opp']['signal']}")
            else:
                print("\n⏳ لا توجد فرص جديدة حالياً")
            
            print(f"\n📊 إجمالي الفرص المكتشفة: {total_opportunities}")
            print(f"⏳ الفحص القادم في {SCAN_INTERVAL} ثانية...")
            print("-" * 60)
            
            time.sleep(SCAN_INTERVAL)
            
        except KeyboardInterrupt:
            print("\n\n🛑 تم إيقاف الكاشف")
            print(f"📊 إجمالي الفحوصات: {scan_count}")
            print(f"📊 إجمالي الفرص: {total_opportunities}")
            break
        except Exception as e:
            print(f"\n❌ خطأ: {e}")
            time.sleep(5)


if __name__ == "__main__":
    run_detector()
