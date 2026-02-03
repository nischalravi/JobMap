// Global variables
let allJobs = [];
let filteredJobs = [];
let currentSort = { column: 'posted', direction: 'desc' };

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadJobs();
    setupEventListeners();
});

// Load jobs data
async function loadJobs() {
    try {
        const response = await fetch('data/jobs.json');
        const data = await response.json();
        allJobs = data.jobs;
        filteredJobs = [...allJobs];
        updateLastUpdate(data.lastUpdate);
        sortJobs(currentSort.column, currentSort.direction);
        renderJobs();
    } catch (error) {
        console.error('Error loading jobs:', error);
        document.getElementById('jobsBody').innerHTML = `
            <tr>
                <td colspan="8" class="no-results">
                    Unable to load job listings. Please try again later or check the 
                    <a href="https://github.com/nischalravi/iam-jobs" target="_blank">GitHub repository</a>.
                </td>
            </tr>
        `;
    }
}

// Setup event listeners
function setupEventListeners() {
    // Search input
    document.getElementById('search').addEventListener('input', filterJobs);
    
    // Filter dropdowns
    document.getElementById('jobType').addEventListener('change', filterJobs);
    document.getElementById('level').addEventListener('change', filterJobs);
    document.getElementById('location').addEventListener('change', filterJobs);
    document.getElementById('clearance').addEventListener('change', filterJobs);
    
    // Clear filters button
    document.getElementById('clearFilters').addEventListener('click', clearFilters);
    
    // Sortable columns
    document.querySelectorAll('th.sortable').forEach(th => {
        th.addEventListener('click', function() {
            const column = this.dataset.sort;
            const direction = (currentSort.column === column && currentSort.direction === 'asc') ? 'desc' : 'asc';
            sortJobs(column, direction);
            renderJobs();
            updateSortIndicators(column, direction);
        });
    });
}

// Filter jobs based on current filter values
function filterJobs() {
    const searchTerm = document.getElementById('search').value.toLowerCase();
    const jobType = document.getElementById('jobType').value;
    const level = document.getElementById('level').value;
    const location = document.getElementById('location').value;
    const clearance = document.getElementById('clearance').value;
    
    filteredJobs = allJobs.filter(job => {
        // Search filter
        const matchesSearch = !searchTerm || 
            job.title.toLowerCase().includes(searchTerm) ||
            job.company.toLowerCase().includes(searchTerm) ||
            (job.description && job.description.toLowerCase().includes(searchTerm));
        
        // Job type filter
        const matchesType = !jobType || job.type === jobType;
        
        // Level filter
        const matchesLevel = !level || job.level === level;
        
        // Location filter
        const matchesLocation = !location || job.locationType === location;
        
        // Clearance filter
        const matchesClearance = !clearance || 
            (clearance === 'none' && (!job.clearance || job.clearance === 'none')) ||
            (clearance !== 'none' && job.clearance === clearance);
        
        return matchesSearch && matchesType && matchesLevel && matchesLocation && matchesClearance;
    });
    
    renderJobs();
}

// Clear all filters
function clearFilters() {
    document.getElementById('search').value = '';
    document.getElementById('jobType').value = '';
    document.getElementById('level').value = '';
    document.getElementById('location').value = '';
    document.getElementById('clearance').value = '';
    
    filteredJobs = [...allJobs];
    renderJobs();
}

// Sort jobs
function sortJobs(column, direction) {
    currentSort = { column, direction };
    
    filteredJobs.sort((a, b) => {
        let aVal = a[column] || '';
        let bVal = b[column] || '';
        
        // Handle date sorting
        if (column === 'posted') {
            aVal = new Date(aVal);
            bVal = new Date(bVal);
        }
        
        // Handle string sorting
        if (typeof aVal === 'string') {
            aVal = aVal.toLowerCase();
            bVal = bVal.toLowerCase();
        }
        
        if (aVal < bVal) return direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return direction === 'asc' ? 1 : -1;
        return 0;
    });
}

// Update sort indicators
function updateSortIndicators(column, direction) {
    document.querySelectorAll('th.sortable').forEach(th => {
        th.classList.remove('asc', 'desc');
    });
    
    const sortedColumn = document.querySelector(`th[data-sort="${column}"]`);
    if (sortedColumn) {
        sortedColumn.classList.add(direction);
    }
}

// Render jobs to table
function renderJobs() {
    const tbody = document.getElementById('jobsBody');
    const resultCount = document.getElementById('resultCount');
    
    resultCount.textContent = filteredJobs.length;
    
    if (filteredJobs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="no-results">No jobs found matching your filters.</td></tr>';
        return;
    }
    
    tbody.innerHTML = filteredJobs.map(job => `
        <tr>
            <td>${escapeHtml(job.company)}</td>
            <td>${escapeHtml(job.title)}</td>
            <td>${escapeHtml(job.location)}</td>
            <td>${formatLocationType(job.locationType)}</td>
            <td>${formatLevel(job.level)}</td>
            <td>${formatClearance(job.clearance)}</td>
            <td>${formatDate(job.posted)}</td>
            <td><a href="${escapeHtml(job.url)}" target="_blank" rel="noopener noreferrer" class="job-link">Apply</a></td>
        </tr>
    `).join('');
}

// Format location type with badges
function formatLocationType(type) {
    const badges = {
        'remote': '<span class="badge badge-remote">Remote</span>',
        'hybrid': '<span class="badge badge-hybrid">Hybrid</span>',
        'onsite': '<span class="badge badge-onsite">Onsite</span>'
    };
    return badges[type] || type;
}

// Format experience level
function formatLevel(level) {
    const levels = {
        'junior': 'Junior',
        'mid': 'Mid-Level',
        'senior': 'Senior',
        'principal': 'Principal',
        'lead': 'Lead/Manager'
    };
    return levels[level] || level;
}

// Format clearance requirement
function formatClearance(clearance) {
    if (!clearance || clearance === 'none') {
        return '<span class="badge badge-no-clearance">None</span>';
    }
    const clearances = {
        'secret': 'Secret',
        'ts': 'Top Secret',
        'ts-sci': 'TS/SCI'
    };
    return `<span class="badge badge-clearance">${clearances[clearance] || clearance}</span>`;
}

// Format date
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    
    return date.toLocaleDateString();
}

// Update last update timestamp
function updateLastUpdate(timestamp) {
    const lastUpdate = document.getElementById('lastUpdate');
    if (timestamp) {
        const date = new Date(timestamp);
        lastUpdate.textContent = date.toLocaleString();
    } else {
        lastUpdate.textContent = 'Unknown';
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
