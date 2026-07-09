# 🔐 Google OAuth Setup Guide

This guide walks you through setting up Google OAuth 2.0 authentication for the Exam System.

## Why Google OAuth?

- ✅ Secure, industry-standard authentication
- ✅ No need to manage passwords
- ✅ Users already have Google accounts
- ✅ Automatic user creation on first login
- ✅ Profile picture and name auto-populated

## Step-by-Step Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a Project" dropdown at the top
3. Click "NEW PROJECT"
4. Enter project name: `Exam System`
5. Click "CREATE"
6. Wait for project to be created (1-2 minutes)
7. Once ready, select the project from dropdown

### Step 2: Enable Google+ API

1. In Google Cloud Console, click the menu (☰) on top-left
2. Go to "APIs & Services" → "Library"
3. Search for "Google+ API"
4. Click on "Google+ API"
5. Click "ENABLE" button
6. Wait for it to enable (30 seconds)

### Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "CREATE CREDENTIALS"
3. Select "OAuth client ID"
4. If prompted to create OAuth consent screen, click "CREATE CONSENT SCREEN"

### Step 3a: Configure OAuth Consent Screen

1. Choose "External" for User Type
2. Click "CREATE"
3. Fill in the form:

   **App information:**
   - App name: `Exam System`
   - User support email: `your-email@gmail.com`
   - Developer contact: `your-email@gmail.com`

4. Click "SAVE AND CONTINUE"
5. Skip "Scopes" (click "SAVE AND CONTINUE")
6. Skip "Test users" (click "SAVE AND CONTINUE")
7. Review and click "BACK TO DASHBOARD"

### Step 3b: Create OAuth Credentials

1. Go back to "APIs & Services" → "Credentials"
2. Click "CREATE CREDENTIALS" again
3. Select "OAuth client ID"
4. Choose "Web application"
5. Fill in:

   **Name:** `Exam System Web Client`

   **Authorized JavaScript origins:**
   - `http://localhost:3000`
   - `http://localhost:8000`
   - `http://localhost:8080`
   - `http://127.0.0.1:8000`
   - `http://127.0.0.1:8080`
   - (Add your production domain later)

   **Authorized redirect URIs:**
   - `http://localhost:8000/auth/google/callback`
   - `http://localhost:3000/auth/google/callback`
   - `http://localhost:8080/auth/google/callback`

6. Click "CREATE"
7. Copy the **Client ID** and **Client Secret** displayed

### Step 4: Add to .env File

1. In the project root directory, create a `.env` file (copy from `.env.example`):

   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file and fill in your Google credentials:

   ```
   GOOGLE_CLIENT_ID=<YOUR_CLIENT_ID>.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=<YOUR_CLIENT_SECRET>
   GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback
   
   # Keep other settings as is
   ```

3. Save the file

### Step 5: Start the Application

1. Run the startup script:

   **Windows:**
   ```bash
   start.bat
   ```

   **macOS/Linux:**
   ```bash
   bash start.sh
   ```

   This will:
   - Start the backend server on `http://localhost:8000`
   - Start the frontend on `http://localhost:8080`
   - Load your Google OAuth configuration

### Step 6: Test the Setup

1. Open your browser to `http://localhost:8080`
2. You should see the login page with a "Sign in with Google" button
3. Click the button and sign in with your Google account
4. After successful login, you should be redirected to the dashboard

## ✅ Verification Checklist

- [ ] Google Cloud Project created
- [ ] Google+ API enabled
- [ ] OAuth credentials created (Client ID and Secret)
- [ ] `.env` file created with your credentials
- [ ] `GOOGLE_CLIENT_ID` filled in `.env`
- [ ] `GOOGLE_CLIENT_SECRET` filled in `.env`
- [ ] Backend server running on port 8000
- [ ] Frontend accessible on port 8080
- [ ] Google Sign-in button appears on login page
- [ ] Authorized Origins/URIs configured
- [ ] System started with `start.bat` or `bash start.sh`
- [ ] Sign-in button visible at `http://localhost:8080`
- [ ] Can successfully sign in with Google

## 🐛 Troubleshooting

### "Sign-in with Google" button not showing
- Clear browser cache (Ctrl+Shift+Delete)
- Hard refresh page (Ctrl+Shift+R)
- Check browser console for errors (F12)
- Verify Client ID in `frontend/index.html`

### "Redirect URI mismatch" error
- Make sure redirect URI in Google Console exactly matches
- Check for trailing slashes
- Verify protocol (http vs https)
- Common URIs:
  ```
  http://localhost:8000/auth/google/callback
  http://localhost:8080/auth/google/callback
  ```

### "OAuth client not found" error
- Verify `.env` file has correct Client ID and Secret
- Restart backend server
- Check `.env` file is in correct location (`/backend/.env`)

### Sign-in works but user not created
- Check backend logs for errors
- Verify database is initialized
- Try restarting backend

### Changes not taking effect
- Hard refresh browser (Ctrl+Shift+R)
- Clear browser cache
- Restart backend server
- Check file was saved correctly

## 🔒 Security Reminders

- ✅ Keep Client Secret **private** - never commit to Git
- ✅ Use HTTPS in production
- ✅ Update authorized URIs for your production domain
- ✅ Rotate credentials regularly
- ✅ Use environment variables (.env) for secrets
- ⚠️ Don't put credentials in code or comments

## Production Deployment

When deploying to production:

1. Go to Google Cloud Console
2. Go to "Credentials"
3. Click on your OAuth client
4. Add your production domain to:
   - **Authorized JavaScript origins**
   - **Authorized redirect URIs**

   Example for domain `exam.yourdomain.com`:
   ```
   Origins:
   https://exam.yourdomain.com
   
   Redirect URIs:
   https://exam.yourdomain.com/auth/google/callback
   ```

5. Update `.env` on production server:
   ```
   GOOGLE_REDIRECT_URI=https://exam.yourdomain.com/auth/google/callback
   ```

## Useful Links

- [Google Cloud Console](https://console.cloud.google.com/)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google+ API Documentation](https://developers.google.com/identity)
- [OAuth 2.0 Playground](https://developers.google.com/oauthplayground)

## Support

If you still have issues:
1. Check browser console (F12) for detailed error messages
2. Check backend logs in terminal
3. Review the error message carefully
4. Check Google Cloud Console for recent activity/errors
5. Try in an incognito window (clears cookies)

---

**Once Google OAuth is configured, you're ready to use the full exam system!** 🚀
