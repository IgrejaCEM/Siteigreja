import { Box, Typography, Accordion, AccordionSummary, AccordionDetails, Container, useMediaQuery, useTheme } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ModernHeader from '../components/ModernHeader';

const faqItems = [
  {
    q: 'Quando e onde acontecerá o evento?',
    a: 'O evento acontecerá conforme a data e local definidos no banner do evento. Você pode encontrar essas informações na página do evento específico.'
  },
  {
    q: 'Como faço para comprar um ingresso?',
    a: 'Clique no botão "GARANTA SEU INGRESSO" no card do evento desejado. Você será redirecionado para a página de inscrição, onde poderá escolher o tipo de ingresso e realizar o pagamento.'
  },
  {
    q: 'Quais as formas de pagamento?',
    a: 'Aceitamos cartão de crédito (com opção de parcelamento), PIX e boleto bancário. O pagamento é processado de forma segura através de nossa plataforma.'
  },
  {
    q: 'Posso transferir meu ingresso?',
    a: 'Sim! Você pode transferir seu ingresso para outra pessoa. Para isso, acesse sua conta, vá até a seção "Meus Ingressos" e selecione a opção de transferência. Cada ingresso pode ser transferido apenas uma vez.'
  },
  {
    q: 'O ingresso dá direito a todas as sessões do evento?',
    a: 'Sim! O ingresso dá direito a todas as sessões do evento no período contratado. Consulte a programação completa na página do evento.'
  },
  {
    q: 'O ingresso inclui hospedagem e alimentação?',
    a: 'Não. O ingresso dá acesso apenas ao evento. A hospedagem e alimentação são de responsabilidade de cada participante. Teremos espaço para alimentação dentro do evento com opções variadas.'
  },
  {
    q: 'Quais documentos preciso apresentar no check-in?',
    a: 'Você precisa apresentar apenas o ingresso impresso ou o QR Code em seu smartphone. Recomendamos também levar um documento com foto para identificação.'
  },
  {
    q: 'Posso alterar as informações do meu ingresso?',
    a: 'Sim, você pode editar as informações do seu ingresso uma vez. Para isso, acesse sua conta, vá até a seção "Meus Ingressos" e selecione a opção de edição.'
  },
  {
    q: 'Qual a política de reembolso?',
    a: 'Os ingressos podem ser cancelados em até 7 dias após a compra, conforme o Código de Defesa do Consumidor. Após esse período, não há reembolso, mas você pode transferir o ingresso para outra pessoa.'
  },
  {
    q: 'Qual a classificação etária do evento?',
    a: 'Não recomendamos a participação de crianças menores de 12 anos, pois não temos estrutura específica para o público infantil. Crianças a partir de 2 anos pagam ingresso integral e devem estar acompanhadas dos pais.'
  }
];

export default function FAQ({ darkMode, onToggleTheme }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <ModernHeader darkMode={darkMode} onToggleTheme={onToggleTheme} />
      <Container maxWidth="md" sx={{ pt: { xs: 12, sm: 16 }, pb: 8, bgcolor: 'transparent' }}>
        <Typography
          variant={isMobile ? 'h4' : 'h3'}
          align="center"
          gutterBottom
          sx={{
            fontWeight: 900,
            mb: 6,
            background: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          PERGUNTAS FREQUENTES
        </Typography>
        <Box sx={{ mt: 4 }}>
          {faqItems.map((item, idx) => (
            <Accordion
              key={idx}
              sx={{
                mb: 2,
                bgcolor: 'background.paper',
                borderRadius: '8px !important',
                '&:before': { display: 'none' },
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  '& .MuiAccordionSummary-content': {
                    my: 1,
                  },
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {item.q}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" color="text.secondary">
                  {item.a}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Container>
    </Box>
  );
} 