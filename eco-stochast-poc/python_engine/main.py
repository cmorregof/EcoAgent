import uvicorn
from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np

app = FastAPI(title="Eco-Stochast SDE Engine")

class ClimateData(BaseModel):
    temperature: float
    precipitation: float
    humidity: float

@app.post("/simulate_risk")
async def simulate_risk(data: ClimateData):
    # CIR Model parameters (Heuristic)
    # dR_t = a(b - R_t)dt + sigma * sqrt(R_t) * dW_t
    
    # Base risk factor influenced by precipitation
    b = 0.1 + (data.precipitation * 0.05) if data.precipitation > 0 else 0.1
    b += (data.humidity / 100.0) * 0.2  # High humidity increases base risk
    
    a = 2.0  # Speed of mean reversion
    sigma = 0.3 * (data.precipitation / 10.0 + 1) # Volatility increases with heavy rain
    
    # Euler-Maruyama Simulation
    T = 1.0     # Total time (e.g., 1 unit = 1 day)
    N = 100     # Number of steps
    dt = T / N
    
    R = np.zeros(N)
    R[0] = 0.05 # Initial risk level

    for i in range(1, N):
        dW = np.random.normal(0, np.sqrt(dt))
        # Ensure R > 0 inside sqrt to avoid complex numbers
        current_R = max(R[i-1], 0)
        
        drift = a * (b - current_R) * dt
        diffusion = sigma * np.sqrt(current_R) * dW
        
        next_R = current_R + drift + diffusion
        R[i] = max(next_R, 0) # Risk cannot be negative

    max_risk_index = float(np.max(R))
    
    # Classify Risk
    risk_level = "BAJO"
    if max_risk_index > 0.6:
        risk_level = "CRÍTICO"
    elif max_risk_index > 0.3:
        risk_level = "MODERADO"
        
    return {
        "max_risk_index": round(max_risk_index, 4),
        "risk_level": risk_level,
        "input_data": {
            "temp": data.temperature,
            "precip": data.precipitation,
            "hum": data.humidity
        }
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
