"""
TIBR Backend - Main FastAPI Application
=======================================
10 روبوتات استثمارية ذكية للسوق السعودي
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
import random

app = FastAPI(title="TIBR API", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============ Bot Configurations ============
BOTS = [
    {"id": "al_nami", "name_ar": "النامي", "name_en": "The Grower", "emoji": "📈", 
     "strategy_ar": "استراتيجية النمو والاتجاه", "risk_level": "متوسط",
     "description_ar": "يبحث عن الأسهم التي تخترق مقاومات مع حجم تداول عالي"},
    {"id": "al_qannas", "name_ar": "القناص", "name_en": "The Sniper", "emoji": "🎯",
     "strategy_ar": "التداول السريع على المدى القصير", "risk_level": "عالي",
     "description_ar": "يستهدف الأسهم في منطقة تشبع بيعي للارتداد السريع"},
    {"id": "al_jasour", "name_ar": "الجسور", "name_en": "The Bold", "emoji": "🦁",
     "strategy_ar": "المخاطر العالية والعوائد الكبيرة", "risk_level": "عالي جداً",
     "description_ar": "يدخل الأسهم المنخفضة بقوة رهاناً على الارتداد"},
    {"id": "al_barq", "name_ar": "البرق", "name_en": "Lightning", "emoji": "⚡",
     "strategy_ar": "اقتناص طفرات الحجم", "risk_level": "عالي جداً",
     "description_ar": "يراقب طفرات الحجم غير العادية للدخول السريع"},
    {"id": "al_basira", "name_ar": "البصيرة", "name_en": "The Seer", "emoji": "👁️",
     "strategy_ar": "تحليل الأخبار والمشاعر", "risk_level": "متوسط",
     "description_ar": "يحلل الأخبار ومشاعر السوق لاتخاذ القرارات"},
    {"id": "al_razeen", "name_ar": "الرزين", "name_en": "The Steady", "emoji": "⚖️",
     "strategy_ar": "الاستثمار في القيمة", "risk_level": "منخفض",
     "description_ar": "يبحث عن الأسهم المقيّمة بأقل من قيمتها الحقيقية"},
    {"id": "al_khabeer", "name_ar": "الخبير", "name_en": "The Expert", "emoji": "🧠",
     "strategy_ar": "التحليل الفني الكلاسيكي", "risk_level": "متوسط",
     "description_ar": "يستخدم التقاطعات الذهبية والمؤشرات الكلاسيكية"},
    {"id": "al_rasi", "name_ar": "الراسي", "name_en": "The Anchor", "emoji": "🏔️",
     "strategy_ar": "صائد التوزيعات", "risk_level": "منخفض",
     "description_ar": "يستهدف الأسهم ذات التوزيعات العالية"},
    {"id": "al_dhakheera", "name_ar": "الذخيرة", "name_en": "The Reserve", "emoji": "💰",
     "strategy_ar": "الشراء المنتظم (DCA)", "risk_level": "منخفض جداً",
     "description_ar": "يشتري بانتظام بغض النظر عن السعر"},
    {"id": "al_mudarra", "name_ar": "المُدرّع", "name_en": "The Armored", "emoji": "🛡️",
     "strategy_ar": "التحوط والتنويع", "risk_level": "منخفض",
     "description_ar": "ينوع المحفظة عبر القطاعات للحماية"},
    {"id": "al_maestro", "name_ar": "المايسترو", "name_en": "The Maestro", "emoji": "🐋",
     "strategy_ar": "صيد الحيتان (Whale Strategy)", "risk_level": "عالي (هجومي)",
     "description_ar": "يتبع سيولة الهوامير + تجميع هرمي لمضاعفة الأرباح"},
]

SAUDI_STOCKS = ["2222.SR", "1120.SR", "2010.SR", "1180.SR", "2380.SR", 
                "7010.SR", "2350.SR", "4200.SR", "1010.SR", "3010.SR"]


# ============ Endpoints ============

@app.get("/")
def root():
    return {"message": "TIBR API v2.0", "status": "running"}


@app.get("/api/bots")
def get_bots():
    return {"data": BOTS, "count": len(BOTS)}


@app.get("/api/bots/{bot_id}")
def get_bot(bot_id: str):
    for bot in BOTS:
        if bot["id"] == bot_id:
            return {"data": bot}
    return {"error": "Bot not found"}

@app.post("/api/backtest/run")
def run_backtest(start_date: str = "2024-01-01", initial_capital: float = 100000, market: str = "saudi"):
    """
    ⚠️ محاكاة آلة الزمن - بيانات حقيقية 100% من Yahoo Finance
    """
    from app.services.backtest_engine import BacktestEngine
    
    try:
        # إنشاء محرك الباك تيست مع تحديد نوع السوق
        engine = BacktestEngine(start_date=start_date, initial_capital=initial_capital, market_type=market)
        
        # تشغيل المحاكاة
        results = engine.run()
        results["market_type"] = market
        
        # إضافة معلومات مصدر البيانات
        results["data_source"] = {
            "provider": "Yahoo Finance",
            "type": "real_historical_data",
            "disclaimer": "⚠️ تحذير: النتائج التاريخية لا تضمن الأداء المستقبلي. استثمر بحكمة.",
            "stocks_used": getattr(engine, 'available_stocks', [])
        }
        
        return results
        
    except Exception as e:
        return {
            "error": True,
            "message": str(e),
            "suggestion": "تحقق من اتصال الإنترنت وحاول مرة أخرى"
        }


@app.get("/api/news")
def get_news():
    return {
        "data": [
            {"title": "أرامكو تعلن نتائج الربع الثالث", "source": "أرقام", "sentiment": "positive"},
            {"title": "تراجع مؤشر تاسي بنسبة 0.5%", "source": "تداول", "sentiment": "negative"},
            {"title": "البنوك السعودية تحقق أرباحاً قياسية", "source": "الاقتصادية", "sentiment": "positive"},
        ]
    }


@app.get("/api/verify/price/{symbol}/{date}")
def verify_price(symbol: str, date: str):
    """
    التحقق من السعر الحقيقي لسهم في تاريخ محدد
    
    Args:
        symbol: رمز السهم (مثل 2222)
        date: التاريخ (YYYY-MM-DD)
    """
    from app.services.price_verifier import price_verifier
    
    # إضافة .SR إذا لم تكن موجودة
    full_symbol = f"{symbol}.SR" if '.SR' not in symbol else symbol
    
    result = price_verifier.get_real_price(full_symbol, date)
    
    if result:
        return {"success": True, "data": result}
    else:
        return {"success": False, "error": "لم يتم العثور على بيانات لهذا السهم/التاريخ"}


@app.get("/api/verify/indicators/{symbol}/{date}")
def verify_indicators(symbol: str, date: str, days_before: int = 200):
    """
    التحقق من المؤشرات الفنية الحقيقية لسهم في تاريخ محدد
    
    Args:
        symbol: رمز السهم (مثل 2222)
        date: التاريخ (YYYY-MM-DD)
        days_before: عدد الأيام قبل التاريخ لحساب المؤشرات
    """
    import yfinance as yf
    from datetime import datetime, timedelta
    from app.services.technical_indicators import TechnicalIndicators
    
    try:
        # إضافة .SR إذا لم تكن موجودة
        full_symbol = f"{symbol}.SR" if '.SR' not in symbol else symbol
        
        # تحويل التاريخ
        target_date = datetime.strptime(date, '%Y-%m-%d')
        start_date = target_date - timedelta(days=days_before)
        end_date = target_date + timedelta(days=5)
        
        # جلب البيانات من Yahoo Finance
        ticker = yf.Ticker(full_symbol)
        hist = ticker.history(start=start_date.strftime('%Y-%m-%d'), 
                             end=end_date.strftime('%Y-%m-%d'))
        
        if hist.empty:
            return {"success": False, "error": "لا توجد بيانات لهذا السهم"}
        
        # تحويل البيانات لتنسيق مناسب
        price_data = []
        target_idx = None
        
        for i, (idx, row) in enumerate(hist.iterrows()):
            date_obj = idx.to_pydatetime()
            if date_obj.tzinfo is not None:
                date_obj = date_obj.replace(tzinfo=None)
            
            price_data.append({
                "date": date_obj,
                "open": float(row['Open']),
                "high": float(row['High']),
                "low": float(row['Low']),
                "close": float(row['Close']),
                "volume": int(row['Volume'])
            })
            
            # البحث عن أقرب تاريخ للتاريخ المطلوب
            if target_idx is None or abs((date_obj - target_date).days) < abs((price_data[target_idx]["date"] - target_date).days):
                target_idx = i
        
        if target_idx is None:
            return {"success": False, "error": "لم يتم العثور على بيانات للتاريخ المحدد"}
        
        # حساب المؤشرات الفنية
        indicators = TechnicalIndicators.get_all_indicators(price_data, target_idx)
        
        return {
            "success": True,
            "data": {
                "symbol": full_symbol,
                "requested_date": date,
                "actual_date": indicators.get("date"),
                "price": indicators.get("price"),
                "indicators": indicators,
                "source": "Yahoo Finance (Real Data)"
            }
        }
        
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.post("/api/verify/trade")
def verify_trade(trade_data: dict):
    """
    التحقق من صفقة واحدة
    
    Body:
        trade_data: بيانات الصفقة (symbol, date, exit_date, price, exit_price)
    """
    from app.services.price_verifier import price_verifier
    
    result = price_verifier.verify_trade(trade_data)
    return {"success": True, "data": result}


@app.post("/api/verify/trades")
def verify_trades(bot_id: str = None, limit: int = 5):
    """
    التحقق من عدة صفقات من بيانات المحاكاة
    
    Args:
        bot_id: معرف الروبوت (اختياري)
        limit: عدد الصفقات للتحقق
    """
    from app.services.price_verifier import price_verifier
    from app.services.backtest_engine import BacktestEngine
    
    # تشغيل محاكاة للحصول على الصفقات
    engine = BacktestEngine(start_date="2024-01-01", initial_capital=100000)
    simulation_results = engine.run()
    
    # جمع الصفقات
    all_trades = []
    for portfolio in simulation_results.get('bot_portfolios', {}).values():
        trades = portfolio.get('trades', [])
        if bot_id and portfolio.get('bot_id') != bot_id:
            continue
        all_trades.extend(trades)
    
    if not all_trades:
        return {"success": False, "error": "لا توجد صفقات للتحقق"}
    
    # التحقق من الصفقات
    result = price_verifier.verify_multiple_trades(all_trades, limit=limit)
    
    return {"success": True, "data": result}


@app.get("/api/verify/stock/{symbol}")
def get_stock_history(symbol: str, days: int = 30):
    """
    جلب تاريخ سعر سهم
    
    Args:
        symbol: رمز السهم
        days: عدد الأيام
    """
    import yfinance as yf
    from datetime import datetime, timedelta
    
    try:
        full_symbol = f"{symbol}.SR" if '.SR' not in symbol else symbol
        
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        ticker = yf.Ticker(full_symbol)
        hist = ticker.history(start=start_date.strftime('%Y-%m-%d'), 
                             end=end_date.strftime('%Y-%m-%d'))
        
        if hist.empty:
            return {"success": False, "error": "لا توجد بيانات"}
        
        data = []
        for idx, row in hist.iterrows():
            data.append({
                'date': idx.strftime('%Y-%m-%d'),
                'open': round(float(row['Open']), 2),
                'high': round(float(row['High']), 2),
                'low': round(float(row['Low']), 2),
                'close': round(float(row['Close']), 2),
                'volume': int(row['Volume'])
            })
        
        return {
            "success": True, 
            "data": {
                "symbol": full_symbol,
                "prices": data,
                "count": len(data)
            }
        }
        
    except Exception as e:
        return {"success": False, "error": str(e)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

