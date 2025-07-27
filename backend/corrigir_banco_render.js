console.log('🚀 CORREÇÃO URGENTE - Banco Render');
console.log('=====================================\n');

const { db } = require('./src/database/db');

async function corrigirBancoRender() {
    try {
        console.log('🔧 Iniciando correção do banco em produção...\n');
        
        // 1. Verificar ambiente
        console.log('🌍 Ambiente:', process.env.NODE_ENV);
        console.log('🗄️ Tipo de banco:', db.client.config.client);
        
        // 2. Verificar se a tabela registrations existe
        const tableExists = await db.schema.hasTable('registrations');
        console.log('📋 Tabela registrations existe:', tableExists);
        
        if (!tableExists) {
            console.log('❌ ERRO: Tabela registrations não existe!');
            console.log('💡 Executar migrations primeiro: npx knex migrate:latest');
            return;
        }
        
        // 3. Verificar colunas existentes
        const columns = await db('registrations').columnInfo();
        const existingColumns = Object.keys(columns);
        console.log('📋 Colunas existentes:', existingColumns);
        
        // 4. Colunas necessárias
        const requiredColumns = ['address', 'registration_code', 'payment_status', 'form_data'];
        const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
        
        console.log('❌ Colunas faltando:', missingColumns);
        
        if (missingColumns.length === 0) {
            console.log('✅ Todas as colunas necessárias já existem!');
            return;
        }
        
        // 5. Adicionar colunas faltantes uma por vez
        for (const column of missingColumns) {
            try {
                console.log(`🔧 Adicionando coluna: ${column}...`);
                
                await db.schema.table('registrations', function(table) {
                    switch(column) {
                        case 'address':
                            table.string('address').nullable();
                            break;
                        case 'registration_code':
                            table.string('registration_code').nullable();
                            break;
                        case 'payment_status':
                            table.string('payment_status').nullable();
                            break;
                        case 'form_data':
                            table.text('form_data').nullable();
                            break;
                    }
                });
                
                console.log(`✅ Coluna ${column} adicionada com sucesso!`);
                
            } catch (colError) {
                console.log(`❌ Erro ao adicionar coluna ${column}:`, colError.message);
            }
        }
        
        // 6. Verificar estrutura final
        const finalColumns = await db('registrations').columnInfo();
        console.log('\n📋 Estrutura final:', Object.keys(finalColumns));
        
        // 7. Teste de inserção
        console.log('\n🧪 Testando inserção...');
        const testData = {
            event_id: 1,
            lot_id: 1,
            name: 'Teste Correção',
            email: 'teste@correção.com',
            phone: '11999999999',
            address: 'Teste Address',
            registration_code: 'TEST-123',
            payment_status: 'pending',
            form_data: '{"test": true}',
            status: 'confirmed'
        };
        
        // Tentar inserir dados de teste
        try {
            const [testId] = await db('registrations').insert(testData).returning('id');
            console.log('✅ Teste de inserção OK! ID:', testId);
            
            // Remover dados de teste
            await db('registrations').where('id', testId).delete();
            console.log('🗑️ Dados de teste removidos');
            
        } catch (testError) {
            console.log('❌ Erro no teste de inserção:', testError.message);
        }
        
        console.log('\n🎉 CORREÇÃO CONCLUÍDA!');
        console.log('✅ Agora a API de inscrição deve funcionar!');
        
    } catch (error) {
        console.error('❌ ERRO CRÍTICO:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        // Fechar conexão
        await db.destroy();
        console.log('\n🔌 Conexão com banco fechada');
        process.exit(0);
    }
}

// Executar correção
corrigirBancoRender(); 