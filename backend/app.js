









// Protected routes
// router.use(authenticateToken);

// // User routes
// router.get('/all', LeadController.getAllLeads);
// router.get('/dashboard', LeadController.getDashboardLeads);
// router.get('/transferred', LeadController.getTransferredLeads);
// router.get('/:id', LeadController.getLeadDetails);
// router.post('/:id/take', LeadController.takeLead);
// router.post('/:id/transfer', LeadController.transferLead);
// router.put('/:id', LeadController.updateLead);

// // Admin only routes
// router.post('/', requireAdmin, LeadController.createLead);
// router.delete('/:id', requireAdmin, LeadController.deleteLead);

// module.exports = router;

// routes/history.js


// routes/users.js


// server.js

// Backend - app.js (Simplified without Socket.io)
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('🚨 Server Error:', err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Admin API: http://localhost:${PORT}/api/admin`);
  console.log(`👥 User API: http://localhost:${PORT}/api/user`);
});

module.exports = app;