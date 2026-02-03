#!/usr/bin/env python3
"""
IAM & Cybersecurity Job Scraper
Aggregates job listings from various sources and outputs to jobs.json
"""

import json
import requests
from datetime import datetime, timedelta
import time
import random
from typing import List, Dict

# Job boards and search parameters
JOB_SOURCES = {
    'indeed': {
        'base_url': 'https://api.indeed.com/ads/apisearch',
        'keywords': ['IAM engineer', 'identity access management', 'cybersecurity', 'security engineer'],
    },
    'linkedin': {
        'base_url': 'https://api.linkedin.com/v2/jobs',
        'keywords': ['IAM', 'identity management', 'access management', 'cybersecurity'],
    },
    'dice': {
        'base_url': 'https://www.dice.com/jobs',
        'keywords': ['IAM', 'CIAM', 'PAM', 'identity governance'],
    }
}

# Sample companies that frequently hire for IAM/Security roles
COMPANIES = [
    'Microsoft', 'Okta', 'Ping Identity', 'SailPoint', 'CyberArk', 'ForgeRock',
    'AWS', 'Google', 'Cisco', 'IBM', 'Oracle', 'Auth0',
    'Deloitte', 'Accenture', 'Booz Allen', 'KPMG', 'PwC',
    'Raytheon', 'Lockheed Martin', 'Northrop Grumman', 'Boeing',
    'JPMorgan Chase', 'Bank of America', 'Wells Fargo', 'Capital One',
    'Northeastern University', 'MIT', 'Stanford', 'Harvard'
]

def classify_job(title: str, description: str = '') -> Dict[str, str]:
    """
    Classify job by type, level, and other attributes based on title and description
    """
    title_lower = title.lower()
    desc_lower = description.lower()
    combined = f"{title_lower} {desc_lower}"
    
    # Determine job type
    job_type = 'security'  # default
    if any(word in title_lower for word in ['iam', 'identity', 'access management', 'idm', 'pam', 'privileged']):
        job_type = 'iam'
    elif any(word in title_lower for word in ['architect']):
        job_type = 'architect'
    elif any(word in title_lower for word in ['analyst']):
        job_type = 'analyst'
    elif any(word in title_lower for word in ['consultant']):
        job_type = 'consultant'
    
    # Determine experience level
    level = 'mid'  # default
    if any(word in title_lower for word in ['junior', 'entry', 'associate', 'i ', ' i)']):
        level = 'junior'
    elif any(word in title_lower for word in ['senior', 'sr.', 'sr ']):
        level = 'senior'
    elif any(word in title_lower for word in ['principal', 'staff', 'distinguished']):
        level = 'principal'
    elif any(word in title_lower for word in ['lead', 'manager', 'director']):
        level = 'lead'
    
    # Determine clearance requirement
    clearance = 'none'
    if any(word in combined for word in ['ts/sci', 'top secret/sci', 'ts-sci']):
        clearance = 'ts-sci'
    elif any(word in combined for word in ['top secret', 'ts clearance']):
        clearance = 'ts'
    elif any(word in combined for word in ['secret clearance', 'security clearance']):
        clearance = 'secret'
    
    # Determine location type
    location_type = 'onsite'  # default
    if any(word in combined for word in ['remote', '100% remote', 'work from home']):
        location_type = 'remote'
    elif any(word in combined for word in ['hybrid', 'flexible']):
        location_type = 'hybrid'
    
    return {
        'type': job_type,
        'level': level,
        'clearance': clearance,
        'locationType': location_type
    }

def scrape_indeed_api(api_key: str = None) -> List[Dict]:
    """
    Scrape jobs from Indeed API (requires API key)
    For demonstration, this returns sample data
    """
    # In production, you would use:
    # response = requests.get(url, params=params, headers=headers)
    
    print("Fetching jobs from Indeed...")
    return []

def scrape_linkedin_api(access_token: str = None) -> List[Dict]:
    """
    Scrape jobs from LinkedIn API (requires OAuth)
    For demonstration, this returns sample data
    """
    print("Fetching jobs from LinkedIn...")
    return []

def scrape_dice() -> List[Dict]:
    """
    Scrape jobs from Dice (web scraping)
    For demonstration, this returns sample data
    """
    print("Fetching jobs from Dice...")
    return []

def scrape_company_careers(companies: List[str]) -> List[Dict]:
    """
    Scrape from company career pages
    For demonstration, this returns sample data
    """
    print(f"Checking {len(companies)} company career pages...")
    return []

def generate_sample_jobs() -> List[Dict]:
    """
    Generate sample job data for demonstration
    In production, this would be replaced with actual scraping
    """
    jobs = []
    
    # Sample job titles
    job_titles = [
        "Senior IAM Engineer",
        "Identity & Access Management Architect",
        "Cybersecurity Engineer - IAM",
        "Principal Security Engineer",
        "IAM Consultant",
        "Identity Security Analyst",
        "Privileged Access Management Engineer",
        "Security Architect - Identity",
        "IAM Technical Lead",
        "Identity Governance Engineer"
    ]
    
    locations = [
        ("Remote", "remote"),
        ("New York, NY", "hybrid"),
        ("San Francisco, CA", "hybrid"),
        ("Washington, DC", "onsite"),
        ("Boston, MA", "hybrid"),
        ("Seattle, WA", "remote"),
        ("Chicago, IL", "hybrid"),
        ("Austin, TX", "remote"),
        ("Arlington, VA", "onsite"),
        ("Denver, CO", "remote")
    ]
    
    clearances = ['none', 'none', 'none', 'secret', 'ts', 'ts-sci']
    
    # Generate jobs
    for i in range(25):
        company = random.choice(COMPANIES)
        title = random.choice(job_titles)
        location, loc_type = random.choice(locations)
        
        classification = classify_job(title)
        
        job = {
            'company': company,
            'title': title,
            'location': location,
            'locationType': loc_type,
            'type': classification['type'],
            'level': classification['level'],
            'clearance': random.choice(clearances),
            'posted': (datetime.now() - timedelta(days=random.randint(0, 30))).strftime('%Y-%m-%d'),
            'url': f'https://careers.example.com/job/{i}',
            'description': f'Great opportunity for {title} at {company}'
        }
        
        jobs.append(job)
    
    return jobs

def deduplicate_jobs(jobs: List[Dict]) -> List[Dict]:
    """
    Remove duplicate job listings based on company + title + location
    """
    seen = set()
    unique_jobs = []
    
    for job in jobs:
        key = (job['company'], job['title'], job['location'])
        if key not in seen:
            seen.add(key)
            unique_jobs.append(job)
    
    return unique_jobs

def main():
    """
    Main scraping function
    """
    print("Starting IAM & Cybersecurity job scraper...")
    print("=" * 60)
    
    all_jobs = []
    
    # In production, uncomment these to use real APIs
    # all_jobs.extend(scrape_indeed_api())
    # all_jobs.extend(scrape_linkedin_api())
    # all_jobs.extend(scrape_dice())
    # all_jobs.extend(scrape_company_careers(COMPANIES))
    
    # For demonstration, use sample data
    all_jobs.extend(generate_sample_jobs())
    
    # Deduplicate
    unique_jobs = deduplicate_jobs(all_jobs)
    
    print(f"\nFound {len(all_jobs)} total jobs")
    print(f"After deduplication: {len(unique_jobs)} unique jobs")
    
    # Sort by posted date (newest first)
    unique_jobs.sort(key=lambda x: x['posted'], reverse=True)
    
    # Create output data
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
    
    print(f"\nJob data written to {output_file}")
    print("=" * 60)
    
    # Print summary statistics
    print("\nJob Summary:")
    print(f"  Total jobs: {len(unique_jobs)}")
    
    # Count by type
    type_counts = {}
    for job in unique_jobs:
        job_type = job.get('type', 'unknown')
        type_counts[job_type] = type_counts.get(job_type, 0) + 1
    
    print("\n  By type:")
    for job_type, count in sorted(type_counts.items()):
        print(f"    {job_type}: {count}")
    
    # Count by location type
    location_counts = {}
    for job in unique_jobs:
        loc_type = job.get('locationType', 'unknown')
        location_counts[loc_type] = location_counts.get(loc_type, 0) + 1
    
    print("\n  By location type:")
    for loc_type, count in sorted(location_counts.items()):
        print(f"    {loc_type}: {count}")
    
    print("\nScraping complete!")

if __name__ == '__main__':
    main()
