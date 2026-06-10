import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const useProductSearch = () => {
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isPredicting, setIsPredicting] = useState(false);

  const handleSearch = async (searchQuery, selectedModel, directQuery = null, customFilters = null) => {
    let queryToUse = directQuery || searchQuery;
    if (!queryToUse.trim()) return;

    if (customFilters && customFilters.quantity) {
      queryToUse = `${queryToUse} ${customFilters.quantity} adet`;
    }

    setResult(null);
    setResultImage(null);
    setErrorMsg('');

    try {
      setStatus('searching_prices');
      const serperKey = import.meta.env.VITE_SERPER_API_KEY;
      if (!serperKey) {
        throw new Error("Serper.dev API Anahtarı bulunamadı! Lütfen .env.local dosyanızı kontrol edin.");
      }

      const serperReq = await fetch("https://google.serper.dev/shopping", {
        method: 'POST',
        headers: {
          "X-API-KEY": serperKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ q: queryToUse, gl: "tr", hl: "tr" }),
      });

      const serperData = await serperReq.json();
      const shoppingResults = serperData.shopping || [];

      if (shoppingResults.length === 0) {
        throw new Error("Üzgünüm, bu ürün için satıcı ve fiyat verisi bulunamadı.");
      }

      const firstProductImage = shoppingResults.find(item => item.imageUrl)?.imageUrl;
      if (firstProductImage) {
        setResultImage(firstProductImage);
      }

      setStatus('analyzing_data');
      
      const cleanData = shoppingResults.slice(0, 8).map((item, index) => ({
        id: "magaza_" + index,
        product_title: item.title,
        store_name: item.source,
        price: item.price,
        rating: item.rating || "Puan yok",
        reviews: item.ratingCount || 0,
        link: item.link
      }));

      const prompt = `Sen uzman bir veri analisti ve alışveriş asistanısın. Aşağıda kullanıcının aradığı "${queryToUse}" ürünü için Google Alışveriş'ten anlık olarak çekilen mağaza ve fiyat verilerini veriyorum:
  
${JSON.stringify(cleanData, null, 2)}

Görevlerin:
1. Sadece yukarıda sana verdiğim JSON verisini kullan! Kendinden mağaza veya link uydurma (Halüsinasyon yapma).
2. Önce ürünün ne tür bir ürün olduğunu anla. Daha sonra sana verdiğim listedeki TÜM 'product_title' başlıklarını incele ve ürüne uygun 4-6 belirgin özelliğini (specs) bul. 
DİKKAT 1: Eğer listedeki ürün başlıklarında farklı aromalar veya renkler varsa, listede geçen TÜM çeşitleri virgülle ayırarak tek bir özellikte birleştir (Örn: Aroma: "Deniz Tuzlu, Mevsim Yeşillikli"). Sadece birini yazıp diğerlerini atlama. ANCAK "Yoğurt ve Mevsim Yeşillikleri" gibi birleşik bir lezzet adı varsa SAKIN bunu ortasından bölüp "Yoğurt, Mevsim Yeşillikleri" diye ayırma, orijinal tamlamayı koru!
DİKKAT 2: Eğer ürünlerde gramaj veya paket (çoklu/tekli) farkları varsa, "134 Gr - 250 Gr" gibi EN KÜÇÜK ve EN BÜYÜK aralığı (range) belirt.
DİKKAT 3: Özelliklerin adını (name) belirlerken ASLA birbirine benzeyen kelimeleri iki kez kullanma. EĞER 'Aroma' YAZDIYSAN, SAKIN 'Lezzet', 'Lezzet Çeşitleri' veya 'Tür' diye ayrı bir özellik daha açma! Kesin kural: Cips vb. ürünlerde SADECE 'Aroma' başlığını kullan.
DİKKAT 4: Özellikler kısmına ASLA fiyat, mağaza veya kargo bilgisi yazma! Sadece fiziksel özellik yaz.
3. "trustScore" (Güven Skoru) 1 ile 10 arasında belirlerken sana verdiğim "rating" (yıldız) ve "reviews" (yorum sayısı) değerlerini dikkate al. Puanı yüksek ve yorumu çok olana yüksek puan ver.
${customFilters && customFilters.quantity ? `ÖNEMLİ KISITLAMA: Kullanıcı sadece ve kesinlikle "${customFilters.quantity}" adet/paket içeren ürünleri arıyor. Çoklu satılan ürünleri (örneğin 6'lı, 24'lü koli) KESİNLİKLE sonuçlardan ele ve JSON'a dahil etme!` : ''}
4. Sadece JSON formatında, hiçbir markdown etiketi kullanmadan veya ekstra metin eklemeden, aşağıdaki şemaya tam olarak uygun çıktı ver.

Beklenen JSON Şeması:
{
  "productName": "Ürünün tam adı",
  "category": "Kategori",
  "specs": [
    { "name": "Özellik Adı", "value": "Değer" }
  ],
  "stores": [
    {
      "id": "Benzersiz ID",
      "name": "Mağaza Adı (store_name)",
      "price": 120.5,
      "formattedPrice": "Sana verdiğim price değerini değiştirmeden sonuna TL ekle (Örn: 120 TL veya 120.50 TL. ASLA KAFANDAN SIFIR EKLEME VEYA BİNLE ÇARPMA!)",
      "trustScore": 9.0,
      "isBestPrice": true,
      "link": "Sana verdiğim linki BİREBİR aynı kopyala, asla değiştirme!"
    }
  ],
  "analysis": "Kısa bir tavsiye."
}

Kurallar:
1. Fiyatları (price) ASLA 100 veya 1000 ile çarpma. Sana 120 verildiyse 120 TL yaz, 64999 verildiyse 64.999 TL yaz. 
2. Sana verdiğim "link" değerlerini ASLA değiştirme, olduğu gibi kullan.
3. Sadece ve sadece JSON formatında yanıt ver.
`;

      let responseText = "";

      if (selectedModel === 'gemini') {
        const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!geminiKey) {
          throw new Error("Gemini API Anahtarı bulunamadı!");
        }

        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const aiResult = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }]
        });
        
        responseText = aiResult.response.text();
      } else if (selectedModel === 'groq') {
        const groqKey = import.meta.env.VITE_GROQ_API_KEY;
        if (!groqKey) {
          throw new Error("Groq API Anahtarı bulunamadı! Lütfen .env dosyanızı kontrol edin.");
        }

        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${groqKey}`
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
            temperature: 0
          })
        });

        if (!groqRes.ok) {
          throw new Error("Groq API hatası: " + groqRes.status);
        }

        const groqData = await groqRes.json();
        responseText = groqData.choices[0].message.content;
      }

      responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const parsedData = JSON.parse(responseText);

      if (parsedData.stores && Array.isArray(parsedData.stores)) {
        parsedData.stores.sort((a, b) => a.price - b.price);
        parsedData.stores.forEach((store, index) => {
          store.isBestPrice = (index === 0);
        });
      }

      setResult(parsedData);
      setStatus('success');
    } catch (error) {
      console.error("İşlem Hatası:", error);
      setErrorMsg(error.message || "Veriler alınırken bir hata oluştu. Lütfen tekrar deneyin.");
      setStatus('error');
    }
  };

  const executePhotoSearch = async (selectedFile, customFilters, selectedModel, setSearchQueryCallback) => {
    setIsPredicting(true);
    setErrorMsg('');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errData = {};
        try {
          errData = await response.json();
        } catch (parseError) {
          throw new Error(`Sunucuya ulaşılamadı (Hata Kodu: ${response.status}). Python API'nin çalıştığından emin olun.`);
        }
        throw new Error(errData.detail || "Fotoğraf işlenirken bir hata oluştu.");
      }

      const data = await response.json();
      if (data.success) {
        setSearchQueryCallback(data.product_name);
        await handleSearch(data.product_name, selectedModel, data.product_name, customFilters);
      } else {
        throw new Error("Ürün algılanamadı.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Model sunucusuna ulaşılamadı. Python API'nin çalıştığından emin olun.");
      setStatus('error');
    } finally {
      setIsPredicting(false);
    }
  };

  return {
    status,
    setStatus,
    result,
    resultImage,
    errorMsg,
    setErrorMsg,
    isPredicting,
    handleSearch,
    executePhotoSearch,
  };
};
