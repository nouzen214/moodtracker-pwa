# 📱 Test MoodTracker on Mobile - Quick Guide

## 🚀 Fastest Way: Deploy to GitHub Pages

### Step 1: Create GitHub Repository (2 minutes)

1. Go to: https://github.com/new
2. **Repository name:** `moodtracker-pwa`
3. **Public** (so GitHub Pages works for free)
4. ✅ Check "Add a README file"
5. Click **"Create repository"**

---

### Step 2: Upload Files via GitHub Web Interface (5 minutes)

Since we had issues with `git push` before, let's use the web interface:

1. **Go to your new repo:** `https://github.com/YOUR_USERNAME/moodtracker-pwa`

2. **Click "Add file" → "Upload files"**

3. **Drag and drop ALL files from:**
   ```
   c:\Users\Nouzen\Desktop\poject\web\
   ```
   
   Make sure to upload:
   - `index.html`
   - `signup.html`
   - `dashboard.html`
   - `admin.html`
   - `app.webmanifest`
   - `sw.js`
   - `css/` folder (with `style.css`)
   - `js/` folder (with `api.js`)
   - `assets/` folder (with `logo.png`, `bg.png`)

4. **Scroll down, add commit message:** "Initial commit"

5. **Click "Commit changes"**

---

### Step 3: Enable GitHub Pages (1 minute)

1. In your repo, click **"Settings"** (top right)

2. Scroll down to **"Pages"** (left sidebar)

3. Under **"Source":**
   - Branch: `main`
   - Folder: `/ (root)`

4. Click **"Save"**

5. **Wait 1-2 minutes** for deployment

6. Your app will be live at:
   ```
   https://YOUR_USERNAME.github.io/moodtracker-pwa/
   ```

---

### Step 4: Test on Mobile! 📱

1. **Open your phone's browser** (Chrome on Android, Safari on iOS)

2. **Go to:** `https://YOUR_USERNAME.github.io/moodtracker-pwa/`

3. **Sign up** and test all features!

4. **Install as PWA:**
   - **Android Chrome:** Menu (⋮) → "Add to Home screen"
   - **iOS Safari:** Share button → "Add to Home Screen"

---

## 🔧 Alternative: Local Testing (If You Want to Test Before Deploying)

### Option A: Use Python HTTP Server

1. Open PowerShell in `web/` folder:
   ```powershell
   cd c:\Users\Nouzen\Desktop\poject\web
   python -m http.server 8000
   ```

2. **On your computer:** Open `http://localhost:8000`

3. **On your phone (same WiFi):**
   - Find your computer's IP address:
     ```powershell
     ipconfig
     ```
   - Look for "IPv4 Address" (e.g., `192.168.1.100`)
   - On phone, open: `http://192.168.1.100:8000`

### Option B: Use VS Code Live Server (If you have VS Code)

1. Install "Live Server" extension
2. Right-click `index.html` → "Open with Live Server"
3. Access from phone using your computer's IP

---

## ✅ Recommended: Deploy to GitHub Pages

It's the easiest and you can access it from anywhere!

**Need help with any step?** Let me know!
