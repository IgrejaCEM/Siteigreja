const { db } = require('./backend/src/database/db');

async function limparInscricoesIncompletas() {
  try {
    console.log('🧹 LIMPANDO INSCRIÇÕES INCOMPLETAS');
    console.log('=====================================');
    
    // 1. Verificar inscrições pending antigas (mais de 30 minutos)
    const timeoutMinutes = 30;
    const cutoffTime = new Date(Date.now() - timeoutMinutes * 60 * 1000);
    
    console.log(`⏰ Buscando inscrições mais antigas que ${timeoutMinutes} minutos...`);
    
    const inscricoesAntigas = await db('registrations')
      .where('status', 'pending')
      .where('created_at', '<', cutoffTime)
      .select('*');
    
    console.log(`📊 Encontradas ${inscricoesAntigas.length} inscrições antigas`);
    
    if (inscricoesAntigas.length === 0) {
      console.log('✅ Nenhuma inscrição antiga encontrada!');
      return;
    }
    
    // 2. Agrupar por lote para devolver vagas
    const lotesParaAtualizar = {};
    inscricoesAntigas.forEach(reg => {
      if (reg.lot_id) {
        lotesParaAtualizar[reg.lot_id] = (lotesParaAtualizar[reg.lot_id] || 0) + 1;
      }
    });
    
    console.log('📋 Vagas a serem devolvidas por lote:');
    Object.entries(lotesParaAtualizar).forEach(([lotId, quantidade]) => {
      console.log(`   • Lote ${lotId}: +${quantidade} vagas`);
    });
    
    // 3. Devolver vagas aos lotes
    for (const [lotId, quantidade] of Object.entries(lotesParaAtualizar)) {
      await db('lots')
        .where('id', lotId)
        .increment('quantity', quantidade);
      
      console.log(`✅ Devolvidas ${quantidade} vagas ao lote ${lotId}`);
    }
    
    // 4. Deletar inscrições antigas
    const deletedCount = await db('registrations')
      .where('status', 'pending')
      .where('created_at', '<', cutoffTime)
      .del();
    
    console.log(`🗑️ Deletadas ${deletedCount} inscrições antigas`);
    
    // 5. Verificar resultado
    const inscricoesRestantes = await db('registrations')
      .where('status', 'pending')
      .count('* as total');
    
    console.log(`📊 Inscrições pending restantes: ${inscricoesRestantes[0].total}`);
    
    console.log('\n🎉 LIMPEZA CONCLUÍDA COM SUCESSO!');
    console.log('✅ Vagas devolvidas aos lotes');
    console.log('✅ Inscrições antigas removidas');
    
  } catch (error) {
    console.error('❌ Erro durante a limpeza:', error);
  } finally {
    process.exit(0);
  }
}

// Executar limpeza
limparInscricoesIncompletas(); 