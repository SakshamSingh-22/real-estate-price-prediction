import sys
import json
import pandas as pd
import joblib
import os

script_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(script_dir, 'bangalore_model.joblib')

pipeline = joblib.load(model_path)

input_json = sys.argv[1]
input_data = json.loads(input_json)

df_input = pd.DataFrame([input_data])
predicted_price = pipeline.predict(df_input)[0]

print(json.dumps({"predicted_price": round(float(predicted_price), 2)}))