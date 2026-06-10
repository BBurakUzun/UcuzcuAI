import React, { useState, useRef, useEffect } from 'react';
import './App.css';

import Header from './components/Header';
import SearchSection from './components/SearchSection';
import LoadingIndicator from './components/LoadingIndicator';
import ComparisonResult from './components/ComparisonResult';
import FilterModal from './components/FilterModal';

import { useProductSearch } from './hooks/useProductSearch';

function App() {
  const {
    status,
    setStatus,
    result,
    resultImage,
    errorMsg,
    setErrorMsg,
    isPredicting,
    handleSearch,
    executePhotoSearch,
  } = useProductSearch();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini');
  const [activeTab, setActiveTab] = useState('photo');
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({ quantity: '' });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleSearch(searchQuery, selectedModel, null, filters);
  };

  const openCamera = async () => {
    try {
      setIsCameraOpen(true);
      setSelectedImage(null);
      setSelectedFile(null);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Kamera erişim hatası:", err);
      setErrorMsg("Kameraya erişilemedi. Lütfen izinleri kontrol edin.");
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        const file = new File([blob], "camera_photo.jpg", { type: "image/jpeg" });
        setSelectedFile(file);
        setSelectedImage(URL.createObjectURL(blob));
        stopCamera();
      }, 'image/jpeg');
    }
  };

  useEffect(() => {
    if (activeTab !== 'photo') {
      stopCamera();
    }
    return () => stopCamera();
  }, [activeTab]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setSelectedImage(URL.createObjectURL(file));
    setErrorMsg('');
    if (isCameraOpen) stopCamera();
  };

  const startPhotoSearch = () => {
    if (!selectedFile) return;
    setShowFilterModal(true);
  };

  const executePhotoSearchWithFilters = () => {
    setShowFilterModal(false);
    executePhotoSearch(selectedFile, filters, selectedModel, setSearchQuery);
  };

  return (
    <>
      <Header />

      <main className="container main-content">
        {(status === 'idle' || status === 'error') && (
          <SearchSection 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSearchSubmit={handleSearchSubmit}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            isPredicting={isPredicting}
            isCameraOpen={isCameraOpen}
            videoRef={videoRef}
            canvasRef={canvasRef}
            takePhoto={takePhoto}
            stopCamera={stopCamera}
            openCamera={openCamera}
            selectedImage={selectedImage}
            startPhotoSearch={startPhotoSearch}
            setSelectedImage={setSelectedImage}
            setSelectedFile={setSelectedFile}
            handleImageUpload={handleImageUpload}
            status={status}
            errorMsg={errorMsg}
          />
        )}

        <LoadingIndicator 
          status={status} 
          searchQuery={searchQuery} 
          selectedModel={selectedModel} 
        />

        {status === 'success' && result && (
          <ComparisonResult 
            result={result} 
            resultImage={resultImage} 
            setStatus={setStatus} 
            setSearchQuery={setSearchQuery} 
          />
        )}
      </main>

      <FilterModal 
        showFilterModal={showFilterModal} 
        filters={filters} 
        setFilters={setFilters} 
        setShowFilterModal={setShowFilterModal} 
        executePhotoSearchWithFilters={executePhotoSearchWithFilters} 
      />
    </>
  );
}

export default App;
