import React, { useState } from 'react';
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function FAQSection() {
  const [expanded, setExpanded] = useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const faqItems = [
    {
      question: "Quando e onde acontecerá a Connect Conf 2025?",
      answer: "A Connect Conf 2025 acontecerá nos dias 24 e 25 de outubro de 2025, com início às 19h, na Igreja CEM - CAJATI, localizada na Av. dos trabalhadores, Nº99 - Centro, Cajati/SP."
    },
    {
      question: "Para quem é a Connect Conf 2025?",
      answer: "A Connect Conf é para todos aqueles que se acham fora do padrão, esquecidos ou desacreditados. É um chamado especial para os improváveis, aqueles que mesmo sendo rejeitados, desacreditados ou esquecidos, mantêm seu coração disponível para Deus."
    },
    {
      question: "Os ingressos dão direito a todas as sessões?",
      answer: "Sim. O ingresso dá direito a todas as sessões da conferência nos dois dias (24 e 25 de outubro)."
    },
    {
      question: "Os ingressos dão direito à hospedagem e alimentação?",
      answer: "Não. A hospedagem e alimentação não estão inclusos no valor do ingresso. Esses são de responsabilidade de cada participante."
    },
    {
      question: "Quais documentos eu apresento na hora do Check-in?",
      answer: "Você precisa levar somente o ingresso impresso ou apresentar o QR Code em seu smartphone."
    },
    {
      question: "Quais as formas de pagamento?",
      answer: "O pagamento pode ser feito através de cartão de crédito (com opção de parcelamento), PIX ou Boleto Bancário."
    },
    {
      question: "Posso alterar as informações do meu ingresso?",
      answer: "Para editar as informações em seu ingresso você deverá entrar no link do seu ingresso, efetuar login com o e-mail utilizado na compra e atualizar os dados do participante. Cada ingresso é individual e pode ser alterado apenas uma vez."
    }
  ];

  return (
    <Box
      id="faq"
      sx={{
        width: '100%',
        background: '#fff',
        py: 10,
        mt: 0, // Garantindo que não tenha margem superior
        px: { xs: 2, sm: 4, md: 8 },
        scrollMarginTop: "100px"
      }}
    >
      <Box
        sx={{
          maxWidth: 1200,
          margin: '0 auto',
          mb: 6,
          textAlign: 'center'
        }}
      >
        <Typography
          variant="h2"
          sx={{
            fontSize: { xs: '2.5rem', md: '3.5rem' },
            fontWeight: 900,
            color: '#000',
            mb: 4,
            textTransform: 'uppercase',
            letterSpacing: '0.02em'
          }}
        >
          Perguntas Frequentes
        </Typography>
      </Box>

      <Box sx={{ maxWidth: 900, margin: '0 auto' }}>
        {faqItems.map((item, index) => (
          <Accordion
            key={index}
            expanded={expanded === `panel${index}`}
            onChange={handleChange(`panel${index}`)}
            sx={{
              background: 'transparent',
              boxShadow: 'none',
              '&:before': {
                display: 'none',
              },
              mb: 2,
              border: '1px solid rgba(0,0,0,0.1)',
              borderRadius: '8px !important',
              overflow: 'hidden',
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                background: 'rgba(0,0,0,0.02)',
                '&:hover': {
                  background: 'rgba(0,0,0,0.04)',
                },
              }}
            >
              <Typography
                sx={{
                  fontSize: { xs: '1.1rem', md: '1.3rem' },
                  fontWeight: 600,
                  color: '#000'
                }}
              >
                {item.question}
              </Typography>
            </AccordionSummary>
            <AccordionDetails
              sx={{
                p: 3,
                background: '#fff'
              }}
            >
              <Typography
                sx={{
                  fontSize: { xs: '1rem', md: '1.1rem' },
                  color: '#666',
                  lineHeight: 1.6
                }}
              >
                {item.answer}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Box>
  );
} 