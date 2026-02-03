# Deployment Guide: GitHub Pages

This guide will walk you through deploying the IAM & Cybersecurity Jobs Explorer to GitHub Pages.

## Prerequisites

- GitHub account
- Git installed on your computer
- Basic command line knowledge

## Step-by-Step Deployment

### Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com)
2. Click the **+** icon in the top right → **New repository**
3. Fill in the details:
   - **Repository name**: `iam-jobs` (or your preferred name)
   - **Description**: "IAM & Cybersecurity job board"
   - **Public** (required for free GitHub Pages)
   - **Do NOT** initialize with README (we already have one)
4. Click **Create repository**

### Step 2: Push Your Code to GitHub

From your local `iam-jobs` directory:

```bash
# Initialize git repository (if not already done)
cd iam-jobs
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: IAM Jobs Explorer"

# Add your GitHub repository as remote
# Replace 'yourusername' with your actual GitHub username
git remote add origin https://github.com/yourusername/iam-jobs.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** (top navigation)
3. Scroll down to **Pages** (left sidebar under "Code and automation")
4. Under **Source**:
   - Select **Deploy from a branch**
   - Branch: **main**
   - Folder: **/ (root)**
5. Click **Save**

**Your site will be live in 1-2 minutes!**

The URL will be: `https://yourusername.github.io/iam-jobs/`

### Step 4: Enable GitHub Actions

To allow automatic job updates:

1. In your repository, go to **Settings** → **Actions** → **General**
2. Under "Workflow permissions":
   - Select **Read and write permissions**
   - Check **Allow GitHub Actions to create and approve pull requests**
3. Click **Save**

### Step 5: Verify Deployment

1. Visit `https://yourusername.github.io/iam-jobs/`
2. You should see your job board with sample data
3. Test the filters and sorting functionality

### Step 6: Test Automated Updates (Optional)

Trigger the workflow manually:

1. Go to **Actions** tab in your repository
2. Click **Update Job Listings** workflow
3. Click **Run workflow** → **Run workflow**
4. Wait for it to complete
5. Check if `data/jobs.json` was updated

## Customization After Deployment

### Update Repository Name in Files

If you used a different repository name, update these files:

**index.html**: Update the footer link
```html
<a href="https://github.com/yourusername/your-repo-name" target="_blank">GitHub Repository</a>
```

**README.md**: Update all repository references

### Add Custom Domain (Optional)

1. Purchase a domain name
2. In repository **Settings** → **Pages**
3. Enter your custom domain under "Custom domain"
4. Configure DNS records with your domain registrar:
   ```
   Type: CNAME
   Name: www
   Value: yourusername.github.io
   ```

## Troubleshooting

### Site Not Loading

**Problem**: 404 error when visiting your GitHub Pages URL

**Solutions**:
- Wait 2-5 minutes after enabling Pages
- Check that you selected the correct branch (main)
- Verify repository is public
- Check that `index.html` is in the root directory

### GitHub Actions Not Running

**Problem**: Workflow doesn't run automatically

**Solutions**:
- Check **Settings** → **Actions** → ensure Actions are enabled
- Verify workflow permissions are set to "Read and write"
- Check `.github/workflows/update-jobs.yml` syntax

### Jobs Not Updating

**Problem**: Jobs data stays the same

**Solutions**:
- Check Actions logs for errors
- Verify Python script runs locally: `python scripts/scrape_jobs.py`
- Check if API keys are needed and properly set in Secrets

### CORS Errors

**Problem**: Browser console shows CORS errors

**Solutions**:
- Ensure you're loading `jobs.json` from the same domain
- Check that file paths are correct
- Use relative paths, not absolute paths

## Monitoring and Maintenance

### Check Workflow Status

1. Go to **Actions** tab
2. View recent workflow runs
3. Click on any run to see detailed logs

### Update Job Sources

Edit `scripts/scrape_jobs.py` and commit:

```bash
git add scripts/scrape_jobs.py
git commit -m "Update job sources"
git push
```

### Modify Update Frequency

Edit `.github/workflows/update-jobs.yml`:

```yaml
schedule:
  - cron: '0 */12 * * *'  # Every 12 hours instead of 6
```

Commit and push changes.

## Security Best Practices

### Protecting API Keys

**Never commit API keys to your repository!**

Use GitHub Secrets:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add your secrets:
   - Name: `INDEED_API_KEY`
   - Value: `your-api-key-here`

Reference in workflow:
```yaml
env:
  INDEED_API_KEY: ${{ secrets.INDEED_API_KEY }}
```

### Rate Limiting

Implement rate limiting in your scraper:

```python
import time

# Add delay between requests
time.sleep(1)  # 1 second delay
```

## Production Considerations

### Before Going Live

- [ ] Test all filters and sorting
- [ ] Verify mobile responsiveness
- [ ] Check cross-browser compatibility
- [ ] Test with real API keys (in dev environment first)
- [ ] Implement error handling in scraper
- [ ] Add monitoring/alerting
- [ ] Review and respect robots.txt
- [ ] Check API terms of service
- [ ] Implement logging

### Performance Optimization

1. **Minimize JSON size**: Remove unnecessary fields
2. **Enable caching**: Use proper HTTP cache headers
3. **Compress assets**: Use minified CSS/JS (for production)
4. **CDN integration**: Consider using a CDN for faster global access

### Legal Compliance

- Review and comply with job board Terms of Service
- Respect API rate limits
- Follow robots.txt directives
- Include privacy policy if collecting user data
- Add proper attribution for data sources

## Backup Strategy

### Backup Your Repository

```bash
# Clone repository
git clone https://github.com/yourusername/iam-jobs.git

# Or pull latest changes
git pull origin main
```

### Export Job Data

GitHub Actions automatically commits updated data, so your job history is in git history.

View history:
```bash
git log data/jobs.json
```

## Updating the Site

### Quick Updates

For minor changes (text, styling):

```bash
# Make changes
git add .
git commit -m "Description of changes"
git push
```

Site updates automatically within 1-2 minutes.

### Major Updates

1. Create a new branch
2. Make and test changes
3. Create a pull request
4. Merge after review

## Getting Help

- **GitHub Pages docs**: https://docs.github.com/pages
- **GitHub Actions docs**: https://docs.github.com/actions
- **Issues**: Open an issue in your repository
- **Community**: GitHub Discussions

## Next Steps

1. Customize the styling to match your brand
2. Add real API integrations
3. Set up monitoring
4. Consider adding analytics (Google Analytics, Plausible, etc.)
5. Share with the IAM community!

---

**Congratulations! Your IAM & Cybersecurity job board is now live! 🎉**

Visit your site at: `https://yourusername.github.io/iam-jobs/`
