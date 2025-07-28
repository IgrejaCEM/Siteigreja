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
              const logoWidth = 50; // Diminuído de 60 para 50
              const logoHeight = 50; // Diminuído de 60 para 50
              const logoX = pageWidth / 2 - logoWidth / 2; // Centralizado
              const logoY = 8; // Diminuído de 10 para 8
              
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
    doc.line(margin, 65, pageWidth - margin, 65); // Diminuído de 80 para 65
    
    // Informações do evento em branco
    doc.setTextColor(textColor);
    doc.setFontSize(14); // Diminuído de 16 para 14
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMAÇÕES DO EVENTO', margin, 80); // Diminuído de 95 para 80
    
    doc.setFontSize(10); // Diminuído de 12 para 10
    doc.setFont('helvetica', 'normal');
    doc.text(`Evento: ${eventData?.title || 'Evento'}`, margin, 92); // Diminuído de 110 para 92
    doc.text(`Data: ${eventData?.date ? new Date(eventData.date).toLocaleDateString('pt-BR') : 'Data'}`, margin, 100); // Diminuído de 120 para 100
    doc.text(`Local: ${eventData?.location || 'Local'}`, margin, 108); // Diminuído de 130 para 108
    
    // Informações do participante em branco
    doc.setFontSize(14); // Diminuído de 16 para 14
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMAÇÕES DO PARTICIPANTE', margin, 125); // Diminuído de 155 para 125
    
    doc.setFontSize(10); // Diminuído de 12 para 10
    doc.setFont('helvetica', 'normal');
    doc.text(`Nome: ${registrationData?.name || 'Nome'}`, margin, 137); // Diminuído de 170 para 137
    doc.text(`Email: ${registrationData?.email || 'Email'}`, margin, 145); // Diminuído de 180 para 145
    doc.text(`Telefone: ${registrationData?.phone || 'Telefone'}`, margin, 153); // Diminuído de 190 para 153
    
    // Código de inscrição em destaque
    doc.setFontSize(14); // Diminuído de 16 para 14
    doc.setFont('helvetica', 'bold');
    doc.text('CÓDIGO DE INSCRIÇÃO', margin, 170); // Diminuído de 215 para 170
    
    // Fundo branco para o código
    doc.setFillColor('#ffffff');
    doc.rect(margin, 175, pageWidth - 2 * margin, 15, 'F'); // Diminuído altura de 20 para 15
    
    doc.setFontSize(12); // Diminuído de 14 para 12
    doc.setFont('helvetica', 'normal');
    doc.setTextColor('#000000'); // Texto preto no fundo branco
    
    // Verificar se temos o código real
    const codeToShow = registrationData?.registration_code || 'CÓDIGO-NÃO-ENCONTRADO';
    console.log('🎫 Código para mostrar:', codeToShow);
    doc.text(codeToShow, pageWidth / 2, 184, { align: 'center' }); // Diminuído de 233 para 184
    
    // QR Code real
    if (registrationData?.registration_code) {
      try {
        console.log('🎫 Gerando QR Code para:', registrationData.registration_code);
        const qrCodeDataURL = await QRCode.toDataURL(registrationData.registration_code, {
          width: 80, // Diminuído de 100 para 80
          margin: 2,
          color: {
            dark: '#ffffff', // Pontos brancos (invertido)
            light: '#000000'  // Fundo preto (invertido)
          }
        });
        
        // Fundo branco para o QR Code
        doc.setFillColor('#ffffff');
        doc.rect(margin, 195, pageWidth - 2 * margin, 90, 'F'); // Diminuído altura de 120 para 90
        
        // Adicionar QR Code (agora com pontos brancos no fundo preto, mas sobre fundo branco do PDF)
        doc.addImage(qrCodeDataURL, 'PNG', pageWidth / 2 - 40, 200, 80, 80); // Diminuído tamanho e posição
        
        // Texto abaixo do QR Code
        doc.setFontSize(8); // Diminuído de 10 para 8
        doc.setTextColor('#000000');
        doc.text('QR Code para Check-in', pageWidth / 2, 295, { align: 'center' }); // Diminuído de 375 para 295
        
      } catch (error) {
        console.log('❌ Erro ao gerar QR Code:', error);
        
        // Fallback: texto simples
        doc.setFillColor('#ffffff');
        doc.rect(margin, 195, pageWidth - 2 * margin, 20, 'F'); // Diminuído altura
        doc.setFontSize(8); // Diminuído de 10 para 8
        doc.setTextColor('#000000');
        doc.text('QR Code para Check-in', pageWidth / 2, 205, { align: 'center' }); // Diminuído posição
      }
    } else {
      console.log('❌ Nenhum código de inscrição encontrado para QR Code');
      // Fallback: texto simples
      doc.setFillColor('#ffffff');
      doc.rect(margin, 195, pageWidth - 2 * margin, 20, 'F'); // Diminuído altura
      doc.setFontSize(8); // Diminuído de 10 para 8
      doc.setTextColor('#000000');
      doc.text('QR Code não disponível', pageWidth / 2, 205, { align: 'center' }); // Diminuído posição
    }
    
    // Linha decorativa branca final
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(1);
    doc.line(margin, 310, pageWidth - margin, 310); // Diminuído de 385 para 310
    
    // CONNECT CONF 2025 na parte de baixo (GARANTIR QUE APAREÇA)
    doc.setFontSize(16); // Diminuído de 18 para 16
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(textColor);
    doc.text('CONNECT CONF 2025', pageWidth / 2, 325, { align: 'center' }); // Diminuído de 400 para 325
    
    // Footer em branco
    doc.setFontSize(8); // Diminuído de 10 para 8
    doc.setTextColor(textColor);
    doc.text('Apresente este ingresso no evento', pageWidth / 2, 335, { align: 'center' }); // Diminuído de 410 para 335
    doc.text('Igreja CEM - Todos os direitos reservados', pageWidth / 2, 345, { align: 'center' }); // Diminuído de 420 para 345
    
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