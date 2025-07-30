const express = require('express');
const router = express.Router();
const RegistrationController = require('../controllers/RegistrationController');
const authMiddleware = require('../middlewares/auth');

// Criar inscrição - PÚBLICO (para checkout)
router.post('/', RegistrationController.create);

// Rotas protegidas (apenas para admin)
router.use(authMiddleware);

// Listar inscrições
router.get('/', RegistrationController.list);

// Buscar inscrição por ID
router.get('/:id', RegistrationController.getById);

// Atualizar inscrição
router.put('/:id', RegistrationController.update);

// Deletar inscrição
router.delete('/:id', RegistrationController.delete);

module.exports = router; 