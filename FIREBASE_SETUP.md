# 🔥 Firebase Google Authentication Setup Guide

This guide shows you how to connect Google Sign-In via Firebase Authentication to the Exam System.

---

## 1. Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **"Add project"** (or select an existing Google Cloud / Firebase project).
3. Name your project (e.g. `exam-system`).
4. (Optional) Disable or enable Google Analytics, then click **"Create project"**.
5. Wait for the project to finish creating and click **"Continue"**.

---

## 2. Enable Google Sign-In Provider

1. In the Firebase Console left sidebar, go to **Build** &rarr; **Authentication**.
2. Click **"Get started"** if this is your first time.
3. In the **Sign-in method** tab, click **Google**.
4. Toggle **Enable**.
5. Select your **Project support email** from the dropdown.
6. Click **Save**.

---

## 3. Register a Web App & Get Firebase Credentials

1. In the Firebase Console, click the **Settings gear icon (⚙️)** next to "Project Overview" &rarr; **Project settings**.
2. Scroll down to the **"Your apps"** section and click the **Web icon (`</>`)**.
3. Register your app:
   - App nickname: `Exam System Web`
   - Leave "Firebase Hosting" unchecked (or checked if you ever want to host on Firebase as well).
   - Click **Register app**.
4. You will see a `firebaseConfig` snippet like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD-EXAMPLE_KEY_HERE",
  authDomain: "exam-system-12345.firebaseapp.com",
  projectId: "exam-system-12345",
  storageBucket: "exam-system-12345.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

---

## 4. Add Authorized Domains in Firebase

For Google Sign-In to work in browser popups, your website domains must be added to Firebase's authorized domains:

1. In Firebase Console, go to **Authentication** &rarr; **Settings** &rarr; **Authorized domains**.
2. `localhost` is authorized by default.
3. When you deploy to Vercel, click **"Add domain"** and add:
   - `your-project-name.vercel.app` (your actual Vercel domain)

---

## 5. Applying the Credentials to the Exam System

You have **3 convenient ways** to apply your Firebase credentials:

### Option A: Directly inside the Web UI (Easiest)
1. Open the Exam System in your browser (`http://localhost:8080` or on your Vercel URL).
2. On the Sign-In modal, click **"⚙️ Firebase Config"**.
3. Paste your `API Key`, `Auth Domain`, `Project ID`, and `App ID`.
4. Click **Save Credentials**.
5. Click **"Sign in with Google"** &mdash; Google popup will open and authenticate!

### Option B: In `frontend/js/firebase-config.js`
Open `frontend/js/firebase-config.js` and replace the placeholder in `DEFAULT_FIREBASE_CONFIG`:

```javascript
const DEFAULT_FIREBASE_CONFIG = {
    apiKey: "YOUR_ACTUAL_API_KEY",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id"
};
```

### Option C: In `.env` or Vercel Environment Variables
Set these variables in your `.env` (for local backend) or in **Vercel Project Settings &rarr; Environment Variables**:

```env
FIREBASE_API_KEY=AIzaSyD...
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
FIREBASE_MESSAGING_SENDER_ID=1234567890
FIREBASE_APP_ID=1:1234567890:web:...
```

---

## 6. Testing

- Click **"Sign in with Google"** &rarr; your Google account selector opens &rarr; logs into the Exam System dashboard!
- If you ever need to test without real credentials, click **"Test with Mock"** on the Sign-In screen.
