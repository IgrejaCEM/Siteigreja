const StoreProduct = require('../models/StoreProduct');
const StoreOrder = require('../models/StoreOrder');
const StoreOrderItem = require('../models/StoreOrderItem');

class StoreProductController {
  // Listar todos os produtos da loja
  static async getAll(req, res) {
    try {
      const products = await StoreProduct.query()
        .where('active', true)
        .orderBy('created_at', 'desc');
      
      return res.json(products);
    } catch (error) {
      console.error('Erro ao listar produtos da loja:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Obter produto específico
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const product = await StoreProduct.query()
        .findById(id)
        .where('active', true);
      
      if (!product) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }
      
      return res.json(product);
    } catch (error) {
      console.error('Erro ao obter produto da loja:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Criar novo produto
  static async create(req, res) {
    try {
      const {
        name,
        description,
        price,
        stock,
        image_url,
        category
      } = req.body;

      const product = await StoreProduct.query().insert({
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        image_url,
        category,
        active: true
      });

      return res.status(201).json(product);
    } catch (error) {
      console.error('Erro ao criar produto da loja:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Atualizar produto
  static async update(req, res) {
    try {
      const { id } = req.params;
      const {
        name,
        description,
        price,
        stock,
        image_url,
        category,
        active
      } = req.body;

      const product = await StoreProduct.query()
        .findById(id)
        .patch({
          name,
          description,
          price: parseFloat(price),
          stock: parseInt(stock),
          image_url,
          category,
          active: active !== undefined ? active : true
        });

      if (!product) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      const updatedProduct = await StoreProduct.query().findById(id);
      return res.json(updatedProduct);
    } catch (error) {
      console.error('Erro ao atualizar produto da loja:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Deletar produto
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const deleted = await StoreProduct.query()
        .findById(id)
        .patch({ active: false });

      if (!deleted) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      return res.json({ message: 'Produto deletado com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar produto da loja:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Criar pedido da loja
  static async createOrder(req, res) {
    try {
      console.log('🏪 Recebendo pedido da loja:', req.body);
      const { customer, items } = req.body;

      // Validar dados
      if (!customer || !items || items.length === 0) {
        console.log('❌ Dados inválidos:', { customer, items });
        return res.status(400).json({ error: 'Dados do pedido inválidos' });
      }

      // Verificar estoque dos produtos
      for (const item of items) {
        const product = await StoreProduct.query()
          .findById(item.product_id)
          .where('active', true);

        if (!product) {
          console.log('❌ Produto não encontrado:', item.product_id);
          return res.status(400).json({ 
            error: `Produto ${item.product_id} não encontrado` 
          });
        }

        if (product.stock < item.quantity) {
          console.log('❌ Estoque insuficiente:', product.name);
          return res.status(400).json({ 
            error: `Estoque insuficiente para o produto ${product.name}` 
          });
        }
      }

      // Criar pedido com campos opcionais
      const orderData = {
        customer_name: customer.name || '',
        customer_email: customer.email || '',
        customer_phone: customer.phone || '',
        customer_cpf: customer.cpf || null,
        customer_address: customer.address ? JSON.stringify(customer.address) : null,
        status: 'pending',
        total_amount: 0
      };

      console.log('📝 Criando pedido:', orderData);
      const order = await StoreOrder.query().insert(orderData);

      // Adicionar itens ao pedido e calcular total
      let totalAmount = 0;
      for (const item of items) {
        const product = await StoreProduct.query().findById(item.product_id);
        
        const itemData = {
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.price || product.price,
          total_price: item.quantity * (item.price || product.price)
        };

        console.log('📦 Adicionando item:', itemData);
        await StoreOrderItem.query().insert(itemData);

        // Atualizar estoque
        await StoreProduct.query()
          .findById(item.product_id)
          .patch({ stock: product.stock - item.quantity });

        totalAmount += itemData.total_price;
      }

      // Atualizar total do pedido
      await StoreOrder.query()
        .findById(order.id)
        .patch({ total_amount: totalAmount });

      console.log('✅ Pedido criado com sucesso:', order.id);

      // Gerar payment_url
      const paymentInfo = {
        payment_url: `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=STORE-${order.id}`,
        payment_id: `STORE-PAY-${order.id}`
      };

      const completeOrder = await StoreOrder.query()
        .findById(order.id)
        .withGraphFetched('items.product');

      return res.status(201).json({
        id: completeOrder.id,
        payment_url: paymentInfo.payment_url,
        payment_id: paymentInfo.payment_id,
        status: 'pending'
      });
    } catch (error) {
      console.error('❌ Erro ao criar pedido da loja:', error);
      console.error('📋 Stack:', error.stack);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Listar pedidos (admin)
  static async getOrders(req, res) {
    try {
      const orders = await StoreOrder.query()
        .withGraphFetched('items.product')
        .orderBy('created_at', 'desc');

      return res.json(orders);
    } catch (error) {
      console.error('Erro ao listar pedidos da loja:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Obter pedido específico (admin)
  static async getOrderById(req, res) {
    try {
      const { id } = req.params;
      const order = await StoreOrder.query()
        .findById(id)
        .withGraphFetched('items.product');

      if (!order) {
        return res.status(404).json({ error: 'Pedido não encontrado' });
      }

      return res.json(order);
    } catch (error) {
      console.error('Erro ao obter pedido da loja:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

module.exports = StoreProductController; 