const { db } = require('./src/database/db');

async function fixLotsQuantity() {
  try {
    console.log('🔧 Corrigindo quantidade dos lotes...\n');

    // Buscar todos os lotes
    const lots = await db('lots').select('*');
    
    console.log(`📊 Encontrados ${lots.length} lotes para verificar\n`);

    for (const lot of lots) {
      // Contar inscrições reais para este lote
      const registrations = await db('registrations')
        .where('lot_id', lot.id)
        .count('* as count');
      
      const actualRegistrations = registrations[0].count;
      const originalQuantity = lot.quantity;
      
      // Calcular quantidade correta (quantidade original - inscrições reais)
      const correctQuantity = Math.max(0, originalQuantity - actualRegistrations);
      
      console.log(`🎯 Lote: ${lot.name} (ID: ${lot.id})`);
      console.log(`   Quantidade original: ${originalQuantity}`);
      console.log(`   Inscrições reais: ${actualRegistrations}`);
      console.log(`   Quantidade correta: ${correctQuantity}`);
      
      // Atualizar apenas se for diferente
      if (correctQuantity !== originalQuantity) {
        await db('lots')
          .where('id', lot.id)
          .update({
            quantity: correctQuantity,
            updated_at: new Date()
          });
        
        console.log(`   ✅ ATUALIZADO: ${originalQuantity} → ${correctQuantity}`);
      } else {
        console.log(`   ✅ Já está correto`);
      }
      console.log('');
    }

    console.log('🎉 Correção concluída!');

  } catch (error) {
    console.error('❌ Erro ao corrigir lotes:', error);
  } finally {
    process.exit(0);
  }
}

fixLotsQuantity(); 