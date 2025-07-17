const { db } = require('../database/db');

async function updateHomeContent() {
  const html = `
    <!-- Banner principal: vídeo MP4 tela cheia -->
    <!-- Hero dinâmico: o frontend alterna entre o GIF e o Hero textual a cada 30s -->
    <div id="hero-dynamic"></div>0000000000000000000000000000

    <!-- Carrossel de texto animado -->
    <div style="background:#2563eb; color:#fff; font-size:1.3rem; font-weight:700; letter-spacing:0.1em; padding:28px 0; overflow:hidden; white-space:nowrap; position:relative;">
      <span class="marquee-span" style="display:inline-block; white-space:nowrap; animation:marquee 18s linear infinite;">
        1º CONFERÊNCIA DE ADOLESCENTES • CONNECT CONF. 2025 • VIVA O NOVO TEMPO • NÃO FIQUE DE FORA • 1º CONFERÊNCIA DE ADOLESCENTES • CONNECT CONF. 2025 • VIVA O NOVO TEMPO • NÃO FIQUE DE FORA • 1º CONFERÊNCIA DE ADOLESCENTES • CONNECT CONF. 2025 • VIVA O NOVO TEMPO • NÃO FIQUE DE FORA •
      </span>
    </div>
    <style>
    @keyframes marquee {
      0% { transform: translateX(0); }
      100% { transform: translateX(-33.33%); }
    }
    </style>

    <!-- Seção TV com vídeo -->
    <div style="background:#e5e7eb; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:40px 0;">
      <div style="font-size:2rem; color:#2563eb; font-weight:700; margin-bottom:16px;">Assista ao vídeo oficial</div>
      <div style="background:#f5f6fa; border-radius:32px; box-shadow:0 4px 32px #0002; padding:12px; max-width:90vw; width:100%; display:flex; justify-content:center;">
        <div style="width:100%; max-width:1200px; aspect-ratio:16/9;">
          <iframe width="100%" height="100%" src="https://www.youtube.com/embed/t5man3liL3I" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen style="border-radius:24px; width:100%; height:100%; display:block;"></iframe>
        </div>
      </div>
    </div>

    <!-- Próximos Eventos -->
    <div id="proximos-eventos"></div>

    <!-- FAQ (opcional) -->
    <div style="background:#f5f6fa; color:#222; padding:40px 0;">
      <div style="max-width:800px; margin:0 auto;">
        <h2 style="color:#2563eb; font-size:2rem; font-weight:700; margin-bottom:24px;">Perguntas Frequentes</h2>
        <div style="margin-bottom:16px;"><b>Quando será o evento?</b><br>2025 (data a definir)</div>
        <div style="margin-bottom:16px;"><b>Onde será?</b><br>Local a definir</div>
        <div style="margin-bottom:16px;"><b>Quem pode participar?</b><br>Todos adolescentes e jovens!</div>
      </div>
    </div>

    <!-- Rodapé -->
    <div style="background:#222; color:#fff; text-align:center; padding:24px 0; font-size:1.1rem;">© 2025 CONNECT CONF. | Realização: ADLS</div>
  `;

  const css = '';
  await db('settings').update({ homeContent: html.toString(), homeCss: '' });
  console.log('Home atualizada com layout inspirado no DunamisCon e nas cores do banner!');
  process.exit(0);
}

updateHomeContent(); 