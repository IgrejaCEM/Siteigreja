const { db } = require('./src/database/db');

async function checkLotsStatus() {
  try {
    console.log('🔍 Verificando status dos lotes...\n');

    // Buscar todos os eventos com seus lotes
    const events = await db('events')
      .select('events.*')
      .leftJoin('lots', 'events.id', 'lots.event_id')
      .orderBy('events.id', 'asc')
      .orderBy('lots.id', 'asc');

    console.log('📊 RESUMO DOS LOTES:\n');

    let currentEvent = null;
    let totalLots = 0;
    let totalQuantity = 0;
    let totalRegistrations = 0;

    for (const row of events) {
      if (!currentEvent || currentEvent.id !== row.event_id) {
        if (currentEvent) {
          console.log(`   Total do evento: ${totalLots} lotes, ${totalQuantity} vagas, ${totalRegistrations} inscrições\n`);
        }
        
        currentEvent = {
          id: row.event_id,
          title: row.title,
          date: row.date
        };
        
        console.log(`🎯 EVENTO: ${row.title} (ID: ${row.event_id})`);
        console.log(`📅 Data: ${row.date}`);
        console.log('📋 Lotes:');
        
        totalLots = 0;
        totalQuantity = 0;
        totalRegistrations = 0;
      }

      if (row.lot_id) {
        // Contar inscrições para este lote
        const registrations = await db('registrations')
          .where('lot_id', row.lot_id)
          .count('* as count');
        
        const regCount = registrations[0].count;
        totalRegistrations += regCount;
        totalLots++;
        totalQuantity += row.quantity;

        const status = row.status === 'active' ? '✅ ATIVO' : '❌ INATIVO';
        const availability = row.quantity > 0 ? '🟢 DISPONÍVEL' : '🔴 ESGOTADO';
        
        console.log(`   • ${row.lot_name} (ID: ${row.lot_id})`);
        console.log(`     Preço: R$ ${row.price}`);
        console.log(`     Vagas: ${row.quantity} | Inscrições: ${regCount}`);
        console.log(`     Status: ${status} | ${availability}`);
        console.log(`     Período: ${row.start_date} até ${row.end_date}`);
        console.log('');
      }
    }

    if (currentEvent) {
      console.log(`   Total do evento: ${totalLots} lotes, ${totalQuantity} vagas, ${totalRegistrations} inscrições\n`);
    }

    // Verificar possíveis problemas
    console.log('🔍 VERIFICAÇÃO DE PROBLEMAS:\n');

    // 1. Lotes com quantidade negativa
    const negativeQuantity = await db('lots')
      .where('quantity', '<', 0)
      .select('*');

    if (negativeQuantity.length > 0) {
      console.log('❌ PROBLEMA: Lotes com quantidade negativa:');
      negativeQuantity.forEach(lot => {
        console.log(`   • Lote ${lot.name} (ID: ${lot.id}): ${lot.quantity} vagas`);
      });
      console.log('');
    }

    // 2. Lotes com mais inscrições que vagas
    const lotsWithOverflow = await db.raw(`
      SELECT 
        l.id,
        l.name,
        l.quantity,
        COUNT(r.id) as registrations_count
      FROM lots l
      LEFT JOIN registrations r ON l.id = r.lot_id
      GROUP BY l.id, l.name, l.quantity
      HAVING COUNT(r.id) > l.quantity
    `);

    if (lotsWithOverflow.rows && lotsWithOverflow.rows.length > 0) {
      console.log('❌ PROBLEMA: Lotes com mais inscrições que vagas:');
      lotsWithOverflow.rows.forEach(lot => {
        console.log(`   • Lote ${lot.name} (ID: ${lot.id}): ${lot.quantity} vagas, ${lot.registrations_count} inscrições`);
      });
      console.log('');
    }

    // 3. Lotes vencidos ainda ativos
    const expiredLots = await db('lots')
      .where('end_date', '<', new Date())
      .where('status', 'active')
      .select('*');

    if (expiredLots.length > 0) {
      console.log('⚠️ AVISO: Lotes vencidos ainda ativos:');
      expiredLots.forEach(lot => {
        console.log(`   • Lote ${lot.name} (ID: ${lot.id}): venceu em ${lot.end_date}`);
      });
      console.log('');
    }

    // 4. Lotes que ainda não começaram
    const futureLots = await db('lots')
      .where('start_date', '>', new Date())
      .where('status', 'active')
      .select('*');

    if (futureLots.length > 0) {
      console.log('⏰ INFO: Lotes que ainda não começaram:');
      futureLots.forEach(lot => {
        console.log(`   • Lote ${lot.name} (ID: ${lot.id}): inicia em ${lot.start_date}`);
      });
      console.log('');
    }

    console.log('✅ Verificação concluída!');

  } catch (error) {
    console.error('❌ Erro ao verificar lotes:', error);
  } finally {
    process.exit(0);
  }
}

checkLotsStatus(); 