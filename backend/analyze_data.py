import json
from app.services.backtest_engine import BacktestEngine
from app.main import SAUDI_STOCKS
from datetime import datetime

def analyze_market_potential():
    print("🕵️‍♂️ جاري تحليل الفرص الضائعة في البيانات...")
    
    # تهيئة المحرك لجلب البيانات
    engine = BacktestEngine(start_date="2023-01-01", initial_capital=100000)
    
    print(f"📊 عدد الأسهم التي تم تحميل بياناتها: {len(engine.price_data)}")
    
    best_stocks = []
    
    for symbol, data in engine.price_data.items():
        if not data: continue
        
        first_price = data[0]["close"]
        highest_price = max(d["high"] for d in data)
        lowest_price = min(d["low"] for d in data)
        last_price = data[-1]["close"]
        
        # أقصى ربح ممكن (من القاع للقمة)
        max_potential_gain = ((highest_price - lowest_price) / lowest_price) * 100
        
        # ربح الاستثمار (من البداية للنهاية)
        buy_hold_gain = ((last_price - first_price) / first_price) * 100
        
        best_stocks.append({
            "symbol": symbol,
            "max_potential": max_potential_gain,
            "buy_hold": buy_hold_gain,
            "period_days": len(data)
        })
    
    # ترتيب الأسهم حسب الفرصة
    best_stocks.sort(key=lambda x: x["max_potential"], reverse=True)
    
    print("\n💎 **أكبر الفرص الموجودة في بياناتك:**")
    print(f"{'السهم':<10} | {'التدبيلة الممكنة (Max)':<20} | {'ربح الاحتفاظ (Hold)':<20}")
    print("-" * 60)
    
    for stock in best_stocks:
        symbol = stock['symbol']
        max_pot = f"{stock['max_potential']:.1f}%"
        hold = f"{stock['buy_hold']:.1f}%"
        print(f"{symbol:<10} | {max_pot:<20} | {hold:<20}")

if __name__ == "__main__":
    analyze_market_potential()
