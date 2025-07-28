import React from 'react';
import { Button } from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const TicketGenerator = ({ registrationData, eventData }) => {
  const generateTicket = () => {
    const doc = new jsPDF();
    
    // Configurações do documento
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    
    // Cores do novo design
    const backgroundColor = '#000000'; // Preto
    const textColor = '#ffffff'; // Branco
    const accentColor = '#ffd700'; // Dourado para destaque
    const secondaryColor = '#cccccc'; // Cinza claro para textos secundários
    
    // Fundo preto completo
    doc.setFillColor(backgroundColor);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    
    // Header com logo do evento (se disponível)
    if (eventData?.logo) {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const logoWidth = 60;
          const logoHeight = 60;
          const logoX = margin;
          const logoY = 15;
          
          doc.addImage(img, 'JPEG', logoX, logoY, logoWidth, logoHeight);
        };
        img.src = eventData.logo;
      } catch (error) {
        console.log('Erro ao carregar logo:', error);
      }
    }
    
    // Título da Igreja em branco
    doc.setTextColor(textColor);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('IGREJA CEM', pageWidth / 2, 45, { align: 'center' });
    
    doc.setFontSize(14);
    doc.text('CONNECT CONF 2025', pageWidth / 2, 58, { align: 'center' });
    
    // Linha decorativa branca
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(2);
    doc.line(margin, 70, pageWidth - margin, 70);
    
    // Informações do evento em branco
    doc.setTextColor(textColor);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMAÇÕES DO EVENTO', margin, 80);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Evento: ${eventData?.title || 'Evento'}`, margin, 95);
    doc.text(`Data: ${eventData?.date ? new Date(eventData.date).toLocaleDateString('pt-BR') : 'Data'}`, margin, 105);
    doc.text(`Local: ${eventData?.location || 'Local'}`, margin, 115);
    
    // Informações do participante em branco
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMAÇÕES DO PARTICIPANTE', margin, 140);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nome: ${registrationData?.name || 'Nome'}`, margin, 155);
    doc.text(`Email: ${registrationData?.email || 'Email'}`, margin, 165);
    doc.text(`Telefone: ${registrationData?.phone || 'Telefone'}`, margin, 175);
    
    // Código de inscrição em destaque
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('CÓDIGO DE INSCRIÇÃO', margin, 200);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(registrationData?.registration_code || 'CÓDIGO', pageWidth / 2, 215, { align: 'center' });
    
    // QR Code (simulado)
    doc.setFontSize(10);
    doc.setTextColor(secondaryColor);
    doc.text('QR Code para Check-in', pageWidth / 2, 235, { align: 'center' });
    
    // Linha decorativa branca final
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(1);
    doc.line(margin, 250, pageWidth - margin, 250);
    
    // Footer em branco
    doc.setFontSize(10);
    doc.setTextColor(textColor);
    doc.text('Apresente este ingresso no evento', pageWidth / 2, 270, { align: 'center' });
    doc.text('Igreja CEM - Todos os direitos reservados', pageWidth / 2, 280, { align: 'center' });
    
    // Salvar o PDF
    const fileName = `ingresso_${registrationData?.registration_code || 'evento'}.pdf`;
    doc.save(fileName);
  };

  return (
    <Button
      variant="contained"
      color="primary"
      startIcon={<DownloadIcon />}
      onClick={generateTicket}
      sx={{
        backgroundColor: '#000000',
        '&:hover': {
          backgroundColor: '#333333'
        },
        fontWeight: 'bold',
        borderRadius: 2,
        px: 3,
        py: 1.5
      }}
    >
      Baixar Ingresso
    </Button>
  );
};

export default TicketGenerator; 