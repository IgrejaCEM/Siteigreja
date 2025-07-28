import React from 'react';
import { Button } from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import QRCode from 'qrcode';

const TicketGenerator = ({ registrationData, eventData }) => {
  const generateTicket = async () => {
    console.log('🎫 Gerando ticket com dados:', { registrationData, eventData });
    
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
        // Carregar logo de forma síncrona
        const loadLogo = () => {
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
              const logoWidth = 60;
              const logoHeight = 60;
              const logoX = pageWidth / 2 - logoWidth / 2; // Centralizado
              const logoY = 10; // Subido de 15 para 10
              
              doc.addImage(img, 'JPEG', logoX, logoY, logoWidth, logoHeight);
              resolve();
            };
            img.onerror = () => {
              console.log('Erro ao carregar logo, continuando sem logo');
              resolve();
            };
            img.src = eventData.logo;
          });
        };
        
        await loadLogo();
      } catch (error) {
        console.log('Erro ao carregar logo:', error);
      }
    }
    
    // Linha decorativa branca
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(2);
    doc.line(margin, 80, pageWidth - margin, 80);
    
    // Informações do evento em branco
    doc.setTextColor(textColor);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMAÇÕES DO EVENTO', margin, 95);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Evento: ${eventData?.title || 'Evento'}`, margin, 110);
    doc.text(`Data: ${eventData?.date ? new Date(eventData.date).toLocaleDateString('pt-BR') : 'Data'}`, margin, 120);
    doc.text(`Local: ${eventData?.location || 'Local'}`, margin, 130);
    
    // Informações do participante em branco
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMAÇÕES DO PARTICIPANTE', margin, 155);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nome: ${registrationData?.name || 'Nome'}`, margin, 170);
    doc.text(`Email: ${registrationData?.email || 'Email'}`, margin, 180);
    doc.text(`Telefone: ${registrationData?.phone || 'Telefone'}`, margin, 190);
    
    // Código de inscrição em destaque
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('CÓDIGO DE INSCRIÇÃO', margin, 215);
    
    // Fundo branco para o código
    doc.setFillColor('#ffffff');
    doc.rect(margin, 220, pageWidth - 2 * margin, 20, 'F');
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor('#000000'); // Texto preto no fundo branco
    
    // Verificar se temos o código real
    const codeToShow = registrationData?.registration_code || 'CÓDIGO-NÃO-ENCONTRADO';
    console.log('🎫 Código para mostrar:', codeToShow);
    doc.text(codeToShow, pageWidth / 2, 233, { align: 'center' });
    
    // QR Code real
    if (registrationData?.registration_code) {
      try {
        console.log('🎫 Gerando QR Code para:', registrationData.registration_code);
        const qrCodeDataURL = await QRCode.toDataURL(registrationData.registration_code, {
          width: 100,
          margin: 2,
          color: {
            dark: '#ffffff', // Pontos brancos (invertido)
            light: '#000000'  // Fundo preto (invertido)
          }
        });
        
        // Fundo branco para o QR Code
        doc.setFillColor('#ffffff');
        doc.rect(margin, 245, pageWidth - 2 * margin, 120, 'F');
        
        // Adicionar QR Code (agora com pontos brancos no fundo preto, mas sobre fundo branco do PDF)
        doc.addImage(qrCodeDataURL, 'PNG', pageWidth / 2 - 50, 250, 100, 100);
        
        // Texto abaixo do QR Code
        doc.setFontSize(10);
        doc.setTextColor('#000000');
        doc.text('QR Code para Check-in', pageWidth / 2, 375, { align: 'center' });
        
      } catch (error) {
        console.log('❌ Erro ao gerar QR Code:', error);
        
        // Fallback: texto simples
        doc.setFillColor('#ffffff');
        doc.rect(margin, 245, pageWidth - 2 * margin, 30, 'F');
        doc.setFontSize(10);
        doc.setTextColor('#000000');
        doc.text('QR Code para Check-in', pageWidth / 2, 260, { align: 'center' });
      }
    } else {
      console.log('❌ Nenhum código de inscrição encontrado para QR Code');
      // Fallback: texto simples
      doc.setFillColor('#ffffff');
      doc.rect(margin, 245, pageWidth - 2 * margin, 30, 'F');
      doc.setFontSize(10);
      doc.setTextColor('#000000');
      doc.text('QR Code não disponível', pageWidth / 2, 260, { align: 'center' });
    }
    
    // Linha decorativa branca final
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(1);
    doc.line(margin, 385, pageWidth - margin, 385);
    
    // CONNECT CONF 2025 na parte de baixo (GARANTIR QUE APAREÇA)
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(textColor);
    doc.text('CONNECT CONF 2025', pageWidth / 2, 400, { align: 'center' });
    
    // Footer em branco
    doc.setFontSize(10);
    doc.setTextColor(textColor);
    doc.text('Apresente este ingresso no evento', pageWidth / 2, 410, { align: 'center' });
    doc.text('Igreja CEM - Todos os direitos reservados', pageWidth / 2, 420, { align: 'center' });
    
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