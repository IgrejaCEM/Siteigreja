// Script para corrigir o slug de um evento específico
// Execute: node scripts/corrigir-slug.js

const path = require('path');
// Ajuste o caminho para o arquivo db.js
const { db } = require('../src/database/db'); 

// O slug antigo e o novo slug corrigido
const antigoSlug = 'connect-conf---2025';
const novoSlug = 'connect-conf-2025';

async function corrigirSlug() {
  console.log(`🚀 Iniciando a correção do slug...`);
  console.log(`Buscando evento com o slug antigo: "${antigoSlug}"`);

  try {
    const evento = await db('events').where('slug', antigoSlug).first();

    if (!evento) {
      console.log(`🟡 Evento com slug "${antigoSlug}" não encontrado. Verificando se já foi corrigido...`);
      const eventoCorrigido = await db('events').where('slug', novoSlug).first();
      if (eventoCorrigido) {
        console.log(`✅ O slug já parece estar corrigido para "${novoSlug}". Nenhuma ação necessária.`);
      } else {
        console.log(`❌ Nenhum evento encontrado com o slug antigo ou o novo. Verifique o slug no banco de dados.`);
      }
      return;
    }

    console.log(`✅ Evento encontrado: ID ${evento.id}, Título: "${evento.title}"`);
    console.log(`Atualizando slug para: "${novoSlug}"`);

    const updated = await db('events')
      .where('id', evento.id)
      .update({
        slug: novoSlug,
        updated_at: db.fn.now()
      });

    if (updated) {
      console.log(`🎉 Sucesso! O slug do evento foi corrigido no banco de dados.`);
    } else {
      console.log(`⚠️ A atualização não retornou sucesso. Verifique o banco de dados.`);
    }

  } catch (error) {
    console.error(`❌ Erro ao tentar corrigir o slug:`, error);
  } finally {
    // Encerrar a conexão com o banco
    await db.destroy();
  }
}

corrigirSlug(); 