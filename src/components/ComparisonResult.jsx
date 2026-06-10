import React from 'react';
import { Sparkles, Search, CheckCircle2, ShoppingCart } from 'lucide-react';

const ComparisonResult = ({ result, resultImage, setStatus, setSearchQuery }) => {
  if (!result) return null;

  return (
    <div className="comparison-section animate-fade-in">
      <div className="section-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {resultImage && (
            <div style={{ backgroundColor: '#fff', padding: '0.25rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <img 
                src={resultImage} 
                alt={result.productName} 
                style={{ width: '80px', height: '80px', objectFit: 'contain', borderRadius: '8px' }} 
              />
            </div>
          )}
          <div>
            <h2 className="section-title" style={{ margin: 0, marginBottom: '0.25rem' }}>{result.productName}</h2>
            <div className="product-meta">Kategori: {result.category}</div>
          </div>
        </div>
        <button className="btn btn-secondary" onClick={() => { setStatus('idle'); setSearchQuery(''); }}>
          <Search size={16} /> Yeni Arama
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <Sparkles className="gradient-text" style={{ marginTop: '0.25rem', flexShrink: 0 }} />
          <div>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>AI Karar Özeti</h3>
            <p style={{ margin: 0, color: 'var(--text-primary)' }}>{result.analysis}</p>
          </div>
        </div>
      </div>

      <h3 className="section-title" style={{ marginTop: '1rem' }}>Detaylı Karşılaştırma</h3>
      <div className="table-container">
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Özellik</th>
              {result.stores.map((store, index) => (
                <th key={store.id} className={index === 0 ? 'winner-cell' : ''}>
                  {store.name}
                  {store.isBestPrice && (
                    <div className="best-price-badge">
                      <CheckCircle2 size={12} /> En Uygun Fiyat
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="feature-name">Fiyat</td>
              {result.stores.map((store, index) => (
                <td key={store.id} className={index === 0 ? 'winner-cell' : ''}>
                  <div className="price-tag">{store.formattedPrice}</div>
                </td>
              ))}
            </tr>
            <tr>
              <td className="feature-name">Güven Skoru (AI)</td>
              {result.stores.map((store, index) => (
                <td key={store.id} className={index === 0 ? 'winner-cell' : ''}>
                  <span className={`badge ${store.trustScore >= 9.0 ? 'badge-success' : 'badge-warning'}`}>
                    {store.trustScore} / 10
                  </span>
                </td>
              ))}
            </tr>
            <tr>
              <td className="feature-name">Satın Al</td>
              {result.stores.map((store, index) => (
                <td key={store.id} className={index === 0 ? 'winner-cell' : ''}>
                  <a href={store.link} target="_blank" rel="noreferrer" className="store-link">
                    <ShoppingCart size={16} /> Mağazaya Git
                  </a>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {result.specs && result.specs.length > 0 && (
        <>
          <h3 className="section-title" style={{ marginTop: '2rem' }}>Özellikler</h3>
          <div className="glass-panel" style={{ padding: '0' }}>
            <table className="comparison-table" style={{ border: 'none' }}>
              <tbody>
                {result.specs.map((spec, i) => (
                  <tr key={i}>
                    <td className="feature-name" style={{ width: '30%' }}>{spec.name}</td>
                    <td>{spec.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default ComparisonResult;
