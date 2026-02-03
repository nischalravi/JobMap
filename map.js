// Interactive Map for IAM Jobs
let map;
let markers = [];
let markerClusterGroup;

// City coordinates database
const cityCoordinates = {
    // United States
    'Seattle, WA': [47.6062, -122.3321],
    'San Francisco, CA': [37.7749, -122.4194],
    'Mountain View, CA': [37.3861, -122.0839],
    'Palo Alto, CA': [37.4419, -122.1430],
    'San Jose, CA': [37.3382, -121.8863],
    'Los Angeles, CA': [34.0522, -118.2437],
    'Redondo Beach, CA': [33.8492, -118.3884],
    'Denver, CO': [39.7392, -104.9903],
    'Austin, TX': [30.2672, -97.7431],
    'Fort Worth, TX': [32.7555, -97.3308],
    'Chicago, IL': [41.8781, -87.6298],
    'New York, NY': [40.7128, -74.0060],
    'Boston, MA': [42.3601, -71.0589],
    'Cambridge, MA': [42.3736, -71.1097],
    'Malden, MA': [42.4251, -71.0662],
    'Washington, DC': [38.9072, -77.0369],
    'McLean, VA': [38.9339, -77.1773],
    'Arlington, VA': [38.8816, -77.0910],
    'Bedford, MA': [42.4965, -71.2761],
    'Indianapolis, IN': [39.7684, -86.1581],
    'Ann Arbor, MI': [42.2808, -83.7430],
    'Redmond, WA': [47.6740, -122.1215],
    
    // UK
    'London': [51.5074, -0.1278],
    
    // Remote/Multiple
    'Remote': null,
    'Multiple Locations': null,
    'US': [39.8283, -98.5795] // Center of US
};

// Color scheme by job type
const jobTypeColors = {
    'iam': '#3498db',        // Blue
    'security': '#e74c3c',   // Red
    'architect': '#9b59b6',  // Purple
    'analyst': '#f39c12',    // Orange
    'consultant': '#1abc9c'  // Teal
};

// Initialize map
function initMap() {
    // Create map centered on US
    map = L.map('map').setView([39.8283, -98.5795], 4);
    
    // Add tile layer (map style)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
    }).addTo(map);
    
    // Initialize marker cluster group
    markerClusterGroup = L.markerClusterGroup({
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true
    });
    
    map.addLayer(markerClusterGroup);
    
    // Load jobs and create markers
    loadJobsAndCreateMarkers();
}

// Load jobs from JSON
async function loadJobsAndCreateMarkers() {
    try {
        const response = await fetch('data/jobs.json');
        const data = await response.json();
        const jobs = data.jobs;
        
        updateStats(jobs);
        createMarkers(jobs);
    } catch (error) {
        console.error('Error loading jobs:', error);
    }
}

// Update statistics
function updateStats(jobs) {
    const totalJobs = jobs.length;
    const remoteJobs = jobs.filter(j => j.locationType === 'remote').length;
    const uniqueLocations = new Set(jobs.map(j => j.location)).size;
    const uniqueCompanies = new Set(jobs.map(j => j.company)).size;
    
    document.getElementById('totalJobs').textContent = totalJobs;
    document.getElementById('remoteJobs').textContent = remoteJobs;
    document.getElementById('totalLocations').textContent = uniqueLocations;
    document.getElementById('avgSalary').textContent = uniqueCompanies;
}

// Create markers for jobs
function createMarkers(jobs) {
    // Group jobs by location
    const jobsByLocation = {};
    
    jobs.forEach(job => {
        const location = job.location;
        if (!jobsByLocation[location]) {
            jobsByLocation[location] = [];
        }
        jobsByLocation[location].push(job);
    });
    
    // Create markers for each location
    Object.entries(jobsByLocation).forEach(([location, locationJobs]) => {
        const coords = getCoordinates(location);
        
        if (coords) {
            createMarkerForLocation(coords, location, locationJobs);
        }
    });
}

// Get coordinates for a location
function getCoordinates(location) {
    // Check if location is in our database
    if (cityCoordinates[location]) {
        return cityCoordinates[location];
    }
    
    // Try to match partial location
    for (const [city, coords] of Object.entries(cityCoordinates)) {
        if (location.includes(city.split(',')[0])) {
            return coords;
        }
    }
    
    // Handle "Remote" specially
    if (location.toLowerCase().includes('remote')) {
        return null; // Don't show remote jobs on map
    }
    
    // Default fallback - could implement geocoding API here
    return null;
}

// Create marker for a location with multiple jobs
function createMarkerForLocation(coords, location, jobs) {
    // Determine marker color based on most common job type
    const jobTypeCounts = {};
    jobs.forEach(job => {
        jobTypeCounts[job.type] = (jobTypeCounts[job.type] || 0) + 1;
    });
    
    const dominantType = Object.keys(jobTypeCounts).reduce((a, b) => 
        jobTypeCounts[a] > jobTypeCounts[b] ? a : b
    );
    
    const color = jobTypeColors[dominantType] || '#3498db';
    
    // Create custom icon
    const markerIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="
            background-color: ${color};
            width: 30px;
            height: 30px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 12px;
        ">${jobs.length}</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -15]
    });
    
    // Create marker
    const marker = L.marker(coords, { icon: markerIcon });
    
    // Create popup content
    const popupContent = createPopupContent(location, jobs);
    marker.bindPopup(popupContent, { maxWidth: 300 });
    
    // Add to cluster group
    markerClusterGroup.addLayer(marker);
    markers.push(marker);
}

// Create popup content for a location
function createPopupContent(location, jobs) {
    let html = `<div class="marker-popup">`;
    html += `<h3 style="margin-top: 0; color: #2c3e50;">${location}</h3>`;
    html += `<p style="color: #7f8c8d; margin: 0.5rem 0;">${jobs.length} job${jobs.length > 1 ? 's' : ''} available</p>`;
    html += `<hr style="border: none; border-top: 1px solid #ecf0f1; margin: 0.5rem 0;">`;
    
    // Show first 3 jobs
    jobs.slice(0, 3).forEach(job => {
        html += `<div style="margin: 0.8rem 0; padding: 0.5rem; background: #f8f9fa; border-radius: 4px;">`;
        html += `<div class="popup-company">${job.company}</div>`;
        html += `<div class="popup-title">${job.title}</div>`;
        html += `<div class="popup-details">`;
        html += `<span class="popup-badge badge-${job.locationType}">${formatLocationType(job.locationType)}</span>`;
        html += `<span class="popup-badge" style="background: ${jobTypeColors[job.type]}; color: white;">${formatJobType(job.type)}</span>`;
        html += `</div>`;
        html += `</div>`;
    });
    
    if (jobs.length > 3) {
        html += `<p style="color: #7f8c8d; font-size: 0.9rem; margin: 0.5rem 0;">+ ${jobs.length - 3} more jobs</p>`;
    }
    
    html += `<a href="index.html?location=${encodeURIComponent(location)}" style="
        display: block;
        margin-top: 0.8rem;
        padding: 0.5rem;
        background: #3498db;
        color: white;
        text-align: center;
        text-decoration: none;
        border-radius: 4px;
        font-weight: 600;
    ">View All Jobs</a>`;
    
    html += `</div>`;
    return html;
}

// Format location type
function formatLocationType(type) {
    const types = {
        'remote': 'Remote',
        'hybrid': 'Hybrid',
        'onsite': 'Onsite'
    };
    return types[type] || type;
}

// Format job type
function formatJobType(type) {
    const types = {
        'iam': 'IAM',
        'security': 'Security',
        'architect': 'Architect',
        'analyst': 'Analyst',
        'consultant': 'Consultant'
    };
    return types[type] || type;
}

// Initialize map when page loads
document.addEventListener('DOMContentLoaded', initMap);
