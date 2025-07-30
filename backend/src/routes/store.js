const express = require('express');
const router = express.Router();
const StoreProductController = require('../controllers/StoreProductController');
const { authenticateToken } = require('../middleware/auth');

// Rotas públicas
router.get('/store-products', StoreProductController.getAll);
router.get('/store-products/:id', StoreProductController.getById);

// Rotas protegidas (admin)
router.post('/store-products', authenticateToken, StoreProductController.create);
router.put('/store-products/:id', authenticateToken, StoreProductController.update);
router.delete('/store-products/:id', authenticateToken, StoreProductController.delete);

// Rotas para pedidos da loja
router.post('/store-orders', StoreProductController.createOrder);
router.get('/store-orders', authenticateToken, StoreProductController.getOrders);
router.get('/store-orders/:id', authenticateToken, StoreProductController.getOrderById);

module.exports = router; 