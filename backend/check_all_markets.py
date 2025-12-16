import requests
import json
import time

def run_multi_market_simulation():
    markets = [
        {"id": "saudi", "name": "🇸🇦 السوق السعودي"},
        {"id": "us", "name": "🇺🇸 السوق الأمريكي"},
        {"id": "crypto", "name": "🪙 سوق الكريبتو"}
    ]
    
    leaderboard = []
    
    print("🌍 بدء بطولة الأسواق العالمية...\n")
    
    for market in markets:
        print(f"⏳ جاري تشغيل المحاكاة لـ {market['name']}...")
        
        try:
            # استدعاء API لكل سوق
            response = requests.post(
                "http://localhost:8000/api/backtest/run", 
                params={"start_date": "2024-01-01", "market": market["id"]}, # params for query
                timeout=180
            )
            
            if response.status_code == 200:
                data = response.json()
                bots = data.get("leaderboard", [])
                if not bots:
                    print(f"DEBUG: Empty leaderboard. Response data: {data}")
                else:
                    print(f"DEBUG: Bots found: {[b.get('bot_id') for b in bots]}")
                
                # البحث عن المايسترو
                maestro = next((bot for bot in bots if bot["bot_id"] == "al_maestro"), None)
                
                if maestro:
                    print(f"✅ تم الانتهاء. النتيجة: {maestro['total_profit_pct']}%")
                    leaderboard.append({
                        "market_name": market["name"],
                        "bot_name": maestro["name_ar"],
                        "profit": maestro["total_profit_pct"],
                        "balance": maestro["final_balance"],
                        "trades": maestro["total_trades"],
                        "win_rate": maestro["win_rate"]
                    })
                else:
                    print(f"⚠️ المايسترو لم يشارك في {market['name']}")
            else:
                print(f"❌ خطأ في السيرفر: {response.status_code} - {response.text}")
                
        except Exception as e:
            print(f"❌ فشل الاتصال: {str(e)}")
        
        print("-" * 40)
        time.sleep(2) # استراحة بين الطلبات

    # عرض النتائج النهائية
    print("\n🏆 **لوحة المتصدرين العالمية (Global Leaderboard)** 🏆")
    print("=" * 60)
    print(f"{'السوق':<20} | {'الروبوت':<15} | {'الربح %':<10} | {'الرصيد النهائي':<15}")
    print("-" * 60)
    
    leaderboard.sort(key=lambda x: x["profit"], reverse=True)
    
    for entry in leaderboard:
        print(f"{entry['market_name']:<20} | {entry['bot_name']:<15} | {entry['profit']:<10}% | {entry['balance']:,.2f}")
    
    print("=" * 60)
    if leaderboard:
        winner = leaderboard[0]
        print(f"\n🥇 **بطل العالم هو: {winner['bot_name']} في {winner['market_name']} بربح {winner['profit']}%**")

if __name__ == "__main__":
    run_multi_market_simulation()
