import requests
import json

try:
    print("⏳ Running Whale Strategy Simulation for Al-Maestro (Saudi Market)...")
    response = requests.post("http://localhost:8000/api/backtest/run", json={}, timeout=60)
    
    if response.status_code == 200:
        data = response.json()
        leaderboard = data.get("leaderboard", [])
        
        maestro = next((bot for bot in leaderboard if bot["bot_id"] == "al_maestro"), None)
        
        if maestro:
            print("\n🐋 **نتائج استراتيجية الحيتان (المايسترو):**")
            print(f"💰 الرصيد النهائي: {maestro['final_balance']:,.2f} ريال")
            print(f"📈 نسبة الربح/الخسارة: {maestro['total_profit_pct']}%")
            print(f"✅ صفقات رابحة: {maestro['winning_trades']}")
            print(f"❌ صفقات خاسرة: {maestro['losing_trades']}")
            print(f"📊 معدل الفوز: {maestro['win_rate']}%")
        else:
            print("❌ لم يتم العثور على المايسترو في النتائج!")
    else:
        print(f"❌ Error: {response.text}")
except Exception as e:
    print(f"❌ Failed to connect: {e}")
