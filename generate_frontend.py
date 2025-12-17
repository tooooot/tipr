import json
import os
import sys
import random
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
                    # Standardize Times for Daily Backtesting Clarity
                    # Entry is always assumed near Market Open
                    # Exit is assumed near Market Close (if intraday) or Open (if swing)
                    
                    entry_dt_obj = t.entry_date if isinstance(t.entry_date, datetime) else datetime.strptime(t.entry_date, "%Y-%m-%d")
                    exit_dt_obj = t.exit_date if isinstance(t.exit_date, datetime) else datetime.strptime(t.exit_date, "%Y-%m-%d")

                    # Set Entry at 10:15 AM (Confirming trend after open)
                    entry_final = entry_dt_obj.replace(hour=10, minute=15, second=0)
                    
                    # Logic for Exit Time
                    if entry_dt_obj.date() == exit_dt_obj.date():
                        # Intraday Trade: Exit before close at 02:45 PM
                        exit_final = exit_dt_obj.replace(hour=14, minute=45, second=0)
                    else:
                        # Swing Trade: Exit usually happens at Open of the exit day
                        exit_final = exit_dt_obj.replace(hour=10, minute=30, second=0)

                    all_trades_export.append({
                        "id": t.id,
                        "bot_id": bot_id,
                        "market": market.upper(),
                        "symbol": t.symbol,
                        "entry_date": entry_final.strftime("%Y-%m-%dT%H:%M:%S"),
                        "entry_price": round(t.entry_price, 2),
                        "exit_date": exit_final.strftime("%Y-%m-%dT%H:%M:%S"),
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
                        "take_profit": round(t.entry_price * 1.05, 2),
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

    # 5. Generate Notifications (Linked to Trades)
    print("🔔 توليد التنبيهات (Notifications)...")
    notifications = []
    
    # Bot Names Mapping (Mirroring Frontend)
    BOT_NAMES = {
        'al_maestro': 'المايسترو',
        'al_qannas': 'القناص',
        'al_hout': 'الحوت',
        'sayyad_alfors': 'صياد الفرص',
        'smart_investor': 'المستثمر الذكي',
        'wave_breaker': 'كاسر الأمواج',
        'gap_hunter': 'صائد الفجوات',
        'momentum_tracker': 'متتبع الزخم',
        'shield_keeper': 'حارس المحفظة',
        'indicator_pro': 'خبير المؤشرات',
        'copy_cat': 'الناسخ',
        'wall_street_wolf': 'ذئب وول ستريت',
        'tech_titan': 'عملاق التقنية',
        'dividend_king': 'ملك التوزيعات',
        'crypto_king': 'ملك الكريبتو',
        'defi_wizard': 'ساحر الـDeFi',
        'pair_trader': 'المضارب المزدوج',
        'sentiment_ai': 'قارئ المشاعر',
        'grid_master': 'سيد الشبكة',
        'al_razeen': 'الرزين',
        'al_dhakheera': 'الذخيرة',
        'al_barq': 'البرق',
        'al_basira': 'البصيرة',
        'al_khabeer': 'الخبير',
        'al_rasi': 'الراسي',
        'al_mudarra': 'المُدرّع',
        'al_nami': 'النامي',
        'al_jasour': 'الجسور',
        'altcoin_hunter': 'صائد العملات البديلة'
    }

    # Take top 20 recent trades (Open + Closed)
    recent_trades = all_trades_export[:20]
    
    for idx, trade in enumerate(recent_trades):
        bot_name = BOT_NAMES.get(trade['bot_id'], "الروبوت الآلي")
        
        notif_type = "opportunity"
        title = f"فرصة جديدة: {bot_name} 🤖"
        msg = f"اقتنص {bot_name} فرصة شراء في {trade['symbol']} بسعر {trade['entry_price']} ريال. الهدف: {trade['take_profit']}"
        
        if trade['status'] == 'closed':
            if trade['result'] == 'win':
                notif_type = "win"
                title = f"مبروك! {bot_name} حقق ربحاً 💰"
                msg = f"قام {bot_name} بإغلاق صفقة {trade['symbol']} بربح {trade['profit_pct']}% ✅"
            else:
                notif_type = "loss"
                title = f"تنبيه أمان: {bot_name} 🛡️"
                msg = f"قام {bot_name} بإغلاق صفقة {trade['symbol']} لتفعيل وقف الخسارة والحفاظ على رأس المال."

        notifications.append({
            "id": idx + 1,
            "bot_id": trade['bot_id'],
            "trade_id": trade['id'], # LINK TO TRADE
            "title": title,
            "message": msg,
            "time": "الآن", # For simulation, everything is fresh
            "read": False,
            "type": notif_type
        })
        
    repo_notif_path = "frontend/src/data/user_notifications.json"
    with open(repo_notif_path, "w", encoding='utf-8') as f:
        json.dump(notifications, f, ensure_ascii=False, indent=4)
        
    print(f"✅✅ تم توليد {len(notifications)} تنبيه.")
    print(f"   المسار: {repo_notif_path}")

if __name__ == "__main__":
    generate_frontend_data()
