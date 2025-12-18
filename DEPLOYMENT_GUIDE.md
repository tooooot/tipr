# 🚀 Tipr Production Deployment Guide

## ✅ Completed Steps

### 1. Code Push to GitHub
- [x] Latest changes committed
- [x] OpportunitiesPage added
- [x] BottomNav updated
- [x] Pushed to `main` branch

---

## 📦 Next: Deploy Frontend to Vercel

### Steps:

1. **Go to Vercel:**
   - Open: https://vercel.com/new
   - Click **Import Git Repository**
   - Select: `tooooot/tipr`

2. **Configure Project:**
   ```
   Framework Preset: Vite
   Root Directory: frontend ← IMPORTANT!
   Build Command: npm run build
   Output Directory: dist
   ```

3. **Environment Variables (CRITICAL):**
   Click **Environment Variables** and add:
   ```
   Name:  VITE_API_URL
   Value: YOUR_RENDER_BACKEND_URL
   ```
   
   Example:
   ```
   VITE_API_URL=https://tipr-backend-abc123.onrender.com
   ```
   
   ⚠️ **NO trailing slash!**

4. **Deploy:**
   - Click **Deploy**
   - Wait ~1 minute
   - You'll get a URL like: `tipr.vercel.app`

---

## 🤖 Background Worker Setup (For 24/7 Scanner)

### Option 1: Render Background Worker (Recommended)

1. **Go to Render Dashboard:**
   - Open: https://dashboard.render.com
   - Click your backend service

2. **Add Background Worker:**
   - Click **Settings**
   - Scroll to **Background Workers**
   - Click **Add Background Worker**
   
3. **Configure Worker:**
   ```
   Name: opportunity-scanner
   Start Command: python opportunity_detector.py
   Plan: Starter ($7/month) ← Free tier won't work
   ```

4. **Deploy Worker:**
   - Click **Create Background Worker**
   - It will start automatically

### Option 2: Keep Running Locally (For Testing)

- Keep `python opportunity_detector.py` running on your computer
- Data saves to `frontend/src/data/live_notifications.json`
- Frontend auto-detects new opportunities every 5 seconds
- **Limitation:** Stops when you close your computer

---

## 🔍 Verification Checklist

### Frontend (Vercel)
- [ ] Deployed successfully
- [ ] Environment variable `VITE_API_URL` set correctly
- [ ] Can access the app at Vercel URL
- [ ] Opportunities page loads
- [ ] Bottom nav shows live green dot on "الفرص"

### Backend (Render)
- [ ] Already deployed and working
- [ ] UptimeRobot monitoring active
- [ ] Health endpoint responding: `/health`

### Background Worker (Optional - Paid)
- [ ] Worker created on Render
- [ ] `opportunity_detector.py` running
- [ ] New opportunities appearing every 30 seconds
- [ ] Data saving to database/files

---

## 📱 Post-Deployment Testing

### 1. Test Frontend
Visit: `https://your-app.vercel.app`

✅ Check:
- App loads properly
- Bottom nav visible
- Click "الفرص" → shows opportunities
- Click a bot → navigates to profile
- PWA installable on mobile

### 2. Test API Connection
- Open browser DevTools (F12)
- Go to Console
- Look for: `⚡ Keep-alive ping sent`
- Should appear every 5 minutes

### 3. Test Opportunities Scanner
- Go to `/opportunities` page
- Should show "آخر تحديث" timestamp
- Click refresh → new opportunities appear (if scanner is running)

---

## 💰 Cost Summary

### Free Tier (Current)
- **Render Backend:** Free
  - Sleeps after 15 min inactivity
  - UptimeRobot keeps it awake
- **Vercel Frontend:** Free
  - Unlimited bandwidth
  - Auto-deploys on Git push
- **Total:** $0/month ✅

### With 24/7 Scanner (Recommended for Production)
- **Render Starter:** $7/month
  - Never sleeps
  - Background worker support
  - 512 MB RAM
- **Vercel:** Still free
- **Total:** $7/month

---

## 🎯 What You Get

### Current (Free):
✅ Live frontend
✅ API backend
✅ Historical trade data
✅ Bot profiles
✅ Portfolio tracking
❌ No real-time opportunity scanning

### With Background Worker ($7/month):
✅ Everything above, PLUS:
✅ 24/7 opportunity scanning
✅ Real-time alerts every 30 seconds
✅ Automatic trade detection
✅ Live robot signals
✅ Continuous market monitoring

---

## 🚀 Quick Commands Reference

### Local Development
```bash
# Frontend
cd frontend
npm run dev

# Backend
cd backend
uvicorn app.main:app --reload

# Scanner (Manual)
python opportunity_detector.py
```

### Git Deploy
```bash
git add -A
git commit -m "Your message"
git push origin main
```

---

## 📞 Next Steps

1. **Deploy to Vercel** (5 minutes)
2. **Test the live app**
3. **Decide:** Free tier or add $7/month scanner?
4. **Celebrate! 🎉**
