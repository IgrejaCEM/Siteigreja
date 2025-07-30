const express = require('express');
const router = express.Router();
const StoreProductController = require('../controllers/StoreProductController');
const auth = require('../middleware/auth');

// Rotas públicas
router.get('/store-products', StoreProductController.getAll);
router.get('/store-products/:id', StoreProductController.getById);

// Rotas protegidas (admin)
router.post('/store-products', auth, StoreProductController.create);
router.put('/store-products/:id', auth, StoreProductController.update);
router.delete('/store-products/:id', auth, StoreProductController.delete);

// Rotas para pedidos da loja
router.post('/store-orders', StoreProductController.createOrder);
router.get('/store-orders', auth, StoreProductController.getOrders);
router.get('/store-orders/:id', auth, StoreProductController.getOrderById);

module.exports = router; 