









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
const express = require('express');
const cors = require('cors');
require('dotenv').config();


// Import routes

const app = express();
const PORT = 5000

// Middleware
app.use(cors("http://localhost:5173"));
app.use(express.json());
const adminRoutes=require('./routes/adminRoutes');

app.use('/api/admin',adminRoutes);



// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
          