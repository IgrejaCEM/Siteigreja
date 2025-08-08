const { db } = require('../database/db');
const PaymentGateway = require('../services/PaymentGateway');

class RegistrationController {
  constructor() {
    this.create = this.create.bind(this);
  }

  async create(req, res) {
    try {
      console.log('🔄 Iniciando criação de inscrição...');
      console.log('📦 Dados recebidos:', JSON.stringify(req.body, null, 2));

      const { event_id, customer, items, products } = req.body;

      // Validar dados obrigatórios
      if (!event_id || !customer || !items || !Array.isArray(items)) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: 'event_id, customer e items são obrigatórios'
        });
      }

      // Gerar código de inscrição único
      const registrationCode = this.generateRegistrationCode();
      console.log('🎫 Código de inscrição gerado:', registrationCode);

      // Criar inscrição
      const [registration] = await db('registrations').insert({
        event_id: event_id === 999 ? null : event_id,
        registration_code: registrationCode,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        cpf: customer.cpf || null,
        address: customer.address ? JSON.stringify(customer.address) : null,
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date()
      }).returning('*');

      console.log('✅ Inscrição criada:', registration.id);

      // Calcular valor total
      let totalAmount = 0;
      console.log('💰 Iniciando cálculo do valor total...');

      // Processar itens (tickets)
      console.log('🛍️ Processando itens (tickets):', items);
      for (const item of items) {
        if (item.type === 'EVENT_TICKET' || item.type === 'event_ticket') {
          console.log(`🔍 Buscando lote: ${item.lot_id}`);
          
          // Buscar lote no banco
          const lot = await db('lots')
            .where('id', item.lot_id)
            .where('event_id', event_id)
            .first();

          if (lot) {
            const ticketValue = parseFloat(lot.price) * item.quantity;
            totalAmount += ticketValue;
            console.log(`✅ Ingresso do lote ${lot.name} adicionado - R$ ${lot.price}`);
            console.log(`💰 TotalAmount após ingresso: R$ ${totalAmount}`);

            // Inserir na tabela de ingressos da inscrição (opcional)
            try {
              await db('registration_tickets').insert({
                registration_id: registration.id,
                lot_id: lot.id,
                quantity: item.quantity,
                unit_price: lot.price,
                total_price: ticketValue
              });
              console.log('✅ Ticket inserido na tabela registration_tickets');
            } catch (error) {
              console.log('⚠️ Erro ao inserir na tabela registration_tickets:', error.message);
              console.log('⚠️ Continuando sem inserir na tabela de relacionamento...');
            }
          } else {
            // Fallback: usar o preço fornecido no item
            const ticketValue = parseFloat(item.price) * item.quantity;
            totalAmount += ticketValue;
            console.log(`⚠️ Lote não encontrado, usando preço do item: R$ ${item.price}`);
            console.log(`💰 TotalAmount após ingresso (fallback): R$ ${totalAmount}`);
          }
        }
      }

      console.log(`💰 TotalAmount após processar itens (tickets): ${totalAmount}`);

      // Processar produtos (event_products OU store_products)
      if (products && products.length > 0) {
        console.log('🛍️ Processando produtos do evento...');
        console.log('🛍️ Produtos recebidos:', products);
        
        for (const product of products) {
          console.log(`🛍️ Processando produto:`, product);
          console.log(`🛍️ product_id: ${product.product_id} (tipo: ${typeof product.product_id})`);
          
          // Buscar produto no evento (event_products) ou na loja geral (store_products)
          console.log('🔍 Buscando na loja do evento (event_products)...');
          let eventProduct = null;
          let storeProduct = null;
          
          try {
            const productId = parseInt(product.product_id) || product.product_id;
            console.log('🔍 Product ID para busca:', productId, '(tipo:', typeof productId, ')');
            
            // Buscar produto do evento
            if (event_id) {
              eventProduct = await db('event_products')
                .where('id', productId)
                .where('event_id', event_id)
                .where('is_active', true)
                .first();
            }
            
            console.log('🔍 Produto encontrado na loja do evento:', !!eventProduct);
            if (eventProduct) {
              console.log('🔍 Dados do produto encontrado:', {
                id: eventProduct.id,
                name: eventProduct.name,
                price: eventProduct.price,
                stock: eventProduct.stock
              });
            }
          } catch (error) {
            console.log('❌ Erro ao buscar na loja do evento:', error.message);
          }
          
          if (!eventProduct) {
            // Tentar na loja geral
            console.log('🔎 Produto não encontrado no event_products. Buscando na loja geral (store_products)...');
            try {
              storeProduct = await db('store_products')
                .where('id', parseInt(product.product_id))
                .where('active', true)
                .first();
            } catch (e) {
              console.log('❌ Erro ao buscar store_products:', e.message);
            }

            if (!storeProduct) {
              console.error(`❌ Produto ${product.product_id} não encontrado nem na loja do evento nem na loja geral`);
              // Fallback: ainda assim tentar usar unit_price enviado para não travar
              const fallbackValue = parseFloat(product.unit_price || 0) * (product.quantity || 1);
              totalAmount += fallbackValue;
              console.log(`🪙 Fallback usando unit_price do payload: ${product.unit_price} x ${product.quantity} = ${fallbackValue}`);
              continue;
            }

            if (storeProduct.stock < product.quantity) {
              console.error(`❌ Estoque insuficiente para produto da loja ${storeProduct.name}`);
              continue;
            }

            // Calcular valor do produto da loja
            const storeUnitPrice = storeProduct.price ?? product.unit_price ?? 0;
            const storeProductValue = parseFloat(storeUnitPrice) * product.quantity;
            totalAmount += storeProductValue;
            console.log(`💰 Produto (loja) ${storeProduct.name}: R$ ${storeProduct.price} x ${product.quantity} = R$ ${storeProductValue}`);
            console.log(`💰 TotalAmount atualizado: R$ ${totalAmount}`);

            // Registrar em registration_store_products, se existir
            try {
              await db('registration_store_products').insert({
                registration_id: registration.id,
                product_id: storeProduct.id,
                quantity: product.quantity,
                unit_price: storeUnitPrice
              });
              console.log('✅ Produto inserido em registration_store_products');
            } catch (error) {
              console.log('⚠️ Erro ao inserir em registration_store_products:', error.message);
            }

            // Atualizar estoque na loja
            try {
              await db('store_products')
                .where('id', storeProduct.id)
                .decrement('stock', product.quantity);
            } catch (error) {
              console.log('⚠️ Erro ao decrementar estoque store_products:', error.message);
            }
          } else {
            // Fluxo normal: produto do evento
            if (eventProduct.stock < product.quantity) {
              console.error(`❌ Estoque insuficiente para produto ${eventProduct.name}`);
              continue;
            }

            const productValue = parseFloat(eventProduct.price) * product.quantity;
            totalAmount += productValue;
            console.log(`💰 Produto ${eventProduct.name}: R$ ${eventProduct.price} x ${product.quantity} = R$ ${productValue}`);
            console.log(`💰 TotalAmount atualizado: R$ ${totalAmount}`);

            try {
              await db('registration_products').insert({
                registration_id: registration.id,
                product_id: eventProduct.id,
                quantity: product.quantity,
                unit_price: eventProduct.price,
                total_price: productValue
              });
              console.log('✅ Produto inserido na tabela registration_products');
            } catch (error) {
              console.log('⚠️ Erro ao inserir na tabela registration_products:', error.message);
              console.log('⚠️ Continuando sem inserir na tabela de relacionamento...');
            }

            // Atualizar estoque do produto do evento
            await db('event_products')
              .where('id', eventProduct.id)
              .decrement('stock', product.quantity);
          }
        }
      }

      console.log(`💰 TotalAmount final após todos os itens: ${totalAmount}`);
      console.log(`🔍 Verificando totalAmount: ${totalAmount}`);

      if (totalAmount <= 0) {
        console.log(`⚠️ TotalAmount é inválido: ${totalAmount}`);
        return res.status(400).json({
          error: 'Valor total inválido',
          details: 'O valor total deve ser maior que zero'
        });
      }

      console.log(`✅ TotalAmount válido: ${totalAmount}`);

      // Verificar se há itens para processar
      console.log('🔍 Verificando condições para pagamento:');
      console.log('   - items:', items);
      console.log('   - products:', products);
      console.log('   - items.length:', items.length);
      console.log('   - products.length:', products ? products.length : 0);
      console.log('   - totalAmount:', totalAmount);

      if (items.length === 0 && (!products || products.length === 0)) {
        console.log('❌ Nenhum item para processar');
        return res.status(400).json({
          error: 'Carrinho vazio',
          details: 'Adicione pelo menos um item ao carrinho'
        });
      }

      console.log('✅ Condições atendidas - criando pagamento real no MercadoPago...');

      // Criar pagamento no MercadoPago
      const paymentData = {
        amount: totalAmount,
        description: `Inscrição ${registrationCode}`,
        customer: {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          registration_code: registrationCode,
          id: registration.id,
          event_id: event_id
        },
        items: items,
        products: products || []
      };

      console.log('💰 Valor total:', totalAmount);
      console.log('🎫 Lot ID:', null);
      console.log('🏪 Produtos:', products || []);
      console.log('💳 Dados para pagamento:', JSON.stringify(paymentData, null, 2));

      const payment = await PaymentGateway.createPayment(paymentData);

      if (!payment || !payment.payment_url) {
        console.log('❌ Erro ao criar pagamento no MercadoPago');
        return res.status(500).json({
          error: 'Erro ao processar pagamento',
          details: 'Não foi possível criar o pagamento'
        });
      }

      console.log('✅ Pagamento criado:', payment);

      // Retornar resposta
      const response = {
        success: true,
        registration: {
          id: registration.id,
          registration_code: registrationCode,
          status: 'pending',
          payment_status: 'pending'
        },
        payment: {
          payment_url: payment.payment_url
        },
        totalAmount: totalAmount
      };

      console.log('✅ Resposta final:', JSON.stringify(response, null, 2));
      return res.status(201).json(response);

    } catch (error) {
      console.error('❌ Erro ao criar inscrição:', error);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }

  generateRegistrationCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const prefix = 'REG-';
    const suffix = '-';
    const codeLength = 8;
    
    let code = prefix;
    for (let i = 0; i < codeLength; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    code += suffix;
    
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return code;
  }
}

module.exports = new RegistrationController(); 