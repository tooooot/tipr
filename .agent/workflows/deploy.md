---
description: How to deploy Tipr to the Web (Backend + Frontend)
---

# Deployment Guide

To make the application accessible to everyone on the internet, you need to deploy both the Backend (Python) and the Frontend (React).

## Prerequisites
1. Create a GitHub account and push this project to a new repository.
2. Create accounts on [Render.com](https://render.com) (for Backend) and [Vercel.com](https://vercel.com) (for Frontend).

## Step 1: Deploy Backend (Render)
1. Go to Render Dashboard > New > Web Service.
2. Connect your GitHub repo.
3. Settings:
    - **Root Directory**: `backend`
    - **Runtime**: Python 3
    - **Build Command**: `pip install -r requirements.txt`
    - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port 10000`
4. Click **Create Web Service**.
5. Wait for deployment. You will get a URL (e.g., `https://tipr-backend.onrender.com`). **Copy this URL.**

## Step 2: Deploy Frontend (Vercel)
1. Go to Vercel Dashboard > Add New > Project.
2. Import your GitHub repo.
3. Settings:
    - **Root Directory**: `frontend`
    - **Framework Preset**: Vite
    - **Environment Variables**:
        - Name: `VITE_API_URL`
        - Value: The Backend URL from Step 1 (e.g., `https://tipr-backend.onrender.com`)
4. Click **Deploy**.

## Step 3: Done!
Vercel will give you a domain (e.g., `tipr.vercel.app`). Open this on any mobile device to install the PWA.
