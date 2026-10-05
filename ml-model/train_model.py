import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor

# 1. Load dataset & filter strictly for Bangalore
df = pd.read_csv('house_price_dataset_india_18k_v2.csv')
df = df[df['City'].astype(str).str.strip().str.lower() == 'bangalore'].copy()

# 2. Extract numeric lat/lon
df['latitude'] = df['latitude'].astype(str).str.replace('° N', '', regex=False).str.strip().astype(float)
df['longitude'] = df['longitude'].astype(str).str.replace('° E', '', regex=False).str.strip().astype(float)

# 3. Compute Distance_to_CityCenter_km automatically using Haversine from MG Road (12.9716, 77.5946)
def haversine(lat1, lon1, lat2=12.9716, lon2=77.5946):
    R = 6371.0
    dlat = np.radians(lat2 - lat1)
    dlon = np.radians(lon2 - lon1)
    a = np.sin(dlat / 2)**2 + np.cos(np.radians(lat1)) * np.cos(np.radians(lat2)) * np.sin(dlon / 2)**2
    c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1 - a))
    return R * c

df['Distance_to_CityCenter_km'] = haversine(df['latitude'], df['longitude'])

# 4. Standardize Locality_Tier and Furnishing text columns
df['Locality_Tier'] = df['Locality_Tier'].astype(str).str.strip().str.title()
df['Furnishing'] = df['Furnishing'].astype(str).str.strip().str.title()

# 5. Handle missing values
df['Furnishing'] = df['Furnishing'].fillna('Unfurnished')
df['Parking'] = df['Parking'].fillna(df['Parking'].mode()[0])
df['Gated_Society'] = df['Gated_Society'].fillna(df['Gated_Society'].mode()[0])
df['Floor_No'] = df['Floor_No'].fillna(df['Floor_No'].median())
df['Distance_to_Metro_km'] = df['Distance_to_Metro_km'].fillna(df['Distance_to_Metro_km'].median())
df['Nearby_Hospital_km'] = df['Nearby_Hospital_km'].fillna(df['Nearby_Hospital_km'].median())

# 6. Feature Selection
feature_cols = [
    'latitude', 'longitude', 'Locality_Tier', 'BHK', 'Bathrooms', 
    'Super_Area_sqft', 'Floor_No', 'Total_Floors', 'Property_Age_years', 
    'Parking', 'Furnishing', 'Lift', 'Gated_Society', 
    'Distance_to_Metro_km', 'Distance_to_CityCenter_km', 
    'Nearby_School_km', 'Nearby_Hospital_km'
]

X = df[feature_cols]
y = df['Market_Price_INR']

cat_cols = ['Locality_Tier', 'Furnishing']
num_cols = [col for col in feature_cols if col not in cat_cols]

# 7. Preprocessing & Model Pipeline
preprocessor = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), num_cols),
        ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), cat_cols)
    ]
)

pipeline = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('regressor', RandomForestRegressor(
        n_estimators=150,
        max_depth=15,
        min_samples_split=5,
        random_state=42,
        n_jobs=-1
    ))
])

# 8. Train and Save Model
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
pipeline.fit(X_train, y_train)

print(f"Bangalore Model Trained successfully. R2 Score: {pipeline.score(X_test, y_test):.4f}")
joblib.dump(pipeline, 'bangalore_model.joblib')
print("Model saved to 'bangalore_model.joblib'")