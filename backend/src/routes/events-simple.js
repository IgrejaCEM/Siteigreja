const express = require('express');
const router = express.Router();
const { db } = require('../database/db');

// Endpoint unificado para inscrição e pagamento
router.post('/:id/inscricao-unificada', async (req, res) => {
  console.log('🚀 INICIANDO INSCRIÇÃO ULTRA-ROBUSTA');
  console.log('📦 Dados recebidos:', JSON.stringify(req.body, null, 2));
  
  try {
    const { id } = req.params;
    const { participantes, payment_method, lot_id, products = [] } = req.body;
    
    console.log('🔍 Dados extraídos:', { id, payment_method, lot_id, participantesCount: participantes?.length });
    
    if (!Array.isArray(participantes) || participantes.length === 0) {
      return res.status(400).json({ error: 'Nenhum participante informado.' });
    }
    
    // Verificar se o evento existe
    const event = await db('events').where('id', id).first();
    if (!event) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }
    
    console.log('✅ Evento encontrado:', event.title);
    
    // Buscar o lote selecionado
    const selectedLot = await db('lots')
      .where('id', lot_id)
      .andWhere('event_id', id)
      .first();
      
    if (!selectedLot) {
      return res.status(400).json({ error: 'Lote selecionado inválido' });
    }
    
    console.log('✅ Lote encontrado:', selectedLot.name, 'Preço:', selectedLot.price);
    
    // Criar inscrição simples
    const registrationCode = `REG-${Date.now()}`;
    const inscricoesIds = [];
    
    for (const participante of participantes) {
      const inscricaoData = {
        event_id: id,
        lot_id: selectedLot.id,
        name: participante.name,
        email: participante.email,
        phone: participante.phone,
        cpf: participante.cpf || null,
        status: 'confirmed',
        payment_status: 'paid',
        registration_code: registrationCode,
        created_at: new Date(),
        updated_at: new Date(),
        form_data: JSON.stringify(participante)
      };
      
      const [inscricaoId] = await db('registrations').insert(inscricaoData).returning('id');
      inscricoesIds.push(inscricaoId);
      console.log('✅ Inscrição criada:', inscricaoId);
    }
    
    // Atualizar quantidade do lote
    await db('lots')
      .where('id', selectedLot.id)
      .update({
        quantity: db.raw(`quantity - ${participantes.length}`),
        updated_at: new Date()
      });
    
    console.log('✅ Quantidade do lote atualizada');
    
    const response = {
      success: true,
      registration_code: registrationCode,
      inscricoes: inscricoesIds,
      message: 'Inscrição realizada com sucesso!'
    };
    
    console.log('📤 Resposta:', response);
    res.json(response);
    
  } catch (error) {
    console.error('❌ Erro na inscrição:', error);
    console.error('📋 Stack:', error.stack);
    res.status(500).json({
      error: 'Erro na inscrição',
      details: error.message,
      stack: error.stack
    });
  }
});

module.exports = router; 