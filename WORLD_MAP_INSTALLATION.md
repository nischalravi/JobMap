# World Map Homepage - Installation Guide

## 🌍 Overview

This replaces your current homepage with an interactive world map where users can:

1. **See the world map immediately** when they visit your site
2. **Click any country** to see jobs available in that country
3. **View color-coded countries** (green = many jobs, blue = few jobs, gray = no jobs)
4. **Browse job cards** for the selected country
5. **Clear selection** to return to global view

## 🎯 What Changes

### Before (Current):
- Homepage shows table of jobs
- Separate map page at `/map.html`

### After (New):
- Homepage shows interactive world map
- Click country → See jobs for that country
- Map-first experience like REFEDS MET

## 📦 Files to Replace

You need to replace **2 files** in your GitHub repository:

### 1. `index.html` (Replace)
- New version with world map as hero element
- Click-to-filter country interface
- Job cards appear below map

### 2. `js/world-map.js` (New file)
- Creates the js folder if it doesn't exist
- Name it: `js/world-map.js`
- Handles country selection and job filtering

## 🚀 Installation Steps

### Step 1: Backup Current Files (Optional)

Before making changes, you can:
1. Download current `index.html` as backup
2. OR create a branch: `git checkout -b backup-old-design`

### Step 2: Replace index.html

**Via GitHub Web Interface:**

1. Go to your repository: https://github.com/nischalravi/iam-jobs
2. Click on `index.html`
3. Click the pencil icon (Edit)
4. Select all (Ctrl+A / Cmd+A)
5. Delete everything
6. Paste the NEW `index.html` content (from the file I provided)
7. Scroll down, commit message: "Replace with world map homepage"
8. Click "Commit changes"

**Via Git Command Line:**

```bash
cd iam-jobs
# Replace index.html with new version
cp /path/to/new/index.html ./
git add index.html
git commit -m "Replace with world map homepage"
git push
```

### Step 3: Add world-map.js

**Via GitHub Web Interface:**

1. In your repository, click "Add file" → "Create new file"
2. Name it: `js/world-map.js`
3. Paste the content from `js/world-map.js` (from the file I provided)
4. Commit message: "Add world map functionality"
5. Click "Commit changes"

**Via Git Command Line:**

```bash
cd iam-jobs
# Copy the new JavaScript file
cp /path/to/new/world-map.js ./js/
git add js/world-map.js
git commit -m "Add world map functionality"
git push
```

### Step 4: Verify Deployment

- **Vercel**: Auto-deploys in 30-60 seconds
- **Netlify**: Auto-deploys in 30-60 seconds
- **GitHub Pages**: Deploys in 1-2 minutes

## ✅ Testing Your New Homepage

### Visit Your Site

Go to: **https://iam-jobs.vercel.app/**

You should see:

1. **Global Statistics** at top:
   - Total Jobs Worldwide
   - Countries
   - Remote Positions
   - Companies Hiring

2. **Interactive World Map**:
   - Countries colored by job availability
   - Green = 10+ jobs
   - Orange = 5-9 jobs
   - Blue = 1-4 jobs
   - Gray = No jobs

3. **Instructions**: "Click on any country to see job opportunities"

### Test Country Selection

1. **Click United States** (should have most jobs)
2. You should see:
   - Purple banner: "United States - X job opportunities available"
   - Grid of job cards below
   - Each card shows company, title, location, badges

3. **Click "View All Countries"** button
   - Returns to global map view
   - Job cards disappear
   - Map resets

## 🎨 Features Explained

### Color-Coded Countries

The map automatically colors countries based on available jobs:
- **🟢 Green** (10+ jobs): Major markets like US, UK
- **🟠 Orange** (5-9 jobs): Growing markets
- **🔵 Blue** (1-4 jobs): Emerging markets
- **⚪ Gray** (0 jobs): No current openings

### Hover Effects

- **Hover over country**: Shows tooltip with job count
- **Click country**: Zooms to country and shows jobs
- **Border highlights**: Selected country has red border

### Job Cards

Each job card displays:
- Company name (uppercase, gray)
- Job title (large, bold)
- Location with pin icon
- Remote/Hybrid/Onsite badge
- Job type badge (IAM, Security, etc.)
- Clearance badge (if required)
- Posted date
- "Apply Now" button

### Statistics Dashboard

Real-time stats show:
- **Total Jobs**: All listings globally
- **Countries**: Number of countries with jobs
- **Remote Jobs**: Work-from-anywhere positions
- **Companies**: Unique hiring organizations

## 🔧 Customization Options

### Change Default Map View

Edit `js/world-map.js`, line ~50:

```javascript
// Default: Global view
center: [30, 0],
zoom: 2,

// For US-focused:
center: [39.8283, -98.5795],
zoom: 4,

// For Europe-focused:
center: [50, 10],
zoom: 3,
```

### Adjust Color Thresholds

Edit `js/world-map.js`, lines ~156-161:

```javascript
function getCountryColor(jobCount) {
    if (jobCount === 0) return '#ecf0f1';      // No jobs
    if (jobCount <= 4) return '#3498db';       // Change threshold here
    if (jobCount <= 9) return '#f39c12';       // Change threshold here
    return '#27ae60';                           // High activity
}
```

### Change Color Scheme

Edit the same function with your preferred colors:

```javascript
if (jobCount === 0) return '#yourcolor';
if (jobCount <= 4) return '#yourcolor';
if (jobCount <= 9) return '#yourcolor';
return '#yourcolor';
```

### Add More Countries to Mapping

If jobs use different country names, edit `js/world-map.js`, lines ~8-32:

```javascript
const countryMapping = {
    'United States': 'USA',
    'Your Country Name': 'ISO_CODE',
    // Add more as needed
};
```

## 🗺️ How It Works

### Data Flow

1. **Page loads** → Fetches `data/jobs.json`
2. **Groups jobs** by country
3. **Loads world GeoJSON** from GitHub
4. **Colors countries** based on job counts
5. **User clicks country** → Filters jobs
6. **Displays job cards** in grid layout

### Country Detection

The system extracts countries from job locations:
- **"San Francisco, CA"** → United States
- **"London"** → United Kingdom
- **"Remote"** → Excluded from map (shown in stats)

### GeoJSON Source

Uses simplified world countries from:
```
https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json
```

This is a free, open-source dataset with country boundaries.

## 📱 Mobile Responsive

The new homepage is fully mobile-optimized:
- Map height adjusts for screens
- Job cards stack vertically on mobile
- Statistics cards reflow
- Touch gestures work for map interaction

## 🔍 Troubleshooting

### Map doesn't load

**Check:**
1. Browser console for errors (F12)
2. Internet connection (loads external GeoJSON)
3. `js/world-map.js` file uploaded correctly
4. Clear browser cache

### Countries not clickable

**Check:**
1. GeoJSON loaded successfully
2. Browser console for JavaScript errors
3. Try different browser

### Jobs don't appear after clicking country

**Check:**
1. `data/jobs.json` exists and is valid JSON
2. Jobs have valid location fields
3. Browser console for errors
4. Verify country name matches data

### Wrong country colors

**Check:**
1. Job data loaded correctly
2. Country extraction logic working
3. Console log jobsByCountry to debug

## 🎯 Comparison: Old vs New

| Feature | Old Design | New Design |
|---------|-----------|------------|
| Landing Page | Job table | World map |
| Country Selection | Manual filter | Click map |
| Visual Appeal | Text-heavy | Map-first |
| User Flow | Search → Filter | Explore → Click |
| Like REFEDS MET | ❌ | ✅ |

## 📊 User Experience

### Typical User Journey

1. **Arrives at site** → Sees world map immediately
2. **Explores colors** → Identifies countries with jobs
3. **Clicks country** → Sees available positions
4. **Reviews job cards** → Finds interesting role
5. **Clicks "Apply Now"** → Goes to company site

### Benefits

- **Visual discovery**: Users see geographic distribution instantly
- **Intuitive interaction**: Click what you want to explore
- **Focused results**: Only shows jobs for selected country
- **Easy reset**: One button returns to global view

## 🎉 You're Ready!

After replacing these 2 files, your site will have:

✅ Interactive world map on homepage
✅ Click countries to filter jobs
✅ Color-coded job availability
✅ Clean job card layout
✅ Mobile responsive design
✅ Smooth animations and transitions
✅ Professional, modern interface
✅ Like REFEDS MET! 🗺️

## 🆘 Need Help?

If you encounter issues:
1. Check deployment logs in Vercel
2. View browser console (F12)
3. Verify both files uploaded correctly
4. Test in incognito mode (clear cache)

---

**Next Steps:**
1. Replace `index.html`
2. Add `js/world-map.js`
3. Commit and push
4. Wait 1-2 minutes
5. Visit your site!

Your IAM job board will now have a world-class, map-first interface! 🌍
