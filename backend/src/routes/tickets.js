const express = require('express');
const router = express.Router();
const { db } = require('../database/db');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Quando montado em /api/tickets, a rota correta deve ser apenas '/:registrationCode/download'
router.get(['/:registrationCode/download', '/tickets/:registrationCode/download'], async (req, res) => {
  try {
    const { registrationCode } = req.params;
    
    console.log('🎫 Gerando ticket para inscrição:', registrationCode);
    
    // Buscar dados da inscrição
    const registration = await db('registrations')
      .where('registration_code', registrationCode)
      .first();
    
    if (!registration) {
      console.log('❌ Inscrição não encontrada:', registrationCode);
      return res.status(404).json({ error: 'Inscrição não encontrada' });
    }
    
    // Buscar dados do evento
    const event = await db('events')
      .where('id', registration.event_id)
      .first();
    
    if (!event) {
      console.log('❌ Evento não encontrado para inscrição:', registrationCode);
      return res.status(404).json({ error: 'Evento não encontrado' });
    }
    
    // Buscar dados do usuário
    const user = await db('users')
      .where('id', registration.user_id)
      .first();
    
    console.log('✅ Dados encontrados, gerando PDF...');
    
    // Criar PDF
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50
    });
    
    // Configurar resposta
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="ticket-${registrationCode}.pdf"`);
    
    // Pipe do PDF para a resposta
    doc.pipe(res);
    
    // Adicionar conteúdo ao PDF
    doc.fontSize(24)
       .text('TICKET DE INSCRIÇÃO', { align: 'center' })
       .moveDown();
    
    doc.fontSize(16)
       .text(`Evento: ${event.name}`)
       .moveDown();
    
    doc.fontSize(14)
       .text(`Código da Inscrição: ${registration.registration_code}`)
       .text(`Nome: ${registration.customer_name}`)
       .text(`Email: ${registration.customer_email}`)
       .text(`Telefone: ${registration.customer_phone}`)
       .moveDown();
    
    if (event.date) {
      doc.text(`Data: ${new Date(event.date).toLocaleDateString('pt-BR')}`)
         .moveDown();
    }
    
    if (event.location) {
      doc.text(`Local: ${event.location}`)
         .moveDown();
    }
    
    // Adicionar QR Code com o código da inscrição
    doc.fontSize(12)
       .text('QR Code para validação:', { align: 'center' })
       .moveDown();
    
    // Aqui você pode adicionar um QR Code real se tiver a biblioteca
    doc.fontSize(10)
       .text(registration.registration_code, { align: 'center' })
       .moveDown();
    
    doc.fontSize(10)
       .text('Este ticket deve ser apresentado na entrada do evento.', { align: 'center' })
       .moveDown();
    
    doc.fontSize(8)
       .text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, { align: 'center' });
    
    // Finalizar PDF
    doc.end();
    
    console.log('✅ PDF gerado com sucesso para:', registrationCode);
    
  } catch (error) {
    console.error('❌ Erro ao gerar ticket:', error);
    res.status(500).json({ error: 'Erro ao gerar ticket' });
  }
});

// Rota para verificar status da inscrição
router.get('/tickets/:registrationCode/status', async (req, res) => {
  try {
    const { registrationCode } = req.params;
    
    const registration = await db('registrations')
      .where('registration_code', registrationCode)
      .first();
    
    if (!registration) {
      return res.status(404).json({ error: 'Inscrição não encontrada' });
    }
    
    res.json({
      registration_code: registration.registration_code,
      status: registration.status,
      payment_status: registration.payment_status,
      created_at: registration.created_at
    });
    
  } catch (error) {
    console.error('❌ Erro ao verificar status:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router; 