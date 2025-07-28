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
    
    // Cores da Igreja CEM
    const primaryColor = '#6a1b9a'; // Roxo
    const secondaryColor = '#000000'; // Preto
    const accentColor = '#ffd700'; // Dourado
    
    // Header do ingresso
    doc.setFillColor(primaryColor);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    // Logo/Título da Igreja
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('IGREJA CEM', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text('CONNECT CONF 2025', pageWidth / 2, 32, { align: 'center' });
    
    // Linha decorativa
    doc.setDrawColor(accentColor);
    doc.setLineWidth(2);
    doc.line(margin, 45, pageWidth - margin, 45);
    
    // Informações do evento
    doc.setTextColor(secondaryColor);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMAÇÕES DO EVENTO', margin, 65);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Evento: ${eventData?.title || 'Evento'}`, margin, 80);
    doc.text(`Data: ${eventData?.date ? new Date(eventData.date).toLocaleDateString('pt-BR') : 'Data'}`, margin, 90);
    doc.text(`Local: ${eventData?.location || 'Local'}`, margin, 100);
    
    // Informações do participante
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMAÇÕES DO PARTICIPANTE', margin, 125);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nome: ${registrationData?.name || 'Nome'}`, margin, 140);
    doc.text(`Email: ${registrationData?.email || 'Email'}`, margin, 150);
    doc.text(`Telefone: ${registrationData?.phone || 'Telefone'}`, margin, 160);
    
    // Código de inscrição
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('CÓDIGO DE INSCRIÇÃO', margin, 185);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(registrationData?.registration_code || 'CÓDIGO', pageWidth / 2, 200, { align: 'center' });
    
    // QR Code (simulado com texto por enquanto)
    doc.setFontSize(10);
    doc.text('QR Code para Check-in', pageWidth / 2, 220, { align: 'center' });
    
    // Linha decorativa final
    doc.setDrawColor(accentColor);
    doc.setLineWidth(1);
    doc.line(margin, 240, pageWidth - margin, 240);
    
    // Footer
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Apresente este ingresso no evento', pageWidth / 2, 260, { align: 'center' });
    doc.text('Igreja CEM - Todos os direitos reservados', pageWidth / 2, 270, { align: 'center' });
    
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
        backgroundColor: '#6a1b9a',
        '&:hover': {
          backgroundColor: '#4a148c'
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