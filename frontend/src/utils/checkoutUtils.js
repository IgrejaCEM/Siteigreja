// Utilitário para corrigir URLs do Mercado Pago
export const fixMercadoPagoUrl = (url) => {
  if (!url) return url;

  console.log('🔧 URL original:', url);

  // Se a URL contém deep links, substituir por URL web
  if (url.includes('mercadopago://') || url.includes('meli://')) {
    console.log('🚫 Deep link detectado, convertendo para web...');
    
    // Extrair o preference ID da URL
    const prefIdMatch = url.match(/pref_id=([^&]+)/);
    if (prefIdMatch) {
      const prefId = prefIdMatch[1];
      const webUrl = `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${prefId}`;
      console.log('✅ URL convertida para web:', webUrl);
      return webUrl;
    }
  }

  // Se já é uma URL web, retornar como está
  if (url.includes('mercadopago.com.br/checkout')) {
    console.log('✅ URL já é web, mantendo como está');
    return url;
  }

  // Se é uma URL de sandbox, converter para produção
  if (url.includes('sandbox.mercadopago.com.br')) {
    const productionUrl = url.replace('sandbox.mercadopago.com.br', 'www.mercadopago.com.br');
    console.log('✅ URL sandbox convertida para produção:', productionUrl);
    return productionUrl;
  }

  console.log('⚠️ URL não reconhecida, retornando original');
  return url;
};

// Função para abrir checkout em nova janela
export const openCheckout = (url) => {
  const fixedUrl = fixMercadoPagoUrl(url);
  console.log('🔗 Abrindo checkout:', fixedUrl);

  // Forçar parâmetros para web checkout
  const urlObj = new URL(fixedUrl);
  urlObj.searchParams.set('use_web_title', 'true');
  urlObj.searchParams.set('back_style', 'arrow');
  urlObj.searchParams.set('loading_mode', 'spinner');
  urlObj.searchParams.set('hides_bottom_bar', 'true');
  urlObj.searchParams.set('platform', 'web');
  urlObj.searchParams.set('force_web', 'true');
  urlObj.searchParams.set('prevent_deep_link', 'true');
  urlObj.searchParams.set('web_only', 'true');
  
  const finalUrl = urlObj.toString();
  console.log('🔗 URL final com parâmetros web:', finalUrl);

  // Abrir em nova janela para evitar problemas de deep links
  const checkoutWindow = window.open(finalUrl, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');

  if (!checkoutWindow) {
    console.log('⚠️ Popup bloqueado, redirecionando na mesma janela');
    // Se popup foi bloqueado, redirecionar na mesma janela
    window.location.href = finalUrl;
  }

  return checkoutWindow;
};

// Função para verificar se a URL é válida
export const isValidCheckoutUrl = (url) => {
  if (!url) return false;

  // Verificar se é uma URL do Mercado Pago
  const isValid = url.includes('mercadopago.com.br') ||
                 url.includes('mercadopago.com') ||
                 url.includes('sandbox.mercadopago.com.br');
  
  console.log('🔍 Validação da URL:', url, '->', isValid);
  return isValid;
};

// Função para interceptar e corrigir deep links automaticamente
export const interceptDeepLinks = () => {
  console.log('🛡️ Inicializando interceptação de deep links...');
  
  // Interceptar cliques em links do Mercado Pago
  document.addEventListener('click', (event) => {
    const target = event.target.closest('a');
    if (target && target.href) {
      const url = target.href;
      if (url.includes('mercadopago://') || url.includes('meli://')) {
        event.preventDefault();
        console.log('🚫 Deep link interceptado no clique:', url);
        const fixedUrl = fixMercadoPagoUrl(url);
        openCheckout(fixedUrl);
      }
    }
  });

  // Interceptar redirecionamentos
  const originalOpen = window.open;
  window.open = function(url, ...args) {
    if (url && (url.includes('mercadopago://') || url.includes('meli://'))) {
      console.log('🚫 Deep link interceptado no window.open:', url);
      const fixedUrl = fixMercadoPagoUrl(url);
      return originalOpen.call(this, fixedUrl, ...args);
    }
    return originalOpen.call(this, url, ...args);
  };

  // Interceptar mudanças de location (versão segura)
  try {
    const originalAssign = window.location.assign;
    window.location.assign = function(url) {
      if (url && (url.includes('mercadopago://') || url.includes('meli://'))) {
        console.log('🚫 Deep link interceptado no location.assign:', url);
        const fixedUrl = fixMercadoPagoUrl(url);
        return originalAssign.call(this, fixedUrl);
      }
      return originalAssign.call(this, url);
    };
  } catch (error) {
    console.log('⚠️ Não foi possível interceptar location.assign:', error.message);
  }

  // Interceptar mudanças de href (versão segura)
  try {
    const originalHref = Object.getOwnPropertyDescriptor(window.location, 'href');
    if (originalHref && originalHref.set) {
      Object.defineProperty(window.location, 'href', {
        set: function(url) {
          if (url && (url.includes('mercadopago://') || url.includes('meli://'))) {
            console.log('🚫 Deep link interceptado no location.href:', url);
            const fixedUrl = fixMercadoPagoUrl(url);
            return originalHref.set.call(this, fixedUrl);
          }
          return originalHref.set.call(this, url);
        },
        get: originalHref.get
      });
    }
  } catch (error) {
    console.log('⚠️ Não foi possível interceptar location.href:', error.message);
  }

  // Interceptar mudanças de replace (versão segura)
  try {
    const originalReplace = window.location.replace;
    window.location.replace = function(url) {
      if (url && (url.includes('mercadopago://') || url.includes('meli://'))) {
        console.log('🚫 Deep link interceptado no location.replace:', url);
        const fixedUrl = fixMercadoPagoUrl(url);
        return originalReplace.call(this, fixedUrl);
      }
      return originalReplace.call(this, url);
    };
  } catch (error) {
    console.log('⚠️ Não foi possível interceptar location.replace:', error.message);
  }

  console.log('✅ Interceptação de deep links inicializada');
};

// Função para forçar web checkout em qualquer URL do Mercado Pago
export const forceWebCheckout = (url) => {
  if (!url) return url;
  
  console.log('🔧 Forçando web checkout para:', url);
  
  // Se é um deep link, converter
  if (url.includes('mercadopago://') || url.includes('meli://')) {
    const prefIdMatch = url.match(/pref_id=([^&]+)/);
    if (prefIdMatch) {
      const prefId = prefIdMatch[1];
      const webUrl = `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${prefId}`;
      console.log('✅ Convertido para web:', webUrl);
      return webUrl;
    }
  }
  
  // Se já é web, adicionar parâmetros
  if (url.includes('mercadopago.com.br/checkout')) {
    const urlObj = new URL(url);
    urlObj.searchParams.set('use_web_title', 'true');
    urlObj.searchParams.set('platform', 'web');
    urlObj.searchParams.set('force_web', 'true');
    const finalUrl = urlObj.toString();
    console.log('✅ Adicionados parâmetros web:', finalUrl);
    return finalUrl;
  }
  
  return url;
}; 