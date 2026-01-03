# test_integration.py
import json
import requests
import numpy as np

API_URL = "http://localhost:8000/api"

def test_20_features():
    print("🧪 Testing 20-Feature Integration...")
    print("="*50)
    
    # 1. Check API health
    print("1️⃣ Checking API health...")
    try:
        response = requests.get(f"{API_URL}/health/")
        data = response.json()
        print(f"✅ API Status: {data.get('status')}")
        print(f"✅ Features loaded: {len(data.get('features', []))}")
        print(f"✅ Features: {data.get('features')[:5]}...")  # First 5 show karo
    except Exception as e:
        print(f"❌ API error: {e}")
        return False
    
    # 2. Load sample features from JSON
    print("\n2️⃣ Loading features_v1.json...")
    with open('bearing_app/models/features_v1.json', 'r') as f:
        feature_config = json.load(f)
    
    features_list = feature_config['feature_columns']
    print(f"✅ Total features in JSON: {len(features_list)}")
    print(f"✅ Feature names: {features_list}")
    
    # 3. Test with sample data
    print("\n3️⃣ Testing prediction with sample data...")
    
    # Normal bearing ke features (20 values)
    sample_features = [
        0.035, 3.2, 0.1, 0.15, 0.0012, 0.028, 0.3, 4.2, 1.25, 5.3,
        45.5, 12.3, 30.0, 0.8, 0.034, 0.001, 3.1, -0.02, 0.145, 0.003
    ]
    
    try:
        response = requests.post(f"{API_URL}/predict/", json={
            'features': sample_features
        })
        data = response.json()
        
        if response.status_code == 200 and data.get('success'):
            print(f"✅ Prediction successful!")
            print(f"✅ Defect Type: {data.get('defect_type')}")
            print(f"✅ Confidence: {data.get('confidence')}")
            print(f"✅ Received {len(data.get('feature_names', []))} features back")
        elif response.status_code == 400:
            print(f"❌ Error: {data.get('error')}")
            print(f"⚠️  Send kiye: {len(sample_features)} features")
            return False
        else:
            print(f"❌ Unexpected error: {data}")
            return False
            
    except Exception as e:
        print(f"❌ API call failed: {e}")
        return False
    
    # 4. Test sample endpoint
    print("\n4️⃣ Testing sample endpoint...")
    try:
        response = requests.post(f"{API_URL}/sample/", json={
            'defect_type': 1
        })
        data = response.json()
        
        if data.get('success'):
            sample_features = data.get('features', [])
            print(f"✅ Sample features received: {len(sample_features)}")
            
            # Check prediction
            prediction = data.get('prediction', {})
            if prediction.get('success'):
                print(f"✅ Sample prediction: {prediction.get('defect_type')}")
            else:
                print(f"⚠️  Sample prediction failed: {prediction.get('error')}")
        else:
            print(f"❌ Sample endpoint failed: {data.get('error')}")
            
    except Exception as e:
        print(f"❌ Sample test failed: {e}")
    
    print("\n" + "="*50)
    print("🎯 VERIFICATION SUMMARY:")
    print("- Check if features count is 20 everywhere")
    print("- Check if ml_model.py loads correct model")
    print("- Check if scaler is applied correctly")
    print("- Check if frontend sends 20 features")
    
    return True

if __name__ == "__main__":
    test_20_features()