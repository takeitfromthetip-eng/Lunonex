import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AICompanionStore = () => {
  const [cart, setCart] = useState([]);
  const [activeTab, setActiveTab] = useState('companions');
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUserId(data.user.id);
    });
  }, []);

  const STORE_ITEMS = {
    companions: [
      { id: 'companion_surfer', name: 'Surfer Girl', price: 100.00, desc: 'Beach-loving, laid-back companion', rating: 'PG' },
      { id: 'companion_skater', name: 'Skater Girl', price: 100.00, desc: 'Rebellious, adventurous skateboarder', rating: 'PG' },
      { id: 'companion_musician', name: 'Musician', price: 100.00, desc: 'Guitar-playing creative soul', rating: 'G' },
      { id: 'companion_nun', name: 'Strict Catholic Nun', price: 100.00, desc: 'Devout, disciplined spiritual guide', rating: 'G' },
      { id: 'companion_yoga', name: 'Yoga Instructor', price: 100.00, desc: 'Peaceful, mindful wellness coach', rating: 'G' },
      { id: 'companion_gamer', name: 'Gamer Girl', price: 100.00, desc: 'Competitive, nerdy gaming partner', rating: 'PG' },
      { id: 'companion_chef', name: 'Chef', price: 100.00, desc: 'Culinary expert who loves cooking', rating: 'G' },
      { id: 'companion_scientist', name: 'Scientist', price: 100.00, desc: 'Brilliant, curious researcher', rating: 'G' },
      { id: 'companion_artist', name: 'Artist', price: 100.00, desc: 'Creative painter and sculptor', rating: 'G' },
      { id: 'companion_librarian', name: 'Librarian', price: 100.00, desc: 'Bookish, intelligent knowledge keeper', rating: 'G' },
      { id: 'companion_dancer', name: 'Professional Dancer', price: 100.00, desc: 'Graceful ballet and contemporary dancer', rating: 'PG' },
      { id: 'companion_bartender', name: 'Bartender', price: 100.00, desc: 'Charismatic mixologist', rating: 'PG-13' },
      { id: 'companion_cowgirl', name: 'Cowgirl', price: 100.00, desc: 'Ranch-living rodeo champion', rating: 'PG' },
      { id: 'companion_mermaid', name: 'Mermaid', price: 100.00, desc: 'Mystical ocean dweller', rating: 'G' },
      { id: 'companion_bdsm', name: 'BDSM Mistress', price: 100.00, desc: 'Dominant, experienced instructor (18+)', rating: 'XXX' },
      { id: 'companion_succubus', name: 'Succubus', price: 100.00, desc: 'Seductive supernatural entity (18+)', rating: 'XXX' },
    ],
    pets: [
      { id: 'pet_horse', name: 'Horse', price: 100.00, desc: 'Majestic companion animal', rating: 'G' },
      { id: 'pet_dog', name: 'Golden Retriever', price: 100.00, desc: 'Loyal, playful best friend', rating: 'G' },
      { id: 'pet_cat', name: 'Persian Cat', price: 100.00, desc: 'Elegant, independent feline', rating: 'G' },
      { id: 'pet_parrot', name: 'Talking Parrot', price: 100.00, desc: 'Colorful, chatty bird', rating: 'G' },
      { id: 'pet_dragon', name: 'Baby Dragon', price: 100.00, desc: 'Mythical fantasy companion', rating: 'PG' },
      { id: 'pet_wolf', name: 'Wolf', price: 100.00, desc: 'Wild, protective guardian', rating: 'PG' },
    ],
    voices: [
      { id: 'voice_sultry', name: 'Sultry Female', price: 0.99, desc: 'Deep, seductive tone', rating: 'R' },
      { id: 'voice_innocent', name: 'Innocent Female', price: 0.99, desc: 'Sweet, youthful voice', rating: 'PG' },
      { id: 'voice_british', name: 'British Accent', price: 0.99, desc: 'Elegant UK English', rating: 'G' },
      { id: 'voice_southern', name: 'Southern Belle', price: 0.99, desc: 'Warm Southern drawl', rating: 'G' },
      { id: 'voice_anime', name: 'Anime Voice', price: 0.99, desc: 'High-pitched Japanese style', rating: 'PG' },
      { id: 'voice_mature', name: 'Mature Professional', price: 0.99, desc: 'Confident, authoritative', rating: 'G' },
      { id: 'voice_whisper', name: 'ASMR Whisper', price: 0.99, desc: 'Soft, relaxing tones', rating: 'PG' },
      { id: 'voice_robotic', name: 'Robotic AI', price: 0.99, desc: 'Synthetic android voice', rating: 'G' },
    ],
    hairstyles: [
      { id: 'hair_pixie', name: 'Pixie Cut', price: 0.99, desc: 'Short and stylish', rating: 'G' },
      { id: 'hair_long', name: 'Long Flowing Hair', price: 0.99, desc: 'Waist-length beauty', rating: 'G' },
      { id: 'hair_ponytail', name: 'High Ponytail', price: 0.99, desc: 'Athletic and practical', rating: 'G' },
      { id: 'hair_braids', name: 'Dutch Braids', price: 0.99, desc: 'Intricate woven style', rating: 'G' },
      { id: 'hair_bob', name: 'Bob Cut', price: 0.99, desc: 'Classic chin-length', rating: 'G' },
      { id: 'hair_curly', name: 'Curly Afro', price: 0.99, desc: 'Natural voluminous curls', rating: 'G' },
      { id: 'hair_bun', name: 'Elegant Bun', price: 0.99, desc: 'Sophisticated updo', rating: 'G' },
      { id: 'hair_mohawk', name: 'Mohawk', price: 0.99, desc: 'Punk rock edge', rating: 'PG' },
    ],
    environments: [
      { id: 'env_beach', name: 'Tropical Beach', price: 9.99, desc: 'Sandy paradise with waves', rating: 'G' },
      { id: 'env_skatepark', name: 'Skatepark', price: 7.99, desc: 'Urban skating arena', rating: 'PG' },
      { id: 'env_church', name: 'Gothic Cathedral', price: 12.99, desc: 'Sacred stone sanctuary', rating: 'G' },
      { id: 'env_yoga_studio', name: 'Yoga Studio', price: 8.99, desc: 'Zen meditation space', rating: 'G' },
      { id: 'env_concert_hall', name: 'Concert Hall', price: 14.99, desc: 'Grand performance venue', rating: 'PG' },
      { id: 'env_library', name: 'Ancient Library', price: 11.99, desc: 'Floor-to-ceiling books', rating: 'G' },
      { id: 'env_ranch', name: 'Western Ranch', price: 13.99, desc: 'Rustic barn and fields', rating: 'G' },
      { id: 'env_underwater', name: 'Underwater Grotto', price: 15.99, desc: 'Mystical ocean cave', rating: 'PG' },
      { id: 'env_bedroom_luxury', name: 'Luxury Bedroom', price: 19.99, desc: 'Silk sheets and candles', rating: 'R' },
      { id: 'env_hot_tub', name: 'Mountain Hot Tub', price: 17.99, desc: 'Scenic outdoor spa', rating: 'PG-13' },
      { id: 'env_dungeon', name: 'BDSM Dungeon', price: 24.99, desc: 'Equipped playroom (18+)', rating: 'XXX' },
      { id: 'env_strip_club', name: 'VIP Strip Club', price: 22.99, desc: 'Private booth (18+)', rating: 'XXX' },
    ],
    props: [
      { id: 'prop_surfboard', name: 'Surfboard', price: 0.99, desc: 'Ride the waves', rating: 'G' },
      { id: 'prop_skateboard', name: 'Skateboard', price: 0.99, desc: 'Street skating deck', rating: 'G' },
      { id: 'prop_guitar', name: 'Acoustic Guitar', price: 2.99, desc: 'Musical instrument', rating: 'G' },
      { id: 'prop_rosary', name: 'Rosary Beads', price: 0.99, desc: 'Prayer accessory', rating: 'G' },
      { id: 'prop_yoga_mat', name: 'Yoga Mat', price: 0.99, desc: 'Meditation surface', rating: 'G' },
      { id: 'prop_controller', name: 'Gaming Controller', price: 1.99, desc: 'Play games together', rating: 'PG' },
      { id: 'prop_whisk', name: 'Chef Whisk', price: 0.99, desc: 'Cooking utensil', rating: 'G' },
      { id: 'prop_paintbrush', name: 'Paint Brush Set', price: 2.99, desc: 'Art supplies', rating: 'G' },
      { id: 'prop_book', name: 'Ancient Book', price: 0.99, desc: 'Reading material', rating: 'G' },
      { id: 'prop_wine', name: 'Wine Bottle', price: 1.99, desc: 'Romantic beverage', rating: 'R' },
      { id: 'prop_saddle', name: 'Horse Saddle', price: 3.99, desc: 'Riding equipment', rating: 'G' },
      { id: 'prop_vibrator', name: 'Vibrator', price: 0.99, desc: 'Intimate toy (18+)', rating: 'XXX' },
      { id: 'prop_handcuffs', name: 'Fuzzy Handcuffs', price: 0.99, desc: 'Restraint accessory (18+)', rating: 'XXX' },
      { id: 'prop_whip', name: 'Leather Whip', price: 2.99, desc: 'BDSM implement (18+)', rating: 'XXX' },
      { id: 'prop_blindfold', name: 'Silk Blindfold', price: 0.99, desc: 'Sensory play (18+)', rating: 'R' },
    ],
    kits: [
      { id: 'kit_surfer', name: 'Surfer Starter Kit', price: 14.99, desc: 'Board, wetsuit, beach vibes', rating: 'G' },
      { id: 'kit_skater', name: 'Skater Gear Bundle', price: 12.99, desc: 'Board, helmet, attitude', rating: 'PG' },
      { id: 'kit_musician', name: 'Musician Bundle', price: 19.99, desc: 'Guitar, mic, amp', rating: 'G' },
      { id: 'kit_yoga', name: 'Yoga Wellness Kit', price: 11.99, desc: 'Mat, blocks, incense', rating: 'G' },
      { id: 'kit_ranch', name: 'Ranch Life Bundle', price: 24.99, desc: 'Saddle, boots, lasso', rating: 'G' },
      { id: 'kit_bdsm_starter', name: 'BDSM Starter Kit', price: 9.99, desc: 'Cuffs, blindfold, feather (18+)', rating: 'XXX' },
      { id: 'kit_bdsm_advanced', name: 'BDSM Advanced Kit', price: 29.99, desc: 'Rope, gag, paddle, clamps (18+)', rating: 'XXX' },
      { id: 'kit_bdsm_master', name: 'BDSM Master Kit', price: 49.99, desc: 'Full dungeon equipment (18+)', rating: 'XXX' },
    ],
    outfits: [
      { id: 'outfit_bikini', name: 'Bikini', price: 2.99, desc: 'Beach swimwear', rating: 'PG-13' },
      { id: 'outfit_skater', name: 'Skater Outfit', price: 3.99, desc: 'Baggy jeans and graphic tee', rating: 'PG' },
      { id: 'outfit_nun', name: 'Nun Habit', price: 4.99, desc: 'Traditional religious garb', rating: 'G' },
      { id: 'outfit_yoga', name: 'Yoga Pants Set', price: 2.99, desc: 'Athletic wear', rating: 'PG' },
      { id: 'outfit_cowgirl', name: 'Cowgirl Outfit', price: 5.99, desc: 'Boots, jeans, hat', rating: 'PG' },
      { id: 'outfit_chef', name: 'Chef Uniform', price: 3.99, desc: 'White coat and hat', rating: 'G' },
      { id: 'outfit_lab', name: 'Lab Coat', price: 2.99, desc: 'Scientist attire', rating: 'G' },
      { id: 'outfit_cocktail', name: 'Cocktail Dress', price: 6.99, desc: 'Elegant evening wear', rating: 'PG-13' },
      { id: 'outfit_lingerie_lace', name: 'Lace Lingerie', price: 2.99, desc: 'Intimate apparel (18+)', rating: 'R' },
      { id: 'outfit_leather', name: 'Leather Bodysuit', price: 7.99, desc: 'Dominatrix attire (18+)', rating: 'XXX' },
      { id: 'outfit_schoolgirl', name: 'Schoolgirl Uniform', price: 4.99, desc: 'Cosplay outfit (18+)', rating: 'R' },
      { id: 'outfit_lingerie_bundle', name: 'Lingerie 10-Pack', price: 19.99, desc: 'Variety of intimate wear (18+)', rating: 'R' },
    ],
  };

  const addToCart = (item) => {
    setCart([...cart, item]);
  };

  const removeFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.price, 0).toFixed(2);
  };

  const handleCheckout = async () => {
    if (!userId) {
      alert('Please log in to make purchases');
      return;
    }
    if (cart.length === 0) {
      alert('Your cart is empty');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/crypto/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          items: cart,
          totalUSD: parseFloat(calculateTotal()),
          cryptoCurrency: 'USDC',
        }),
      });

      const data = await response.json();
      if (data.error) {
        alert(`Error: ${data.error}`);
        return;
      }

      // Redirect to crypto payment page
      window.location.href = data.paymentUrl;
    } catch (error) {
      alert(`Payment error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderItems = (category) => {
    return STORE_ITEMS[category].map((item) => (
      <div key={item.id} className="store-item">
        <div className="item-header">
          <h3>{item.name}</h3>
          <span className="rating-badge">{item.rating}</span>
        </div>
        <p className="item-desc">{item.desc}</p>
        <div className="item-footer">
          <span className="price">${item.price.toFixed(2)}</span>
          <button onClick={() => addToCart(item)} className="add-btn">
            Add to Cart
          </button>
        </div>
      </div>
    ));
  };

  return (
    <div className="ai-companion-store">
      <header className="store-header">
        <h1>AI Companion Store</h1>
        <p className="subtitle">Customize your perfect AI companion with unlimited options</p>
        <div className="cart-summary">
          Cart: {cart.length} items | Total: ${calculateTotal()}
        </div>
      </header>

      <nav className="store-tabs">
        <button onClick={() => setActiveTab('companions')} className={activeTab === 'companions' ? 'active' : ''}>
          Companions ($100)
        </button>
        <button onClick={() => setActiveTab('pets')} className={activeTab === 'pets' ? 'active' : ''}>
          Pets ($100)
        </button>
        <button onClick={() => setActiveTab('voices')} className={activeTab === 'voices' ? 'active' : ''}>
          Voices ($0.99)
        </button>
        <button onClick={() => setActiveTab('hairstyles')} className={activeTab === 'hairstyles' ? 'active' : ''}>
          Hairstyles ($0.99)
        </button>
        <button onClick={() => setActiveTab('environments')} className={activeTab === 'environments' ? 'active' : ''}>
          Environments
        </button>
        <button onClick={() => setActiveTab('props')} className={activeTab === 'props' ? 'active' : ''}>
          Props
        </button>
        <button onClick={() => setActiveTab('kits')} className={activeTab === 'kits' ? 'active' : ''}>
          Kits
        </button>
        <button onClick={() => setActiveTab('outfits')} className={activeTab === 'outfits' ? 'active' : ''}>
          Outfits
        </button>
      </nav>

      <div className="store-grid">
        {renderItems(activeTab)}
      </div>

      {cart.length > 0 && (
        <div className="cart-panel">
          <h2>Your Cart</h2>
          {cart.map((item, index) => (
            <div key={index} className="cart-item">
              <span>{item.name}</span>
              <span>${item.price.toFixed(2)}</span>
              <button onClick={() => removeFromCart(index)}>Remove</button>
            </div>
          ))}
          <div className="cart-total">
            <strong>Total: ${calculateTotal()}</strong>
          </div>
          <button onClick={handleCheckout} disabled={loading} className="checkout-btn">
            {loading ? 'Processing...' : 'Checkout with Crypto'}
          </button>
          <p className="payment-note">Accepts BTC, ETH, USDC (auto-converts to USD)</p>
        </div>
      )}

      <style jsx>{`
        .ai-companion-store {
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
        }
        .store-header {
          text-align: center;
          color: white;
          margin-bottom: 2rem;
        }
        .store-header h1 {
          font-size: 3rem;
          margin-bottom: 0.5rem;
        }
        .subtitle {
          font-size: 1.2rem;
          opacity: 0.9;
        }
        .cart-summary {
          background: rgba(255, 255, 255, 0.2);
          padding: 1rem;
          border-radius: 10px;
          margin-top: 1rem;
          font-size: 1.1rem;
        }
        .store-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          justify-content: center;
        }
        .store-tabs button {
          padding: 0.75rem 1.5rem;
          border: none;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
          font-size: 1rem;
        }
        .store-tabs button:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }
        .store-tabs button.active {
          background: white;
          color: #667eea;
          font-weight: bold;
        }
        .store-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        .store-item {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s;
        }
        .store-item:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 12px rgba(0, 0, 0, 0.2);
        }
        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        .item-header h3 {
          font-size: 1.3rem;
          color: #333;
          margin: 0;
        }
        .rating-badge {
          background: #ff6b6b;
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 5px;
          font-size: 0.8rem;
          font-weight: bold;
        }
        .item-desc {
          color: #666;
          font-size: 0.95rem;
          margin-bottom: 1rem;
        }
        .item-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .price {
          font-size: 1.5rem;
          font-weight: bold;
          color: #667eea;
        }
        .add-btn {
          background: #667eea;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
          transition: background 0.3s;
        }
        .add-btn:hover {
          background: #5568d3;
        }
        .cart-panel {
          position: fixed;
          bottom: 0;
          right: 0;
          width: 400px;
          max-height: 500px;
          background: white;
          border-radius: 12px 12px 0 0;
          box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.2);
          padding: 1.5rem;
          overflow-y: auto;
        }
        .cart-panel h2 {
          margin-top: 0;
          color: #333;
        }
        .cart-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          border-bottom: 1px solid #eee;
        }
        .cart-item button {
          background: #ff6b6b;
          color: white;
          border: none;
          padding: 0.25rem 0.75rem;
          border-radius: 5px;
          cursor: pointer;
          font-size: 0.9rem;
        }
        .cart-total {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 2px solid #667eea;
          font-size: 1.3rem;
          text-align: right;
        }
        .checkout-btn {
          width: 100%;
          padding: 1rem;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1.1rem;
          font-weight: bold;
          cursor: pointer;
          margin-top: 1rem;
          transition: background 0.3s;
        }
        .checkout-btn:hover:not(:disabled) {
          background: #5568d3;
        }
        .checkout-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .payment-note {
          text-align: center;
          font-size: 0.9rem;
          color: #666;
          margin-top: 0.5rem;
        }
        @media (max-width: 768px) {
          .cart-panel {
            width: 100%;
          }
          .store-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default AICompanionStore;
