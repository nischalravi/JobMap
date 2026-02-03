// World Map with Country Selection - Global Edition
let map;
let allJobs = [];
let selectedCountry = null;
let countryLayers = {};

// Comprehensive country mapping - maps job location formats to GeoJSON country names
const countryMapping = {
    // United States
    'United States': 'United States of America',
    'USA': 'United States of America',
    'US': 'United States of America',
    'U.S.': 'United States of America',
    'U.S.A.': 'United States of America',
    
    // United Kingdom
    'United Kingdom': 'United Kingdom',
    'UK': 'United Kingdom',
    'Great Britain': 'United Kingdom',
    'England': 'United Kingdom',
    'Scotland': 'United Kingdom',
    'Wales': 'United Kingdom',
    'Northern Ireland': 'United Kingdom',
    
    // Canada
    'Canada': 'Canada',
    
    // Europe
    'Germany': 'Germany',
    'France': 'France',
    'Spain': 'Spain',
    'Italy': 'Italy',
    'Netherlands': 'Netherlands',
    'Belgium': 'Belgium',
    'Switzerland': 'Switzerland',
    'Austria': 'Austria',
    'Sweden': 'Sweden',
    'Norway': 'Norway',
    'Denmark': 'Denmark',
    'Finland': 'Finland',
    'Poland': 'Poland',
    'Portugal': 'Portugal',
    'Ireland': 'Ireland',
    'Greece': 'Greece',
    'Czech Republic': 'Czech Republic',
    'Czechia': 'Czech Republic',
    'Hungary': 'Hungary',
    'Romania': 'Romania',
    
    // Asia
    'India': 'India',
    'China': 'China',
    'Japan': 'Japan',
    'South Korea': 'South Korea',
    'Singapore': 'Singapore',
    'Hong Kong': 'Hong Kong',
    'Taiwan': 'Taiwan',
    'Thailand': 'Thailand',
    'Vietnam': 'Vietnam',
    'Philippines': 'Philippines',
    'Indonesia': 'Indonesia',
    'Malaysia': 'Malaysia',
    'Pakistan': 'Pakistan',
    'Bangladesh': 'Bangladesh',
    
    // Middle East
    'Israel': 'Israel',
    'UAE': 'United Arab Emirates',
    'United Arab Emirates': 'United Arab Emirates',
    'Dubai': 'United Arab Emirates',
    'Abu Dhabi': 'United Arab Emirates',
    'Saudi Arabia': 'Saudi Arabia',
    'Qatar': 'Qatar',
    'Kuwait': 'Kuwait',
    'Turkey': 'Turkey',
    
    // Oceania
    'Australia': 'Australia',
    'New Zealand': 'New Zealand',
    
    // Americas
    'Mexico': 'Mexico',
    'Brazil': 'Brazil',
    'Argentina': 'Argentina',
    'Chile': 'Chile',
    'Colombia': 'Colombia',
    'Peru': 'Peru',
    
    // Africa
    'South Africa': 'South Africa',
    'Egypt': 'Egypt',
    'Nigeria': 'Nigeria',
    'Kenya': 'Kenya',
    'Morocco': 'Morocco',
    
    // Eastern Europe
    'Russia': 'Russia',
    'Ukraine': 'Ukraine',
    'Belarus': 'Belarus',
    'Estonia': 'Estonia',
    'Latvia': 'Latvia',
    'Lithuania': 'Lithuania'
};

// US States
const usStates = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC'];

// Canadian Provinces
const canadianProvinces = ['AB','BC','MB','NB','NL','NS','NT','NU','ON','PE','QC','SK','YT'];

// Major cities by country
const cityToCountry = {
    // US Cities
    'New York': 'United States of America',
    'Los Angeles': 'United States of America',
    'Chicago': 'United States of America',
    'Houston': 'United States of America',
    'Phoenix': 'United States of America',
    'Philadelphia': 'United States of America',
    'San Antonio': 'United States of America',
    'San Diego': 'United States of America',
    'Dallas': 'United States of America',
    'San Jose': 'United States of America',
    'Austin': 'United States of America',
    'Jacksonville': 'United States of America',
    'San Francisco': 'United States of America',
    'Seattle': 'United States of America',
    'Denver': 'United States of America',
    'Washington': 'United States of America',
    'Boston': 'United States of America',
    'Nashville': 'United States of America',
    'Detroit': 'United States of America',
    'Portland': 'United States of America',
    'Las Vegas': 'United States of America',
    'Memphis': 'United States of America',
    'Baltimore': 'United States of America',
    'Atlanta': 'United States of America',
    'Miami': 'United States of America',
    'Minneapolis': 'United States of America',
    'Cleveland': 'United States of America',
    'Arlington': 'United States of America',
    'Raleigh': 'United States of America',
    'Tampa': 'United States of America',
    'Pittsburgh': 'United States of America',
    'Cincinnati': 'United States of America',
    'Redmond': 'United States of America',
    'Mountain View': 'United States of America',
    'Palo Alto': 'United States of America',
    'Cambridge': 'United States of America',
    'Ann Arbor': 'United States of America',
    'Malden': 'United States of America',
    'Bedford': 'United States of America',
    'McLean': 'United States of America',
    'Fort Worth': 'United States of America',
    
    // UK Cities
    'London': 'United Kingdom',
    'Manchester': 'United Kingdom',
    'Birmingham': 'United Kingdom',
    'Leeds': 'United Kingdom',
    'Glasgow': 'United Kingdom',
    'Edinburgh': 'United Kingdom',
    'Liverpool': 'United Kingdom',
    'Bristol': 'United Kingdom',
    'Cambridge': 'United Kingdom', // Can be UK or US - check context
    'Oxford': 'United Kingdom',
    
    // Canadian Cities
    'Toronto': 'Canada',
    'Montreal': 'Canada',
    'Vancouver': 'Canada',
    'Calgary': 'Canada',
    'Ottawa': 'Canada',
    'Edmonton': 'Canada',
    'Winnipeg': 'Canada',
    
    // European Cities
    'Berlin': 'Germany',
    'Munich': 'Germany',
    'Frankfurt': 'Germany',
    'Hamburg': 'Germany',
    'Paris': 'France',
    'Lyon': 'France',
    'Marseille': 'France',
    'Madrid': 'Spain',
    'Barcelona': 'Spain',
    'Rome': 'Italy',
    'Milan': 'Italy',
    'Amsterdam': 'Netherlands',
    'Rotterdam': 'Netherlands',
    'Brussels': 'Belgium',
    'Zurich': 'Switzerland',
    'Geneva': 'Switzerland',
    'Vienna': 'Austria',
    'Stockholm': 'Sweden',
    'Oslo': 'Norway',
    'Copenhagen': 'Denmark',
    'Helsinki': 'Finland',
    'Warsaw': 'Poland',
    'Lisbon': 'Portugal',
    'Dublin': 'Ireland',
    'Athens': 'Greece',
    'Prague': 'Czech Republic',
    'Budapest': 'Hungary',
    'Bucharest': 'Romania',
    
    // Asian Cities
    'Tokyo': 'Japan',
    'Osaka': 'Japan',
    'Kyoto': 'Japan',
    'Seoul': 'South Korea',
    'Busan': 'South Korea',
    'Singapore': 'Singapore',
    'Hong Kong': 'Hong Kong',
    'Taipei': 'Taiwan',
    'Bangkok': 'Thailand',
    'Mumbai': 'India',
    'Delhi': 'India',
    'Bangalore': 'India',
    'Hyderabad': 'India',
    'Chennai': 'India',
    'Pune': 'India',
    'Kolkata': 'India',
    'Beijing': 'China',
    'Shanghai': 'China',
    'Shenzhen': 'China',
    'Guangzhou': 'China',
    'Manila': 'Philippines',
    'Jakarta': 'Indonesia',
    'Kuala Lumpur': 'Malaysia',
    
    // Middle East Cities
    'Tel Aviv': 'Israel',
    'Jerusalem': 'Israel',
    'Dubai': 'United Arab Emirates',
    'Abu Dhabi': 'United Arab Emirates',
    'Riyadh': 'Saudi Arabia',
    'Doha': 'Qatar',
    'Istanbul': 'Turkey',
    'Ankara': 'Turkey',
    
    // Oceania Cities
    'Sydney': 'Australia',
    'Melbourne': 'Australia',
    'Brisbane': 'Australia',
    'Perth': 'Australia',
    'Auckland': 'New Zealand',
    'Wellington': 'New Zealand',
    
    // Latin America Cities
    'Mexico City': 'Mexico',
    'Guadalajara': 'Mexico',
    'Monterrey': 'Mexico',
    'São Paulo': 'Brazil',
    'Rio de Janeiro': 'Brazil',
    'Buenos Aires': 'Argentina',
    'Santiago': 'Chile',
    'Bogotá': 'Colombia',
    'Lima': 'Peru',
    
    // African Cities
    'Cape Town': 'South Africa',
    'Johannesburg': 'South Africa',
    'Cairo': 'Egypt',
    'Lagos': 'Nigeria',
    'Nairobi': 'Kenya',
    'Casablanca': 'Morocco'
};

// Extract country from location string
function extractCountry(location) {
    if (!location) return 'United States of America';
    
    const locationLower = location.toLowerCase();
    
    // Handle remote/multiple
    if (locationLower.includes('remote')) return 'Remote';
    if (locationLower.includes('multiple')) return 'United States of America';
    
    // Check for US state abbreviations (highest priority for US)
    for (const state of usStates) {
        if (location.includes(', ' + state)) {
            return 'United States of America';
        }
    }
    
    // Check for Canadian provinces
    for (const province of canadianProvinces) {
        if (location.includes(', ' + province)) {
            return 'Canada';
        }
    }
    
    // Check for explicit country names in location
    for (const [countryVariant, officialName] of Object.entries(countryMapping)) {
        if (location.includes(countryVariant)) {
            return officialName;
        }
    }
    
    // Check city to country mapping
    for (const [city, country] of Object.entries(cityToCountry)) {
        if (location.includes(city)) {
            return country;
        }
    }
    
    // Default to US if nothing matched (most jobs without country are US)
    return 'United States of America';
}

// Initialize map
function initMap() {
    map = L.map('worldMap', {
        center: [30, 0],
        zoom: 2,
        minZoom: 2,
        maxZoom: 10,
        worldCopyJump: true
    });
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        noWrap: false
    }).addTo(map);
    
    loadJobsAndCountries();
}

// Load jobs and set up country layers
async function loadJobsAndCountries() {
    try {
        const response = await fetch('data/jobs.json');
        const data = await response.json();
        allJobs = data.jobs;
        
        updateGlobalStats();
        await loadCountryBoundaries();
        
    } catch (error) {
        console.error('Error loading jobs:', error);
        document.getElementById('totalJobs').textContent = 'Error';
    }
}

// Update global statistics
function updateGlobalStats() {
    const totalJobs = allJobs.length;
    const remoteJobs = allJobs.filter(j => j.locationType === 'remote').length;
    const companies = new Set(allJobs.map(j => j.company)).size;
    
    const countries = new Set();
    allJobs.forEach(job => {
        const country = extractCountry(job.location);
        if (country !== 'Remote') {
            countries.add(country);
        }
    });
    
    document.getElementById('totalJobs').textContent = totalJobs;
    document.getElementById('totalCountries').textContent = countries.size;
    document.getElementById('remoteJobs').textContent = remoteJobs;
    document.getElementById('companiesHiring').textContent = companies;
}

// Load and display country boundaries
async function loadCountryBoundaries() {
    try {
        const response = await fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json');
        const geojson = await response.json();
        
        const jobsByCountry = {};
        allJobs.forEach(job => {
            const country = extractCountry(job.location);
            if (country !== 'Remote') {
                jobsByCountry[country] = (jobsByCountry[country] || 0) + 1;
            }
        });
        
        console.log('Jobs by country:', jobsByCountry);
        
        L.geoJSON(geojson, {
            style: function(feature) {
                const countryName = feature.properties.name;
                const jobCount = jobsByCountry[countryName] || 0;
                
                return {
                    fillColor: getCountryColor(jobCount),
                    weight: 1,
                    opacity: 1,
                    color: 'white',
                    fillOpacity: 0.7
                };
            },
            onEachFeature: function(feature, layer) {
                const countryName = feature.properties.name;
                const jobCount = jobsByCountry[countryName] || 0;
                
                countryLayers[countryName] = layer;
                
                layer.bindTooltip(
                    `<strong>${countryName}</strong><br>${jobCount} job${jobCount !== 1 ? 's' : ''}`,
                    { sticky: true }
                );
                
                layer.on('click', function() {
                    selectCountry(countryName);
                });
                
                layer.on('mouseover', function() {
                    this.setStyle({
                        weight: 3,
                        fillOpacity: 0.9
                    });
                });
                
                layer.on('mouseout', function() {
                    if (selectedCountry !== countryName) {
                        this.setStyle({
                            weight: 1,
                            fillOpacity: 0.7
                        });
                    }
                });
            }
        }).addTo(map);
        
    } catch (error) {
        console.error('Error loading country boundaries:', error);
    }
}

// Get color based on job count
function getCountryColor(jobCount) {
    if (jobCount === 0) return '#ecf0f1';
    if (jobCount <= 4) return '#3498db';
    if (jobCount <= 9) return '#f39c12';
    return '#27ae60';
}

// Select a country and show its jobs
function selectCountry(countryName) {
    selectedCountry = countryName;
    
    const countryJobs = allJobs.filter(job => {
        const jobCountry = extractCountry(job.location);
        return jobCountry === countryName;
    });
    
    document.getElementById('countryName').textContent = countryName;
    document.getElementById('countryJobCount').textContent = countryJobs.length;
    document.getElementById('selectedCountryBanner').classList.add('active');
    
    Object.entries(countryLayers).forEach(([name, layer]) => {
        if (name === countryName) {
            layer.setStyle({
                weight: 4,
                color: '#e74c3c',
                fillOpacity: 0.9
            });
            map.fitBounds(layer.getBounds(), { padding: [50, 50] });
        } else {
            layer.setStyle({
                weight: 1,
                color: 'white',
                fillOpacity: 0.4
            });
        }
    });
    
    displayJobs(countryJobs);
    
    document.getElementById('selectedCountryBanner').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

// Clear country selection
function clearCountrySelection() {
    selectedCountry = null;
    
    document.getElementById('selectedCountryBanner').classList.remove('active');
    document.getElementById('jobsGrid').classList.remove('active');
    document.getElementById('jobsGrid').innerHTML = '';
    
    map.setView([30, 0], 2);
    
    Object.entries(countryLayers).forEach(([name, layer]) => {
        const jobCount = allJobs.filter(job => 
            extractCountry(job.location) === name
        ).length;
        
        layer.setStyle({
            fillColor: getCountryColor(jobCount),
            weight: 1,
            color: 'white',
            fillOpacity: 0.7
        });
    });
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Display jobs in grid
function displayJobs(jobs) {
    const grid = document.getElementById('jobsGrid');
    grid.classList.add('active');
    
    if (jobs.length === 0) {
        grid.innerHTML = '<div class="no-jobs">No jobs found for this country.</div>';
        return;
    }
    
    grid.innerHTML = jobs.map(job => `
        <div class="job-card">
            <div class="job-card-header">
                <div class="job-company">${escapeHtml(job.company)}</div>
                <h3 class="job-title">${escapeHtml(job.title)}</h3>
            </div>
            
            <div class="job-details">
                <span class="job-badge badge-location">📍 ${escapeHtml(job.location)}</span>
                <span class="job-badge badge-${job.locationType}">${formatLocationType(job.locationType)}</span>
                <span class="job-badge badge-type">${formatJobType(job.type)}</span>
                ${job.clearance && job.clearance !== 'none' ? 
                    `<span class="job-badge badge-clearance">🔒 ${formatClearance(job.clearance)}</span>` : 
                    ''}
            </div>
            
            <div class="job-posted">Posted ${formatDate(job.posted)}</div>
            
            <a href="${escapeHtml(job.url)}" target="_blank" rel="noopener noreferrer" class="job-apply">
                Apply Now →
            </a>
        </div>
    `).join('');
}

// Format functions
function formatLocationType(type) {
    const types = {
        'remote': '🏠 Remote',
        'hybrid': '🔄 Hybrid',
        'onsite': '🏢 Onsite'
    };
    return types[type] || type;
}

function formatJobType(type) {
    const types = {
        'iam': 'IAM Engineer',
        'security': 'Security Engineer',
        'architect': 'Security Architect',
        'analyst': 'Security Analyst',
        'consultant': 'Consultant'
    };
    return types[type] || type;
}

function formatClearance(clearance) {
    const clearances = {
        'secret': 'Secret',
        'ts': 'Top Secret',
        'ts-sci': 'TS/SCI'
    };
    return clearances[clearance] || clearance;
}

function formatDate(dateString) {
    if (!dateString) return 'Recently';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    
    return date.toLocaleDateString();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initMap);
