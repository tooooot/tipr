import json
import os
import sys
from datetime import datetime, timedelta

# Add backend to path to import app modules
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.services.backtest_engine import BacktestEngine

def generate_frontend_data():
    print("🚀 توليد بيانات الواجهة من المحرك الجديد (Generate Frontend Data)...")
    
    # 1. Define Markets and Run Engines
    markets = ["saudi", "us", "crypto"]
    start_date = (datetime.now() - timedelta(days=365)).strftime("%Y-%m-%d")
    initial_capital = 100000
    
    all_trades_export = []
    
    for market in markets:
        print(f"\n⚙️ تشغيل محرك سوق: {market.upper()}...")
        try:
            engine = BacktestEngine(start_date, initial_capital, market)
            
            # Use 'run' but modify strictly to NOT print too much, or just capture the results
            # The 'run' method runs until NOW.
            # We want to access internal state after run.
            
            # Run the engine
            engine.run()
            
            # 2. Extract CLOSED Trades
            print(f"   📥 استخراج الصفقات المغلقة ({market})...")
            for bot_id, trades in engine.closed_trades.items():
                for t in trades:
                    all_trades_export.append({
                        "id": t.id,
                        "bot_id": bot_id,
                        "market": market.upper(),
                        "symbol": t.symbol,
                        "entry_date": t.entry_date,
                        "entry_price": round(t.entry_price, 2),
                        "exit_date": t.exit_date,
                        "exit_price": round(t.exit_price, 2),
                        "profit_pct": t.profit_pct,
                        "status": "closed",
                        "result": t.result,
                        "reason_ar": t.reason_ar,
                        "exit_reason": t.exit_reason_ar,
                        "entry_indicators": t.entry_indicators,
                        "exit_indicators": t.exit_indicators,
                        # Fallback values for UI consistency
                        "current_price": round(t.exit_price, 2), 
                        "take_profit": round(t.entry_price * 1.05, 2), # Approx if not stored
                        "stop_loss": round(t.entry_price * 0.95, 2)
                    })
            
            # 3. Extract OPEN Trades (Positions)
            # Accessing private attribute somewhat, but accessible in python
            print(f"   📥 استخراج الصفقات المفتوحة ({market})...")
            for bot_id, positions in engine.positions.items():
                for symbol, pos in positions.items():
                    # Get current price
                    current_price = engine._get_price_on_date(symbol, datetime.now())
                    if not current_price: current_price = pos.entry_price
                    
                    profit_pct = ((current_price - pos.entry_price) / pos.entry_price) * 100
                    
                    all_trades_export.append({
                        "id": f"{bot_id}_{symbol}_open_{int(datetime.now().timestamp())}",
                        "bot_id": bot_id,
                        "market": market.upper(),
                        "symbol": symbol,
                        "entry_date": pos.entry_date.strftime("%Y-%m-%d"),
                        "entry_price": round(pos.entry_price, 2),
                        "current_price": round(current_price, 2),
                        "profit_pct": round(profit_pct, 2),
                        "take_profit": round(pos.take_profit, 2),
                        "stop_loss": round(pos.stop_loss, 2),
                        "status": "open",
                        "reason_ar": pos.reason_ar,
                        "entry_indicators": pos.entry_indicators
                    })
                    
        except Exception as e:
            print(f"❌ خطأ في سوق {market}: {e}")
            import traceback
            traceback.print_exc()

    # Sort descending by date
    all_trades_export.sort(key=lambda x: x['entry_date'], reverse=True)
    
    # 4. Save to Frontend
    output_path = "frontend/src/data/real_trades.json"
    with open(output_path, "w", encoding='utf-8') as f:
        json.dump(all_trades_export, f, ensure_ascii=False, indent=4)
        
    print(f"\n✅✅ تم تحديث بيانات الواجهة بنجاح: {len(all_trades_export)} صفقة تم توليدها.")
    print(f"   المسار: {output_path}")

if __name__ == "__main__":
    generate_frontend_data()
