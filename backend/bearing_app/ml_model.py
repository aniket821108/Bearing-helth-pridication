import joblib
import numpy as np
import json
import os
from scipy import signal
import random

class BearingPredictor:
    def __init__(self):
        # Get the directory of the current file
        current_dir = os.path.dirname(os.path.abspath(__file__))
        models_dir = os.path.join(current_dir, 'models')
        
        # Load your NEW model files
        model_path = os.path.join(models_dir, 'model_v1.joblib')
        scaler_path = os.path.join(models_dir, 'scaler_v1.joblib')
        feature_path = os.path.join(models_dir, 'features_v1.json')
        
        try:
            self.model = joblib.load(model_path)
            self.scaler = joblib.load(scaler_path)
            
            # Load feature names from JSON
            with open(feature_path, 'r') as f:
                feature_data = json.load(f)
                self.feature_names = feature_data['feature_columns']
                self.feature_descriptions = feature_data.get('feature_descriptions', {})
            
            print(f"✅ Model loaded successfully!")
            print(f"✅ Features: {len(self.feature_names)} features loaded")
            print(f"✅ Feature names: {self.feature_names}")
            
        except Exception as e:
            print(f"❌ Error loading model: {e}")
            # Fallback to default feature names
            self.feature_names = [
                'RMS', 'Kurtosis', 'Skewness', 'Peak', 'Variance', 'Mean_Abs', 
                'Peak_to_Peak', 'Crest_Factor', 'Shape_Factor', 'Impulse_Factor',
                'Spectral_Centroid', 'Spectral_Spread', 'Dominant_Freq', 'Dominant_Mag',
                'RMS_MA10', 'RMS_Trend', 'Kurtosis_MA10', 'Kurtosis_Trend', 
                'Peak_MA10', 'Peak_Trend'
            ]
            self.feature_descriptions = {}
            # Create dummy model for demo
            self.create_dummy_model()
    
    def create_dummy_model(self):
        """Create a dummy model for demo if real model fails"""
        from sklearn.ensemble import RandomForestClassifier
        print("⚠️ Creating dummy model for demonstration...")
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        # Train with dummy data
        X_dummy = np.random.randn(100, 20)
        y_dummy = np.random.randint(0, 4, 100)
        self.model.fit(X_dummy, y_dummy)
        
        # Dummy scaler
        class DummyScaler:
            def transform(self, X):
                return X
            def fit_transform(self, X):
                return X
        
        self.scaler = DummyScaler()
        print("✅ Dummy model ready!")
    
    def get_feature_names(self):
        """Return feature names for frontend"""
        return self.feature_names
    
    def get_feature_descriptions(self):
        """Return feature descriptions"""
        return self.feature_descriptions
    
    def predict(self, features):
        """
        features: List of 20 features in EXACT order from features_v1.json
        """
        try:
            if len(features) != 20:
                return {
                    'success': False,
                    'error': f'Expected 20 features, got {len(features)}'
                }
            
            # Convert to numpy array
            features_array = np.array(features).reshape(1, -1)
            
            # Scale features
            scaled_features = self.scaler.transform(features_array)
            
            # Make prediction
            prediction = self.model.predict(scaled_features)
            probabilities = self.model.predict_proba(scaled_features)
            
            # Map prediction to label
            defect_labels = {
                0: "Normal",
                1: "Inner Race Defect",
                2: "Outer Race Defect", 
                3: "Ball Defect"
            }
            
            prediction_code = int(prediction[0])
            
            return {
                'success': True,
                'defect_type': defect_labels[prediction_code],
                'confidence': float(max(probabilities[0])),
                'probabilities': probabilities[0].tolist(),
                'prediction_code': prediction_code,
                'feature_names': self.feature_names,
                'feature_values': dict(zip(self.feature_names, features)),
                'feature_descriptions': self.feature_descriptions
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def generate_synthetic_vibration(self, defect_type, duration=2, fs=10000):
        """
        Generate synthetic vibration signals for different bearing defects
        Now returns 20 features instead of 8
        """
        t = np.linspace(0, duration, int(fs * duration))
        
        # Base signal (normal operation)
        base_freq = 30  # Shaft rotation frequency (Hz)
        base_amp = 0.5
        
        # Normal bearing vibration
        normal_signal = base_amp * np.sin(2 * np.pi * base_freq * t)
        noise = 0.1 * np.random.randn(len(t))
        
        if defect_type == 0:  # Normal
            defect_signal = normal_signal + noise
            
        elif defect_type == 1:  # Inner Race Defect
            defect_freq = 5.5 * base_freq
            impulses = np.zeros_like(t)
            impulse_indices = np.arange(0, len(t), int(fs/defect_freq))
            impulses[impulse_indices] = 2.0
            decay = np.exp(-1000 * np.linspace(0, 0.01, 100))
            impulses = np.convolve(impulses, decay, mode='same')[:len(t)]
            defect_signal = normal_signal + 1.5 * impulses + 0.3 * noise
            
        elif defect_type == 2:  # Outer Race Defect
            defect_freq = 3.8 * base_freq
            impulses = np.zeros_like(t)
            impulse_indices = np.arange(0, len(t), int(fs/defect_freq))
            impulses[impulse_indices] = 1.8
            decay = np.exp(-800 * np.linspace(0, 0.01, 100))
            impulses = np.convolve(impulses, decay, mode='same')[:len(t)]
            defect_signal = normal_signal + 1.2 * impulses + 0.4 * noise
            
        elif defect_type == 3:  # Ball Defect
            defect_freq = 2.3 * base_freq
            impulses = np.zeros_like(t)
            impulse_indices = np.arange(0, len(t), int(fs/defect_freq))
            impulses[impulse_indices] = 1.5
            decay = np.exp(-600 * np.linspace(0, 0.02, 200))
            impulses = np.convolve(impulses, decay, mode='same')[:len(t)]
            defect_signal = normal_signal + 1.0 * impulses + 0.5 * noise
        else:
            defect_signal = normal_signal + noise
        
        # Extract ALL 20 features
        features = self.extract_features_v1(defect_signal, fs)
        
        return {
            'signal': defect_signal[:1000].tolist(),
            'time': t[:1000].tolist(),
            'features': features,
            'defect_type': defect_type,
            'sampling_rate': fs,
            'duration': duration
        }
    
    def extract_features_v1(self, signal, fs):
        """
        Extract ALL 20 features for the new model
        """
        # 1. Time Domain Features
        rms = np.sqrt(np.mean(signal**2))
        peak = np.max(np.abs(signal))
        variance = np.var(signal)
        mean_abs = np.mean(np.abs(signal))
        peak_to_peak = np.max(signal) - np.min(signal)
        
        # 2. Statistical Features
        kurtosis = np.mean((signal - np.mean(signal))**4) / (np.std(signal)**4)
        skewness = np.mean((signal - np.mean(signal))**3) / (np.std(signal)**3)
        crest_factor = peak / rms if rms != 0 else 0
        shape_factor = rms / mean_abs if mean_abs != 0 else 0
        impulse_factor = peak / mean_abs if mean_abs != 0 else 0
        
        # 3. Frequency Domain Features
        fft_vals = np.abs(np.fft.rfft(signal))
        freqs = np.fft.rfftfreq(len(signal), 1/fs)
        
        if len(fft_vals) > 0:
            spectral_centroid = np.sum(freqs * fft_vals) / np.sum(fft_vals) if np.sum(fft_vals) != 0 else 0
            spectral_spread = np.sqrt(np.sum((freqs - spectral_centroid)**2 * fft_vals) / np.sum(fft_vals)) if np.sum(fft_vals) != 0 else 0
            dominant_idx = np.argmax(fft_vals)
            dominant_freq = freqs[dominant_idx]
            dominant_mag = fft_vals[dominant_idx]
        else:
            spectral_centroid = spectral_spread = dominant_freq = dominant_mag = 0
        
        # 4. Rolling/Time-series Features (simulated)
        # For demo, we'll create realistic values based on defect type
        rms_ma10 = rms * (1 + np.random.uniform(-0.1, 0.1))
        rms_trend = np.random.uniform(-0.05, 0.05)
        kurtosis_ma10 = kurtosis * (1 + np.random.uniform(-0.15, 0.15))
        kurtosis_trend = np.random.uniform(-0.1, 0.1)
        peak_ma10 = peak * (1 + np.random.uniform(-0.1, 0.1))
        peak_trend = np.random.uniform(-0.05, 0.05)
        
        return [
            float(rms), float(kurtosis), float(skewness), float(peak), float(variance),
            float(mean_abs), float(peak_to_peak), float(crest_factor), float(shape_factor), 
            float(impulse_factor), float(spectral_centroid), float(spectral_spread),
            float(dominant_freq), float(dominant_mag), float(rms_ma10), float(rms_trend),
            float(kurtosis_ma10), float(kurtosis_trend), float(peak_ma10), float(peak_trend)
        ]
    
    def generate_demo_data(self, defect_type):
        """Generate synthetic data and predict"""
        try:
            # Generate synthetic vibration data
            synthetic_data = self.generate_synthetic_vibration(defect_type)
            
            # Make prediction
            prediction_result = self.predict(synthetic_data['features'])
            
            defect_labels = {
                0: "Normal",
                1: "Inner Race Defect",
                2: "Outer Race Defect",
                3: "Ball Defect"
            }
            
            return {
                'success': True,
                'synthetic_data': synthetic_data,
                'prediction': prediction_result,
                'actual_generated': defect_labels[defect_type],
                'match': prediction_result.get('prediction_code', -1) == defect_type
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_sample_features(self, defect_type):
        """Get sample feature values for demonstration based on defect type"""
        # Realistic ranges based on defect type
        samples = {
            0: [  # Normal
                0.035, 3.2, 0.1, 0.15, 0.0012, 0.028, 0.3, 4.2, 1.25, 5.3,
                45.5, 12.3, 30.0, 0.8, 0.034, 0.001, 3.1, -0.02, 0.145, 0.003
            ],
            1: [  # Inner Race Defect
                0.12, 12.5, 2.3, 0.85, 0.014, 0.095, 1.7, 7.1, 1.26, 8.9,
                165.5, 45.2, 165.0, 2.5, 0.118, 0.015, 12.8, 0.25, 0.82, 0.012
            ],
            2: [  # Outer Race Defect
                0.08, 8.7, 1.4, 0.55, 0.0064, 0.064, 1.1, 6.8, 1.25, 8.6,
                114.0, 38.7, 114.0, 1.8, 0.078, 0.008, 8.9, 0.18, 0.54, 0.009
            ],
            3: [  # Ball Defect
                0.09, 9.8, 1.8, 0.65, 0.0081, 0.072, 1.3, 7.2, 1.25, 9.0,
                69.0, 28.5, 69.0, 1.9, 0.088, 0.009, 9.5, 0.20, 0.63, 0.010
            ]
        }
        
        return samples.get(defect_type, samples[0])

# Create singleton instance
predictor = BearingPredictor()
# ml_model.py - predictor object ke baad ye add karo
def verify_model_integrity():
    """Verify that model, scaler, and features are aligned"""
    print("\n" + "="*50)
    print("🧠 MODEL INTEGRITY CHECK")
    print("="*50)
    
    # Check model dimensions
    if hasattr(predictor.model, 'n_features_in_'):
        print(f"✅ Model expects: {predictor.model.n_features_in_} features")
    
    # Check scaler dimensions
    if hasattr(predictor.scaler, 'n_features_in_'):
        print(f"✅ Scaler fitted on: {predictor.scaler.n_features_in_} features")
    
    # Check feature names
    print(f"✅ Feature names loaded: {len(predictor.feature_names)}")
    print(f"✅ Features: {predictor.feature_names}")
    
    # Test prediction
    test_features = [0.1] * 20  # 20 dummy values
    try:
        result = predictor.predict(test_features)
        if result['success']:
            print(f"✅ Test prediction works: {result['defect_type']}")
        else:
            print(f"❌ Test prediction failed: {result.get('error')}")
    except Exception as e:
        print(f"❌ Prediction error: {e}")
    
    print("="*50)

# Call this function when module loads
if __name__ == "bearing_app.ml_model":
    verify_model_integrity()