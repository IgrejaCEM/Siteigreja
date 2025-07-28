const { db } = require('../database/db');
const BoletoPaymentGateway = require('../services/BoletoPaymentGateway');

class BoletoCleanupService {
  constructor() {
    this.boletoGateway = new BoletoPaymentGateway();
  }

  // Limpar boletos vencidos e liberar vagas
  async cleanupExpiredBoletos() {
    console.log('🧹 INICIANDO LIMPEZA DE BOLETOS VENCIDOS...');
    
    try {
      // Buscar pagamentos vencidos
      const expiredPayments = await db('payments')
        .join('registrations', 'payments.registration_code', 'registrations.registration_code')
        .where('payments.payment_method', 'boleto')
        .where('payments.status', 'pending')
        .where('payments.created_at', '<', new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)) // 3 dias atrás
        .select(
          'payments.*',
          'registrations.id as registration_id',
          'registrations.event_id',
          'registrations.lot_id',
          'registrations.name',
          'registrations.email'
        );

      console.log(`📋 Encontrados ${expiredPayments.length} boletos vencidos`);

      let cleanedCount = 0;
      let errorCount = 0;

      for (const payment of expiredPayments) {
        try {
          console.log(`🔍 Processando boleto: ${payment.registration_code} - ${payment.name}`);

          // 1. Cancelar boleto no Mercado Pago
          try {
            await this.boletoGateway.cancelExpiredBoleto(payment.payment_intent_id);
            console.log(`✅ Boleto cancelado no MP: ${payment.payment_intent_id}`);
          } catch (mpError) {
            console.log(`⚠️ Erro ao cancelar no MP: ${mpError.message}`);
          }

          // 2. Atualizar status no banco
          await db('payments')
            .where('id', payment.id)
            .update({
              status: 'expired',
              updated_at: new Date()
            });

          // 3. Cancelar inscrição
          await db('registrations')
            .where('id', payment.registration_id)
            .update({
              status: 'cancelled',
              payment_status: 'expired',
              updated_at: new Date()
            });

          // 4. Liberar vaga no lote
          await db('lots')
            .where('id', payment.lot_id)
            .increment('quantity', 1);

          console.log(`✅ Vaga liberada no lote ${payment.lot_id}`);

          // 5. Registrar log de limpeza
          await db('payment_logs').insert({
            payment_id: payment.id,
            registration_code: payment.registration_code,
            action: 'expired_cleanup',
            details: `Boleto vencido cancelado e vaga liberada`,
            created_at: new Date()
          });

          cleanedCount++;
          console.log(`✅ Boleto ${payment.registration_code} processado com sucesso`);

        } catch (error) {
          errorCount++;
          console.error(`❌ Erro ao processar boleto ${payment.registration_code}:`, error.message);
        }
      }

      console.log(`🎉 LIMPEZA CONCLUÍDA:`);
      console.log(`   ✅ Processados: ${cleanedCount}`);
      console.log(`   ❌ Erros: ${errorCount}`);
      console.log(`   📊 Total: ${expiredPayments.length}`);

      return {
        success: true,
        processed: cleanedCount,
        errors: errorCount,
        total: expiredPayments.length
      };

    } catch (error) {
      console.error('❌ Erro na limpeza de boletos:', error);
      throw error;
    }
  }

  // Verificar boletos próximos do vencimento
  async checkBoletosNearExpiration() {
    console.log('🔍 VERIFICANDO BOLETOS PRÓXIMOS DO VENCIMENTO...');
    
    try {
      const nearExpirationPayments = await db('payments')
        .join('registrations', 'payments.registration_code', 'registrations.registration_code')
        .where('payments.payment_method', 'boleto')
        .where('payments.status', 'pending')
        .where('payments.created_at', '<', new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)) // 2 dias atrás
        .where('payments.created_at', '>=', new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)) // 3 dias atrás
        .select(
          'payments.*',
          'registrations.name',
          'registrations.email'
        );

      console.log(`📋 Encontrados ${nearExpirationPayments.length} boletos próximos do vencimento`);

      // Aqui você pode implementar notificação por email
      for (const payment of nearExpirationPayments) {
        console.log(`⚠️ Boleto próximo do vencimento: ${payment.registration_code} - ${payment.name} (${payment.email})`);
        
        // TODO: Enviar email de lembrete
        // await sendExpirationReminder(payment);
      }

      return {
        success: true,
        nearExpiration: nearExpirationPayments.length,
        payments: nearExpirationPayments
      };

    } catch (error) {
      console.error('❌ Erro ao verificar boletos próximos do vencimento:', error);
      throw error;
    }
  }

  // Estatísticas de boletos
  async getBoletoStats() {
    try {
      const stats = await db('payments')
        .where('payment_method', 'boleto')
        .select(
          db.raw('COUNT(*) as total'),
          db.raw('COUNT(CASE WHEN status = "pending" THEN 1 END) as pending'),
          db.raw('COUNT(CASE WHEN status = "paid" THEN 1 END) as paid'),
          db.raw('COUNT(CASE WHEN status = "expired" THEN 1 END) as expired'),
          db.raw('COUNT(CASE WHEN status = "cancelled" THEN 1 END) as cancelled')
        )
        .first();

      return {
        success: true,
        stats: {
          total: parseInt(stats.total || 0),
          pending: parseInt(stats.pending || 0),
          paid: parseInt(stats.paid || 0),
          expired: parseInt(stats.expired || 0),
          cancelled: parseInt(stats.cancelled || 0)
        }
      };

    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas de boletos:', error);
      throw error;
    }
  }
}

// Executar limpeza se chamado diretamente
if (require.main === module) {
  const cleanup = new BoletoCleanupService();
  
  cleanup.cleanupExpiredBoletos()
    .then(result => {
      console.log('✅ Limpeza concluída:', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Erro na limpeza:', error);
      process.exit(1);
    });
}

module.exports = BoletoCleanupService; 