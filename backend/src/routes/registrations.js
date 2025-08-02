const express = require('express');
const router = express.Router();
const RegistrationController = require('../controllers/RegistrationController');
const authMiddleware = require('../middlewares/auth');
const { db } = require('../database/db');

// Criar inscrição - PÚBLICO (para checkout)
router.post('/', (req, res, next) => {
  console.log('🔔 ROTA /registrations POST chamada!');
  console.log('🔍 Headers recebidos na rota:', req.headers);
  console.log('🔍 Content-Type:', req.headers['content-type']);
  console.log('🔍 Content-Length:', req.headers['content-length']);
  console.log('🔍 Origin:', req.headers['origin']);
  console.log('🔍 User-Agent:', req.headers['user-agent']);
  console.log('📦 Dados recebidos na rota:', JSON.stringify(req.body, null, 2));
  
  try {
    console.log('🔧 Chamando RegistrationController.create...');
    RegistrationController.create(req, res, next);
  } catch (error) {
    console.error('❌ Erro na rota /registrations:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
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

// Verificar status do pagamento
router.get('/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    console.log('🔍 Verificando status do pagamento para orderId:', orderId);
    
    const registration = await db('registrations')
      .where('id', orderId)
      .first();
    
    if (!registration) {
      console.log('❌ Inscrição não encontrada para orderId:', orderId);
      return res.status(404).json({ error: 'Inscrição não encontrada' });
    }
    
    console.log('📊 Status atual:', registration.payment_status);
    
    res.json({
      registration_code: registration.registration_code,
      status: registration.payment_status,
      created_at: registration.created_at
    });
  } catch (error) {
    console.error('❌ Erro ao verificar status:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router; 