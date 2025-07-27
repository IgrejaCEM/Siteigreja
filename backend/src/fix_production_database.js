const { db } = require('./database/db');

async function fixProductionDatabase() {
    try {
        console.log('🔧 [PROD] Iniciando correção do banco de dados...\n');

        // Verificar ambiente
        console.log('🌍 Ambiente:', process.env.NODE_ENV || 'development');
        
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
            return { success: true, action: 'table_created' };
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
            return { success: true, action: 'no_changes_needed' };
        }

        // Adicionar colunas faltantes
        console.log('🔧 Adicionando colunas faltantes...');
        
        const columnActions = [];
        
        await db.schema.table('registrations', function(table) {
            if (missingColumns.includes('address')) {
                table.string('address').nullable();
                console.log('  ✅ Adicionada coluna: address');
                columnActions.push('address');
            }
            if (missingColumns.includes('registration_code')) {
                table.string('registration_code').nullable();
                console.log('  ✅ Adicionada coluna: registration_code');
                columnActions.push('registration_code');
            }
            if (missingColumns.includes('payment_status')) {
                table.string('payment_status').nullable();
                console.log('  ✅ Adicionada coluna: payment_status');
                columnActions.push('payment_status');
            }
            if (missingColumns.includes('form_data')) {
                table.text('form_data').nullable();
                console.log('  ✅ Adicionada coluna: form_data');
                columnActions.push('form_data');
            }
        });

        console.log('✅ Estrutura da tabela registrations corrigida com sucesso!');

        // Verificar estrutura final
        const finalColumns = await db('registrations').columnInfo();
        console.log('📋 Estrutura final:', Object.keys(finalColumns));

        return { 
            success: true, 
            action: 'columns_added',
            addedColumns: columnActions,
            finalStructure: Object.keys(finalColumns)
        };

    } catch (error) {
        console.error('❌ Erro ao corrigir banco de dados:', error);
        return { 
            success: false, 
            error: error.message,
            stack: error.stack 
        };
    }
}

// Se chamado diretamente
if (require.main === module) {
    fixProductionDatabase()
        .then(result => {
            console.log('\n📋 Resultado:', JSON.stringify(result, null, 2));
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('❌ Erro fatal:', error);
            process.exit(1);
        });
}

module.exports = { fixProductionDatabase }; 