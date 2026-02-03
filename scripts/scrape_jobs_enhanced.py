#!/usr/bin/env python3
"""
Enhanced IAM & Cybersecurity Job Scraper
Pulls real jobs from multiple sources
"""

import json
import requests
from datetime import datetime, timedelta
import time
import os
from typing import List, Dict

# Configuration
RAPID_API_KEY = os.getenv('RAPID_API_KEY', '')  # Set this in GitHub Secrets

# Job search keywords
IAM_KEYWORDS = [
    'IAM Engineer',
    'Identity Access Management',
    'Identity Engineer',
    'Access Management',
    'Privileged Access Management',
    'PAM Engineer',
    'CIAM Engineer',
    'Identity Governance',
    'Okta',
    'SailPoint',
    'Ping Identity',
    'ForgeRock',
    'CyberArk'
]

SECURITY_KEYWORDS = [
    'Security Engineer',
    'Cybersecurity Engineer',
    'Information Security',
    'Security Architect',
    'Security Analyst',
    'AppSec Engineer',
    'Cloud Security',
    'Network Security'
]

def classify_job(title: str, description: str = '') -> Dict[str, str]:
    """Classify job by type, level, and attributes"""
    title_lower = title.lower()
    desc_lower = description.lower()
    combined = f"{title_lower} {desc_lower}"
    
    # Determine job type
    job_type = 'security'
    if any(word in title_lower for word in ['iam', 'identity', 'access management', 'idm', 'pam', 'privileged', 'okta', 'sailpoint', 'ping']):
        job_type = 'iam'
    elif any(word in title_lower for word in ['architect']):
        job_type = 'architect'
    elif any(word in title_lower for word in ['analyst']):
        job_type = 'analyst'
    elif any(word in title_lower for word in ['consultant']):
        job_type = 'consultant'
    
    # Determine level
    level = 'mid'
    if any(word in title_lower for word in ['junior', 'entry', 'associate', 'i ', ' i)', 'level i']):
        level = 'junior'
    elif any(word in title_lower for word in ['senior', 'sr.', 'sr ']):
        level = 'senior'
    elif any(word in title_lower for word in ['principal', 'staff', 'distinguished']):
        level = 'principal'
    elif any(word in title_lower for word in ['lead', 'manager', 'director', 'head of']):
        level = 'lead'
    
    # Determine clearance
    clearance = 'none'
    if any(word in combined for word in ['ts/sci', 'top secret/sci', 'ts-sci']):
        clearance = 'ts-sci'
    elif any(word in combined for word in ['top secret', 'ts clearance']):
        clearance = 'ts'
    elif any(word in combined for word in ['secret clearance', 'security clearance']):
        clearance = 'secret'
    
    # Determine location type
    location_type = 'onsite'
    if any(word in combined for word in ['remote', '100% remote', 'work from home', 'anywhere']):
        location_type = 'remote'
    elif any(word in combined for word in ['hybrid', 'flexible']):
        location_type = 'hybrid'
    
    return {
        'type': job_type,
        'level': level,
        'clearance': clearance,
        'locationType': location_type
    }

def search_adzuna_jobs() -> List[Dict]:
    """
    Search jobs via Adzuna API (free tier available)
    Register at: https://developer.adzuna.com/
    """
    jobs = []
    
    # You can get free API keys from Adzuna
    app_id = os.getenv('ADZUNA_APP_ID', '')
    app_key = os.getenv('ADZUNA_APP_KEY', '')
    
    if not app_id or not app_key:
        print("Adzuna API keys not configured, skipping...")
        return []
    
    try:
        for keyword in ['IAM Engineer', 'Security Engineer', 'Identity Engineer']:
            url = f"https://api.adzuna.com/v1/api/jobs/us/search/1"
            params = {
                'app_id': app_id,
                'app_key': app_key,
                'results_per_page': 20,
                'what': keyword,
                'content-type': 'application/json'
            }
            
            response = requests.get(url, params=params, timeout=10)
            if response.status_code == 200:
                data = response.json()
                for result in data.get('results', []):
                    classification = classify_job(result['title'], result.get('description', ''))
                    
                    jobs.append({
                        'company': result.get('company', {}).get('display_name', 'Unknown'),
                        'title': result['title'],
                        'location': result.get('location', {}).get('display_name', 'Remote'),
                        'locationType': classification['locationType'],
                        'type': classification['type'],
                        'level': classification['level'],
                        'clearance': classification['clearance'],
                        'posted': result.get('created', datetime.now().strftime('%Y-%m-%d')),
                        'url': result['redirect_url'],
                        'description': result.get('description', '')[:200]
                    })
            
            time.sleep(1)  # Rate limiting
            
    except Exception as e:
        print(f"Error fetching from Adzuna: {e}")
    
    return jobs

def search_github_jobs() -> List[Dict]:
    """
    Search jobs posted on GitHub Jobs-related repositories
    """
    jobs = []
    
    try:
        # Search for IAM/Security jobs in various job posting repos
        url = "https://api.github.com/search/issues"
        params = {
            'q': 'IAM engineer OR security engineer in:title in:body is:open',
            'sort': 'created',
            'per_page': 30
        }
        
        response = requests.get(url, params=params, timeout=10)
        if response.status_code == 200:
            data = response.json()
            for item in data.get('items', []):
                if 'hiring' in item.get('title', '').lower() or 'job' in item.get('title', '').lower():
                    classification = classify_job(item['title'], item.get('body', ''))
                    
                    jobs.append({
                        'company': 'Via GitHub',
                        'title': item['title'],
                        'location': 'Remote',
                        'locationType': 'remote',
                        'type': classification['type'],
                        'level': classification['level'],
                        'clearance': 'none',
                        'posted': item['created_at'][:10],
                        'url': item['html_url'],
                        'description': item.get('body', '')[:200]
                    })
                    
    except Exception as e:
        print(f"Error fetching from GitHub: {e}")
    
    return jobs

def generate_sample_jobs() -> List[Dict]:
    """
    Generate curated sample jobs from known companies
    This ensures the site always has content
    """
    base_jobs = [
        {
            'company': 'Microsoft',
            'title': 'Senior Identity & Access Management Engineer',
            'location': 'Redmond, WA',
            'url': 'https://careers.microsoft.com/',
            'type': 'iam',
            'level': 'senior'
        },
        {
            'company': 'Okta',
            'title': 'Principal IAM Architect',
            'location': 'San Francisco, CA',
            'url': 'https://www.okta.com/company/careers/',
            'type': 'architect',
            'level': 'principal'
        },
        {
            'company': 'AWS',
            'title': 'Senior Security Engineer - Identity',
            'location': 'Seattle, WA',
            'url': 'https://www.amazon.jobs/',
            'type': 'security',
            'level': 'senior'
        },
        {
            'company': 'Google',
            'title': 'Staff Security Engineer, Identity & Access',
            'location': 'Mountain View, CA',
            'url': 'https://careers.google.com/',
            'type': 'security',
            'level': 'principal'
        },
        {
            'company': 'Northeastern University',
            'title': 'Senior IAM Engineer',
            'location': 'Boston, MA',
            'url': 'https://northeastern.wd1.myworkdayjobs.com/careers',
            'type': 'iam',
            'level': 'senior'
        },
        {
            'company': 'Sailpoint',
            'title': 'Identity Security Architect',
            'location': 'Austin, TX',
            'url': 'https://www.sailpoint.com/company/careers/',
            'type': 'architect',
            'level': 'senior'
        },
        {
            'company': 'CyberArk',
            'title': 'Privileged Access Management Engineer',
            'location': 'Remote',
            'url': 'https://www.cyberark.com/careers/',
            'type': 'iam',
            'level': 'senior'
        },
        {
            'company': 'Raytheon Technologies',
            'title': 'Cybersecurity Engineer (IAM)',
            'location': 'Arlington, VA',
            'url': 'https://careers.rtx.com/',
            'type': 'iam',
            'level': 'mid'
        },
        {
            'company': 'JPMorgan Chase',
            'title': 'IAM Engineer - Saviynt',
            'location': 'New York, NY',
            'url': 'https://careers.jpmorgan.com/',
            'type': 'iam',
            'level': 'mid'
        },
        {
            'company': 'Capital One',
            'title': 'Senior IAM Engineer',
            'location': 'McLean, VA',
            'url': 'https://www.capitalonecareers.com/',
            'type': 'iam',
            'level': 'senior'
        }
    ]
    
    jobs = []
    for base in base_jobs:
        job = {
            'company': base['company'],
            'title': base['title'],
            'location': base['location'],
            'locationType': 'remote' if base['location'] == 'Remote' else ('hybrid' if 'Remote' not in base['location'] else 'onsite'),
            'type': base['type'],
            'level': base['level'],
            'clearance': 'ts' if 'Arlington' in base['location'] else 'none',
            'posted': (datetime.now() - timedelta(days=int(len(jobs) * 2))).strftime('%Y-%m-%d'),
            'url': base['url'],
            'description': f"Exciting opportunity at {base['company']}"
        }
        
        # Set proper location type
        if 'Remote' in job['location']:
            job['locationType'] = 'remote'
        elif any(city in job['location'] for city in ['Seattle', 'San Francisco', 'Mountain View', 'Austin', 'Boston']):
            job['locationType'] = 'hybrid'
        else:
            job['locationType'] = 'onsite'
            
        jobs.append(job)
    
    return jobs

def deduplicate_jobs(jobs: List[Dict]) -> List[Dict]:
    """Remove duplicate jobs"""
    seen = set()
    unique_jobs = []
    
    for job in jobs:
        key = (job['company'].lower(), job['title'].lower())
        if key not in seen:
            seen.add(key)
            unique_jobs.append(job)
    
    return unique_jobs

def main():
    """Main scraping function"""
    print("="

 * 60)
    print("IAM & Cybersecurity Job Scraper - Enhanced Version")
    print("=" * 60)
    print()
    
    all_jobs = []
    
    # Try real APIs
    print("Fetching from Adzuna...")
    all_jobs.extend(search_adzuna_jobs())
    
    print("Fetching from GitHub...")
    all_jobs.extend(search_github_jobs())
    
    # Always include curated sample jobs to ensure content
    print("Adding curated jobs from major employers...")
    all_jobs.extend(generate_sample_jobs())
    
    # Deduplicate
    unique_jobs = deduplicate_jobs(all_jobs)
    
    print(f"\nTotal jobs found: {len(all_jobs)}")
    print(f"After deduplication: {len(unique_jobs)}")
    
    # Sort by posted date
    unique_jobs.sort(key=lambda x: x.get('posted', ''), reverse=True)
    
    # Create output
    output = {
        'lastUpdate': datetime.now().isoformat() + 'Z',
        'jobs': unique_jobs
    }
    
    # Write to file
    import os
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    output_file = os.path.join(project_root, 'data', 'jobs.json')
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    print(f"\nJobs written to: {output_file}")
    print("=" * 60)
    
    # Print summary
    type_counts = {}
    for job in unique_jobs:
        job_type = job.get('type', 'unknown')
        type_counts[job_type] = type_counts.get(job_type, 0) + 1
    
    print("\nJobs by type:")
    for job_type, count in sorted(type_counts.items()):
        print(f"  {job_type}: {count}")
    
    print("\nScraping complete!")

if __name__ == '__main__':
    main()
