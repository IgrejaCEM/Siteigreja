const Registration = require('../models/Registration');
const EventProduct = require('../models/EventProduct');
const RegistrationProduct = require('../models/RegistrationProduct');
const { generateRegistrationCode } = require('../utils/registrationUtils');
const { db } = require('../database/db');
console.log('🔧 Importando PaymentGateway...');
const paymentGateway = require('../services/PaymentGateway');
console.log('🔧 PaymentGateway importado:', !!paymentGateway);

class RegistrationController {
  constructor() {
    console.log('🔧 RegistrationController constructor iniciado...');
    this.paymentGateway = paymentGateway; // Use the exported instance directly
    console.log('🔧 PaymentGateway atribuído:', !!this.paymentGateway);
    
    // Verificar se o PaymentGateway foi inicializado corretamente
    if (!this.paymentGateway) {
      console.error('❌ PaymentGateway não foi inicializado corretamente');
      throw new Error('PaymentGateway não foi inicializado');
    }
    
    console.log('✅ PaymentGateway inicializado:', !!this.paymentGateway);
    console.log('🔧 Métodos do PaymentGateway:', Object.keys(this.paymentGateway));
  }

  async create(req, res) {
    try {
      console.log('📦 Dados recebidos no RegistrationController:', JSON.stringify(req.body, null, 2));
      console.log('🔍 Headers recebidos:', req.headers);
      console.log('🔍 Content-Type:', req.headers['content-type']);
      console.log('🔍 Content-Length:', req.headers['content-length']);
      
      const {
        event_id,
        lot_id,
        customer,
        items,
        name,
        email,
        phone,
        cpf,
        address,
        form_data,
        products
      } = req.body;

      // Extrair dados do customer se fornecido
      const customerData = customer || {};
      const finalName = customerData.name || name || '';
      const finalEmail = customerData.email || email || '';
      const finalPhone = customerData.phone || phone || '';
      const finalCpf = customerData.cpf || cpf || '';
      const finalAddress = customerData.address || address || '';

      console.log('👤 Dados do cliente extraídos:', {
        name: finalName,
        email: finalEmail,
        phone: finalPhone,
        cpf: finalCpf,
        address: finalAddress
      });

      console.log('🔍 Customer original:', customer);
      console.log('🔍 CustomerData:', customerData);
      console.log('🔍 Campos individuais:', { name, email, phone, cpf });

      // Validar dados obrigatórios
      if (!finalName || !finalEmail || !finalPhone) {
        console.log('❌ Validação falhou:');
        console.log('   - finalName:', finalName, 'tipo:', typeof finalName);
        console.log('   - finalEmail:', finalEmail, 'tipo:', typeof finalEmail);
        console.log('   - finalPhone:', finalPhone, 'tipo:', typeof finalPhone);
        return res.status(400).json({ 
          error: 'Nome, email e telefone são obrigatórios',
          details: {
            name: finalName,
            email: finalEmail,
            phone: finalPhone
          }
        });
      }

      console.log('🔍 Verificando conexão com banco...');
      const testConnection = await db.raw('SELECT 1 as test');
      console.log('✅ Conexão com banco OK:', testConnection.rows[0]);

      const registrationCode = await generateRegistrationCode();
      console.log('🎫 Registration code gerado:', registrationCode);

      // Criar inscrição usando Knex diretamente
      console.log('📝 Criando inscrição...');
      console.log('🔍 event_id recebido:', event_id, 'tipo:', typeof event_id);
      console.log('🔍 lot_id recebido:', lot_id, 'tipo:', typeof lot_id);
      
      const [registration] = await db('registrations').insert({
        event_id: event_id ? parseInt(event_id) : null,
        lot_id: lot_id ? parseInt(lot_id) : null,
        name: finalName,
        email: finalEmail,
        phone: finalPhone,
        cpf: finalCpf || null,
        address: finalAddress ? JSON.stringify(finalAddress) : null,
        form_data: form_data ? JSON.stringify(form_data) : null,
        registration_code: registrationCode,
        status: 'pending',
        payment_status: 'pending',
        created_at: new Date(),
        updated_at: new Date()
      }).returning('*');

      console.log('✅ Inscrição criada:', registration.id);

             // Calcular valor total
       let totalAmount = 0;
       console.log('💰 Iniciando cálculo do valor total...');

             // Processar itens se houver
       if (items && items.length > 0) {
         console.log('🛍️ Processando itens:', items);
         console.log('💰 TotalAmount antes dos itens:', totalAmount);
        
        for (const item of items) {
          if (item.type === 'EVENT_PRODUCT') {
            // Produto do evento
            console.log('🔍 Buscando produto do evento:', item.id);
            const eventProduct = await db('event_products')
              .where('id', item.id)
              .first();
            
            if (!eventProduct) {
              console.error(`❌ Produto ${item.id} não encontrado`);
              continue;
            }

            if (eventProduct.stock < item.quantity) {
              console.error(`❌ Estoque insuficiente para ${eventProduct.name}`);
              continue;
            }

            // Atualizar estoque
            await db('event_products')
              .where('id', item.id)
              .update({ 
                stock: eventProduct.stock - item.quantity,
                updated_at: new Date()
              });

                         // Adicionar produto à inscrição
             await db('registration_products').insert({
               registration_id: registration.id,
               product_id: item.id,
               quantity: item.quantity,
               unit_price: eventProduct.price,
               created_at: new Date(),
               updated_at: new Date()
             });

            totalAmount += eventProduct.price * item.quantity;
            console.log(`✅ Produto ${eventProduct.name} adicionado`);
          } else if (item.type === 'EVENT_TICKET') {
            // Ingresso do evento - calcular valor do lote
            if (item.lot_id) {
              console.log('🔍 Buscando lote:', item.lot_id);
              const lot = await db('lots')
                .where('id', item.lot_id)
                .first();
              
              if (lot) {
               totalAmount += lot.price * item.quantity;
               console.log(`✅ Ingresso do lote ${lot.name} adicionado - R$ ${lot.price}`);
               console.log(`💰 TotalAmount após ingresso: R$ ${totalAmount}`);
             } else {
               console.log('⚠️ Lote não encontrado, usando preço do item');
               totalAmount += item.price * item.quantity;
               console.log(`✅ Ingresso adicionado usando preço do item - R$ ${item.price}`);
               console.log(`💰 TotalAmount após ingresso: R$ ${totalAmount}`);
             }
         } else {
           // Se não tem lot_id, usar o preço do item
           totalAmount += item.price * item.quantity;
           console.log(`✅ Ingresso adicionado - R$ ${item.price}`);
           console.log(`💰 TotalAmount após ingresso: R$ ${totalAmount}`);
         }
       }
     }
   }
   
   console.log('💰 TotalAmount após processar itens:', totalAmount);

             // Processar produtos da loja se houver
       if (products && products.length > 0) {
         console.log('🏪 Processando produtos da loja:', products);
         console.log('🔍 Verificando tabelas necessárias...');
         
         try {
           // Verificar se a tabela store_products existe
           const storeProductsExists = await db.schema.hasTable('store_products');
           console.log('✅ Tabela store_products existe:', storeProductsExists);
           
           if (!storeProductsExists) {
             console.log('⚠️ Tabela store_products não existe, criando automaticamente...');
             
             // Criar a tabela store_products automaticamente
             await db.schema.createTable('store_products', (table) => {
               table.increments('id').primary();
               table.string('name', 255).notNullable();
               table.text('description');
               table.decimal('price', 10, 2).notNullable();
               table.integer('stock').notNullable().defaultTo(0);
               table.string('image_url', 500);
               table.string('category', 100);
               table.boolean('active').notNullable().defaultTo(true);
               table.timestamps(true, true);
               
               // Índices
               table.index('active');
               table.index('category');
             });
             
             console.log('✅ Tabela store_products criada com sucesso!');
           }
           
           // Verificar se a tabela registration_store_products existe
           const registrationStoreProductsExists = await db.schema.hasTable('registration_store_products');
           console.log('✅ Tabela registration_store_products existe:', registrationStoreProductsExists);
           
           if (!registrationStoreProductsExists) {
             console.log('⚠️ Tabela registration_store_products não existe, criando automaticamente...');
             
             // Criar a tabela registration_store_products automaticamente
             await db.schema.createTable('registration_store_products', (table) => {
               table.increments('id').primary();
               table.integer('registration_id').unsigned().references('id').inTable('registrations').onDelete('CASCADE');
               table.integer('product_id').unsigned().references('id').inTable('store_products').onDelete('CASCADE');
               table.integer('quantity').notNullable();
               table.decimal('unit_price', 10, 2).notNullable();
               table.timestamps(true, true);
             });
             
             console.log('✅ Tabela registration_store_products criada com sucesso!');
           }
         } catch (error) {
           console.error('❌ Erro ao verificar/criar tabelas:', error);
           throw error;
         }
        
        for (const product of products) {
          console.log('🔍 Buscando produto da loja:', product.product_id);
          console.log('🔍 Dados do produto:', JSON.stringify(product, null, 2));
          
          const storeProduct = await db('store_products')
            .where('id', product.product_id)
            .first();
          
          console.log('🔍 Produto encontrado:', storeProduct);
          
          if (!storeProduct) {
            console.error(`❌ Produto da loja ${product.product_id} não encontrado`);
            continue;
          }

          if (storeProduct.stock < product.quantity) {
            console.error(`❌ Estoque insuficiente para ${storeProduct.name}`);
            continue;
          }

          console.log('📝 Atualizando estoque...');
          // Atualizar estoque
          await db('store_products')
            .where('id', product.product_id)
            .update({ 
              stock: storeProduct.stock - product.quantity,
              updated_at: new Date()
            });

          console.log('📝 Inserindo na tabela registration_store_products...');
          console.log('🔍 Dados para inserção:', {
            registration_id: registration.id,
            product_id: product.product_id,
            quantity: product.quantity,
            unit_price: product.unit_price
          });
          
          // Adicionar produto da loja à inscrição (usando registration_store_products)
          await db('registration_store_products').insert({
            registration_id: registration.id,
            product_id: product.product_id,
            quantity: product.quantity,
            unit_price: product.unit_price,
            created_at: new Date(),
            updated_at: new Date()
          });

          totalAmount += product.unit_price * product.quantity;
          console.log(`✅ Produto da loja ${storeProduct.name} adicionado`);
          console.log(`💰 TotalAmount após produto da loja: R$ ${totalAmount}`);
        }
      }
      
      console.log('💰 TotalAmount final após todos os itens:', totalAmount);

      // Criar pagamento real se necessário
      let paymentInfo = null;
      
      // Sempre gerar payment_url se houver itens ou produtos
      console.log('🔍 Verificando condições para pagamento:');
      console.log('   - items:', items);
      console.log('   - products:', products);
      console.log('   - items.length:', items ? items.length : 0);
      console.log('   - products.length:', products ? products.length : 0);
      console.log('   - totalAmount:', totalAmount);
      
      if ((items && items.length > 0) || (products && products.length > 0)) {
        console.log('✅ Condições atendidas - criando pagamento real no MercadoPago...');
        console.log('💰 Valor total:', totalAmount);
        console.log('🎫 Lot ID:', registration.lot_id);
        console.log('🏪 Produtos:', products);
        
               // Verificar se o totalAmount é válido
       console.log('🔍 Verificando totalAmount:', totalAmount);
       if (totalAmount <= 0) {
         console.log('⚠️ TotalAmount é inválido:', totalAmount);
         return res.status(400).json({ 
           error: 'Valor total inválido',
           details: 'O valor total deve ser maior que zero' 
         });
       }
       console.log('✅ TotalAmount válido:', totalAmount);
        
        try {
          const paymentData = {
            amount: totalAmount,
            description: `Inscrição ${registrationCode}`,
            customer: {
              name: finalName,
              email: finalEmail,
              phone: finalPhone,
              registration_code: registrationCode,
              id: registration.id,
              event_id: event_id
            }
          };

          console.log('📦 Dados do pagamento:', JSON.stringify(paymentData, null, 2));
          console.log('🔧 PaymentGateway disponível:', !!this.paymentGateway);
          console.log('🔧 Métodos do PaymentGateway:', Object.keys(this.paymentGateway));
          
          // Verificar se o PaymentGateway está disponível
          if (!this.paymentGateway) {
            throw new Error('PaymentGateway não está disponível');
          }
          
          console.log('🔧 PaymentGateway disponível, chamando createPayment...');
          console.log('🔧 PaymentData:', JSON.stringify(paymentData, null, 2));
          console.log('🔧 PaymentGateway object:', this.paymentGateway);
          console.log('🔧 PaymentGateway methods:', Object.keys(this.paymentGateway));
          
          let paymentResult;
          try {
            console.log('🔧 Iniciando chamada para PaymentGateway.createPayment...');
            paymentResult = await this.paymentGateway.createPayment(paymentData);
            console.log('✅ PaymentGateway.createPayment executado com sucesso');
            console.log('✅ Resultado:', JSON.stringify(paymentResult, null, 2));
          } catch (paymentError) {
            console.error('❌ Erro ao chamar PaymentGateway.createPayment:', paymentError);
            console.error('❌ Stack trace:', paymentError.stack);
            console.error('❌ Error message:', paymentError.message);
            if (paymentError.response) {
              console.error('❌ Response status:', paymentError.response.status);
              console.error('❌ Response data:', JSON.stringify(paymentError.response.data, null, 2));
            }
            throw paymentError;
          }
          
          console.log('✅ Resultado do PaymentGateway:', JSON.stringify(paymentResult, null, 2));
          
          paymentInfo = {
            payment_url: paymentResult.payment_url,
            payment_id: paymentResult.id
          };
          
          console.log('✅ Payment info criada:', paymentInfo);
        } catch (paymentError) {
          console.error('❌ Erro ao criar pagamento:', paymentError);
          console.error('❌ Stack trace:', paymentError.stack);
          // Continuar mesmo se o pagamento falhar
          paymentInfo = {
            payment_url: null,
            payment_id: null
          };
        }
      } else {
        console.log('❌ Condições não atendidas - não criando pagamento');
        paymentInfo = {
          payment_url: null,
          payment_id: null
        };
      }

      console.log('✅ Inscrição processada com sucesso');

      return res.status(201).json({
        order_id: registration.id,
        registration_code: registration.registration_code,
        payment_url: paymentInfo?.payment_url,
        payment_id: paymentInfo?.payment_id,
        status: 'pending'
      });

    } catch (error) {
      console.error('❌ Erro ao criar inscrição:', error);
      return res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: error.message 
      });
    }
  }

  async list(req, res) {
    // Retorna uma lista vazia por enquanto
    return res.json([]);
  }

  async getById(req, res) {
    // Retorna um objeto vazio por enquanto
    return res.json({});
  }

  async update(req, res) {
    // Retorna mensagem de update por enquanto
    return res.json({ message: 'update' });
  }

  async delete(req, res) {
    // Retorna mensagem de delete por enquanto
    return res.json({ message: 'delete' });
  }
}

module.exports = new RegistrationController(); 