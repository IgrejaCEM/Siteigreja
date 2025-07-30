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
const storeRoutes = require('./store');

// Rotas públicas
router.use('/events', eventRoutes);
router.use('/auth', authRoutes);
router.use('/event-products', eventProductRoutes);
router.use('/upload', uploadRoutes);
router.use('/', storeRoutes); // Rotas da loja

// Rotas protegidas
router.use('/admin', adminRoutes);
router.use('/financial', financialRoutes);
router.use('/settings', settingsRoutes);
router.use('/payments', paymentRoutes);
router.use('/registrations', registrationRoutes);
router.use('/lots', lotRoutes);

module.exports = router; 