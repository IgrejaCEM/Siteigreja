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
    // Dados do participante vêm direto da tabela registrations
    
    console.log('✅ Dados encontrados, gerando PDF...');
    
    // Criar PDF com layout escuro
    const doc = new PDFDocument({ size: 'A4', margin: 36 });
    
    // Configurar resposta
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="ticket-${registrationCode}.pdf"`);
    
    // Pipe do PDF para a resposta
    doc.pipe(res);
    
    // Fundo preto em toda a página
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    doc.save();
    doc.rect(0, 0, pageWidth, pageHeight).fill('#000000');
    doc.restore();

    // Texto branco
    doc.fillColor('#FFFFFF');

    // Cabeçalho com logo (se houver)
    const logoUrl = event?.logo || event?.banner_evento || event?.banner || null;
    if (logoUrl && logoUrl.startsWith('http')) {
      try {
        const fetch = require('node-fetch');
        const resp = await fetch(logoUrl);
        const buf = Buffer.from(await resp.arrayBuffer());
        const img = doc.openImage(buf);
        const maxWidth = 180;
        const ratio = Math.min(1, maxWidth / img.width);
        const w = img.width * ratio;
        const h = img.height * ratio;
        const x = (pageWidth - w) / 2;
        doc.image(img, x, 36, { width: w, height: h });
        doc.moveDown(2);
      } catch (e) {
        // Se falhar, segue sem logo
      }
    }
    doc.fontSize(24).text('TICKET DE INSCRIÇÃO', { align: 'center' }).moveDown(1.2);
    
    // Informações do evento/participante
    const eventTitle = event?.title || event?.name || 'Evento';
    const customerName = registration?.name || registration?.customer_name || '—';
    const customerEmail = registration?.email || registration?.customer_email || '—';
    const customerPhone = registration?.phone || registration?.customer_phone || '—';
    const eventDate = event?.date ? new Date(event.date).toLocaleDateString('pt-BR') : '';
    const eventLocation = event?.location || '';

    doc.fontSize(14).text(`Evento: ${eventTitle}`).moveDown(0.6);
    
    doc.fontSize(12)
       .text(`Código da Inscrição: ${registration.registration_code}`)
       .text(`Nome: ${customerName}`)
       .text(`Email: ${customerEmail}`)
       .text(`Telefone: ${customerPhone}`)
       .moveDown(0.6);
    
    if (eventDate) doc.text(`Data: ${eventDate}`).moveDown(0.6);
    
    if (eventLocation) doc.text(`Local: ${eventLocation}`).moveDown(1.2);
    
    // QR Code real
    doc.fontSize(12).text('QR Code para validação:', { align: 'center' }).moveDown(0.6);

    try {
      const QRCode = require('qrcode');
      const qrSize = 220;
      const qrBuffer = await QRCode.toBuffer(registration.registration_code, {
        errorCorrectionLevel: 'H',
        width: qrSize,
        color: { dark: '#000000', light: '#FFFFFF' }
      });

      // Painel branco centralizado para o QR no fundo preto
      const panelPadding = 16;
      const panelW = qrSize + panelPadding * 2;
      const panelH = qrSize + panelPadding * 2;
      const panelX = (pageWidth - panelW) / 2;
      const currentY = doc.y;
      const panelY = currentY;

      doc.save();
      doc.rect(panelX, panelY, panelW, panelH).fill('#FFFFFF');
      doc.restore();
      // Inserir QR dentro do painel
      const qrX = panelX + panelPadding;
      const qrY = panelY + panelPadding;
      const img = doc.openImage(qrBuffer);
      doc.image(img, qrX, qrY, { width: qrSize, height: qrSize });
      doc.moveDown( (panelH / 12) );
    } catch (e) {
      console.log('⚠️ Falha ao gerar QR Code, usando código textual:', e.message);
      doc.fontSize(10).text(registration.registration_code, { align: 'center' }).moveDown(0.8);
    }
    
    doc.fontSize(10).text('Este ticket deve ser apresentado na entrada do evento.', { align: 'center' }).moveDown(0.8);
    
    doc.fontSize(8).text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, { align: 'center' });
    
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