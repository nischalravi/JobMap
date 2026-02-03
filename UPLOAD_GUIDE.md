# Upload Guide for GitHub

## 📦 Files Ready to Upload

All files are customized with your username: **nischalravi**

## 🚀 Method 1: Upload via GitHub Web Interface (Easiest)

### Step 1: Prepare Your Repository

1. Go to: https://github.com/nischalravi/iam-jobs
2. Delete the existing files (or start fresh)

### Step 2: Upload All Files

**Important:** GitHub web interface requires uploading folders separately!

#### Upload Root Files First:
1. Click **Add file** → **Upload files**
2. Drag these files from the `iam-jobs-complete` folder:
   - `index.html`
   - `README.md`
   - `DEPLOYMENT.md`
   - `QUICKSTART.md`
   - `requirements.txt`
   - `.gitignore`
3. Scroll down, commit message: "Add root files"
4. Click **Commit changes**

#### Upload CSS Folder:
1. Click **Add file** → **Create new file**
2. In the name field, type: `css/style.css`
3. Copy-paste content from `css/style.css`
4. Commit message: "Add CSS styling"
5. Click **Commit changes**

#### Upload JS Folder:
1. Click **Add file** → **Create new file**
2. Type: `js/app.js`
3. Copy-paste content from `js/app.js`
4. Commit and save

#### Upload Data Folder:
1. Click **Add file** → **Create new file**
2. Type: `data/jobs.json`
3. Copy-paste content from `data/jobs.json`
4. Commit and save

#### Upload Scripts Folder:
1. Click **Add file** → **Create new file**
2. Type: `scripts/scrape_jobs.py`
3. Copy-paste content from `scripts/scrape_jobs.py`
4. Commit and save

#### Upload GitHub Actions:
1. Click **Add file** → **Create new file**
2. Type: `.github/workflows/update-jobs.yml`
3. Copy-paste content from `.github/workflows/update-jobs.yml`
4. Commit and save

---

## 🚀 Method 2: Upload via Git Command Line (Recommended)

### Step 1: Clear Existing Repository (if needed)

```bash
# Clone your repository
git clone https://github.com/nischalravi/iam-jobs.git
cd iam-jobs

# Remove all existing files (except .git)
rm -rf * .github .gitignore

# Commit the deletion
git add -A
git commit -m "Clear repository for fresh upload"
git push
```

### Step 2: Copy New Files

```bash
# Copy all files from iam-jobs-complete to your repository
# (Replace /path/to/iam-jobs-complete with actual path)
cp -r /path/to/iam-jobs-complete/* .
cp -r /path/to/iam-jobs-complete/.github .
cp /path/to/iam-jobs-complete/.gitignore .

# Add all files
git add .

# Commit
git commit -m "Complete IAM Jobs Explorer setup"

# Push
git push
```

---

## 🚀 Method 3: Fresh Start (Clean Repository)

### Step 1: Delete and Recreate Repository

1. Go to: https://github.com/nischalravi/iam-jobs/settings
2. Scroll to bottom → **Delete this repository**
3. Create new repository: https://github.com/new
   - Name: `iam-jobs`
   - Public
   - **Don't** initialize with any files

### Step 2: Upload via Git

```bash
# Navigate to iam-jobs-complete folder
cd /path/to/iam-jobs-complete

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: IAM Jobs Explorer"

# Add remote
git remote add origin https://github.com/nischalravi/iam-jobs.git

# Push
git branch -M main
git push -u origin main
```

---

## ✅ After Upload: Enable Features

### 1. Enable GitHub Pages

1. Go to: https://github.com/nischalravi/iam-jobs/settings/pages
2. Source: **Deploy from a branch**
3. Branch: **main**
4. Folder: **/ (root)**
5. Click **Save**

**Your site**: https://nischalravi.github.io/iam-jobs/

### 2. Enable GitHub Actions

1. Go to: https://github.com/nischalravi/iam-jobs/settings/actions
2. Under "Workflow permissions":
   - Select **Read and write permissions**
   - Check **Allow GitHub Actions to create and approve pull requests**
3. Click **Save**

### 3. Test Auto-Update

1. Go to: https://github.com/nischalravi/iam-jobs/actions
2. Click **Update Job Listings**
3. Click **Run workflow** → **Run workflow**
4. Wait for completion
5. Check that `data/jobs.json` was updated

---

## 📋 File Checklist

Verify these files exist in your repository:

```
iam-jobs/
├── .github/
│   └── workflows/
│       └── update-jobs.yml      ✓ Auto-update configuration
├── css/
│   └── style.css                ✓ Styling
├── js/
│   └── app.js                   ✓ Frontend logic
├── data/
│   └── jobs.json                ✓ Job listings
├── scripts/
│   └── scrape_jobs.py          ✓ Job scraper
├── .gitignore                   ✓ Git ignore rules
├── DEPLOYMENT.md                ✓ Deployment guide
├── index.html                   ✓ Main page
├── QUICKSTART.md                ✓ Quick start guide
├── README.md                    ✓ Documentation
└── requirements.txt             ✓ Python dependencies
```

---

## 🆘 Troubleshooting

### Site shows 404
- Wait 2-5 minutes after enabling Pages
- Verify `index.html` is in root directory
- Check repository is **Public**

### Missing styles or JavaScript
- Verify `css/style.css` uploaded correctly
- Verify `js/app.js` uploaded correctly
- Check browser console (F12) for errors

### Jobs not displaying
- Verify `data/jobs.json` uploaded correctly
- Check file paths are correct
- Open browser console for errors

### Actions not working
- Verify `.github/workflows/update-jobs.yml` exists
- Check Actions are enabled in settings
- Verify workflow permissions set correctly

---

## 🎉 Success!

Once uploaded, your site will be live at:
**https://nischalravi.github.io/iam-jobs/**

All files are pre-configured with your username!
