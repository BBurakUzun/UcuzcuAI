import React from 'react';

const LoadingIndicator = ({ status, searchQuery, selectedModel }) => {
  if (status !== 'searching_prices' && status !== 'analyzing_data') return null;

  return (
    <div className="loading-container animate-fade-in">
      <div className="spinner"></div>
      <p className="loading-text" style={{ textAlign: 'center' }}>
        {status === 'searching_prices' ? (
          <>
            <strong>{searchQuery}</strong> için Serper.dev üzerinden anlık fiyatlar çekiliyor...
            <br/><span style={{ fontSize: '0.875rem', opacity: 0.7 }}>Aşama 1/2: Veri Toplama</span>
          </>
        ) : (
          <>
            Ham veriler <strong>{selectedModel === 'gemini' ? 'Gemini AI' : 'Groq (Llama 3.3 70B)'}</strong> modeline iletildi, analiz ve kıyaslama tablosu oluşturuluyor...
            <br/><span style={{ fontSize: '0.875rem', opacity: 0.7 }}>Aşama 2/2: Yapay Zeka Analizi</span>
          </>
        )}
      </p>
    </div>
  );
};

export default LoadingIndicator;
