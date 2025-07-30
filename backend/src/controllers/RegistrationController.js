const Registration = require('../models/Registration');
const EventProduct = require('../models/EventProduct');
const RegistrationProduct = require('../models/RegistrationProduct');
const { generateRegistrationCode } = require('../utils/registrationUtils');
const { db } = require('../database/db');

class RegistrationController {
  async create(req, res) {
    try {
      console.log('📦 Dados recebidos no RegistrationController:', JSON.stringify(req.body, null, 2));
      
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

      console.log('👤 Dados do cliente:', {
        name: finalName,
        email: finalEmail,
        phone: finalPhone,
        cpf: finalCpf
      });

      // Validar dados obrigatórios
      if (!finalName || !finalEmail || !finalPhone) {
        return res.status(400).json({ 
          error: 'Nome, email e telefone são obrigatórios' 
        });
      }

      const registrationCode = await generateRegistrationCode();

      // Criar inscrição usando Knex diretamente
      const [registration] = await db('registrations').insert({
        event_id: parseInt(event_id),
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

      // Processar produtos se houver
      if (items && items.length > 0) {
        console.log('🛍️ Processando produtos:', items);
        
        for (const item of items) {
          if (item.type === 'EVENT_PRODUCT') {
            // Produto do evento
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
              unit_price: item.price,
              created_at: new Date(),
              updated_at: new Date()
            });

            console.log(`✅ Produto ${eventProduct.name} adicionado`);
          }
        }
      }

      // Processar produtos da loja se houver
      if (products && products.length > 0) {
        console.log('🏪 Processando produtos da loja:', products);
        
        for (const product of products) {
          const storeProduct = await db('store_products')
            .where('id', product.product_id)
            .first();
          
          if (!storeProduct) {
            console.error(`❌ Produto da loja ${product.product_id} não encontrado`);
            continue;
          }

          if (storeProduct.stock < product.quantity) {
            console.error(`❌ Estoque insuficiente para ${storeProduct.name}`);
            continue;
          }

          // Atualizar estoque
          await db('store_products')
            .where('id', product.product_id)
            .update({ 
              stock: storeProduct.stock - product.quantity,
              updated_at: new Date()
            });

          // Adicionar produto da loja à inscrição
          await db('store_order_items').insert({
            order_id: registration.id, // Usar registration.id como order_id
            product_id: product.product_id,
            quantity: product.quantity,
            unit_price: product.unit_price,
            created_at: new Date(),
            updated_at: new Date()
          });

          console.log(`✅ Produto da loja ${storeProduct.name} adicionado`);
        }
      }

      // Criar pagamento se necessário
      let paymentInfo = null;
      
      // Sempre gerar payment_url se houver qualquer item (ingresso ou produtos)
      if (registration.lot_id || (products && products.length > 0)) {
        // Gerar URL de pagamento real
        const paymentId = `PAY-${Date.now()}-${registration.id}`;
        paymentInfo = {
          payment_url: `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${paymentId}`,
          payment_id: paymentId
        };
        
        console.log('💳 Payment info gerada:', paymentInfo);
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