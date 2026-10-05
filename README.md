# real-estate-price-prediction
##  Machine Learning Model

The application uses a **Random Forest Regression** model trained specifically on Bangalore property data.

The training pipeline:

1. Loads the Indian real-estate dataset.
2. Filters the dataset to **Bangalore** properties.
3. Cleans latitude and longitude values.
4. Calculates the distance from Bangalore city center using the **Haversine formula**.
5. Handles missing values.
6. Standardizes categorical features.
7. Applies feature preprocessing using `StandardScaler` and `OneHotEncoder`.
8. Trains a `RandomForestRegressor`.
9. Saves the trained pipeline using Joblib.

### Model Features

The model uses the following features:

| Feature | Description |
|---|---|
| `latitude` | Property latitude |
| `longitude` | Property longitude |
| `Locality_Tier` | Locality classification/tier |
| `BHK` | Number of bedrooms |
| `Bathrooms` | Number of bathrooms |
| `Super_Area_sqft` | Property area in square feet |
| `Floor_No` | Property floor number |
| `Total_Floors` | Total floors in the building |
| `Property_Age_years` | Age of the property |
| `Parking` | Parking availability |
| `Furnishing` | Furnishing status |
| `Lift` | Lift/elevator availability |
| `Gated_Society` | Whether the property is in a gated society |
| `Distance_to_Metro_km` | Distance to the nearest metro |
| `Distance_to_CityCenter_km` | Distance from Bangalore city center |
| `Nearby_School_km` | Distance to a nearby school |
| `Nearby_Hospital_km` | Distance to a nearby hospital |

### Model Architecture

The machine-learning pipeline consists of:

```text
Input Features
      │
      ▼
┌───────────────────────────────┐
│      Data Preprocessing       │
│                               │
│ Numeric Features              │
│ → StandardScaler              │
│                               │
│ Categorical Features          │
│ → OneHotEncoder               │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│     Random Forest Regressor   │
│                               │
│ n_estimators = 150            │
│ max_depth = 15                │
│ min_samples_split = 5        │
│ random_state = 42             │
└───────────────┬───────────────┘
                │
                ▼
        Predicted Price (INR)
```

### Distance Calculation

`Distance_to_CityCenter_km` is calculated automatically using the **Haversine formula**.

The reference point used for Bangalore city center is:

```text
Latitude:  12.9716
Longitude: 77.5946
```

This corresponds to the MG Road area of Bangalore.

### Training the Model

Navigate to the ML directory:

```bash
cd ml-model
```

Create and activate a Python virtual environment:

```bash
python -m venv venv
```

#### Windows

```powershell
venv\Scripts\activate
```

#### macOS / Linux

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Train the model:

```bash
python train_model.py
```

The training script evaluates the model on a held-out test set and prints the **R² score**:

```text
Bangalore Model Trained successfully. R2 Score: 0.xxxx
Model saved to 'bangalore_model.joblib'
```

The trained model is saved as:

```text
ml-model/bangalore_model.joblib
```

### Making Predictions

The `predict.py` script loads the saved pipeline and accepts property information as a JSON argument.

Example:

```bash
python predict.py "{\"latitude\":12.9716,\"longitude\":77.5946,\"Locality_Tier\":\"Tier 1\",\"BHK\":3,\"Bathrooms\":2,\"Super_Area_sqft\":1500,\"Floor_No\":3,\"Total_Floors\":10,\"Property_Age_years\":5,\"Parking\":1,\"Furnishing\":\"Furnished\",\"Lift\":1,\"Gated_Society\":1,\"Distance_to_Metro_km\":2.5,\"Distance_to_CityCenter_km\":1.2,\"Nearby_School_km\":1.0,\"Nearby_Hospital_km\":2.0}"
```

The prediction script returns JSON:

```json
{
  "predicted_price": 8500000.0
}
```

The `predicted_price` value represents the estimated property price in **Indian Rupees (INR)**.

> **Note:** The input feature names and categorical values must match the features expected by the trained pipeline.

### Trained Model

The trained model is included in the repository:

```text
ml-model/bangalore_model.joblib
```

This allows the application to make predictions without retraining the model every time it is run.
