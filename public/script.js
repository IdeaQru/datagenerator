// Global variables
let currentPage = 1;
let itemsPerPage = 10;
let totalData = 0;

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    loadTableData();
    loadStats();
});

// API Base URL
const API_BASE = '/api';

// Show specific page
function showPage(pageName) {
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    
    // Remove active class from all nav buttons
    const navButtons = document.querySelectorAll('.nav-button');
    navButtons.forEach(btn => btn.classList.remove('active'));
    
    // Show selected page
    document.getElementById(pageName + 'Page').classList.add('active');
    
    // Activate corresponding nav button
    if (pageName === 'generator') {
        document.getElementById('generatorBtn').classList.add('active');
    } else if (pageName === 'table') {
        document.getElementById('tableBtn').classList.add('active');
        loadTableData();
    } else if (pageName === 'stats') {
        document.getElementById('statsBtn').classList.add('active');
        loadStats();
    }
}

// Generate data via API
async function generateData() {
    const generateBtn = document.getElementById('generateBtn');
    const buttonText = generateBtn.querySelector('.button-text');
    const loadingSpinner = generateBtn.querySelector('.loading-spinner');
    const responseMessage = document.getElementById('responseMessage');
    const dataCountInput = document.getElementById('dataCountInput');
    
    const count = parseInt(dataCountInput.value) || 100;
    
    // Show loading state
    generateBtn.disabled = true;
    buttonText.textContent = 'Generating...';
    loadingSpinner.style.display = 'inline-block';
    responseMessage.style.display = 'none';
    
    try {
        const response = await fetch(`${API_BASE}/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ count: count })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Show success message
            responseMessage.className = 'response-message success';
            responseMessage.textContent = result.message;
            responseMessage.style.display = 'block';
            
            // Update data count in navigation
            document.getElementById('dataCount').textContent = result.totalData;
            
            // Auto switch to table view
            setTimeout(() => {
                showPage('table');
            }, 1500);
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        // Show error message
        responseMessage.className = 'response-message error';
        responseMessage.textContent = 'Error: ' + error.message;
        responseMessage.style.display = 'block';
    } finally {
        // Reset button
        generateBtn.disabled = false;
        buttonText.textContent = 'Generate Data';
        loadingSpinner.style.display = 'none';
    }
}

// Load table data with pagination
async function loadTableData(page = 1) {
    const tableLoading = document.getElementById('tableLoading');
    const tableWrapper = document.getElementById('tableWrapper');
    const emptyState = document.getElementById('emptyState');
    const paginationContainer = document.getElementById('paginationContainer');
    
    // Show loading
    tableLoading.style.display = 'flex';
    tableWrapper.style.display = 'none';
    emptyState.style.display = 'none';
    
    try {
        const response = await fetch(`${API_BASE}/data?page=${page}&limit=${itemsPerPage}`);
        const result = await response.json();
        
        if (result.data && result.data.length > 0) {
            renderTable(result.data);
            renderPagination(result.pagination);
            updatePaginationInfo(result.pagination);
            
            tableWrapper.style.display = 'block';
            totalData = result.pagination.totalItems;
            document.getElementById('dataCount').textContent = totalData;
        } else {
            emptyState.style.display = 'block';
            paginationContainer.innerHTML = '';
            document.getElementById('paginationInfo').textContent = 'Menampilkan 0 - 0 dari 0 data';
        }
    } catch (error) {
        console.error('Error loading data:', error);
        emptyState.style.display = 'block';
    } finally {
        tableLoading.style.display = 'none';
    }
}

// Render table with data
function renderTable(data) {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';
    
    data.forEach(item => {
        const row = document.createElement('tr');
        const categoryClass = item.kategori.toLowerCase().replace(' ', '-');
        const createdAt = new Date(item.createdAt).toLocaleString('id-ID');
        
        row.innerHTML = `
            <td>${item.id}</td>
            <td>${item.lat}</td>
            <td>${item.long}</td>
            <td>${item.kadarKlorofilA}</td>
            <td>${item.suhuPermukaan}</td>
            <td>
                <span class="category-badge ${categoryClass}">
                    ${item.kategori}
                </span>
            </td>
            <td>${createdAt}</td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Render pagination buttons
function renderPagination(pagination) {
    const paginationContainer = document.getElementById('paginationContainer');
    paginationContainer.innerHTML = '';
    
    if (pagination.totalPages <= 1) return;
    
    // Previous button
    const prevBtn = createPaginationButton('‹ Previous', pagination.currentPage - 1, !pagination.hasPrev);
    paginationContainer.appendChild(prevBtn);
    
    // Page numbers
    const startPage = Math.max(1, pagination.currentPage - 2);
    const endPage = Math.min(pagination.totalPages, pagination.currentPage + 2);
    
    if (startPage > 1) {
        paginationContainer.appendChild(createPaginationButton('1', 1));
        if (startPage > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            ellipsis.className = 'pagination-ellipsis';
            paginationContainer.appendChild(ellipsis);
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const isActive = i === pagination.currentPage;
        const pageBtn = createPaginationButton(i.toString(), i, false, isActive);
        paginationContainer.appendChild(pageBtn);
    }
    
    if (endPage < pagination.totalPages) {
        if (endPage < pagination.totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            ellipsis.className = 'pagination-ellipsis';
            paginationContainer.appendChild(ellipsis);
        }
        paginationContainer.appendChild(createPaginationButton(pagination.totalPages.toString(), pagination.totalPages));
    }
    
    // Next button
    const nextBtn = createPaginationButton('Next ›', pagination.currentPage + 1, !pagination.hasNext);
    paginationContainer.appendChild(nextBtn);
}

// Create pagination button
function createPaginationButton(text, page, disabled = false, active = false) {
    const button = document.createElement('button');
    button.textContent = text;
    button.className = `pagination-button ${active ? 'active' : ''}`;
    button.disabled = disabled;
    
    if (!disabled) {
        button.onclick = () => {
            currentPage = page;
            loadTableData(page);
        };
    }
    
    return button;
}

// Update pagination info
function updatePaginationInfo(pagination) {
    const paginationInfo = document.getElementById('paginationInfo');
    paginationInfo.textContent = `Menampilkan ${pagination.startItem} - ${pagination.endItem} dari ${pagination.totalItems} data`;
}

// Change items per page
function changeItemsPerPage() {
    const select = document.getElementById('itemsPerPage');
    itemsPerPage = parseInt(select.value);
    currentPage = 1;
    loadTableData(1);
}

// Export data as CSV
async function exportData() {
    try {
        const response = await fetch(`${API_BASE}/export`);
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `data-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } else {
            const error = await response.json();
            alert(error.message || 'Error exporting data');
        }
    } catch (error) {
        alert('Error exporting data: ' + error.message);
    }
}

// Clear all data
async function clearData() {
    if (!confirm('Apakah Anda yakin ingin menghapus semua data?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/data`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert(result.message);
            document.getElementById('dataCount').textContent = '0';
            loadTableData();
            loadStats();
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        alert('Error clearing data: ' + error.message);
    }
}

// Load statistics
async function loadStats() {
    try {
        const response = await fetch(`${API_BASE}/stats`);
        const stats = await response.json();
        
        renderStats(stats);
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Render statistics
function renderStats(stats) {
    const statsGrid = document.getElementById('statsGrid');
    statsGrid.innerHTML = '';
    
    // Total Data Card
    const totalCard = createStatCard('Total Data', stats.totalData, 'Total data yang tersimpan di database');
    statsGrid.appendChild(totalCard);
    
    // Total Generated Card
    const generatedCard = createStatCard('Total Generated', stats.totalGenerated, 'Total data yang pernah di-generate');
    statsGrid.appendChild(generatedCard);
    
    // Category breakdown
    Object.entries(stats.categoryBreakdown).forEach(([category, count]) => {
        const categoryCard = createStatCard(category, count, `Jumlah data dengan kategori ${category}`);
        statsGrid.appendChild(categoryCard);
    });
    
    // Last Generated Card
    if (stats.lastGenerated) {
        const lastGenerated = new Date(stats.lastGenerated).toLocaleString('id-ID');
        const lastCard = createStatCard('Last Generated', lastGenerated, 'Waktu terakhir data di-generate', true);
        statsGrid.appendChild(lastCard);
    }
}

// Create stat card
function createStatCard(title, value, description, isText = false) {
    const card = document.createElement('div');
    card.className = 'stat-card';
    
    card.innerHTML = `
        <h3>${title}</h3>
        <div class="stat-value ${isText ? 'text-value' : ''}">${value}</div>
        <div class="stat-description">${description}</div>
    `;
    
    return card;
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl + G for generate
    if (e.ctrlKey && e.key === 'g') {
        e.preventDefault();
        if (document.getElementById('generatorPage').classList.contains('active')) {
            generateData();
        }
    }
    
    // Ctrl + E for export
    if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        exportData();
    }
    
    // Ctrl + R for refresh table
    if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        if (document.getElementById('tablePage').classList.contains('active')) {
            loadTableData(currentPage);
        }
    }
});

// Auto refresh data count every 30 seconds
setInterval(async () => {
    try {
        const response = await fetch(`${API_BASE}/stats`);
        const stats = await response.json();
        document.getElementById('dataCount').textContent = stats.totalData;
    } catch (error) {
        console.error('Error auto-refreshing stats:', error);
    }
}, 30000);
