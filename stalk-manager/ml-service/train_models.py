# ml-service/app.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="StockDock AI Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 1. SIMULATED HISTORICAL TRAINING DATA ---
# In production, you would pull this directly from your MongoDB Orders collection
data = {
    "day_of_week": [0, 1, 2, 3, 4, 5, 6, 0, 1, 2, 3, 4, 5, 6], # 0=Mon, 6=Sun
    "is_weekend":  [0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1],
    "prev_day_sold": [12, 15, 14, 18, 22, 30, 28, 13, 14, 16, 19, 25, 32, 29],
    "actual_demand": [14, 15, 17, 20, 26, 31, 27, 13, 16, 17, 21, 27, 33, 28] # Target variable
}

df = pd.DataFrame(data)
X = df[["day_of_week", "is_weekend", "prev_day_sold"]]
y = df["actual_demand"]

# --- 2. TRAIN THE RANDOM FOREST MODEL ---
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X, y)
print("✅ Random Forest Regressor trained on historical stock data!")

# --- 3. DEFINE API PAYLOAD SCHEMA ---
class PredictionRequest(BaseModel):
    day_of_week: int
    prev_day_sold: int

@app.post("/predict-stock")
def predict_stock(req: PredictionRequest):
    try:
        is_weekend = 1 if req.day_of_week >= 5 else 0
        features = np.array([[req.day_of_week, is_weekend, req.prev_day_sold]])
        
        # Predict optimal stock and round to nearest whole bread loaf
        predicted_stock = int(np.round(model.predict(features)[0]))
        
        return {
            "status": "success",
            "recommended_target": predicted_stock,
            "confidence_metric": "Random Forest (100 Trees)"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
