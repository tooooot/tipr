import yfinance as yf
import pandas as pd

# Fix for yfinance connection (Anti-scraping)
import requests_cache
session = requests_cache.CachedSession('yfinance.cache')
session.headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'

def test_saudi_fetch():
    symbol = "1120.SR" # Al Rajhi
    print(f"Testing fetch for {symbol}...")
    
    try:
        # Try without session first (standard)
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period="1mo")
        
        if hist.empty:
            print("❌ Standard fetch failed (Empty).")
            
            # Try with session
            print("🔄 Trying with Custom Session...")
            ticker = yf.Ticker(symbol, session=session)
            hist = ticker.history(period="1mo")
            
        if not hist.empty:
            print(f"✅ Success! Retrieved {len(hist)} days of REAL data.")
            print(hist.tail(3)[['Close', 'Volume']])
        else:
            print("❌ All fetch attempts failed.")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    try:
        import yfinance
        print(f"yfinance version: {yfinance.__version__}")
        test_saudi_fetch()
    except ImportError:
        print("yfinance not installed.")
