import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const UserInventory = ({ userId }) => {
  const [inventory, setInventory] = useState({
    companions: [],
    pets: [],
    voices: [],
    hairstyles: [],
    environments: [],
    props: [],
    kits: [],
    outfits: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('companions');

  useEffect(() => {
    if (userId) {
      fetchInventory();
    }
  }, [userId]);

  const fetchInventory = async () => {
    try {
      const { data, error } = await supabase
        .from('user_purchases')
        .select('*')
        .eq('user_id', userId)
        .order('purchased_at', { ascending: false });

      if (error) throw error;

      // Group items by type
      const grouped = {
        companions: [],
        pets: [],
        voices: [],
        hairstyles: [],
        environments: [],
        props: [],
        kits: [],
        outfits: []
      };

      data.forEach(item => {
        const type = item.item_type + 's'; // pluralize
        if (grouped[type]) {
          grouped[type].push(item);
        }
      });

      setInventory(grouped);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setLoading(false);
    }
  };

  const getTotalSpent = () => {
    let total = 0;
    Object.values(inventory).forEach(items => {
      items.forEach(item => {
        total += parseFloat(item.price_paid);
      });
    });
    return total.toFixed(2);
  };

  const getTotalItems = () => {
    return Object.values(inventory).reduce((sum, items) => sum + items.length, 0);
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.spinner}></div>
        <p>Loading your inventory...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>🎒 My Inventory</h1>
        <div style={styles.stats}>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{getTotalItems()}</div>
            <div style={styles.statLabel}>Total Items</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>${getTotalSpent()}</div>
            <div style={styles.statLabel}>Total Spent</div>
          </div>
        </div>
      </div>

      <div style={styles.tabs}>
        <button
          onClick={() => setActiveTab('companions')}
          style={{...styles.tab, ...(activeTab === 'companions' ? styles.tabActive : {})}}
        >
          👥 Companions ({inventory.companions.length})
        </button>
        <button
          onClick={() => setActiveTab('pets')}
          style={{...styles.tab, ...(activeTab === 'pets' ? styles.tabActive : {})}}
        >
          🐾 Pets ({inventory.pets.length})
        </button>
        <button
          onClick={() => setActiveTab('voices')}
          style={{...styles.tab, ...(activeTab === 'voices' ? styles.tabActive : {})}}
        >
          🎤 Voices ({inventory.voices.length})
        </button>
        <button
          onClick={() => setActiveTab('hairstyles')}
          style={{...styles.tab, ...(activeTab === 'hairstyles' ? styles.tabActive : {})}}
        >
          💇 Hairstyles ({inventory.hairstyles.length})
        </button>
        <button
          onClick={() => setActiveTab('environments')}
          style={{...styles.tab, ...(activeTab === 'environments' ? styles.tabActive : {})}}
        >
          🌍 Environments ({inventory.environments.length})
        </button>
        <button
          onClick={() => setActiveTab('props')}
          style={{...styles.tab, ...(activeTab === 'props' ? styles.tabActive : {})}}
        >
          🎭 Props ({inventory.props.length})
        </button>
        <button
          onClick={() => setActiveTab('kits')}
          style={{...styles.tab, ...(activeTab === 'kits' ? styles.tabActive : {})}}
        >
          📦 Kits ({inventory.kits.length})
        </button>
        <button
          onClick={() => setActiveTab('outfits')}
          style={{...styles.tab, ...(activeTab === 'outfits' ? styles.tabActive : {})}}
        >
          👗 Outfits ({inventory.outfits.length})
        </button>
      </div>

      <div style={styles.grid}>
        {inventory[activeTab].length === 0 ? (
          <div style={styles.empty}>
            <p>No {activeTab} owned yet.</p>
            <button
              onClick={() => window.location.href = '#aicompanion'}
              style={styles.shopButton}
            >
              Visit Store
            </button>
          </div>
        ) : (
          inventory[activeTab].map((item, idx) => (
            <div key={idx} style={styles.card}>
              <div style={styles.cardHeader}>
                <h3>{item.item_name}</h3>
                <span style={styles.price}>${item.price_paid}</span>
              </div>
              <div style={styles.cardBody}>
                <p style={styles.itemId}>ID: {item.item_id}</p>
                <p style={styles.purchaseDate}>
                  Purchased: {new Date(item.purchased_at).toLocaleDateString()}
                </p>
              </div>
              <button style={styles.equipButton}>
                ✨ Equip
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '2rem',
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginTop: '1rem',
  },
  statCard: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '1.5rem',
    borderRadius: '12px',
    color: 'white',
    textAlign: 'center',
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
  },
  statLabel: {
    fontSize: '0.9rem',
    opacity: 0.9,
  },
  tabs: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '2rem',
    flexWrap: 'wrap',
  },
  tab: {
    padding: '0.75rem 1.5rem',
    border: '2px solid #e5e7eb',
    background: 'white',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    fontSize: '1rem',
    fontWeight: '500',
  },
  tabActive: {
    background: '#667eea',
    color: 'white',
    borderColor: '#667eea',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.5rem',
  },
  card: {
    background: 'white',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    padding: '1.5rem',
    transition: 'transform 0.3s, box-shadow 0.3s',
    cursor: 'pointer',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #e5e7eb',
  },
  price: {
    background: '#10b981',
    color: 'white',
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.9rem',
    fontWeight: 'bold',
  },
  cardBody: {
    marginBottom: '1rem',
  },
  itemId: {
    fontSize: '0.85rem',
    color: '#6b7280',
    fontFamily: 'monospace',
    marginBottom: '0.5rem',
  },
  purchaseDate: {
    fontSize: '0.85rem',
    color: '#9ca3af',
  },
  equipButton: {
    width: '100%',
    padding: '0.75rem',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background 0.3s',
  },
  empty: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: '3rem',
    background: '#f9fafb',
    borderRadius: '12px',
  },
  shopButton: {
    marginTop: '1rem',
    padding: '0.75rem 2rem',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '1rem',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '5px solid #f3f3f3',
    borderTop: '5px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '2rem auto',
  },
};

export default UserInventory;
