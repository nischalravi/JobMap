# Interactive World Map Feature - Installation Guide

## 🗺️ Overview

This adds an interactive world map to your IAM Jobs site, similar to REFEDS MET, showing job locations globally with:

- **Interactive markers** showing job clusters by location
- **Color-coded by job type** (IAM, Security, Architect, etc.)
- **Click markers** to see job details
- **Statistics dashboard** showing total jobs, locations, remote jobs
- **Legend** explaining marker colors
- **Smooth navigation** between list and map views

## 📦 What's Included

### New Files to Add:

1. **map.html** - Interactive map page
2. **js/map.js** - Map functionality and marker logic
3. **Updated index.html** - Added navigation tabs

## 🚀 Installation Steps

### Step 1: Add New Files to Your Repository

**Option A: Via GitHub Web Interface**

1. Go to your repository: https://github.com/nischalravi/iam-jobs

2. **Add map.html:**
   - Click "Add file" → "Create new file"
   - Name: `map.html`
   - Copy content from the `map.html` file provided
   - Commit changes

3. **Add map.js:**
   - Click "Add file" → "Create new file"  
   - Name: `js/map.js`
   - Copy content from the `js/map.js` file provided
   - Commit changes

4. **Update index.html:**
   - Click on existing `index.html`
   - Click edit (pencil icon)
   - Replace with updated version that includes navigation tabs
   - Commit changes

**Option B: Via Git Command Line**

```bash
# Navigate to your local repository
cd iam-jobs

# Add the new files (copy them to appropriate locations first)
git add map.html
git add js/map.js
git add index.html  # updated version

# Commit
git commit -m "Add interactive world map feature"

# Push to GitHub
git push
```

### Step 2: Verify Deployment

- **GitHub Pages**: Will auto-deploy in 1-2 minutes
- **Vercel**: Auto-deploys immediately on push
- **Netlify**: Auto-deploys immediately on push

### Step 3: Test the Map

1. Visit your site
2. Click the "🗺️ Interactive Map" tab
3. You should see:
   - World map centered on US
   - Markers showing job locations
   - Statistics at the top
   - Click markers to see job details

## 🎨 Features Explained

### Interactive Markers

- **Size**: Number inside shows jobs at that location
- **Color**: Indicates job type
  - 🔵 Blue = IAM Engineer
  - 🔴 Red = Security Engineer  
  - 🟣 Purple = Security Architect
  - 🟠 Orange = Security Analyst
  - 🟢 Teal = Consultant

### Marker Clustering

- Multiple jobs at nearby locations cluster together
- Click cluster to zoom in and see individual markers
- Prevents map overcrowding

### Statistics Dashboard

Shows at top of map page:
- Total jobs
- Number of unique locations
- Remote jobs count
- Number of companies hiring

### Popup Details

Click any marker to see:
- Location name
- Number of jobs available
- List of first 3 jobs with:
  - Company name
  - Job title
  - Remote/Hybrid/Onsite badge
  - Job type badge
- Link to view all jobs for that location

## 🔧 Customization Options

### Change Map Center/Zoom

Edit `js/map.js`, line ~61:

```javascript
// Default: Centered on US
map = L.map('map').setView([39.8283, -98.5795], 4);

// For Europe:
map = L.map('map').setView([50.8503, 4.3517], 4);

// For global view:
map = L.map('map').setView([20, 0], 2);
```

### Change Map Style

Edit `js/map.js`, line ~64-68:

```javascript
// Current: OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {

// Alternative styles:

// Dark mode:
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {

// Light/minimal:
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
```

### Change Marker Colors

Edit `js/map.js`, lines ~40-46:

```javascript
const jobTypeColors = {
    'iam': '#3498db',        // Change to your preferred colors
    'security': '#e74c3c',
    'architect': '#9b59b6',
    'analyst': '#f39c12',
    'consultant': '#1abc9c'
};
```

### Add More Cities

Edit `js/map.js`, lines ~8-36, add more city coordinates:

```javascript
const cityCoordinates = {
    'Your City, State': [latitude, longitude],
    // Add as many as needed
};
```

## 📍 How Location Mapping Works

The map uses a built-in database of city coordinates. When a job has a location:

1. Looks up coordinates in database
2. If found, creates marker
3. If not found, tries partial match
4. Remote jobs are excluded from map (shown in stats only)

**To add new cities:**
- Find coordinates on Google Maps (right-click → "What's here?")
- Add to `cityCoordinates` object in `map.js`

## 🌐 External Dependencies

The map uses these CDN libraries (no installation needed):

- **Leaflet.js** - Open-source mapping library
- **Leaflet.markercluster** - Marker clustering plugin

These load automatically from CDNs when users visit the page.

## 🎯 Navigation Flow

Users can switch between views:
- **📋 Job Listings** - Original table view with filters
- **🗺️ Interactive Map** - Geographic visualization

Both views use the same `data/jobs.json` file, so they're always in sync.

## 🔍 Troubleshooting

### Map doesn't show

**Check:**
1. `map.html` is in repository root
2. `js/map.js` is in the js folder
3. Browser console for errors (F12)
4. Internet connection (needs CDN access)

### Markers missing

**Check:**
1. Jobs have valid locations in `data/jobs.json`
2. Locations match entries in `cityCoordinates` object
3. Remote jobs won't show (by design)

### Map looks wrong

**Check:**
1. Proper HTML structure in `map.html`
2. CSS from `css/style.css` is loading
3. Clear browser cache
4. Check browser console for errors

## 📊 Performance

The map is optimized for:
- Up to 1,000 markers smoothly
- Clustering reduces load
- Lightweight library (Leaflet)
- Fast CDN delivery

## 🎨 Mobile Responsive

The map automatically adjusts for:
- ✅ Desktop computers
- ✅ Tablets  
- ✅ Mobile phones

Touch gestures work for:
- Pan (drag)
- Zoom (pinch)
- Marker clicks

## 📈 Future Enhancements

Possible additions:
- Heat map overlay
- Filter jobs directly on map
- Draw custom search areas
- Salary ranges by location
- Company density visualization

## ✅ Verification Checklist

After installation:

- [ ] Map page loads at `/map.html`
- [ ] Navigation tabs work (switch between list/map)
- [ ] Markers appear on map
- [ ] Statistics show correct numbers
- [ ] Clicking markers shows popups
- [ ] "View All Jobs" links work
- [ ] Legend displays correctly
- [ ] Mobile view works
- [ ] Both Vercel/Netlify deployments updated

## 🆘 Need Help?

If you encounter issues:
1. Check browser console (F12) for errors
2. Verify all files are in correct locations
3. Clear browser cache
4. Check that jobs.json is valid JSON
5. Test in different browser

## 🎉 You're Done!

Your IAM Jobs site now has an interactive world map like REFEDS MET!

Visit: `https://your-site-url/map.html`

Users can now visualize job opportunities geographically and explore different regions interactively.
