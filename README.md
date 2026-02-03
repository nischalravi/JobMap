# IAM & Cybersecurity Jobs Explorer

A static website that aggregates and displays Identity & Access Management (IAM) and Cybersecurity job listings from various sources. Hosted on GitHub Pages with automated updates.

🔗 **Live Site**: `https://nischalravi.github.io/iam-jobs/`

## Features

- **Automated Job Aggregation**: Scrapes jobs from multiple sources every 6 hours
- **Advanced Filtering**: Search and filter by job type, experience level, location, and clearance requirements
- **Sortable Columns**: Click column headers to sort jobs
- **Clean Interface**: Inspired by REFEDS MET, professional and easy to use
- **Mobile Responsive**: Works on all devices
- **No Backend Required**: Pure static site hosted on GitHub Pages

## Job Sources

- Indeed API
- LinkedIn Jobs
- Dice Technology Jobs
- CyberSecJobs.com
- ClearedJobs.net
- Direct company career pages (Microsoft, Okta, AWS, etc.)

## Quick Start

### 1. Fork or Clone This Repository

```bash
git clone https://github.com/nischalravi/iam-jobs.git
cd iam-jobs
```

### 2. Enable GitHub Pages

1. Go to your repository settings
2. Navigate to **Pages** section
3. Under "Source", select **Deploy from a branch**
4. Select branch: **main** and folder: **/ (root)**
5. Click **Save**

Your site will be available at: `https://nischalravi.github.io/iam-jobs/`

### 3. Configure GitHub Actions (Optional)

To enable automatic job updates:

1. Go to repository **Settings** → **Actions** → **General**
2. Under "Workflow permissions", select **Read and write permissions**
3. Click **Save**

The workflow will now run automatically every 6 hours.

### 4. Add API Keys (Optional)

For production use with real job APIs:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add the following secrets:
   - `INDEED_API_KEY`: Your Indeed Publisher API key
   - `LINKEDIN_ACCESS_TOKEN`: Your LinkedIn OAuth token

## Project Structure

```
iam-jobs/
├── index.html              # Main HTML page
├── css/
│   └── style.css          # Styling
├── js/
│   └── app.js             # Frontend JavaScript
├── data/
│   └── jobs.json          # Job listings (auto-generated)
├── scripts/
│   └── scrape_jobs.py     # Python scraper
├── .github/
│   └── workflows/
│       └── update-jobs.yml # GitHub Actions workflow
└── README.md
```

## Local Development

### Prerequisites

- Python 3.8+
- Modern web browser

### Running Locally

1. Start a local web server:

```bash
# Using Python
python -m http.server 8000

# Or using Node.js
npx serve
```

2. Open your browser to `http://localhost:8000`

### Testing the Scraper

```bash
cd scripts
python scrape_jobs.py
```

This will generate sample data in `data/jobs.json`.

## Customization

### Modify Job Sources

Edit `scripts/scrape_jobs.py` to add or remove job sources:

```python
JOB_SOURCES = {
    'indeed': {
        'base_url': 'https://api.indeed.com/ads/apisearch',
        'keywords': ['IAM engineer', 'identity access management'],
    },
    # Add more sources here
}
```

### Change Update Frequency

Edit `.github/workflows/update-jobs.yml`:

```yaml
on:
  schedule:
    - cron: '0 */6 * * *'  # Change to your preferred schedule
```

Common cron schedules:
- Every 6 hours: `0 */6 * * *`
- Every 12 hours: `0 */12 * * *`
- Daily at midnight: `0 0 * * *`
- Twice daily: `0 0,12 * * *`

### Styling

Modify `css/style.css` to change colors, fonts, or layout.

## API Integration

### Indeed API

1. Sign up for [Indeed Publisher API](https://www.indeed.com/publisher)
2. Get your API key
3. Add to GitHub secrets as `INDEED_API_KEY`
4. Update `scripts/scrape_jobs.py` to use the API

### LinkedIn API

1. Create a LinkedIn Developer App
2. Implement OAuth 2.0 flow
3. Add access token to GitHub secrets
4. Update scraper to use LinkedIn Jobs API

### Other Sources

The scraper can be extended to include:
- Greenhouse API (for specific companies)
- Lever API (for specific companies)
- Custom RSS feeds
- Direct web scraping (use with caution)

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this for your own job board!

## Acknowledgments

- Inspired by [REFEDS MET](https://met.refeds.org/)
- Built for the IAM and Cybersecurity community

## Support

If you find this useful:
- ⭐ Star the repository
- 🐛 Report issues on GitHub
- 💡 Suggest features

## Roadmap

- [ ] Add salary range information
- [ ] Email notifications for new jobs
- [ ] Save favorite jobs (localStorage)
- [ ] Export to CSV
- [ ] RSS feed
- [ ] Job application tracking
- [ ] Company ratings/reviews

---

**Note**: This is a sample project for demonstration. In production:
- Respect robots.txt and API rate limits
- Follow each platform's terms of service
- Implement proper error handling and logging
- Add monitoring and alerting
- Consider using a proper job board API service
