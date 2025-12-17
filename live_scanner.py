"""
🔴 TIPR Live Price Scanner v2
==============================
يجلب الأسعار الحقيقية لحظياً من مصادر متعددة
ويكتشف الفرص للروبوتات

تشغيل مستمر: python live_scanner.py
تشغيل مرة: python live_scanner.py --once
"""

import requests
from bs4 import BeautifulSoup
import json
import time
import os
from datetime import datetime

# === المصادر ===
SAUDI_STOCKS = [
    {"symbol": "1120.SR", "name": "الراجحي", "emoji": "🏦"},
    {"symbol": "2222.SR", "name": "أرامكو", "emoji": "🛢️"},
    {"symbol": "2010.SR", "name": "سابك", "emoji": "🏭"},
    {"symbol": "7010.SR", "name": "STC", "emoji": "📱"},
    {"symbol": "1180.SR", "name": "الأهلي", "emoji": "🏛️"},
    {"symbol": "1150.SR", "name": "الإنماء", "emoji": "💳"},
    {"symbol": "2350.SR", "name": "كيان", "emoji": "⚗️"},
    {"symbol": "4200.SR", "name": "الدريس", "emoji": "⛽"},
]

US_STOCKS = [
    {"symbol": "AAPL", "name": "Apple", "emoji": "🍎"},
    {"symbol": "NVDA", "name": "NVIDIA", "emoji": "💚"},
    {"symbol": "TSLA", "name": "Tesla", "emoji": "🚗"},
    {"symbol": "MSFT", "name": "Microsoft", "emoji": "🪟"},
    {"symbol": "GOOGL", "name": "Google", "emoji": "🔍"},
    {"symbol": "AMZN", "name": "Amazon", "emoji": "📦"},
    {"symbol": "META", "name": "Meta", "emoji": "👤"},
    {"symbol": "AMD", "name": "AMD", "emoji": "🔴"},
]

CRYPTO = [
    {"symbol": "BTCUSDT", "name": "Bitcoin", "emoji": "₿"},
    {"symbol": "ETHUSDT", "name": "Ethereum", "emoji": "Ξ"},
    {"symbol": "BNBUSDT", "name": "BNB", "emoji": "🔶"},
    {"symbol": "SOLUSDT", "name": "Solana", "emoji": "◎"},
    {"symbol": "XRPUSDT", "name": "XRP", "emoji": "💧"},
    {"symbol": "DOGEUSDT", "name": "Dogecoin", "emoji": "🐕"},
]

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}


def get_binance_price(symbol):
    """جلب السعر من Binance API (للكريبتو)"""
    try:
        url = f"https://api.binance.com/api/v3/ticker/price?symbol={symbol}"
        response = requests.get(url, timeout=5)
        data = response.json()
        return float(data['price'])
    except:
        return None


def get_binance_24h(symbol):
    """جلب بيانات 24 ساعة من Binance"""
    try:
        url = f"https://api.binance.com/api/v3/ticker/24hr?symbol={symbol}"
        response = requests.get(url, timeout=5)
        data = response.json()
        return {
            'price': float(data['lastPrice']),
            'change': float(data['priceChangePercent']),
            'high': float(data['highPrice']),
            'low': float(data['lowPrice']),
            'volume': float(data['volume'])
        }
    except:
        return None


def scrape_google_finance(symbol):
    """جلب السعر من Google Finance"""
    try:
        # تحويل الرمز
        if ".SR" in symbol:
            g_symbol = f"{symbol.replace('.SR', '')}:TADAWUL"
        else:
            g_symbol = f"{symbol}:NASDAQ"
        
        url = f"https://www.google.com/finance/quote/{g_symbol}"
        
        response = requests.get(url, headers=HEADERS, timeout=10)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # البحث عن السعر
        price_div = soup.find('div', {'class': 'YMlKec fxKbKc'})
        if price_div:
            price_str = price_div.text.replace('SAR', '').replace('$', '').replace(',', '').strip()
            return float(price_str)
        
        # محاولة class آخر
        price_divs = soup.find_all('div', {'class': 'YMlKec'})
        for div in price_divs:
            text = div.text.strip()
            if text and text[0].isdigit():
                clean = text.replace('SAR', '').replace('$', '').replace(',', '').strip()
                try:
                    return float(clean)
                except:
                    continue
                    
    except Exception as e:
        pass
    
    return None


def get_live_price(symbol, market="us"):
    """جلب السعر من أفضل مصدر"""
    
    price = None
    source = None
    change = 0
    
    # الكريبتو - استخدم Binance
    if market == "crypto":
        data = get_binance_24h(symbol)
        if data:
            return data['price'], "Binance", data['change']
    
    # الأسهم - استخدم Google Finance
    price = scrape_google_finance(symbol)
    if price:
        source = "Google Finance"
    
    return price, source, change


def scan_all_markets():
    """فحص جميع الأسواق"""
    
    results = {
        "timestamp": datetime.now().isoformat(),
        "last_update": datetime.now().strftime("%H:%M:%S"),
        "markets": {
            "saudi": {"name": "🇸🇦 السعودي", "stocks": [], "count": 0},
            "us": {"name": "🇺🇸 الأمريكي", "stocks": [], "count": 0},
            "crypto": {"name": "🪙 الكريبتو", "stocks": [], "count": 0},
        }
    }
    
    # الكريبتو (Binance API - سريع جداً)
    print("\n🪙 جاري فحص سوق الكريبتو...")
    for stock in CRYPTO:
        price, source, change = get_live_price(stock["symbol"], "crypto")
        if price:
            results["markets"]["crypto"]["stocks"].append({
                "symbol": stock["symbol"],
                "name": stock["name"],
                "emoji": stock["emoji"],
                "price": round(price, 2),
                "change": round(change, 2),
                "source": source,
                "time": datetime.now().strftime("%H:%M:%S")
            })
            change_str = f"+{change:.2f}%" if change >= 0 else f"{change:.2f}%"
            print(f"   ✅ {stock['emoji']} {stock['name']}: ${price:,.2f} ({change_str})")
        else:
            print(f"   ❌ {stock['emoji']} {stock['name']}: فشل")
    results["markets"]["crypto"]["count"] = len(results["markets"]["crypto"]["stocks"])
    
    # السوق السعودي
    print("\n🇸🇦 جاري فحص السوق السعودي...")
    for stock in SAUDI_STOCKS:
        price, source, change = get_live_price(stock["symbol"], "saudi")
        if price:
            results["markets"]["saudi"]["stocks"].append({
                "symbol": stock["symbol"],
                "name": stock["name"],
                "emoji": stock["emoji"],
                "price": round(price, 2),
                "change": 0,
                "source": source,
                "time": datetime.now().strftime("%H:%M:%S")
            })
            print(f"   ✅ {stock['emoji']} {stock['name']}: {price:.2f} ر.س")
        else:
            print(f"   ❌ {stock['emoji']} {stock['name']}: فشل")
    results["markets"]["saudi"]["count"] = len(results["markets"]["saudi"]["stocks"])
    
    # السوق الأمريكي
    print("\n🇺🇸 جاري فحص السوق الأمريكي...")
    for stock in US_STOCKS:
        price, source, change = get_live_price(stock["symbol"], "us")
        if price:
            results["markets"]["us"]["stocks"].append({
                "symbol": stock["symbol"],
                "name": stock["name"],
                "emoji": stock["emoji"],
                "price": round(price, 2),
                "change": 0,
                "source": source,
                "time": datetime.now().strftime("%H:%M:%S")
            })
            print(f"   ✅ {stock['emoji']} {stock['name']}: ${price:,.2f}")
        else:
            print(f"   ❌ {stock['emoji']} {stock['name']}: فشل")
    results["markets"]["us"]["count"] = len(results["markets"]["us"]["stocks"])
    
    return results


def save_results(results):
    """حفظ النتائج"""
    
    # حفظ للفرونت إند
    output_path = os.path.join(os.path.dirname(__file__), 'frontend', 'src', 'data', 'live_prices.json')
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    # حفظ للباك إند
    backend_path = os.path.join(os.path.dirname(__file__), 'backend', 'data', 'live_prices.json')
    os.makedirs(os.path.dirname(backend_path), exist_ok=True)
    
    with open(backend_path, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print(f"\n💾 تم الحفظ!")


def run_continuous(interval=30):
    """تشغيل مستمر"""
    
    print("=" * 60)
    print("🔴 TIPR LIVE PRICE SCANNER v2")
    print("=" * 60)
    print(f"⏱️  التحديث كل {interval} ثانية")
    print("💡 اضغط Ctrl+C للإيقاف")
    print("=" * 60)
    
    while True:
        try:
            results = scan_all_markets()
            save_results(results)
            
            total = sum(m["count"] for m in results["markets"].values())
            print(f"\n📊 المجموع: {total} سعر")
            print(f"⏳ التحديث القادم في {interval} ثانية...")
            print("-" * 60)
            
            time.sleep(interval)
            
        except KeyboardInterrupt:
            print("\n\n🛑 تم الإيقاف")
            break
        except Exception as e:
            print(f"\n❌ خطأ: {e}")
            time.sleep(5)


def run_once():
    """تشغيل مرة واحدة"""
    print("=" * 60)
    print("🔴 TIPR LIVE PRICE SCANNER v2 (Single Run)")
    print("=" * 60)
    
    results = scan_all_markets()
    save_results(results)
    
    total = sum(m["count"] for m in results["markets"].values())
    print(f"\n✅ تم جلب {total} سعر بنجاح!")
    
    return results


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "--once":
        run_once()
    else:
        run_continuous(interval=30)
