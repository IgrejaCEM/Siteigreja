const express = require('express');
const router = express.Router();
const adminRoutes = require('./admin');
const eventRoutes = require('./events');
const paymentRoutes = require('./payment');
const settingsRoutes = require('./settings');
const authRoutes = require('./auth');
const financialRoutes = require('./financial.routes');
const registrationRoutes = require('./registrations');
const eventProductRoutes = require('./eventProducts');
const lotRoutes = require('./lots');
const uploadRoutes = require('./upload');

// Rotas públicas
router.use('/events', eventRoutes);
router.use('/auth', authRoutes);
router.use('/event-products', eventProductRoutes);
router.use('/upload', uploadRoutes);

// Rotas protegidas
router.use('/admin', adminRoutes);
router.use('/financial', financialRoutes);
router.use('/settings', settingsRoutes);
router.use('/payment', paymentRoutes);
router.use('/registrations', registrationRoutes);
router.use('/payments', paymentRoutes);
router.use('/lots', lotRoutes);

module.exports = router; 