#!/usr/bin/env python3
"""
IAM & Cybersecurity Job Scraper - Adzuna Multi-Country Edition
Pulls real jobs from Adzuna API across multiple countries
"""

import json
import requests
from datetime import datetime, timedelta
import time
import os
from typing import List, Dict

# Adzuna API Configuration
ADZUNA_APP_ID = os.getenv('ADZUNA_APP_ID', '')
ADZUNA_APP_KEY = os.getenv('ADZUNA_APP_KEY', '')

# Countries supported by Adzuna (country code: display name)
ADZUNA_COUNTRIES = {
    'us': 'United States',
    'gb': 'United Kingdom',
    'ca': 'Canada',
    'au': 'Australia',
    'de': 'Germany',
    'fr': 'France',
    'nl': 'Netherlands',
    'nz': 'New Zealand',
    'pl': 'Poland',
    'at': 'Austria',
    'ch': 'Switzerland',
    'in': 'India',
    'sg': 'Singapore',
    'za': 'South Africa',
    'br': 'Brazil',
    'mx': 'Mexico',
    'it': 'Italy',
    'es': 'Spain'
}

def classify_job(title: str, description: str = '') -> Dict[str, str]:
    """Classify job by type and level"""
    title_lower = title.lower()
    desc_lower = description.lower()
    combined = f"{title_lower} {desc_lower}"
    
    # Job type
    job_type = 'security'
    if any(word in title_lower for word in ['iam', 'identity', 'access management', 'idm', 'pam', 'privileged', 'okta', 'sailpoint', 'ping', 'saviynt', 'cyberark']):
        job_type = 'iam'
    elif 'architect' in title_lower:
        job_type = 'architect'
    elif 'analyst' in title_lower:
        job_type = 'analyst'
    elif 'consultant' in title_lower:
        job_type = 'consultant'
    
    # Experience level
    level = 'mid'
    if any(word in title_lower for word in ['junior', 'entry', 'associate', 'graduate']):
        level = 'junior'
    elif any(word in title_lower for word in ['senior', 'sr.', 'sr ']):
        level = 'senior'
    elif any(word in title_lower for word in ['principal', 'staff', 'distinguished']):
        level = 'principal'
    elif any(word in title_lower for word in ['lead', 'manager', 'director', 'head']):
        level = 'lead'
    
    # Location type
    location_type = 'onsite'
    if any(word in combined for word in ['remote', 'work from home', 'wfh', 'anywhere']):
        location_type = 'remote'
    elif any(word in combined for word in ['hybrid', 'flexible']):
        location_type = 'hybrid'
    
    # Clearance
    clearance = 'none'
    if any(word in combined for word in ['ts/sci', 'ts-sci', 'top secret/sci']):
        clearance = 'ts-sci'
    elif 'top secret' in combined or 'ts clearance' in combined:
        clearance = 'ts'
    elif 'secret clearance' in combined or 'security clearance' in combined:
        clearance = 'secret'
    
    return {
        'type': job_type,
        'level': level,
        'locationType': location_type,
        'clearance': clearance
    }

def search_adzuna_country(country_code: str, keyword: str, max_results: int = 10) -> List[Dict]:
    """Search jobs in a specific country via Adzuna API"""
    jobs = []
    
    if not ADZUNA_APP_ID or not ADZUNA_APP_KEY:
        print(f"  Skipping {country_code} - API keys not configured")
        return []
    
    try:
        url = f"https://api.adzuna.com/v1/api/jobs/{country_code}/search/1"
        params = {
            'app_id': ADZUNA_APP_ID,
            'app_key': ADZUNA_APP_KEY,
            'results_per_page': max_results,
            'what': keyword,
            'content-type': 'application/json',
            'sort_by': 'date'
        }
        
        response = requests.get(url, params=params, timeout=15)
        
        if response.status_code == 200:
            data = response.json()
            
            for result in data.get('results', []):
                try:
                    classification = classify_job(
                        result.get('title', ''),
                        result.get('description', '')
                    )
                    
                    # Extract location with country context
                    location_obj = result.get('location', {})
                    city = location_obj.get('display_name', '') or location_obj.get('area', [''])[0]
                    
                    # Get country name from the search country code
                    country_name = ADZUNA_COUNTRIES.get(country_code, 'Unknown')
                    
                    # Format location properly: "City, Country"
                    if city and city != country_name:
                        location = f"{city}, {country_name}"
                    else:
                        location = country_name
                    
                    job = {
                        'company': result.get('company', {}).get('display_name', 'Unknown Company'),
                        'title': result.get('title', 'Untitled Position'),
                        'location': location,
                        'locationType': classification['locationType'],
                        'type': classification['type'],
                        'level': classification['level'],
                        'clearance': classification['clearance'],
                        'posted': result.get('created', datetime.now().strftime('%Y-%m-%d')),
                        'url': result.get('redirect_url', '#'),
                        'description': result.get('description', '')[:300]
                    }
                    
                    jobs.append(job)
                    
                except Exception as e:
                    print(f"    Error processing job: {e}")
                    continue
            
            print(f"  ✓ {country_code.upper()}: Found {len(jobs)} jobs for '{keyword}'")
        else:
            print(f"  ✗ {country_code.upper()}: API returned {response.status_code}")
    
    except requests.exceptions.Timeout:
        print(f"  ✗ {country_code.upper()}: Request timeout")
    except Exception as e:
        print(f"  ✗ {country_code.upper()}: Error - {e}")
    
    return jobs

def search_all_countries() -> List[Dict]:
    """Search for jobs across all supported countries"""
    all_jobs = []
    
    print("\n🌍 Searching jobs globally via Adzuna API...")
    print("=" * 60)
    
    # Priority countries (search with more keywords)
    priority_countries = ['us', 'gb', 'ca', 'de', 'in', 'au', 'sg']
    priority_keywords = ['IAM engineer', 'identity management', 'security engineer']
    
    # Other countries (fewer searches to stay within rate limits)
    other_countries = [code for code in ADZUNA_COUNTRIES.keys() if code not in priority_countries]
    other_keywords = ['IAM engineer', 'cybersecurity']
    
    # Search priority countries
    print("\n📍 Priority Countries (US, UK, CA, DE, IN, AU, SG):")
    for country_code in priority_countries:
        for keyword in priority_keywords:
            jobs = search_adzuna_country(country_code, keyword, max_results=15)
            all_jobs.extend(jobs)
            time.sleep(1)  # Rate limiting - 1 request per second
    
    # Search other countries
    print(f"\n📍 Other Countries ({len(other_countries)} countries):")
    for country_code in other_countries:
        for keyword in other_keywords:
            jobs = search_adzuna_country(country_code, keyword, max_results=5)
            all_jobs.extend(jobs)
            time.sleep(1)  # Rate limiting
    
    return all_jobs

def deduplicate_jobs(jobs: List[Dict]) -> List[Dict]:
    """Remove duplicate jobs"""
    seen = set()
    unique_jobs = []
    
    for job in jobs:
        # Create unique key from company + title
        key = (job['company'].lower().strip(), job['title'].lower().strip())
        if key not in seen:
            seen.add(key)
            unique_jobs.append(job)
    
    return unique_jobs

def generate_sample_international_jobs() -> List[Dict]:
    """Fallback: Generate sample jobs if API keys not available"""
    
    sample_jobs = [
        # USA
        {'company': 'Microsoft', 'title': 'Senior IAM Engineer', 'location': 'Redmond, WA', 'type': 'iam', 'level': 'senior', 'locationType': 'hybrid', 'url': 'https://careers.microsoft.com/'},
        {'company': 'Google', 'title': 'Staff Security Engineer - Identity', 'location': 'Mountain View, CA', 'type': 'security', 'level': 'principal', 'locationType': 'hybrid', 'url': 'https://careers.google.com/'},
        {'company': 'AWS', 'title': 'Senior IAM Engineer', 'location': 'Seattle, WA', 'type': 'iam', 'level': 'senior', 'locationType': 'remote', 'url': 'https://www.amazon.jobs/'},
        {'company': 'Okta', 'title': 'Principal IAM Architect', 'location': 'San Francisco, CA', 'type': 'architect', 'level': 'principal', 'locationType': 'remote', 'url': 'https://www.okta.com/company/careers/'},
        {'company': 'Northeastern University', 'title': 'Senior IAM Engineer', 'location': 'Boston, MA', 'type': 'iam', 'level': 'senior', 'locationType': 'hybrid', 'url': 'https://northeastern.wd1.myworkdayjobs.com/careers'},
        {'company': 'JPMorgan Chase', 'title': 'IAM Engineer', 'location': 'New York, NY', 'type': 'iam', 'level': 'mid', 'locationType': 'hybrid', 'url': 'https://careers.jpmorgan.com/'},
        {'company': 'Capital One', 'title': 'Senior IAM Engineer', 'location': 'McLean, VA', 'type': 'iam', 'level': 'senior', 'locationType': 'hybrid', 'url': 'https://www.capitalonecareers.com/'},
        {'company': 'Cisco', 'title': 'Principal IAM Engineer', 'location': 'San Jose, CA', 'type': 'iam', 'level': 'principal', 'locationType': 'hybrid', 'url': 'https://jobs.cisco.com/'},
        {'company': 'Raytheon', 'title': 'Cybersecurity IAM Engineer', 'location': 'Arlington, VA', 'type': 'iam', 'level': 'mid', 'locationType': 'onsite', 'url': 'https://careers.rtx.com/'},
        {'company': 'Lockheed Martin', 'title': 'Security Engineer - IAM', 'location': 'Fort Worth, TX', 'type': 'security', 'level': 'mid', 'locationType': 'onsite', 'url': 'https://www.lockheedmartinjobs.com/'},
        
        # UK
        {'company': 'HSBC', 'title': 'Senior IAM Engineer', 'location': 'London, United Kingdom', 'type': 'iam', 'level': 'senior', 'locationType': 'hybrid', 'url': 'https://www.hsbc.com/careers'},
        {'company': 'Barclays', 'title': 'IAM Architect', 'location': 'London, UK', 'type': 'architect', 'level': 'senior', 'locationType': 'hybrid', 'url': 'https://joinus.barclays/'},
        {'company': 'Lloyds Banking Group', 'title': 'IAM Security Engineer', 'location': 'Edinburgh, United Kingdom', 'type': 'iam', 'level': 'mid', 'locationType': 'hybrid', 'url': 'https://www.lloydsbankinggroup.com/careers.html'},
        {'company': 'BBC', 'title': 'Cybersecurity IAM Specialist', 'location': 'Manchester, UK', 'type': 'security', 'level': 'mid', 'locationType': 'hybrid', 'url': 'https://careers.bbc.co.uk/'},
        
        # Canada
        {'company': 'Shopify', 'title': 'Senior Security Engineer - Identity', 'location': 'Toronto, Canada', 'type': 'security', 'level': 'senior', 'locationType': 'remote', 'url': 'https://www.shopify.com/careers'},
        {'company': 'RBC', 'title': 'IAM Architect', 'location': 'Toronto, ON', 'type': 'architect', 'level': 'senior', 'locationType': 'hybrid', 'url': 'https://jobs.rbc.com/'},
        {'company': 'TD Bank', 'title': 'Identity Management Engineer', 'location': 'Vancouver, BC', 'type': 'iam', 'level': 'mid', 'locationType': 'hybrid', 'url': 'https://jobs.td.com/'},
        
        # Germany
        {'company': 'SAP', 'title': 'IAM Solutions Architect', 'location': 'Berlin, Germany', 'type': 'architect', 'level': 'senior', 'locationType': 'hybrid', 'url': 'https://jobs.sap.com/'},
        {'company': 'Siemens', 'title': 'Cybersecurity IAM Engineer', 'location': 'Munich, Germany', 'type': 'iam', 'level': 'mid', 'locationType': 'hybrid', 'url': 'https://www.siemens.com/global/en/company/jobs.html'},
        
        # France
        {'company': 'BNP Paribas', 'title': 'IAM Security Specialist', 'location': 'Paris, France', 'type': 'security', 'level': 'mid', 'locationType': 'hybrid', 'url': 'https://group.bnpparibas/en/careers'},
        
        # India
        {'company': 'Tata Consultancy Services', 'title': 'Senior IAM Consultant', 'location': 'Mumbai, India', 'type': 'consultant', 'level': 'senior', 'locationType': 'onsite', 'url': 'https://www.tcs.com/careers'},
        {'company': 'Infosys', 'title': 'IAM Lead', 'location': 'Bangalore, India', 'type': 'lead', 'level': 'lead', 'locationType': 'hybrid', 'url': 'https://www.infosys.com/careers/'},
        {'company': 'Wipro', 'title': 'Cybersecurity IAM Engineer', 'location': 'Hyderabad, India', 'type': 'iam', 'level': 'mid', 'locationType': 'hybrid', 'url': 'https://careers.wipro.com/'},
        
        # Singapore
        {'company': 'DBS Bank', 'title': 'Principal IAM Architect', 'location': 'Singapore', 'type': 'architect', 'level': 'principal', 'locationType': 'hybrid', 'url': 'https://www.dbs.com/careers/'},
        {'company': 'Grab', 'title': 'Senior Security Engineer', 'location': 'Singapore', 'type': 'security', 'level': 'senior', 'locationType': 'hybrid', 'url': 'https://grab.careers/'},
        
        # Australia
        {'company': 'Commonwealth Bank', 'title': 'IAM Security Engineer', 'location': 'Sydney, Australia', 'type': 'iam', 'level': 'mid', 'locationType': 'hybrid', 'url': 'https://www.commbank.com.au/about-us/careers.html'},
        {'company': 'ANZ Bank', 'title': 'Senior Identity Engineer', 'location': 'Melbourne, Australia', 'type': 'iam', 'level': 'senior', 'locationType': 'hybrid', 'url': 'https://www.anz.com/about-us/careers/'},
        
        # Spain
        {'company': 'Banco Santander', 'title': 'IAM Solutions Architect', 'location': 'Madrid, Spain', 'type': 'architect', 'level': 'senior', 'locationType': 'hybrid', 'url': 'https://www.santander.com/en/careers'},
        
        # Netherlands
        {'company': 'ING Group', 'title': 'Cybersecurity IAM Engineer', 'location': 'Amsterdam, Netherlands', 'type': 'iam', 'level': 'mid', 'locationType': 'hybrid', 'url': 'https://www.ing.jobs/'},
        
        # Switzerland
        {'company': 'Credit Suisse', 'title': 'Senior IAM Engineer', 'location': 'Zurich, Switzerland', 'type': 'iam', 'level': 'senior', 'locationType': 'hybrid', 'url': 'https://www.credit-suisse.com/careers'}
    ]
    
    jobs = []
    for i, base in enumerate(sample_jobs):
        job = {
            'company': base['company'],
            'title': base['title'],
            'location': base['location'],
            'locationType': base['locationType'],
            'type': base['type'],
            'level': base['level'],
            'clearance': 'ts' if 'Arlington' in base['location'] or 'Fort Worth' in base['location'] else 'none',
            'posted': (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d'),
            'url': base['url'],
            'description': f'Great opportunity at {base["company"]}'
        }
        jobs.append(job)
    
    return jobs

def main():
    """Main scraping function"""
    print("=" * 60)
    print("IAM & Cybersecurity Job Scraper - Global Edition")
    print("Powered by Adzuna API")
    print("=" * 60)
    
    # Check API keys
    if not ADZUNA_APP_ID or not ADZUNA_APP_KEY:
        print("\n⚠️  WARNING: Adzuna API keys not configured!")
        print("Set these environment variables:")
        print("  - ADZUNA_APP_ID")
        print("  - ADZUNA_APP_KEY")
        print("\nGet free API keys at: https://developer.adzuna.com/signup")
        print("\nUsing fallback: generating sample international jobs...")
        print("=" * 60)
        
        # Use sample data if no API keys
        all_jobs = generate_sample_international_jobs()
    else:
        print(f"\n✓ API Keys configured")
        print(f"  App ID: {ADZUNA_APP_ID[:8]}...")
        
        # Search all countries
        all_jobs = search_all_countries()
    
    # Deduplicate
    print(f"\n📊 Results:")
    print(f"  Total jobs found: {len(all_jobs)}")
    
    unique_jobs = deduplicate_jobs(all_jobs)
    print(f"  After deduplication: {len(unique_jobs)}")
    
    # Sort by posted date (newest first)
    unique_jobs.sort(key=lambda x: x.get('posted', ''), reverse=True)
    
    # Create output
    output = {
        'lastUpdate': datetime.now().isoformat() + 'Z',
        'jobs': unique_jobs
    }
    
    # Write to file
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    output_file = os.path.join(project_root, 'data', 'jobs.json')
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    print(f"\n✓ Jobs written to: {output_file}")
    
    # Print summary by location
    location_counts = {}
    for job in unique_jobs:
        location = job.get('location', 'Unknown')
        location_counts[location] = location_counts.get(location, 0) + 1
    
    print("\n📍 Jobs by Location (top 15):")
    sorted_locations = sorted(location_counts.items(), key=lambda x: x[1], reverse=True)[:15]
    for location, count in sorted_locations:
        print(f"  {location}: {count}")
    
    # Print by type
    type_counts = {}
    for job in unique_jobs:
        job_type = job.get('type', 'unknown')
        type_counts[job_type] = type_counts.get(job_type, 0) + 1
    
    print("\n🔷 Jobs by Type:")
    for job_type, count in sorted(type_counts.items()):
        print(f"  {job_type}: {count}")
    
    print("\n" + "=" * 60)
    print("✓ Scraping complete!")
    print("=" * 60)

if __name__ == '__main__':
    main()
    