// World Map with Country Selection
let map;
let allJobs = [];
let selectedCountry = null;
let countryLayers = {};

// Country to ISO code mapping
const countryMapping = {
    'United States': 'USA',
    'United Kingdom': 'GBR',
    'UK': 'GBR',
    'Canada': 'CAN',
    'Germany': 'DEU',
    'France': 'FRA',
    'India': 'IND',
    'China': 'CHN',
    'Japan': 'JPN',
    'Australia': 'AUS',
    'Brazil': 'BRA',
    'Netherlands': 'NLD',
    'Singapore': 'SGP',
    'Ireland': 'IRL',
    'Switzerland': 'CHE',
    'Sweden': 'SWE',
    'Norway': 'NOR',
    'Denmark': 'DNK',
    'Finland': 'FIN',
    'Spain': 'ESP',
    'Italy': 'ITA'
};

// Extract country from location string
function extractCountry(location) {
    if (!location) return 'United States';
    
    if (location.toLowerCase().includes('remote')) return 'Remote';
    if (location.toLowerCase().includes('multiple')) return 'United States';
    
    for (const [country, code] of Object.entries(countryMapping)) {
        if (location.includes(country)) return country;
    }
    
    return 'United States';
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
