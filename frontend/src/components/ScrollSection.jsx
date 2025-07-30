import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';

export default function ScrollSection() {
  const sectionRef = useRef(null);
  const textRef = useRef(null);
  const wordsRefs = useRef([]);
  const [imageVersion, setImageVersion] = useState(Date.now()); // Para cache-busting

  // Função para gerar URL da imagem com cache-busting
  const getImageUrl = (imgNumber) => {
    const basePath = `/images_site/${imgNumber}`;
    const extensions = ['.jpg', '.jpeg', '.png', '.webp'];
    
    // Tenta diferentes extensões
    for (const ext of extensions) {
      const url = `${basePath}${ext}?v=${imageVersion}`;
      return url;
    }
    
    // Fallback
    return `${basePath}.jpg?v=${imageVersion}`;
  };

  // Função para recarregar imagens
  const reloadImages = () => {
    setImageVersion(Date.now());
  };

  // Recarregar imagens quando o componente montar
  useEffect(() => {
    reloadImages();
  }, []);

  const handleScroll = () => {
    try {
      // Verificar se os elementos existem antes de usar
      if (!sectionRef.current || !textRef.current) {
        console.log('⚠️ Elementos do ScrollSection não encontrados');
        return;
      }

      const windowHeight = window.innerHeight;
      const sectionRect = sectionRef.current.getBoundingClientRect();
      const sectionHeight = sectionRef.current.offsetHeight;

      // Progresso da seção preta na tela (0 = início, 1 = final)
      const progress = Math.max(0, Math.min(1, (windowHeight - sectionRect.top) / (sectionHeight + windowHeight)));

      // Efeito de entrada: frase sobe de baixo para o centro
      let translateY = 0;
      let containerOpacity = 1;
      const entryStart = 0.28; // Agora começa após 25% do progresso
      const entryTranslate = 1300; // valor inicial de 750px para subir bem de baixo
      if (progress < entryStart) {
        // Nos primeiros 25%, a frase sube de baixo e faz fade in
        translateY = (1 - progress / entryStart) * entryTranslate;
        containerOpacity = progress / entryStart;
      } else if (progress > 0.75) {
        // No final, a frase sobe para cima (efeito de saída)
        translateY = -((progress - 0.85) / 0.15) * 10;
      } else {
        // Centralizada
        translateY = 0;
      }
      
      // Aplicar transformações com verificação de segurança
      if (textRef.current) {
        textRef.current.style.position = 'fixed';
        textRef.current.style.top = '50%';
        textRef.current.style.left = '50%';
        textRef.current.style.transform = `translate(-50%, -50%) translateY(${translateY}px)`;
        textRef.current.style.opacity = (progress > 0 && progress < 0.9) ? containerOpacity : 0;
      }

      // Desaparecimento linha por linha no final
      const fadeStart = 0.75;
      const fadeProgress = progress > fadeStart ? (progress - fadeStart) / 0.15 : 0;
      
      wordsRefs.current.forEach((word, idx) => {
        if (!word) return;
        
        try {
          // 3 linhas: 0-4, 5-8, 9 (finalPhrase)
          let line = 0;
          if (idx > 4 && idx < 9) line = 1;
          if (idx >= 9) line = 2;
          // Inverter a ordem do fade: de baixo para cima
          let fadeOrder = 2 - line;
          let lineFade = 1;
          if (progress < entryStart) {
            // Fade-in de baixo para cima
            const fadeInProgress = progress / entryStart;
            const lineDelay = fadeOrder * 0.2;
            lineFade = Math.max(0, Math.min(1, (fadeInProgress - lineDelay) * 3));
          } else if (progress > fadeStart) {
            // Fade-out de baixo para cima
            const lineDelay = fadeOrder * 0.2;
            lineFade = Math.max(0, 1 - Math.max(0, fadeProgress - lineDelay) * 3);
          }
          word.style.opacity = (progress > 0 && progress < 0.9) ? lineFade : 0;
        } catch (error) {
          console.log('⚠️ Erro ao processar palavra:', idx, error);
        }
      });
    } catch (error) {
      console.error('❌ Erro no handleScroll:', error);
    }
  };

  // Adiciona o listener de scroll com tratamento de erro
  useEffect(() => {
    try {
      window.addEventListener('scroll', handleScroll);
      // Chama uma vez para posicionar inicialmente, mas com delay
      setTimeout(() => {
        handleScroll();
      }, 100);
      
      return () => {
        try {
          window.removeEventListener('scroll', handleScroll);
        } catch (error) {
          console.error('❌ Erro ao remover listener de scroll:', error);
        }
      };
    } catch (error) {
      console.error('❌ Erro ao adicionar listener de scroll:', error);
    }
  }, []);

  // Array com todas as palavras do texto
  const words = [
    'Deus', 'sempre', 'usou', 'os', 'improváveis,',
    'Deus', 'ainda', 'usa', 'os', 'improváveis.',
  ];

  const finalPhrase = "E talvez... esse improvável seja você.";

  return (
    <Box
      ref={sectionRef}
      sx={{
        position: 'relative',
        minHeight: '400vh',
        background: '#000',
        overflow: 'hidden',
        marginTop: '-50vh',
      }}
    >
      {/* Imagens fixas com diferentes z-index */}
      {[
        // Primeira coluna (esquerda) - Ajustando para ocupar só as primeiras 3 telas
        { top: '20%', left: '5%', width: 220, height: 160, zIndex: 5, img: '1' },
        { top: '35%', left: '15%', width: 180, height: 240, zIndex: 1, img: '2' },
        { top: '50%', left: '8%', width: 200, height: 150, zIndex: 3, img: '3' },
        { top: '65%', left: '12%', width: 240, height: 180, zIndex: 4, img: '4' },
        { top: '75%', left: '5%', width: 190, height: 140, zIndex: 2, img: '5' },
        
        // Segunda coluna (direita)
        { top: '25%', right: '8%', width: 200, height: 150, zIndex: 2, img: '6' },
        { top: '40%', right: '12%', width: 220, height: 160, zIndex: 5, img: '7' },
        { top: '55%', right: '5%', width: 180, height: 240, zIndex: 1, img: '8' },
        { top: '70%', right: '15%', width: 210, height: 155, zIndex: 3, img: '9' },
        
        // Coluna central - algumas imagens mais próximas do texto
        { top: '30%', left: '35%', width: 160, height: 120, zIndex: 4, img: '10' },
        { top: '45%', right: '38%', width: 170, height: 130, zIndex: 2, img: '11' },
        { top: '60%', left: '42%', width: 150, height: 200, zIndex: 5, img: '12' },
        { top: '73%', right: '40%', width: 180, height: 140, zIndex: 3, img: '13' },
        
        // Imagens que passarão sobre o texto
        { top: '33%', left: '25%', width: 200, height: 150, zIndex: 6, img: '14' },
        { top: '48%', right: '28%', width: 180, height: 160, zIndex: 6, img: '15' },
        { top: '63%', left: '32%', width: 190, height: 140, zIndex: 6, img: '16' },
      ].map((img, index) => (
        <Box
          key={index}
          component="img"
          src={getImageUrl(img.img)}
          alt=""
          onError={(e) => {
            console.log(`Erro ao carregar imagem ${img.img}:`, e.target.src);
            // Tenta outras extensões se falhar
            const currentSrc = e.target.src;
            if (currentSrc.includes('.jpg')) {
              e.target.src = currentSrc.replace('.jpg', '.jpeg');
            } else if (currentSrc.includes('.jpeg')) {
              e.target.src = currentSrc.replace('.jpeg', '.png');
            } else if (currentSrc.includes('.png')) {
              e.target.src = currentSrc.replace('.png', '.webp');
            }
          }}
          onLoad={() => {
            console.log(`Imagem ${img.img} carregada com sucesso`);
          }}
          sx={{
            position: 'absolute',
            top: img.top,
            left: img.left,
            right: img.right,
            width: { xs: img.width * 0.6, sm: img.width },
            height: { xs: img.height * 0.6, sm: img.height },
            objectFit: 'cover',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            zIndex: img.zIndex,
            transition: 'transform 0.3s ease-out',
            '&:hover': {
              transform: 'scale(1.05)',
              zIndex: 10,
            },
            opacity: 0.8, // Deixa as imagens um pouco mais suaves
          }}
        />
      ))}

      {/* Container para o texto com scroll */}
      <Box
        ref={textRef}
        sx={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: '#fff',
          zIndex: 4,
          pointerEvents: 'none',
          opacity: 0,
          width: '90vw',
          maxWidth: '1200px',
        }}
      >
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: '2.5rem', sm: '3.5rem', md: '5rem' },
            fontWeight: 900,
            marginBottom: 2,
            textTransform: 'uppercase',
            letterSpacing: '0.02em',
            lineHeight: 1.1,
            textShadow: '0 4px 20px rgba(0,0,0,0.8)',
            wordSpacing: '0.1em',
          }}
        >
          {words.map((word, index) => (
            <React.Fragment key={index}>
              <Box
                component="span"
                ref={el => wordsRefs.current[index] = el}
                sx={{
                  display: 'inline-block',
                  opacity: 0,
                }}
              >
                {word}
              </Box>
              {index === 4 && <br />}
              {index !== 4 && index !== words.length - 1 && ' '}
            </React.Fragment>
          ))}
        </Typography>
        <Typography
          variant="h2"
          ref={el => wordsRefs.current[words.length] = el}
          sx={{
            fontSize: { xs: '1.6rem', sm: '2rem', md: '2.8rem' },
            fontWeight: 600,
            fontStyle: 'italic',
            textShadow: '0 4px 20px rgba(0,0,0,0.8)',
            opacity: 0,
            marginTop: 2,
          }}
        >
          {finalPhrase}
        </Typography>
      </Box>
    </Box>
  );
} 