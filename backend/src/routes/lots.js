const express = require('express');
const router = express.Router();
const LotController = require('../controllers/LotController');
const authMiddleware = require('../middlewares/auth');

// Rotas protegidas (requerem autenticação)
router.use(authMiddleware);

// Deletar lote
router.delete('/:id', LotController.delete);

module.exports = router; 