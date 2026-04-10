import json
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor


@dataclass
class ZoneSample:
    zone: str
    crop_id: str
    threshold: float
    moisture: float
    temp: float
    humidity: float
    hours_ahead: int


def generate_samples() -> List[ZoneSample]:
    crops = [
        ("wheat", 38.0),
        ("cotton", 42.0),
        ("rice", 52.0),
        ("chickpea", 30.0),
    ]
    samples: List[ZoneSample] = []
    rng = np.random.default_rng(7)
    for zone in ["A", "B"]:
        for crop_id, threshold in crops:
            for _ in range(400):
                moisture = float(rng.uniform(28, 80))
                temp = float(rng.uniform(18, 40))
                humidity = float(rng.uniform(35, 95))
                hours_ahead = int(rng.choice([24, 48, 72]))
                samples.append(
                    ZoneSample(
                        zone=zone,
                        crop_id=crop_id,
                        threshold=threshold,
                        moisture=moisture,
                        temp=temp,
                        humidity=humidity,
                        hours_ahead=hours_ahead,
                    )
                )
    return samples


def to_frame(samples: List[ZoneSample]) -> pd.DataFrame:
    rows = []
    for s in samples:
        stress = (s.temp - 28.0) * 0.22 - (s.humidity - 60.0) * 0.05
        decay = (s.hours_ahead / 24.0) * (2.2 + max(stress, -2))
        predicted = max(0.0, min(100.0, s.moisture - decay))
        rows.append(
            {
                "zone": 0 if s.zone == "A" else 1,
                "crop_id": s.crop_id,
                "threshold": s.threshold,
                "moisture_now": s.moisture,
                "temp": s.temp,
                "humidity": s.humidity,
                "hours_ahead": s.hours_ahead,
                "moisture_future": predicted,
            }
        )
    frame = pd.DataFrame(rows)
    return pd.get_dummies(frame, columns=["crop_id"], drop_first=False)


def train_and_save_model() -> Dict[str, str]:
    samples = generate_samples()
    df = to_frame(samples)
    y = df.pop("moisture_future")
    model = RandomForestRegressor(n_estimators=160, random_state=42, max_depth=10)
    model.fit(df, y)

    out_dir = Path(__file__).resolve().parent
    model_path = out_dir / "zone_moisture_model.pkl"
    columns_path = out_dir / "zone_model_columns.json"
    joblib.dump(model, model_path)
    columns_path.write_text(json.dumps({"columns": list(df.columns)}), encoding="utf-8")
    return {"model_path": str(model_path), "columns_path": str(columns_path)}


if __name__ == "__main__":
    result = train_and_save_model()
    print(result)
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
import joblib
import os

MODEL_PATH = "moisture_model.pkl"

def generate_dummy_data():
    """Generates synthetic historical IoT data: day_num, time_hour, temp, hum, prev_moist -> target_moist"""
    np.random.seed(42)
    n_samples = 1000
    
    day_num = np.random.randint(1, 365, n_samples)
    time_hour = np.random.randint(0, 24, n_samples)
    temp = np.random.uniform(20.0, 40.0, n_samples)
    hum = np.random.uniform(30.0, 90.0, n_samples)
    prev_moist = np.random.uniform(20.0, 80.0, n_samples)
    
    # Target moisture drops more if hot and low humidity, else drops slowly
    drop = (temp * 0.5) - (hum * 0.1)
    target_moist = prev_moist - drop
    
    # Clip to realistic values
    target_moist = np.clip(target_moist, 0, 100)
    
    df = pd.DataFrame({
        "day_num": day_num,
        "time_hour": time_hour,
        "temp": temp,
        "humidity": hum,
        "prev_moisture": prev_moist,
        "target_moisture": target_moist
    })
    return df

def train_and_save_model():
    print("Generating data...")
    df = generate_dummy_data()
    
    X = df[["day_num", "time_hour", "temp", "humidity", "prev_moisture"]]
    y = df["target_moisture"]
    
    model = LinearRegression()
    model.fit(X, y)
    
    score = model.score(X, y)
    print(f"Model trained! R^2 Score: {score:.2f}")
    
    joblib.dump(model, MODEL_PATH)
    print(f"Model saved to {MODEL_PATH}")

if __name__ == "__main__":
    train_and_save_model()
