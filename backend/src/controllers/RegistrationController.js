const { db } = require('../database/db');
const PaymentGateway = require('../services/PaymentGateway');
const StoreProduct = require('../models/StoreProduct');

class RegistrationController {
  constructor() {
    this.generateRegistrationCode = this.generateRegistrationCode.bind(this);
    this.create = this.create.bind(this);
    this.list = this.list.bind(this);
    this.getById = this.getById.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  generateRegistrationCode() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `REG-${timestamp}-${random}`.toUpperCase();
  }

  async create(req, res) {
    try {
      console.log('🔄 Iniciando criação de inscrição...');
      console.log('📦 Dados recebidos:', JSON.stringify(req.body, null, 2));

      const {
        event_id,
        customer,
        items = [],
        products = [],
        totalAmount: clientTotalAmount
      } = req.body;

      // Validações básicas
      if (!customer || !customer.name || !customer.email || !customer.phone) {
        return res.status(400).json({
          error: 'Dados do cliente incompletos',
          details: 'Nome, email e telefone são obrigatórios'
        });
      }

      // Processar dados do cliente
      const finalName = customer.name.trim();
      const finalEmail = customer.email.trim().toLowerCase();
      const finalPhone = customer.phone.trim();
      const finalCpf = customer.cpf && customer.cpf.trim() !== '' ? customer.cpf.trim() : null;
      const finalAddress = customer.address || null;
      const form_data = customer.form_data || null;

      // Gerar código de inscrição
      const registrationCode = this.generateRegistrationCode();
      console.log('🎫 Código de inscrição gerado:', registrationCode);

      // Criar inscrição no banco
      const [registration] = await db('registrations').insert({
        event_id: event_id === 999 ? null : event_id, // Para event_id 999, usar null
        name: finalName,
        email: finalEmail,
        phone: finalPhone,
        cpf: finalCpf,
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

      // Processar itens (tickets do evento)
      if (items && items.length > 0) {
        console.log('🛍️ Processando itens (tickets):', items);
        
        for (const item of items) {
          if (item.type === 'EVENT_TICKET' || item.type === 'event_ticket') {
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
      
      console.log('💰 TotalAmount após processar itens (tickets):', totalAmount);

      // Processar produtos da loja geral (store_products)
      if (products && products.length > 0) {
        console.log('🛍️ Processando produtos da loja geral...');
        console.log('🛍️ Produtos recebidos:', products);
        
        // Verificar conexão com banco
        console.log('🔍 Verificando conexão com banco...');
        try {
          const dbTest = await db('store_products').count('* as total');
          console.log('🔍 Teste de conexão com banco:', dbTest);
        } catch (dbError) {
          console.log('❌ Erro na conexão com banco:', dbError.message);
        }
        
        for (const product of products) {
          console.log(`🛍️ Processando produto:`, product);
          console.log(`🛍️ product_id: ${product.product_id} (tipo: ${typeof product.product_id})`);
          
          // Buscar produto na loja geral (store_products)
          console.log('🔍 Buscando na loja geral (store_products)...');
          let storeProduct = null;
          
          try {
            // Tentar com diferentes tipos de ID
            const productId = parseInt(product.product_id) || product.product_id;
            console.log('🔍 Product ID para busca:', productId, '(tipo:', typeof productId, ')');
            
            // Teste 1: Buscar sem filtro active
            console.log('🔍 Teste 1: Buscar sem filtro active...');
            storeProduct = await db('store_products')
              .where('id', productId)
              .first();
            
            console.log('🔍 Resultado teste 1:', !!storeProduct);
            
            if (!storeProduct) {
              // Teste 2: Buscar com filtro active
              console.log('🔍 Teste 2: Buscar com filtro active...');
              storeProduct = await db('store_products')
                .where('id', productId)
                .where('active', true)
                .first();
              
              console.log('🔍 Resultado teste 2:', !!storeProduct);
            }
            
            if (!storeProduct) {
              // Teste 3: Buscar todos os produtos
              console.log('🔍 Teste 3: Buscar todos os produtos...');
              const allProducts = await db('store_products').select('*');
              console.log('🔍 Total de produtos encontrados:', allProducts.length);
              console.log('🔍 IDs dos produtos:', allProducts.map(p => p.id));
              
              // Teste 4: Buscar por string
              console.log('🔍 Teste 4: Buscar por string...');
              storeProduct = await db('store_products')
                .where('id', productId.toString())
                .first();
              
              console.log('🔍 Resultado teste 4:', !!storeProduct);
            }
            
            console.log('🔍 Produto encontrado na loja geral:', !!storeProduct);
            if (storeProduct) {
              console.log('🔍 Dados do produto encontrado:', {
                id: storeProduct.id,
                name: storeProduct.name,
                price: storeProduct.price,
                stock: storeProduct.stock
              });
            }
          } catch (error) {
            console.log('❌ Erro ao buscar na loja geral:', error.message);
            console.log('❌ Stack:', error.stack);
          }
          
          if (!storeProduct) {
            console.error(`❌ Produto ${product.product_id} não encontrado na loja geral`);
            console.log('🔍 Tentando buscar todos os produtos para debug...');
            try {
              const allProducts = await db('store_products').select('*');
              console.log('🔍 Todos os produtos na loja geral:', allProducts);
            } catch (error) {
              console.log('❌ Erro ao buscar todos os produtos:', error.message);
            }
            continue;
          }
          
          if (storeProduct.stock < product.quantity) {
            console.error(`❌ Estoque insuficiente para produto ${storeProduct.name}`);
            continue;
          }
          
          // Calcular valor do produto
          const productValue = parseFloat(storeProduct.price) * product.quantity;
          totalAmount += productValue;
          console.log(`💰 Produto ${storeProduct.name}: R$ ${storeProduct.price} x ${product.quantity} = R$ ${productValue}`);
          console.log(`💰 TotalAmount atualizado: R$ ${totalAmount}`);
          
          // Inserir na tabela de produtos da loja da inscrição
          await db('registration_store_products').insert({
            registration_id: registration.id,
            product_id: storeProduct.id,
            quantity: product.quantity,
            unit_price: storeProduct.price,
            total_price: productValue
          });
          
          // Atualizar estoque
          await db('store_products')
            .where('id', storeProduct.id)
            .decrement('stock', product.quantity);
        }
      }
      
      console.log('💰 TotalAmount final após todos os itens:', totalAmount);

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
            },
            items: items,
            products: products
          };

          console.log('💳 Dados para pagamento:', JSON.stringify(paymentData, null, 2));
          
          paymentInfo = await PaymentGateway.createPayment(paymentData);
          console.log('✅ Pagamento criado:', paymentInfo);
          
        } catch (paymentError) {
          console.error('❌ Erro ao criar pagamento:', paymentError);
          return res.status(500).json({
            error: 'Erro ao processar pagamento',
            details: paymentError.message
          });
        }
      }

      // Retornar resposta
      const response = {
        success: true,
        registration: {
          id: registration.id,
          registration_code: registrationCode,
          status: registration.status,
          payment_status: registration.payment_status
        },
        payment: paymentInfo ? {
          payment_url: paymentInfo.payment_url,
          preference_id: paymentInfo.preference_id
        } : null,
        totalAmount: totalAmount
      };

      console.log('✅ Resposta final:', JSON.stringify(response, null, 2));
      return res.status(201).json(response);

    } catch (error) {
      console.error('❌ Erro na criação de inscrição:', error);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }

  async list(req, res) {
    try {
      const registrations = await db('registrations').select('*').orderBy('created_at', 'desc');
      res.json(registrations);
    } catch (error) {
      console.error('Erro ao listar inscrições:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const registration = await db('registrations').where('id', id).first();
      
      if (!registration) {
        return res.status(404).json({ error: 'Inscrição não encontrada' });
      }
      
      res.json(registration);
    } catch (error) {
      console.error('Erro ao buscar inscrição:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const updated = await db('registrations')
        .where('id', id)
        .update({
          ...updateData,
          updated_at: new Date()
        });
      
      if (updated === 0) {
        return res.status(404).json({ error: 'Inscrição não encontrada' });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Erro ao atualizar inscrição:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      
      const deleted = await db('registrations').where('id', id).del();
      
      if (deleted === 0) {
        return res.status(404).json({ error: 'Inscrição não encontrada' });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Erro ao deletar inscrição:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

module.exports = new RegistrationController(); 