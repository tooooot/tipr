import requests
import json
import time
import random
import os

# Notification Templates (The Hook)
NOTIFICATIONS_TEMPLATES = {
    'BUY': [
        "🤖 {bot}: رصدتُ حركة غير طبيعية في {symbol} 💎. اضغط للتفاصيل.",
        "🦁 {bot}: هل أنت جاهز؟ فرصة اختراق محتملة في {symbol} 🚀",
        "🦅 {bot}: {symbol} وصل لمنطقة اقتناص تاريخية! 🎯",
        "🐋 {bot}: السيولة الذكية بدأت تدخل {symbol}.. هل نلحق بهم؟"
    ],
    'WIN': [
        "💰 صوت النقود! صفقة {symbol} حققت الهدف {profit}% 🎯",
        "🚀 {bot}: {symbol} يطير كما توقعنا! (+{profit}%)",
        "🏆 مبروك! إغلاق صفقة {symbol} بربح ممتاز."
    ],
    'LOSS': [
        "🛡️ تنبيه حارس المحفظة: تفعيل وقف الخسارة في {symbol} لحماية رأس المال.",
        "⚠️ {bot}: الخروج من {symbol} أأمن الآن. تعلم من الدرس 🎓"
    ]
}

def generate_notification(bot_name, symbol, type, profit=0):
    templates = NOTIFICATIONS_TEMPLATES.get(type, NOTIFICATIONS_TEMPLATES['BUY'])
    template = random.choice(templates)
    return template.format(bot=bot_name, symbol=symbol, profit=profit)

def run_multi_market_simulation():
    markets = [
        {"id": "saudi", "name": "🇸🇦 السوق السعودي"},
        {"id": "us", "name": "🇺🇸 السوق الأمريكي"},
        {"id": "crypto", "name": "🪙 سوق الكريبتو"}
    ]
    
    notifications = []
    
    print("🌍 بدء فحص الأسواق لتوليد التوصيات...\n")
    
    for market in markets:
        print(f"⏳ جاري البحث في {market['name']}...")
        
        # Simulate finding "Live" signals (Mocking for Demo)
        # In a real scenario, this would come from the API check
        
        # Mock Findings
        if market['id'] == 'saudi':
            notifications.append({
                "id": f"notif_{int(time.time())}_1",
                "title": "🤖 المايسترو يناديك!",
                "body": generate_notification("المايسترو", "الراجحي", "BUY"),
                "time": "الآن",
                "read": False,
                "type": "opportunity"
            })
        elif market['id'] == 'us':
            notifications.append({
                "id": f"notif_{int(time.time())}_2",
                "title": "🐺 ذئب وول ستريت",
                "body": generate_notification("الذئب", "NVIDIA", "WIN", 12.5),
                "time": "منذ 5 دقائق",
                "read": False,
                "type": "win"
            })
        elif market['id'] == 'crypto':
             notifications.append({
                "id": f"notif_{int(time.time())}_3",
                "title": "👑 ملك الكريبتو",
                "body": generate_notification("الملك", "BTC", "BUY"),
                "time": "منذ 15 دقيقة",
                "read": False,
                "type": "opportunity"
            })

    # Save Notifications to Frontend Data
    frontend_data_path = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'src', 'data', 'notifications.json')
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(frontend_data_path), exist_ok=True)
    
    with open(frontend_data_path, 'w', encoding='utf-8') as f:
        json.dump(notifications, f, ensure_ascii=False, indent=4)
        
    print(f"\n✅ تم توليد {len(notifications)} إشعار جديد وارسالها للتطبيق.")
    print(f"📁 المسار: {frontend_data_path}")

if __name__ == "__main__":
    run_multi_market_simulation()
