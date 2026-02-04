#!/usr/bin/env python3
"""
Enhanced Job Scraper with Visa Sponsorship Detection
"""

import json
import requests
from datetime import datetime, timedelta
import time
import os
from typing import List, Dict
import re

# API Configuration
ADZUNA_APP_ID = os.getenv('ADZUNA_APP_ID', '')
ADZUNA_APP_KEY = os.getenv('ADZUNA_APP_KEY', '')

ADZUNA_COUNTRIES = {
    'us': 'United States', 'gb': 'United Kingdom', 'ca': 'Canada', 'au': 'Australia',
    'de': 'Germany', 'fr': 'France', 'nl': 'Netherlands', 'nz': 'New Zealand',
    'pl': 'Poland', 'at': 'Austria', 'ch': 'Switzerland', 'in': 'India',
    'sg': 'Singapore', 'za': 'South Africa', 'br': 'Brazil', 'mx': 'Mexico',
    'it': 'Italy', 'es': 'Spain'
}

def detect_visa_sponsorship(title: str, description: str) -> Dict[str, any]:
    """
    Detect visa sponsorship and work authorization requirements from job description
    """
    combined = f"{title} {description}".lower()
    
    # Visa sponsorship indicators
    visa_info = {
        'sponsorship_available': False,
        'sponsorship_status': 'unknown',  # 'available', 'not_available', 'unknown'
        'work_authorization_required': False,
        'location_restrictions': []
    }
    
    # Positive indicators for visa sponsorship
    sponsorship_positive = [
        'visa sponsorship',
        'will sponsor',
        'sponsorship available',
        'h1b sponsor',
        'can sponsor',
        'sponsors visas',
        'visa support',
        'immigration support',
        'relocation assistance'
    ]
    
    # Negative indicators (no sponsorship)
    sponsorship_negative = [
        'no visa sponsorship',
        'no sponsorship',
        'cannot sponsor',
        'will not sponsor',
        'us citizens only',
        'citizenship required',
        'must be authorized',
        'must be eligible',
        'must have authorization',
        'security clearance required'  # Usually means US citizen
    ]
    
    # Work authorization requirements
    auth_requirements = [
        'must be authorized to work',
        'work authorization required',
        'right to work',
        'legally authorized',
        'employment authorization',
        'work permit required'
    ]
    
    # Location restrictions
    location_keywords = {
        'us_only': ['us citizens only', 'u.s. citizens only', 'must be us citizen'],
        'clearance': ['security clearance', 'ts/sci', 'top secret', 'secret clearance'],
        'local_only': ['must be located in', 'must reside in', 'local candidates only'],
        'no_remote_intl': ['us remote only', 'uk remote only', 'must be in country']
    }
    
    # Check for positive sponsorship
    for phrase in sponsorship_positive:
        if phrase in combined:
            visa_info['sponsorship_available'] = True
            visa_info['sponsorship_status'] = 'available'
            break
    
    # Check for negative sponsorship (overrides positive)
    for phrase in sponsorship_negative:
        if phrase in combined:
            visa_info['sponsorship_available'] = False
            visa_info['sponsorship_status'] = 'not_available'
            break
    
    # Check for work authorization requirements
    for phrase in auth_requirements:
        if phrase in combined:
            visa_info['work_authorization_required'] = True
    
    # Detect location restrictions
    restrictions = []
    if any(phrase in combined for phrase in location_keywords['us_only']):
        restrictions.append('US Citizens Only')
    if any(phrase in combined for phrase in location_keywords['clearance']):
        restrictions.append('Security Clearance Required')
    if any(phrase in combined for phrase in location_keywords['local_only']):
        restrictions.append('Local Candidates Preferred')
    if any(phrase in combined for phrase in location_keywords['no_remote_intl']):
        restrictions.append('Domestic Remote Only')
    
    visa_info['location_restrictions'] = restrictions
    
    return visa_info

def classify_job(title: str, description: str = '') -> Dict[str, str]:
    """Enhanced job classification with visa info"""
    title_lower = title.lower()
    desc_lower = description.lower()
    combined = f"{title_lower} {desc_lower}"
    
    # Basic classification
    job_type = 'security'
    if any(word in title_lower for word in ['iam', 'identity', 'access management', 'idm', 'pam', 'privileged', 'okta', 'sailpoint', 'ping', 'saviynt', 'cyberark']):
        job_type = 'iam'
    elif 'architect' in title_lower:
        job_type = 'architect'
    elif 'analyst' in title_lower:
        job_type = 'analyst'
    elif 'consultant' in title_lower:
        job_type = 'consultant'
    
    level = 'mid'
    if any(word in title_lower for word in ['junior', 'entry', 'associate', 'graduate']):
        level = 'junior'
    elif any(word in title_lower for word in ['senior', 'sr.', 'sr ']):
        level = 'senior'
    elif any(word in title_lower for word in ['principal', 'staff', 'distinguished']):
        level = 'principal'
    elif any(word in title_lower for word in ['lead', 'manager', 'director', 'head']):
        level = 'lead'
    
    location_type = 'onsite'
    if any(word in combined for word in ['remote', 'work from home', 'wfh', 'anywhere']):
        location_type = 'remote'
    elif any(word in combined for word in ['hybrid', 'flexible']):
        location_type = 'hybrid'
    
    clearance = 'none'
    if any(word in combined for word in ['ts/sci', 'ts-sci', 'top secret/sci']):
        clearance = 'ts-sci'
    elif 'top secret' in combined or 'ts clearance' in combined:
        clearance = 'ts'
    elif 'secret clearance' in combined or 'security clearance' in combined:
        clearance = 'secret'
    
    # Detect visa sponsorship and restrictions
    visa_info = detect_visa_sponsorship(title, description)
    
    return {
        'type': job_type,
        'level': level,
        'locationType': location_type,
        'clearance': clearance,
        'visaSponsorship': visa_info['sponsorship_status'],
        'workAuthRequired': visa_info['work_authorization_required'],
        'locationRestrictions': visa_info['location_restrictions']
    }

def search_adzuna_country(country_code: str, keyword: str, max_results: int = 20) -> List[Dict]:
    """Search with enhanced visa detection"""
    jobs = []
    
    if not ADZUNA_APP_ID or not ADZUNA_APP_KEY:
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
                    description = result.get('description', '')
                    title = result.get('title', '')
                    
                    classification = classify_job(title, description)
                    
                    location_obj = result.get('location', {})
                    city = location_obj.get('display_name', '') or location_obj.get('area', [''])[0]
                    country_name = ADZUNA_COUNTRIES.get(country_code, 'Unknown')
                    
                    if city and city != country_name:
                        location = f"{city}, {country_name}"
                    else:
                        location = country_name
                    
                    job = {
                        'company': result.get('company', {}).get('display_name', 'Unknown Company'),
                        'title': title,
                        'location': location,
                        'locationType': classification['locationType'],
                        'type': classification['type'],
                        'level': classification['level'],
                        'clearance': classification['clearance'],
                        'visaSponsorship': classification['visaSponsorship'],
                        'workAuthRequired': classification['workAuthRequired'],
                        'locationRestrictions': classification['locationRestrictions'],
                        'posted': result.get('created', datetime.now().strftime('%Y-%m-%d')),
                        'url': result.get('redirect_url', '#'),
                        'description': description[:500]
                    }
                    
                    jobs.append(job)
                    
                except Exception as e:
                    continue
            
            print(f"  ✓ {country_code.upper()}: {len(jobs)} jobs")
        
    except Exception as e:
        print(f"  ✗ {country_code.upper()}: {str(e)[:50]}")
    
    return jobs

def search_all_countries() -> List[Dict]:
    """Search with reduced frequency to stay within API limits"""
    all_jobs = []
    
    print("\n🌍 Searching 18 countries via Adzuna...")
    print("=" * 60)
    
    # Optimized search - fewer calls, more results
    priority_countries = ['us', 'gb', 'ca', 'de', 'in', 'au', 'sg']
    
    print("\n📍 Priority Markets:")
    for country_code in priority_countries:
        # Fewer keywords, more results per call
        jobs = search_adzuna_country(country_code, 'IAM OR identity OR cybersecurity', max_results=30)
        all_jobs.extend(jobs)
        time.sleep(1)
    
    print("\n📍 Other Markets:")
    other_countries = [c for c in ADZUNA_COUNTRIES.keys() if c not in priority_countries]
    for country_code in other_countries:
        jobs = search_adzuna_country(country_code, 'IAM OR security', max_results=15)
        all_jobs.extend(jobs)
        time.sleep(1)
    
    print(f"\nAPI Calls made: ~{len(priority_countries) + len(other_countries)}")
    
    return all_jobs

def deduplicate_jobs(jobs: List[Dict]) -> List[Dict]:
    """Remove duplicates"""
    seen = set()
    unique_jobs = []
    
    for job in jobs:
        key = (job['company'].lower().strip(), job['title'].lower().strip())
        if key not in seen:
            seen.add(key)
            unique_jobs.append(job)
    
    return unique_jobs

def main():
    """Main function"""
    print("=" * 60)
    print("JOBMAP - Global Job Scraper with Visa Detection")
    print("=" * 60)
    
    if not ADZUNA_APP_ID or not ADZUNA_APP_KEY:
        print("\n⚠️  No API keys - using sample data")
        all_jobs = []
    else:
        print(f"\n✓ API configured (ID: {ADZUNA_APP_ID[:8]}...)")
        all_jobs = search_all_countries()
    
    print(f"\n📊 Total jobs found: {len(all_jobs)}")
    
    unique_jobs = deduplicate_jobs(all_jobs)
    print(f"After deduplication: {len(unique_jobs)}")
    
    # Analyze visa sponsorship
    visa_yes = len([j for j in unique_jobs if j.get('visaSponsorship') == 'available'])
    visa_no = len([j for j in unique_jobs if j.get('visaSponsorship') == 'not_available'])
    visa_unknown = len([j for j in unique_jobs if j.get('visaSponsorship') == 'unknown'])
    
    print(f"\n🛂 Visa Sponsorship Analysis:")
    print(f"  Sponsors visa: {visa_yes}")
    print(f"  No sponsorship: {visa_no}")
    print(f"  Unknown: {visa_unknown}")
    
    unique_jobs.sort(key=lambda x: x.get('posted', ''), reverse=True)
    
    output = {
        'lastUpdate': datetime.now().isoformat() + 'Z',
        'jobs': unique_jobs
    }
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    output_file = os.path.join(project_root, 'data', 'jobs.json')
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    print(f"\n✓ Jobs saved: {output_file}")
    
    # Country summary
    country_counts = {}
    for job in unique_jobs:
        parts = job.get('location', 'Unknown').split(', ')
        country = parts[-1] if len(parts) > 1 else parts[0]
        country_counts[country] = country_counts.get(country, 0) + 1
    
    print("\n📍 Top 15 Countries:")
    for country, count in sorted(country_counts.items(), key=lambda x: x[1], reverse=True)[:15]:
        print(f"  {country}: {count}")
    
    print("\n" + "=" * 60)
    print("✓ Complete!")

if __name__ == '__main__':
    main()
    