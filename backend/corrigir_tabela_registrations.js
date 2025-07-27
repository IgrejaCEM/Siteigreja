const { db } = require('./src/database/db');

async function corrigirTabelaRegistrations() {
    try {
        console.log('🔍 Verificando estrutura da tabela registrations...\n');

        // Verificar se a tabela existe
        const tableExists = await db.schema.hasTable('registrations');
        console.log('📋 Tabela registrations existe:', tableExists ? 'SIM' : 'NÃO');

        if (!tableExists) {
            console.log('❌ Tabela registrations não existe! Criando...');
            
            await db.schema.createTable('registrations', function(table) {
                table.increments('id').primary();
                table.integer('event_id').unsigned().references('id').inTable('events').onDelete('CASCADE');
                table.integer('lot_id').unsigned().references('id').inTable('lots').onDelete('SET NULL');
                table.integer('user_id').unsigned().references('id').inTable('users').onDelete('SET NULL');
                table.string('name').notNullable();
                table.string('email').notNullable();
                table.string('phone').notNullable();
                table.string('cpf').nullable();
                table.string('address').nullable();
                table.string('registration_code').nullable();
                table.string('status').defaultTo('pending');
                table.string('payment_status').nullable();
                table.text('form_data').nullable();
                table.timestamp('created_at').defaultTo(db.fn.now());
                table.timestamp('updated_at').defaultTo(db.fn.now());
            });

            console.log('✅ Tabela registrations criada com sucesso!');
            return;
        }

        // Verificar colunas existentes
        const columns = await db('registrations').columnInfo();
        console.log('📋 Colunas existentes:', Object.keys(columns));

        const requiredColumns = [
            'address',
            'registration_code',
            'payment_status',
            'form_data'
        ];

        // Verificar quais colunas estão faltando
        const missingColumns = requiredColumns.filter(col => !columns[col]);
        console.log('❌ Colunas faltando:', missingColumns);

        if (missingColumns.length === 0) {
            console.log('✅ Todas as colunas necessárias estão presentes!');
            return;
        }

        // Adicionar colunas faltantes
        console.log('🔧 Adicionando colunas faltantes...');
        
        await db.schema.table('registrations', function(table) {
            if (missingColumns.includes('address')) {
                table.string('address').nullable();
                console.log('  ✅ Adicionada coluna: address');
            }
            if (missingColumns.includes('registration_code')) {
                table.string('registration_code').nullable();
                console.log('  ✅ Adicionada coluna: registration_code');
            }
            if (missingColumns.includes('payment_status')) {
                table.string('payment_status').nullable();
                console.log('  ✅ Adicionada coluna: payment_status');
            }
            if (missingColumns.includes('form_data')) {
                table.text('form_data').nullable();
                console.log('  ✅ Adicionada coluna: form_data');
            }
        });

        console.log('✅ Estrutura da tabela registrations corrigida com sucesso!');

        // Verificar estrutura final
        const finalColumns = await db('registrations').columnInfo();
        console.log('📋 Estrutura final:', Object.keys(finalColumns));

    } catch (error) {
        console.error('❌ Erro ao corrigir tabela registrations:', error);
        console.error('Stack trace:', error.stack);
    } finally {
        await db.destroy();
    }
}

corrigirTabelaRegistrations(); 