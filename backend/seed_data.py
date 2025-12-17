import yfinance as yf
import json
import os
import time
import random
from datetime import datetime, timedelta

# Create data directory
os.makedirs("backend/data", exist_ok=True)

MARKETS = {
    "saudi": [
        "1120.SR", "2222.SR", "2010.SR", "1180.SR", "2380.SR", 
        "7010.SR", "2350.SR", "4200.SR", "1010.SR", "3010.SR" # Core Saudi Stocks
    ],
    "us": [
        "NVDA", "TSLA", "META", "AMD", "MSFT", 
        "GOOG", "AMZN", "AAPL", "NFLX", "COIN" # Top Tech
    ],
    "crypto": [
        "BTC-USD", "ETH-USD", "SOL-USD", "BNB-USD", "XRP-USD" # Top Crypto
    ]
}

# Setup Session with Headers to bypass Yahoo's basic blocking
import requests
session = requests.Session()
session.headers.update({
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
})

def fetch_and_seed():
    all_data = {}
    print("🚀 بدء تحميل البيانات التاريخية الحقيقية (Seeding)...")
    
    for market, symbols in MARKETS.items():
        print(f"\n📊 جاري تحميل سوق: {market.upper()}")
        all_data[market] = {}
        
        for symbol in symbols:
            print(f"   ⏳ تحميل {symbol}...", end="")
            try:
                # Add headers to mimic browser
                ticker = yf.Ticker(symbol, session=session)
                
                # Fetch 1 Year of Data
                hist = ticker.history(period="1y", interval="1d")
                
                if not hist.empty:
                    clean_data = []
                    for idx, row in hist.iterrows():
                        date_str = idx.strftime("%Y-%m-%dT%H:%M:%S")
                        clean_data.append({
                            "date": date_str,
                            "open": round(float(row['Open']), 2),
                            "high": round(float(row['High']), 2),
                            "low": round(float(row['Low']), 2),
                            "close": round(float(row['Close']), 2),
                            "volume": int(row['Volume'])
                        })
                    
                    all_data[market][symbol] = clean_data
                    print(f" ✅ نجح ({len(clean_data)} يوم)")
                else:
                    print(" ❌ فشل (بيانات فارغة)")
            
            except Exception as e:
                print(f" ❌ خطأ: {e}")
            
            # Sleep slightly to avoid rate limits
            time.sleep(random.uniform(0.5, 1.5))

    # Save to file
    output_path = "backend/data/real_market_data.json"
    with open(output_path, "w", encoding='utf-8') as f:
        json.dump(all_data, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅✅ تم حفظ قاعدة البيانات بنجاح في: {output_path}")

if __name__ == "__main__":
    fetch_and_seed()
