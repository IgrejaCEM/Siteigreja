const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const EventProductController = require('../controllers/EventProductController');
const authMiddleware = require('../middlewares/auth');

// Rotas protegidas (requerem autenticação)
router.use(authMiddleware);

// Criar produto
router.post('/', upload.single('image'), EventProductController.create);

// Listar produtos por evento
router.get('/event/:event_id', EventProductController.listByEvent);

// Atualizar produto
router.put('/:id', upload.single('image'), EventProductController.update);

// Deletar produto
router.delete('/:id', EventProductController.delete);

module.exports = router; 