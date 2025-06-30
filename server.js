const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3900;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Global data storage
let dummyData = [];
let totalGenerated = 0;

// Categories for random selection
const categories = ['Potensial', 'Tidak Potensial', 'Sangat Potensial'];

// Generate dummy data function
function generateDummyData(count = 100) {
    const data = [];
    
    for (let i = 0; i < count; i++) {
        // Generate random coordinates around Indonesia
        const lat = -11 + Math.random() * 6; // Range: -11 to -5
        const long = 95 + Math.random() * 46; // Range: 95 to 141
        
        // Generate random chlorophyll-a level (0.1 to 2.0)
        const kadarKlorofilA = Math.round((0.1 + Math.random() * 1.9) * 10) / 10;
        
        // Generate random surface temperature (20-32°C)
        const suhuPermukaan = Math.round(20 + Math.random() * 12);
        
        // Random category
        const kategori = categories[Math.floor(Math.random() * categories.length)];
        
        data.push({
            id: totalGenerated + i + 1,
            lat: Math.round(lat * 1000000) / 1000000,
            long: Math.round(long * 1000000) / 1000000,
            kadarKlorofilA: kadarKlorofilA,
            suhuPermukaan: suhuPermukaan,
            kategori: kategori,
            createdAt: new Date().toISOString()
        });
    }
    
    return data;
}

// Routes

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Get all data with pagination
app.get('/api/data', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const results = {};
    
    // Add pagination info
    results.pagination = {
        currentPage: page,
        totalPages: Math.ceil(dummyData.length / limit),
        totalItems: dummyData.length,
        itemsPerPage: limit,
        hasNext: endIndex < dummyData.length,
        hasPrev: startIndex > 0
    };

    // Add range info
    if (dummyData.length > 0) {
        results.pagination.startItem = startIndex + 1;
        results.pagination.endItem = Math.min(endIndex, dummyData.length);
    } else {
        results.pagination.startItem = 0;
        results.pagination.endItem = 0;
    }

    // Get paginated data
    results.data = dummyData.slice(startIndex, endIndex);
    
    res.json(results);
});
// Get all data without pagination
app.get('/api/data/all', (req, res) => {
    res.json(dummyData);
});

// Generate new dummy data
app.post('/api/generate', (req, res) => {
    const count = req.body.count || 100;
    
    try {
        const newData = generateDummyData(count);
        dummyData = dummyData.concat(newData);
        totalGenerated += count;
        
        res.json({
            success: true,
            message: `${count} data dummy berhasil di-generate`,
            newDataCount: count,
            totalData: dummyData.length,
            totalGenerated: totalGenerated,
            generatedAt: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error generating data',
            error: error.message
        });
    }
});

// Get statistics
app.get('/api/stats', (req, res) => {
    const categoryStats = {};
    categories.forEach(cat => {
        categoryStats[cat] = dummyData.filter(item => item.kategori === cat).length;
    });

    res.json({
        totalData: dummyData.length,
        totalGenerated: totalGenerated,
        categoryBreakdown: categoryStats,
        lastGenerated: dummyData.length > 0 ? dummyData[dummyData.length - 1].createdAt : null
    });
});

// Clear all data
app.delete('/api/data', (req, res) => {
    dummyData = [];
    totalGenerated = 0;
    
    res.json({
        success: true,
        message: 'Semua data berhasil dihapus',
        totalData: 0
    });
});

// Export data as CSV
app.get('/api/export', (req, res) => {
    if (dummyData.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Tidak ada data untuk diekspor'
        });
    }

    const headers = ['ID', 'Latitude', 'Longitude', 'Kadar Klorofil-a', 'Suhu Permukaan', 'Kategori', 'Created At'];
    let csvContent = headers.join(',') + '\n';
    
    dummyData.forEach(item => {
        const row = [
            item.id,
            item.lat,
            item.long,
            item.kadarKlorofilA,
            item.suhuPermukaan,
            `"${item.kategori}"`,
            item.createdAt
        ];
        csvContent += row.join(',') + '\n';
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=data-dummy-${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csvContent);
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`API endpoints:`);
    console.log(`- GET /api/data?page=1&limit=10 - Get paginated data`);
    console.log(`- POST /api/generate - Generate new data`);
    console.log(`- GET /api/data/all - Get all data`);
    console.log(`- GET /api/stats - Get statistics`);
    console.log(`- DELETE /api/data - Clear all data`);
    console.log(`- GET /api/export - Export data as CSV`);
});
