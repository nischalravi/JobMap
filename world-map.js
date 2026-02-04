// JOBMAP - World Map with Visa Sponsorship Display
let map;
let allJobs = [];
let selectedCountry = null;
let countryLayers = {};
let currentView = 'list'; // Default to list view to show visa column

// US States
const usStates = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC'];

// Canadian Provinces  
const canadianProvinces = ['AB','BC','MB','NB','NL','NS','NT','NU','ON','PE','QC','SK','YT'];

// Major cities to country mapping
const cityToCountry = {
    'New York': 'United States of America', 'Los Angeles': 'United States of America', 'Chicago': 'United States of America',
    'Seattle': 'United States of America', 'San Francisco': 'United States of America', 'Boston': 'United States of America',
    'Austin': 'United States of America', 'Denver': 'United States of America', 'Atlanta': 'United States of America',
    'Washington': 'United States of America', 'Miami': 'United States of America', 'Dallas': 'United States of America',
    'Houston': 'United States of America', 'Philadelphia': 'United States of America', 'Phoenix': 'United States of America',
    'San Diego': 'United States of America', 'San Jose': 'United States of America', 'Portland': 'United States of America',
    'Las Vegas': 'United States of America', 'Detroit': 'United States of America', 'Minneapolis': 'United States of America',
    'Nashville': 'United States of America', 'Baltimore': 'United States of America', 'Pittsburgh': 'United States of America',
    'Cleveland': 'United States of America', 'Cincinnati': 'United States of America', 'Tampa': 'United States of America',
    'Raleigh': 'United States of America', 'Arlington': 'United States of America', 'McLean': 'United States of America',
    'Redmond': 'United States of America', 'Mountain View': 'United States of America', 'Palo Alto': 'United States of America',
    'Cambridge': 'United States of America', 'Malden': 'United States of America', 'Fort Worth': 'United States of America',
    
    'London': 'United Kingdom', 'Manchester': 'United Kingdom', 'Edinburgh': 'United Kingdom', 'Birmingham': 'United Kingdom',
    'Toronto': 'Canada', 'Vancouver': 'Canada', 'Montreal': 'Canada', 'Calgary': 'Canada', 'Ottawa': 'Canada',
    'Sydney': 'Australia', 'Melbourne': 'Australia', 'Brisbane': 'Australia', 'Perth': 'Australia',
    'Berlin': 'Germany', 'Munich': 'Germany', 'Frankfurt': 'Germany', 'Hamburg': 'Germany',
    'Paris': 'France', 'Lyon': 'France', 'Amsterdam': 'Netherlands', 'Singapore': 'Singapore',
    'Mumbai': 'India', 'Bangalore': 'India', 'Hyderabad': 'India', 'Delhi': 'India', 'Pune': 'India'
};

function extractCountry(location) {
    if (!location) return 'United States of America';
    if (location.toLowerCase().includes('remote')) return 'Remote';
    
    for (const state of usStates) {
        if (location.includes(', ' + state)) return 'United States of America';
    }
    
    for (const province of canadianProvinces) {
        if (location.includes(', ' + province)) return 'Canada';
    }
    
    for (const [city, country] of Object.entries(cityToCountry)) {
        if (location.includes(city)) return country;
    }
    
    return 'United States of America';
}

function initMap() {
    map = L.map('worldMap', { center: [30, 0], zoom: 2, minZoom: 2, maxZoom: 10 });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);
    loadJobsAndCountries();
}

async function loadJobsAndCountries() {
    try {
        const response = await fetch('data/jobs.json');
        const data = await response.json();
        allJobs = data.jobs;
        updateGlobalStats();
        await loadCountryBoundaries();
    } catch (error) {
        console.error('Error:', error);
    }
}

function updateGlobalStats() {
    document.getElementById('totalJobs').textContent = allJobs.length;
    document.getElementById('remoteJobs').textContent = allJobs.filter(j => j.locationType === 'remote').length;
    document.getElementById('companiesHiring').textContent = new Set(allJobs.map(j => j.company)).size;
    
    const countries = new Set();
    allJobs.forEach(job => {
        const country = extractCountry(job.location);
        if (country !== 'Remote') countries.add(country);
    });
    document.getElementById('totalCountries').textContent = countries.size;
}

async function loadCountryBoundaries() {
    try {
        const response = await fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json');
        const geojson = await response.json();
        
        const jobsByCountry = {};
        allJobs.forEach(job => {
            const country = extractCountry(job.location);
            if (country !== 'Remote') jobsByCountry[country] = (jobsByCountry[country] || 0) + 1;
        });
        
        L.geoJSON(geojson, {
            style: function(feature) {
                const jobCount = jobsByCountry[feature.properties.name] || 0;
                return {
                    fillColor: jobCount === 0 ? '#ecf0f1' : jobCount <= 4 ? '#3498db' : jobCount <= 9 ? '#f39c12' : '#27ae60',
                    weight: 1, opacity: 1, color: 'white', fillOpacity: 0.7
                };
            },
            onEachFeature: function(feature, layer) {
                const countryName = feature.properties.name;
                const jobCount = jobsByCountry[countryName] || 0;
                countryLayers[countryName] = layer;
                layer.bindTooltip(`<strong>${countryName}</strong><br>${jobCount} job${jobCount !== 1 ? 's' : ''}`, { sticky: true });
                layer.on('click', () => selectCountry(countryName));
                layer.on('mouseover', function() { this.setStyle({ weight: 3, fillOpacity: 0.9 }); });
                layer.on('mouseout', function() { if (selectedCountry !== countryName) this.setStyle({ weight: 1, fillOpacity: 0.7 }); });
            }
        }).addTo(map);
    } catch (error) {
        console.error('Error loading map:', error);
    }
}

function selectCountry(countryName) {
    selectedCountry = countryName;
    const countryJobs = allJobs.filter(job => extractCountry(job.location) === countryName);
    
    document.getElementById('countryName').textContent = countryName;
    document.getElementById('countryJobCount').textContent = countryJobs.length;
    document.getElementById('selectedCountryBanner').classList.add('active');
    
    Object.entries(countryLayers).forEach(([name, layer]) => {
        if (name === countryName) {
            layer.setStyle({ weight: 4, color: '#e74c3c', fillOpacity: 0.9 });
            map.fitBounds(layer.getBounds(), { padding: [50, 50] });
        } else {
            layer.setStyle({ weight: 1, color: 'white', fillOpacity: 0.4 });
        }
    });
    
    displayJobs(countryJobs);
    document.getElementById('selectedCountryBanner').scrollIntoView({ behavior: 'smooth' });
}

function clearCountrySelection() {
    selectedCountry = null;
    document.getElementById('selectedCountryBanner').classList.remove('active');
    document.getElementById('jobsGrid').classList.remove('active');
    document.getElementById('jobsList').classList.remove('active');
    map.setView([30, 0], 2);
    
    Object.entries(countryLayers).forEach(([name, layer]) => {
        const jobCount = allJobs.filter(job => extractCountry(job.location) === name).length;
        const color = jobCount === 0 ? '#ecf0f1' : jobCount <= 4 ? '#3498db' : jobCount <= 9 ? '#f39c12' : '#27ae60';
        layer.setStyle({ fillColor: color, weight: 1, color: 'white', fillOpacity: 0.7 });
    });
}

function showAllJobs() {
    selectedCountry = 'All Countries';
    document.getElementById('countryName').textContent = 'All Countries';
    document.getElementById('countryJobCount').textContent = allJobs.length;
    document.getElementById('selectedCountryBanner').classList.add('active');
    map.setView([30, 0], 2);
    displayJobs(allJobs);
    document.getElementById('selectedCountryBanner').scrollIntoView({ behavior: 'smooth' });
}

function showRemoteJobs() {
    selectedCountry = 'Remote';
    const remoteJobs = allJobs.filter(job => job.locationType === 'remote');
    document.getElementById('countryName').textContent = 'Remote Positions Worldwide';
    document.getElementById('countryJobCount').textContent = remoteJobs.length;
    document.getElementById('selectedCountryBanner').classList.add('active');
    displayJobs(remoteJobs);
    document.getElementById('selectedCountryBanner').scrollIntoView({ behavior: 'smooth' });
}

function switchView(view) {
    currentView = view;
    document.querySelectorAll('.view-toggle-btn').forEach(btn => {
        btn.classList.remove('active');
        if ((view === 'card' && btn.textContent.includes('Cards')) || (view === 'list' && btn.textContent.includes('List'))) {
            btn.classList.add('active');
        }
    });
    
    let jobsToDisplay = [];
    if (selectedCountry === 'All Countries') {
        jobsToDisplay = allJobs;
    } else if (selectedCountry === 'Remote') {
        jobsToDisplay = allJobs.filter(job => job.locationType === 'remote');
    } else {
        jobsToDisplay = allJobs.filter(job => extractCountry(job.location) === selectedCountry);
    }
    
    if (view === 'card') {
        document.getElementById('jobsGrid').classList.add('active');
        document.getElementById('jobsList').classList.remove('active');
        displayJobsGrid(jobsToDisplay);
    } else {
        document.getElementById('jobsGrid').classList.remove('active');
        document.getElementById('jobsList').classList.add('active');
        displayJobsList(jobsToDisplay);
    }
}

function displayJobs(jobs) {
    if (currentView === 'card') {
        displayJobsGrid(jobs);
    } else {
        displayJobsList(jobs);
    }
}

function displayJobsGrid(jobs) {
    const grid = document.getElementById('jobsGrid');
    grid.classList.add('active');
    document.getElementById('jobsList').classList.remove('active');
    
    if (jobs.length === 0) {
        grid.innerHTML = '<div class="no-jobs">No jobs found.</div>';
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
                <span class="job-badge badge-${job.locationType}">${job.locationType === 'remote' ? '🏠' : job.locationType === 'hybrid' ? '🔄' : '🏢'} ${formatLocationType(job.locationType)}</span>
                <span class="job-badge badge-type">${formatJobType(job.type)}</span>
                ${job.visaSponsorship === 'available' ? '<span class="job-badge badge-visa-yes">🛂 Visa Sponsor</span>' : ''}
                ${job.clearance && job.clearance !== 'none' ? `<span class="job-badge badge-clearance">🔒 ${formatClearance(job.clearance)}</span>` : ''}
            </div>
            <div class="job-posted">Posted ${formatDate(job.posted)}</div>
            <a href="${escapeHtml(job.url)}" target="_blank" rel="noopener noreferrer" class="job-apply">Apply Now →</a>
        </div>
    `).join('');
}

function displayJobsList(jobs) {
    const list = document.getElementById('jobsList');
    const tbody = document.getElementById('jobsTableBody');
    
    document.getElementById('jobsGrid').classList.remove('active');
    list.classList.add('active');
    
    if (jobs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" class="no-jobs">No jobs found.</td></tr>';
        return;
    }
    
    tbody.innerHTML = jobs.map(job => `
        <tr>
            <td><strong>${escapeHtml(job.company)}</strong></td>
            <td>${escapeHtml(job.title)}</td>
            <td>${escapeHtml(job.location)}</td>
            <td><span class="job-badge badge-type">${formatJobType(job.type)}</span></td>
            <td>${formatLevel(job.level)}</td>
            <td><span class="job-badge badge-${job.locationType}">${formatLocationType(job.locationType)}</span></td>
            <td>${formatVisaSponsorship(job.visaSponsorship)}</td>
            <td>${job.clearance && job.clearance !== 'none' ? `<span class="job-badge badge-clearance">${formatClearance(job.clearance)}</span>` : '<span class="job-badge badge-location">None</span>'}</td>
            <td>${formatDate(job.posted)}</td>
            <td><a href="${escapeHtml(job.url)}" target="_blank" class="table-job-link">Apply</a></td>
        </tr>
    `).join('');
}

function formatLevel(level) {
    return { 'junior': 'Junior', 'mid': 'Mid', 'senior': 'Senior', 'principal': 'Principal', 'lead': 'Lead' }[level] || level;
}

function formatLocationType(type) {
    return { 'remote': 'Remote', 'hybrid': 'Hybrid', 'onsite': 'Onsite' }[type] || type;
}

function formatJobType(type) {
    return { 'iam': 'IAM', 'security': 'Security', 'architect': 'Architect', 'analyst': 'Analyst', 'consultant': 'Consultant' }[type] || type;
}

function formatClearance(clearance) {
    return { 'secret': 'Secret', 'ts': 'TS', 'ts-sci': 'TS/SCI' }[clearance] || clearance;
}

function formatVisaSponsorship(status) {
    if (status === 'available') {
        return '<span class="job-badge badge-visa-yes">✓ Yes</span>';
    } else if (status === 'not_available') {
        return '<span class="job-badge badge-visa-no">✗ No</span>';
    } else {
        return '<span class="job-badge badge-location">?</span>';
    }
}

function formatDate(dateString) {
    if (!dateString) return 'Recent';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil(Math.abs(now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return date.toLocaleDateString();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', initMap);
