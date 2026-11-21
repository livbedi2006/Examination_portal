# ⚡ Vercel Deployment Guide

This guide explains how to deploy the entire full-stack Exam System (FastAPI backend + HTML5/JS frontend + AI models) on **Vercel**.

---

## Architecture on Vercel

```
Vercel Project
├── /api/index.py               <- Python Serverless Function (FastAPI API)
├── /frontend/ (and root /)      <- Static Frontend (HTML, CSS, JS)
├── /data/clean_questions.csv    <- Question Bank (Loaded on demand)
├── /models/                     <- AI Difficulty & Vectorizer Models
└── vercel.json                  <- URL Rewrites & Routing
```

- **Backend API**: Handled serverlessly by `/api/index.py` using FastAPI.
- **Frontend**: Served globally via Vercel Edge Network.
- **Database**: Defaults to `/tmp/exam_system.db` on serverless runs (or point `DATABASE_URL` to PostgreSQL on Neon, Supabase, etc.).

---

## Method 1: Deploy with Git (Recommended)

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Configure Firebase Google login and Vercel deployment"
   git push origin main
   ```

2. **Go to [Vercel](https://vercel.com/) and Sign In**.

3. Click **"Add New..."** &rarr; **"Project"**.

4. Select your GitHub repository (`student-examination-system`).

5. **Configure Project Settings**:
   - **Framework Preset**: Select `Other` (Vercel will automatically detect `vercel.json`).
   - **Root Directory**: Leave as `./` (Root).

6. **Add Environment Variables** (Optional but recommended):
   Click **Environment Variables** and add:
   - `SECRET_KEY`: A random 32+ character string (e.g. `openssl rand -hex 32`)
   - `FIREBASE_API_KEY`: Your Firebase web API Key
   - `FIREBASE_PROJECT_ID`: Your Firebase Project ID
   - `FIREBASE_AUTH_DOMAIN`: `your-project-id.firebaseapp.com`
   - `FIREBASE_APP_ID`: Your Firebase Web App ID

7. Click **"Deploy"**.

8. Once deployed (approx. 1–2 minutes), Vercel provides your live URL:
   `https://your-project-name.vercel.app`

9. **Important: Add Vercel domain to Firebase Authorized Domains**:
   - Go to [Firebase Console](https://console.firebase.google.com/) &rarr; **Authentication** &rarr; **Settings** &rarr; **Authorized domains**.
   - Click **Add domain** and enter `your-project-name.vercel.app`.

---

## Method 2: Deploy with Vercel CLI

If you have Node.js and Vercel CLI installed locally:

1. In PowerShell / Terminal in the project root:
   ```bash
   npx vercel
   ```
2. Log in with your Vercel account when prompted in the browser.
3. Confirm the default project settings:
   - Set up and deploy? **Yes**
   - Which scope? **Select your account**
   - Link to existing project? **No**
   - What's your project's name? **exam-system**
   - In which directory is your code located? **./**
4. For production deployment:
   ```bash
   npx vercel --prod
   ```

---

## Verifying the Deployment

1. **Frontend**: Open `https://your-project-name.vercel.app` &mdash; you should see the Exam System login page.
2. **Backend Health Check**: Open `https://your-project-name.vercel.app/api/index.py` or `/config/frontend` &mdash; should return JSON.
3. **API Docs**: Open `https://your-project-name.vercel.app/docs` &mdash; should open FastAPI Swagger UI.
4. **Google Sign-In**: Click "Sign in with Google" and authenticate.
