const Registration = require('../models/Registration');
const EventProduct = require('../models/EventProduct');
const RegistrationProduct = require('../models/RegistrationProduct');
const { generateRegistrationCode } = require('../utils/registrationUtils');
const { db } = require('../database/db');
const paymentGateway = require('../services/PaymentGateway');

class RegistrationController {
  constructor() {
    this.paymentGateway = paymentGateway; // Use the exported instance directly
    
    // Verificar se o PaymentGateway foi inicializado corretamente
    if (!this.paymentGateway) {
      console.error('❌ PaymentGateway não foi inicializado corretamente');
      throw new Error('PaymentGateway não foi inicializado');
    }
    
    console.log('✅ PaymentGateway inicializado:', !!this.paymentGateway);
  }

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

      // Calcular valor total
      let totalAmount = 0;

      // Processar itens se houver
      if (items && items.length > 0) {
        console.log('🛍️ Processando itens:', items);
        
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
              unit_price: eventProduct.price,
              total_price: eventProduct.price * item.quantity,
              created_at: new Date(),
              updated_at: new Date()
            });

            totalAmount += eventProduct.price * item.quantity;
            console.log(`✅ Produto ${eventProduct.name} adicionado`);
          } else if (item.type === 'EVENT_TICKET') {
            // Ingresso do evento - calcular valor do lote
            if (item.lot_id) {
              const lot = await db('lots')
                .where('id', item.lot_id)
                .first();
              
              if (lot) {
                totalAmount += lot.price * item.quantity;
                console.log(`✅ Ingresso do lote ${lot.name} adicionado - R$ ${lot.price}`);
              }
            } else {
              // Se não tem lot_id, usar o preço do item
              totalAmount += item.price * item.quantity;
              console.log(`✅ Ingresso adicionado - R$ ${item.price}`);
            }
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

          totalAmount += product.unit_price * product.quantity;
          console.log(`✅ Produto da loja ${storeProduct.name} adicionado`);
        }
      }

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
        
        // Forçar totalAmount a ser pelo menos 1 se for 0
        if (totalAmount === 0) {
          console.log('⚠️ TotalAmount é 0, forçando para 1');
          totalAmount = 1;
        }
        
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
          
          const paymentResult = await this.paymentGateway.createPayment(paymentData);
          
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