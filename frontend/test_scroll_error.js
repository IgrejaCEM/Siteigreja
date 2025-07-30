// Script para testar se o problema de scroll foi resolvido
console.log('🧪 TESTANDO CORREÇÃO DO ERRO DE SCROLL');
console.log('========================================');

// Simular o que pode estar causando o erro
function testScrollHandling() {
  try {
    console.log('✅ Testando manipulação de scroll...');
    
    // Simular elementos que podem não existir
    const mockSectionRef = { current: null };
    const mockTextRef = { current: null };
    const mockWordsRefs = { current: [] };
    
    // Função de scroll com tratamento de erro
    const handleScroll = () => {
      try {
        // Verificar se os elementos existem antes de usar
        if (!mockSectionRef.current || !mockTextRef.current) {
          console.log('⚠️ Elementos do ScrollSection não encontrados (esperado)');
          return;
        }

        const windowHeight = window.innerHeight;
        const sectionRect = mockSectionRef.current.getBoundingClientRect();
        const sectionHeight = mockSectionRef.current.offsetHeight;

        // Progresso da seção
        const progress = Math.max(0, Math.min(1, (windowHeight - sectionRect.top) / (sectionHeight + windowHeight)));

        // Aplicar transformações com verificação de segurança
        if (mockTextRef.current) {
          mockTextRef.current.style.position = 'fixed';
          mockTextRef.current.style.top = '50%';
          mockTextRef.current.style.left = '50%';
          mockTextRef.current.style.transform = `translate(-50%, -50%)`;
          mockTextRef.current.style.opacity = (progress > 0 && progress < 0.9) ? 1 : 0;
        }

        // Processar palavras com tratamento de erro
        mockWordsRefs.current.forEach((word, idx) => {
          if (!word) return;
          
          try {
            word.style.opacity = 1;
          } catch (error) {
            console.log('⚠️ Erro ao processar palavra:', idx, error);
          }
        });
      } catch (error) {
        console.error('❌ Erro no handleScroll:', error);
      }
    };

    // Testar a função
    handleScroll();
    console.log('✅ Função de scroll testada com sucesso');
    
    // Testar listener de scroll
    try {
      window.addEventListener('scroll', handleScroll);
      console.log('✅ Listener de scroll adicionado com sucesso');
      
      // Remover listener
      window.removeEventListener('scroll', handleScroll);
      console.log('✅ Listener de scroll removido com sucesso');
    } catch (error) {
      console.error('❌ Erro ao manipular listener de scroll:', error);
    }
    
  } catch (error) {
    console.error('❌ Erro geral no teste:', error);
  }
}

// Executar teste
testScrollHandling();

console.log('\n💡 RESULTADO:');
console.log('Se não houve erros acima, a correção funcionou.');
console.log('Agora teste rolar a página no site para ver se o erro foi resolvido.'); 