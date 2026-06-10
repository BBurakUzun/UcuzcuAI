import React from 'react';
import { Search } from 'lucide-react';

const FilterModal = ({ showFilterModal, filters, setFilters, setShowFilterModal, executePhotoSearchWithFilters }) => {
  if (!showFilterModal) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '90%', maxWidth: '400px', padding: '2rem', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
        <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.25rem' }}>Arama Filtreleri</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Daha isabetli sonuçlar için aradığınız ürün adedini belirtebilirsiniz. Filtre istemiyorsanız boş bırakabilirsiniz.
        </p>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-primary)' }}>Adet Seçimi (Opsiyonel)</label>
          <input 
            type="number" 
            className="search-input" 
            placeholder="Örn: 1 (Sadece tekli satışlar)" 
            value={filters.quantity}
            onChange={(e) => setFilters({ ...filters, quantity: e.target.value })}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px' }}
            min="1"
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={() => setShowFilterModal(false)}>
            İptal
          </button>
          <button className="btn btn-primary" onClick={executePhotoSearchWithFilters}>
            <Search size={16} /> Uygula ve Ara
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
