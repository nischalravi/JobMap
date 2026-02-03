# IAM & Cybersecurity Jobs Explorer

A static website that aggregates and displays Identity & Access Management (IAM) and Cybersecurity job listings from various sources. Features an interactive world map for geographic job exploration.

🔗 **Live Site**: https://iam-jobs.vercel.app/

## Features

- 🗺️ **Interactive World Map** - Click any country to see available jobs
- 🎨 **Color-Coded Countries** - Visual indication of job availability
- 🔍 **Smart Filtering** - Filter by job type, level, location, clearance
- 🔄 **Auto-Updates** - Jobs refresh automatically every 6 hours
- 📱 **Mobile Responsive** - Works on all devices
- 🚀 **Zero Cost** - Hosted free on Vercel/Netlify

## Quick Start

1. **Deploy to Vercel/Netlify**
2. **Enable GitHub Actions** for automatic job updates
3. **Visit your site** and explore jobs on the interactive map!

See [docs/QUICKSTART.md](docs/QUICKSTART.md) for detailed instructions.

## Project Structure
```
iam-jobs/
├── .github/
│   └── workflows/
│       └── update-jobs.yml    # Auto-update jobs every 6 hours
├── css/
│   └── style.css              # Styling
├── data/
│   └── jobs.json              # Job listings (auto-generated)
├── docs/
│   ├── DEPLOYMENT.md          # Deployment guide
│   └── QUICKSTART.md          # Quick start
├── js/
│   └── world-map.js           # Interactive map logic
├── scripts/
│   └── scrape_jobs.py         # Job aggregation script
├── .gitignore                 # Git ignore rules
├── index.html                 # Main page (world map interface)
├── README.md                  # This file
└── requirements.txt           # Python dependencies
```

## How It Works

1. **Visit Site** → See interactive world map
2. **Hover Countries** → See job count tooltips
3. **Click Country** → View jobs for that country
4. **Click "Apply Now"** → Go to company's job page

## Job Sources

- Indeed API
- LinkedIn Jobs
- Dice Technology Jobs
- CyberSecJobs.com
- ClearedJobs.net (clearance-required positions)
- Direct company career pages

## Development

### Local Testing
```bash
# Start local server
python -m http.server 8000

# Visit http://localhost:8000
```

### Update Jobs Manually
```bash
cd scripts
python scrape_jobs.py
```

## Deployment

Automatically deploys via:
- **Vercel**: Deploys on every push to main
- **GitHub Actions**: Updates jobs every 6 hours

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for details.

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Mapping**: Leaflet.js
- **Backend**: Python 3.8+ (job scraping)
- **Hosting**: Vercel/Netlify
- **CI/CD**: GitHub Actions

## License

MIT License - feel free to use for your own job board!

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## Feedback

Found an issue or have a suggestion? [Open an issue](https://github.com/nischalravi/iam-jobs/issues).

---

**Built for the IAM & Cybersecurity community** 🔐
