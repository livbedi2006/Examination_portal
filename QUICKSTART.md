# QUICK START GUIDE

## 🚀 Get Running in 5 Minutes

### Prerequisites Checklist
- ✅ Python 3.8+ installed
- ✅ Modern web browser
- ✅ Webcam (for proctoring)
- ✅ Google account (for OAuth)

### Step 1: Configure Google OAuth (2 minutes)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable Google+ API
4. Go to Credentials → Create OAuth 2.0 credentials → Web Application
5. Add Authorized Redirect URIs:
   ```
   http://localhost:8000/auth/google/callback
   http://localhost:3000
   http://localhost:8080
   ```
6. Copy Client ID and Secret

### Step 2: Configure Environment (1 minute)

```bash
cd "student examination system"
cp .env.example .env
```

Edit `.env`:
```
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
SECRET_KEY=change-this-to-random-string
```

### Step 3: Start Everything (1 minute)

**Windows:**
```bash
start.bat
```

**macOS/Linux:**
```bash
bash start.sh
```

### Step 4: Access the System (1 minute)

Open browser and go to:
```
Frontend: http://localhost:8080
Backend:  http://localhost:8000
API Docs: http://localhost:8000/docs
```

## ✅ Verify It's Working

1. **Frontend loads** → You see exam system homepage
2. **Google button visible** → Auth is ready
3. **API docs accessible** → Backend is running
4. **Sign in successful** → Full system works

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| Port 8000 in use | `lsof -i :8000` then kill, or use different port |
| Google auth fails | Check Client ID in .env, verify redirect URLs |
| Python not found | Install Python 3.8+ and add to PATH |
| Camera permission denied | Check browser settings, try incognito mode |

## 📚 Next Steps

1. **Review Backend**: `backend/README.md`
2. **Review Frontend**: `frontend/README.md`
3. **Try the exam**: Create account → Select subject → Take test
4. **Check proctoring**: Look for camera monitor during exam
5. **View results**: See score and performance metrics

## 🔧 Customization

### Add Job Role
Edit `backend/app/routes/subjects.py`:
```python
JOB_SUBJECTS_MAP = {
    "Your Role": [
        SubjectOption(
            subject_id="your_id",
            name="Your Subject",
            ...
        )
    ]
}
```

### Change Colors
Edit `frontend/css/styles.css`:
```css
:root {
    --primary: #3b82f6;  /* Change this to your color */
    --success: #10b981;
    ...
}
```

### Adjust Proctoring
Edit `Proctoring/config.json`:
- Camera resolution
- Detection thresholds
- Prohibited objects
- Audio sensitivity

## 📊 Test Data

System comes with:
- Sample questions in `data/clean_questions.csv`
- Pre-trained models in `models/`
- Proctoring config in `Proctoring/config.json`

## 🔒 Security Reminders

- ⚠️ Change `SECRET_KEY` in `.env` for production
- ⚠️ Use HTTPS in production
- ⚠️ Set strong database password
- ⚠️ Never commit .env to Git
- ⚠️ Use PostgreSQL for production (not SQLite)

## 📞 Help

1. Check browser console for errors (F12)
2. Check terminal for backend logs
3. Review README.md files for detailed docs
4. Check API documentation at `/docs`

---

**You're ready! Start with `start.bat` or `bash start.sh`** 🎓
