import os
import json
import io
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image

app = FastAPI(title="Ucuzcu Photo Search API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SINIF_SAYISI = 0
SINIF_ISIMLERI = {}
model = None
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

def load_model():
    global model, SINIF_SAYISI, SINIF_ISIMLERI
    
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(BASE_DIR, 'ucuzcu_mobilenet_v2_best.pth')
    json_path = os.path.join(BASE_DIR, 'sinif_isimleri.json')
    
    if not os.path.exists(model_path) or not os.path.exists(json_path):
        print("UYARI: Model ağırlıkları veya sınıf isimleri bulunamadı! Lütfen ilgili dosyaları 'api' klasörüne kopyalayın.")
        return False

    with open(json_path, 'r', encoding='utf-8') as f:
        SINIF_ISIMLERI = json.load(f)
        
    SINIF_SAYISI = len(SINIF_ISIMLERI)
    
    model = models.mobilenet_v2(weights=None)
    in_features = model.classifier[1].in_features
    model.classifier[1] = nn.Sequential(
        nn.Linear(in_features, 512),
        nn.ReLU(),
        nn.Dropout(0.4),
        nn.Linear(512, SINIF_SAYISI)
    )
    
    model.load_state_dict(torch.load(model_path, map_location=device))
    model.to(device)
    model.eval()
    print("Model başarıyla yüklendi!")
    return True

RESIM_BOYUTU = 384
val_transforms = transforms.Compose([
    transforms.Resize(400),
    transforms.CenterCrop(RESIM_BOYUTU),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

load_model()

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Ucuzcu API is running", "model_loaded": model is not None}

@app.post("/predict")
async def predict_image(file: UploadFile = File(...)):
    if model is None:
        loaded = load_model()
        if not loaded:
            raise HTTPException(status_code=500, detail="Model dosyaları eksik! (ucuzcu_mobilenet_v2_best.pth ve sinif_isimleri.json)")

    try:
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        
        tensor = val_transforms(image).unsqueeze(0).to(device)
        
        with torch.no_grad():
            outputs = model(tensor)
            _, predicted_idx = torch.max(outputs, 1)
            
        predicted_class_id = str(predicted_idx.item())
        predicted_class_name = SINIF_ISIMLERI.get(predicted_class_id, "Bilinmeyen Ürün")
        
        return {
            "success": True,
            "product_name": predicted_class_name
        }
        
    except Exception as e:
        print("Tahmin hatası:", e)
        raise HTTPException(status_code=500, detail=str(e))
