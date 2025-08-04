const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.')); // Serve static files from current directory

// In-memory storage (in production, use a real database)
let orders = [];
let payments = [];

// Load products data
const loadProducts = () => {
    try {
        const productsData = fs.readFileSync(path.join(__dirname, 'products.json'), 'utf8');
        return JSON.parse(productsData);
    } catch (error) {
        console.error('Error loading products:', error);
        return { products: [], categories: [] };
    }
};

// ===== API ROUTES =====

// Get all products
app.get('/api/products', (req, res) => {
    try {
        const data = loadProducts();
        res.json(data.products);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load products' });
    }
});

// Get products by category
app.get('/api/products/category/:categoryId', (req, res) => {
    try {
        const { categoryId } = req.params;
        const data = loadProducts();
        const filteredProducts = data.products.filter(product => product.category === categoryId);
        res.json(filteredProducts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load products by category' });
    }
});

// Get all categories
app.get('/api/categories', (req, res) => {
    try {
        const data = loadProducts();
        res.json(data.categories);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load categories' });
    }
});

// Get single product by ID
app.get('/api/products/:productId', (req, res) => {
    try {
        const { productId } = req.params;
        const data = loadProducts();
        const product = data.products.find(p => p.id === productId);
        
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load product' });
    }
});

// Create new order
app.post('/api/orders', (req, res) => {
    try {
        const { items, customerInfo, totalAmount } = req.body;
        
        if (!items || !customerInfo || !totalAmount) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const order = {
            id: uuidv4(),
            items,
            customerInfo,
            totalAmount,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        orders.push(order);
        
        res.status(201).json({
            success: true,
            orderId: order.id,
            message: 'Order created successfully'
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// Process payment
app.post('/api/payments', (req, res) => {
    try {
        const { orderId, paymentMethod, cardInfo, amount } = req.body;
        
        if (!orderId || !paymentMethod || !amount) {
            return res.status(400).json({ error: 'Missing required payment information' });
        }

        // Simulate payment processing
        const payment = {
            id: uuidv4(),
            orderId,
            paymentMethod,
            amount,
            status: 'processing',
            createdAt: new Date().toISOString()
        };

        // Simulate payment processing delay
        setTimeout(() => {
            // Simulate successful payment (90% success rate)
            const isSuccessful = Math.random() > 0.1;
            payment.status = isSuccessful ? 'completed' : 'failed';
            payment.updatedAt = new Date().toISOString();
            
            // Update order status
            const order = orders.find(o => o.id === orderId);
            if (order) {
                order.status = isSuccessful ? 'paid' : 'payment_failed';
                order.updatedAt = new Date().toISOString();
            }
            
            payments.push(payment);
        }, 2000);

        res.json({
            success: true,
            paymentId: payment.id,
            message: 'Payment processing started'
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to process payment' });
    }
});

// Get payment status
app.get('/api/payments/:paymentId', (req, res) => {
    try {
        const { paymentId } = req.params;
        const payment = payments.find(p => p.id === paymentId);
        
        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }
        
        res.json(payment);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get payment status' });
    }
});

// Get order by ID
app.get('/api/orders/:orderId', (req, res) => {
    try {
        const { orderId } = req.params;
        const order = orders.find(o => o.id === orderId);
        
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get order' });
    }
});

// Update order status
app.patch('/api/orders/:orderId', (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        
        const order = orders.find(o => o.id === orderId);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        order.status = status;
        order.updatedAt = new Date().toISOString();
        
        res.json({
            success: true,
            message: 'Order status updated successfully'
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update order status' });
    }
});

// Search products
app.get('/api/products/search/:query', (req, res) => {
    try {
        const { query } = req.params;
        const data = loadProducts();
        
        const searchResults = data.products.filter(product => 
            product.name.toLowerCase().includes(query.toLowerCase()) ||
            product.description.toLowerCase().includes(query.toLowerCase()) ||
            product.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        );
        
        res.json(searchResults);
    } catch (error) {
        res.status(500).json({ error: 'Failed to search products' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 TheMarket4All API server running on port ${PORT}`);
    console.log(`📦 Products API: http://localhost:${PORT}/api/products`);
    console.log(`💳 Payments API: http://localhost:${PORT}/api/payments`);
    console.log(`🛒 Orders API: http://localhost:${PORT}/api/orders`);
    console.log(`🏠 Website: http://localhost:${PORT}`);
});

module.exports = app; 