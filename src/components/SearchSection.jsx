import React from 'react';
import { Search, Camera, UploadCloud, AlertCircle } from 'lucide-react';

const SearchSection = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  handleSearchSubmit,
  selectedModel,
  setSelectedModel,
  isPredicting,
  isCameraOpen,
  videoRef,
  canvasRef,
  takePhoto,
  stopCamera,
  openCamera,
  selectedImage,
  startPhotoSearch,
  setSelectedImage,
  setSelectedFile,
  handleImageUpload,
  status,
  errorMsg
}) => {
  return (
    <section className="hero-section animate-fade-in">
      <h1 className="hero-title">
        Fiyatları <span className="gradient-text">Profesyonelce</span> Kıyaslayın
      </h1>
      <p className="hero-subtitle">
        En uygun fiyatlar Ucuzcu.ai 'da
      </p>
      
      <div className="search-container">
        <div className="tabs-container">
          <button 
            type="button"
            className={`tab-btn ${activeTab === 'text' ? 'active' : ''}`}
            onClick={() => setActiveTab('text')}
          >
            <Search size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} />
            Metinle Ara
          </button>
          <button 
            type="button"
            className={`tab-btn ${activeTab === 'photo' ? 'active' : ''}`}
            onClick={() => setActiveTab('photo')}
          >
            <Camera size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} />
            Fotoğrafla Ara
          </button>
        </div>

        {activeTab === 'text' ? (
          <form className="search-form" onSubmit={handleSearchSubmit}>
            <div className="search-input-wrapper">
              <Search className="search-icon" size={24} />
              <input 
                type="text" 
                className="search-input" 
                placeholder="Örn: iPhone 15 Pro veya Dyson V15" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button type="submit" className="search-button" disabled={!searchQuery.trim()}>
              Fiyatları Kıyasla
            </button>
          </form>
        ) : (
          <div className="photo-tab-container" style={{ width: '100%' }}>
            <input 
              type="file" 
              id="photo-upload" 
              accept="image/*" 
              style={{ display: 'none' }} 
              onChange={handleImageUpload}
            />
            
            {isPredicting ? (
              <div className="upload-container">
                <div className="spinner" style={{ marginBottom: '1rem' }}></div>
                <div className="upload-text">Yapay Zeka Fotoğrafı İnceliyor...</div>
                <div className="upload-subtext">Lütfen bekleyin</div>
              </div>
            ) : isCameraOpen ? (
              <div className="camera-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <video ref={videoRef} autoPlay playsInline style={{ width: '100%', maxWidth: '400px', borderRadius: '12px', background: '#000' }} />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'center' }}>
                  <button type="button" className="btn btn-primary" onClick={takePhoto}>
                    <Camera size={18} /> Fotoğraf Çek
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={stopCamera}>
                    İptal
                  </button>
                </div>
              </div>
            ) : selectedImage ? (
              <div className="preview-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <img src={selectedImage} alt="Yüklenen" className="preview-image" style={{ width: '100%', maxWidth: '400px', maxHeight: '300px', objectFit: 'contain', borderRadius: '12px' }} />
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'center' }}>
                  <button type="button" className="btn btn-primary" onClick={startPhotoSearch}>
                    <Search size={18} /> Bu Ürünü Ara
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => { setSelectedImage(null); setSelectedFile(null); }}>
                    Farklı Fotoğraf
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', width: '100%' }}>
                <div className="upload-container" style={{ flex: 1, minWidth: '200px', cursor: 'pointer' }} onClick={() => document.getElementById('photo-upload').click()}>
                  <UploadCloud size={48} className="upload-icon" />
                  <div className="upload-text">Fotoğraf Yükle</div>
                  <div className="upload-subtext">(Dosya Seçin)</div>
                </div>
                <div className="upload-container" style={{ flex: 1, minWidth: '200px', cursor: 'pointer' }} onClick={openCamera}>
                  <Camera size={48} className="upload-icon" />
                  <div className="upload-text">Kamera ile Çek</div>
                  <div className="upload-subtext">(Anında Çekim)</div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="model-selection-wrapper">
          <span className="model-label">Yapay Zeka Modeli:</span>
          <div className="model-pills">
            <button type="button" className={`model-pill ${selectedModel === 'gemini' ? 'active' : ''}`} onClick={() => setSelectedModel('gemini')}>
              Google Gemini
            </button>
            <button type="button" className={`model-pill ${selectedModel === 'groq' ? 'active' : ''}`} onClick={() => setSelectedModel('groq')}>
              Groq Llama 70B
            </button>
          </div>
        </div>
      </div>

      {status === 'error' && (
        <div className="glass-panel" style={{ marginTop: '2rem', padding: '1rem', borderLeft: '4px solid var(--danger)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)', justifyContent: 'center' }}>
            <AlertCircle size={20} />
            <span>{errorMsg}</span>
          </div>
        </div>
      )}
    </section>
  );
};

export default SearchSection;
