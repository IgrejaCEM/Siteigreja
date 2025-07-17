const express = require('express');
const router = express.Router();
const RegistrationController = require('../controllers/RegistrationController');
const authMiddleware = require('../middlewares/auth');

// Rotas protegidas (exemplo, ajuste conforme sua necessidade)
router.use(authMiddleware);

// Criar inscrição
router.post('/', RegistrationController.create);

// Listar inscrições
router.get('/', RegistrationController.list);

// Buscar inscrição por ID
router.get('/:id', RegistrationController.getById);

// Atualizar inscrição
router.put('/:id', RegistrationController.update);

// Deletar inscrição
router.delete('/:id', RegistrationController.delete);

module.exports = router; 