import React, { useState } from 'react';
import './MerchStore.css';
import { PrintOnDemand } from './PrintOnDemand';

const MerchStore = () => {
  const [activeSection, setActiveSection] = useState('shop'); // 'shop' or 'print-on-demand'
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products] = useState([
    {
      id: 1,
      name: 'Anime Character T-Shirt',
      price: 29.99,
      category: 'clothing',
      image: 'https://via.placeholder.com/300x400/667eea/fff?text=T-Shirt',
      stock: 45,
      sizes: ['S', 'M', 'L', 'XL', 'XXL']
    },
    {
      id: 2,
      name: 'CGI Art Print Poster',
      price: 19.99,
      category: 'prints',
      image: 'https://via.placeholder.com/300x400/764ba2/fff?text=Poster',
      stock: 120,
      sizes: ['12x18', '18x24', '24x36']
    },
    {
      id: 3,
      name: 'Creator Logo Hoodie',
      price: 49.99,
      category: 'clothing',
      image: 'https://via.placeholder.com/300x400/f093fb/fff?text=Hoodie',
      stock: 28,
      sizes: ['S', 'M', 'L', 'XL', 'XXL']
    },
    {
      id: 4,
      name: 'Limited Edition Art Book',
      price: 39.99,
      category: 'books',
      image: 'https://via.placeholder.com/300x400/4facfe/fff?text=Book',
      stock: 50,
      sizes: ['Standard']
    },
    {
      id: 5,
      name: 'Character Sticker Pack',
      price: 9.99,
      category: 'accessories',
      image: 'https://via.placeholder.com/300x400/00f2fe/fff?text=Stickers',
      stock: 200,
      sizes: ['Pack of 10']
    },
    {
      id: 6,
      name: 'Coffee Mug',
      price: 14.99,
      category: 'accessories',
      image: 'https://via.placeholder.com/300x400/667eea/fff?text=Mug',
      stock: 85,
      sizes: ['11oz', '15oz']
    }
  ]);

  const addToCart = (product, size) => {
    const existingItem = cart.find(item => item.id === product.id && item.size === size);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id && item.size === size
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, size, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId, size) => {
    setCart(cart.filter(item => !(item.id === productId && item.size === size)));
  };

  const updateQuantity = (productId, size, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId, size);
    } else {
      setCart(cart.map(item =>
        item.id === productId && item.size === size
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category === selectedCategory);

  const checkout = () => {
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    alert(`Checkout - Total: $${getCartTotal().toFixed(2)}\n\nThis would redirect to payment processing.`);
  };

  return (
    <div className="merch-store">
      <div className="store-header">
        <h1>🛍️ Marketplace</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button 
            className={`section-tab ${activeSection === 'shop' ? 'active' : ''}`}
            onClick={() => setActiveSection('shop')}
            style={{
              padding: '10px 20px',
              background: activeSection === 'shop' ? '#667eea' : 'rgba(255,255,255,0.1)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            🛒 Merch Shop
          </button>
          <button 
            className={`section-tab ${activeSection === 'print-on-demand' ? 'active' : ''}`}
            onClick={() => setActiveSection('print-on-demand')}
            style={{
              padding: '10px 20px',
              background: activeSection === 'print-on-demand' ? '#667eea' : 'rgba(255,255,255,0.1)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            📦 Print On Demand
          </button>
          {activeSection === 'shop' && (
            <button className="cart-btn" onClick={() => setShowCart(!showCart)}>
              🛒 Cart ({getCartItemCount()})
            </button>
          )}
        </div>
      </div>

      {activeSection === 'print-on-demand' ? (
        <PrintOnDemand />
      ) : (
      <div className="store-layout">
        <aside className="store-sidebar">
          <h3>Categories</h3>
          <div className="category-list">
            <button 
              className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('all')}
            >
              All Products
            </button>
            <button 
              className={`category-btn ${selectedCategory === 'clothing' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('clothing')}
            >
              👕 Clothing
            </button>
            <button 
              className={`category-btn ${selectedCategory === 'prints' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('prints')}
            >
              🖼️ Prints
            </button>
            <button 
              className={`category-btn ${selectedCategory === 'books' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('books')}
            >
              📚 Books
            </button>
            <button 
              className={`category-btn ${selectedCategory === 'accessories' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('accessories')}
            >
              ✨ Accessories
            </button>
          </div>
        </aside>

        <main className="store-main">
          <div className="products-grid">
            {filteredProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={addToCart}
              />
            ))}
          </div>
        </main>

        {showCart && (
          <div className="cart-sidebar">
            <div className="cart-header">
              <h2>Shopping Cart</h2>
              <button className="close-cart" onClick={() => setShowCart(false)}>×</button>
            </div>

            {cart.length === 0 ? (
              <div className="empty-cart">
                <p>🛒</p>
                <p>Your cart is empty</p>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map((item, index) => (
                    <div key={`${item.id}-${item.size}-${index}`} className="cart-item">
                      <img src={item.image} alt={item.name} />
                      <div className="cart-item-info">
                        <h4>{item.name}</h4>
                        <p className="cart-item-size">Size: {item.size}</p>
                        <p className="cart-item-price">${item.price}</p>
                        <div className="cart-item-quantity">
                          <button onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}>-</button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}>+</button>
                        </div>
                      </div>
                      <button 
                        className="remove-item"
                        onClick={() => removeFromCart(item.id, item.size)}
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>

                <div className="cart-footer">
                  <div className="cart-total">
                    <span>Total:</span>
                    <span className="total-amount">${getCartTotal().toFixed(2)}</span>
                  </div>
                  <button className="checkout-btn" onClick={checkout}>
                    Checkout
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      )}
    </div>
  );
};

const ProductCard = ({ product, onAddToCart }) => {
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [showDetails, setShowDetails] = useState(false);

  const handleAddToCart = () => {
    onAddToCart(product, selectedSize);
    alert(`Added ${product.name} (${selectedSize}) to cart!`);
  };

  return (
    <div className="product-card">
      <div className="product-image">
        <img src={product.image} alt={product.name} />
        {product.stock < 20 && (
          <div className="low-stock-badge">Only {product.stock} left!</div>
        )}
      </div>

      <div className="product-info">
        <h3>{product.name}</h3>
        <p className="product-price">${product.price}</p>

        <div className="size-selector">
          <label>Size:</label>
          <select value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)}>
            {product.sizes.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>

        <div className="product-actions">
          <button className="add-to-cart-btn" onClick={handleAddToCart}>
            Add to Cart
          </button>
          <button className="details-btn" onClick={() => setShowDetails(!showDetails)}>
            {showDetails ? 'Hide' : 'Details'}
          </button>
        </div>

        {showDetails && (
          <div className="product-details">
            <p><strong>Stock:</strong> {product.stock} available</p>
            <p><strong>Category:</strong> {product.category}</p>
            <p><strong>Available Sizes:</strong> {product.sizes.join(', ')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MerchStore;
