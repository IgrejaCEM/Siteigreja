const express = require('express');
const router = express.Router();
const RegistrationController = require('../controllers/RegistrationController');
const authMiddleware = require('../middlewares/auth');

// Criar inscrição - PÚBLICO (para checkout)
router.post('/', (req, res, next) => {
  console.log('🔔 ROTA /registrations POST chamada!');
  console.log('📦 Dados recebidos na rota:', JSON.stringify(req.body, null, 2));
  RegistrationController.create(req, res, next);
});

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