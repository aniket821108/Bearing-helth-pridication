import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import './BearingPredictor.css';
import FeatureInput20 from './FeatureInput20';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const API_URL = 'http://localhost:8000/api';

const BearingPredictor = ({ featureNames }) => {
  // ✅ 20 features initialize karo
  const [features, setFeatures] = useState(Array(20).fill(''));
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [samplePredictions, setSamplePredictions] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [featureDescriptions, setFeatureDescriptions] = useState({});

  // ✅ Single useEffect mein sab kuch
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Feature descriptions fetch karo
        const featuresResponse = await axios.get(`${API_URL}/features/`);
        if (featuresResponse.data.success) {
          setFeatureDescriptions(featuresResponse.data.feature_descriptions || {});
        }
        
        // Sample predictions load karo
        await loadSamplePredictions();
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
      }
    };
    
    fetchData();
  }, []);

  const loadSamplePredictions = async () => {
    try {
      const defectTypes = [0, 1, 2, 3];
      const predictions = [];
      
      for (const defectType of defectTypes) {
        const response = await axios.post(`${API_URL}/sample/`, { defect_type: defectType });
        if (response.data.success) {
          predictions.push(response.data);
        }
      }
      
      setSamplePredictions(predictions);
    } catch (error) {
      console.error('Failed to load sample predictions:', error);
      // Local fallback samples
      const localSamples = [
        {
          features: [0.035, 3.2, 0.1, 0.15, 0.0012, 0.028, 0.3, 4.2, 1.25, 5.3, 45.5, 12.3, 30.0, 0.8, 0.034, 0.001, 3.1, -0.02, 0.145, 0.003],
          prediction: { defect_type: "Normal", confidence: 0.95 }
        },
        {
          features: [0.12, 12.5, 2.3, 0.85, 0.014, 0.095, 1.7, 7.1, 1.26, 8.9, 165.5, 45.2, 165.0, 2.5, 0.118, 0.015, 12.8, 0.25, 0.82, 0.012],
          prediction: { defect_type: "Inner Race Defect", confidence: 0.88 }
        }
      ];
      setSamplePredictions(localSamples);
    }
  };

  const handleInputChange = (index, value) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
    setError('');
  };

  const validateInputs = () => {
    for (let i = 0; i < features.length; i++) {
      const value = features[i].trim();
      if (value === '') {
        setError(`Please enter value for ${featureNames[i] || `Feature ${i + 1}`}`);
        return false;
      }
      
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        setError(`Invalid number for ${featureNames[i] || `Feature ${i + 1}`}`);
        return false;
      }
    }
    return true;
  };

  const handlePredict = async () => {
    if (!validateInputs()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const numericFeatures = features.map(f => parseFloat(f));
      const response = await axios.post(`${API_URL}/predict/`, {
        features: numericFeatures
      });
      
      if (response.data.success) {
        setPrediction(response.data);
      } else {
        setError(response.data.error || 'Prediction failed');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to connect to server. Please check if backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const loadSample = (sample) => {
    setFeatures(sample.features);
    setPrediction(sample.prediction);
    setError('');
  };

  // ✅ 20 features clear karo
  const clearForm = () => {
    setFeatures(Array(20).fill(''));
    setPrediction(null);
    setError('');
  };

  const probabilityChartData = prediction ? {
    labels: ['Normal', 'Inner Race', 'Outer Race', 'Ball Defect'],
    datasets: [
      {
        label: 'Probability (%)',
        data: prediction.probabilities.map(p => p * 100),
        backgroundColor: [
          '#4CAF50', '#FF9800', '#F44336', '#2196F3'
        ],
        borderColor: [
          '#45a049', '#e68900', '#d32f2f', '#1976d2'
        ],
        borderWidth: 1
      }
    ]
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Defect Probability Distribution',
        font: {
          size: 14,
          weight: 'bold'
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Probability (%)'
        }
      }
    }
  };

  const defectColors = {
    'Normal': '#4CAF50',
    'Inner Race Defect': '#FF9800',
    'Outer Race Defect': '#F44336',
    'Ball Defect': '#2196F3'
  };

  return (
    <div className="predictor-container">
      <div className="predictor-layout">
        {/* Left Panel - Input Form */}
        <div className="input-panel">
          <div className="panel-header">
            <h2>📊 Manual Prediction</h2>
            <p>Enter 20 bearing vibration features to get ML prediction</p>
          </div>

          <div className="features-form">
            <FeatureInput20 
              features={features}
              featureNames={featureNames}
              featureDescriptions={featureDescriptions}
              onFeatureChange={handleInputChange}
            />
            
            {error && (
              <div className="error-message">
                ⚠️ {error}
              </div>
            )}

            <div className="feature-summary">
              <p>Total Features: <strong>20</strong> | 
                Time Domain: <strong>5</strong> | 
                Statistical: <strong>5</strong> | 
                Frequency Domain: <strong>4</strong> | 
                Rolling: <strong>6</strong>
              </p>
            </div>

            <div className="action-buttons">
              <button
                className="predict-btn"
                onClick={handlePredict}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Predicting...
                  </>
                ) : (
                  '🔍 Predict Bearing Condition'
                )}
              </button>
              
              <button
                className="clear-btn"
                onClick={clearForm}
                disabled={loading}
              >
                🗑️ Clear
              </button>
            </div>
          </div>

          <div className="samples-section">
            <h3>💡 Sample Predictions</h3>
            <div className="samples-grid">
              {samplePredictions.map((sample, index) => (
                <div
                  key={index}
                  className="sample-card"
                  onClick={() => loadSample(sample)}
                >
                  <div className="sample-header">
                    <div className="sample-type">
                      {sample.prediction?.defect_type || 'Unknown'}
                    </div>
                    <div className="sample-confidence">
                      {sample.prediction?.confidence ? 
                        `${(sample.prediction.confidence * 100).toFixed(0)}%` : 'N/A'}
                    </div>
                  </div>
                  <div className="sample-features">
                    RMS: {sample.features[0]?.toFixed(3)} | 
                    Kurtosis: {sample.features[1]?.toFixed(1)}
                  </div>
                  <div className="sample-hint">
                    Click to load
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Results */}
        <div className="results-panel">
          {prediction ? (
            <>
              <div className="results-header">
                <h2>Prediction Results</h2>
                <div className="confidence-badge">
                  {prediction.confidence ? 
                    `${(prediction.confidence * 100).toFixed(1)}%` : 'N/A'}
                </div>
              </div>

              <div 
                className="prediction-card"
                style={{ 
                  borderLeftColor: defectColors[prediction.defect_type] || '#667eea',
                  backgroundColor: `${defectColors[prediction.defect_type] || '#667eea'}10`
                }}
              >
                <div className="prediction-type">
                  <h3>{prediction.defect_type}</h3>
                  <div className="prediction-icon">
                    {prediction.defect_type === 'Normal' ? '✅' : 
                     prediction.defect_type.includes('Inner') ? '⚠️' :
                     prediction.defect_type.includes('Outer') ? '🔴' : '🔵'}
                  </div>
                </div>
                
                <div className="prediction-details">
                  <div className="detail-item">
                    <span className="detail-label">Status:</span>
                    <span className={`detail-value ${prediction.defect_type === 'Normal' ? 'healthy' : 'defective'}`}>
                      {prediction.defect_type === 'Normal' ? 'Healthy' : 'Defective'}
                    </span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-label">Confidence:</span>
                    <span className="detail-value confidence">
                      {(prediction.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-label">Prediction Code:</span>
                    <span className="detail-value">{prediction.prediction_code}</span>
                  </div>
                </div>
              </div>

              <div className="chart-section">
                <div className="chart-container">
                  {probabilityChartData && (
                    <Bar data={probabilityChartData} options={chartOptions} />
                  )}
                </div>
              </div>

              <div className="recommendations-section">
                <h3>📋 Recommendations</h3>
                {prediction.defect_type === 'Normal' ? (
                  <div className="recommendation normal">
                    <h4>✅ Bearing is Healthy</h4>
                    <ul>
                      <li>Continue regular maintenance schedule</li>
                      <li>Monitor vibration levels weekly</li>
                      <li>Check lubrication levels monthly</li>
                      <li>Schedule next inspection in 3 months</li>
                    </ul>
                  </div>
                ) : (
                  <div className="recommendation defective">
                    <h4>⚠️ Immediate Action Required</h4>
                    <ul>
                      <li>Schedule immediate visual inspection</li>
                      <li>Check lubrication system</li>
                      <li>Consider bearing replacement soon</li>
                      <li>Increase monitoring frequency to daily</li>
                      <li>Prepare maintenance shutdown plan</li>
                    </ul>
                  </div>
                )}
              </div>

              {showAdvanced && prediction.feature_values && (
                <div className="advanced-section">
                  <h3>🔧 Feature Analysis</h3>
                  <div className="features-analysis">
                    {Object.entries(prediction.feature_values).map(([name, value]) => (
                      <div key={name} className="feature-analysis-item">
                        <div className="feature-analysis-name">{name}</div>
                        <div className="feature-analysis-value">{value.toFixed(4)}</div>
                        <div className="feature-analysis-bar">
                          <div 
                            className="feature-analysis-fill"
                            style={{ width: `${Math.min(value * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                className="toggle-advanced"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                {showAdvanced ? '▲ Hide Advanced' : '▼ Show Advanced Analysis'}
              </button>
            </>
          ) : (
            <div className="placeholder-results">
              <div className="placeholder-icon">📈</div>
              <h3>Enter 20 Features to Get Prediction</h3>
              <p>
                Fill in all 20 vibration features on the left and click "Predict" 
                to see the ML model's diagnosis.
              </p>
              <div className="placeholder-tips">
                <h4>💡 Tips:</h4>
                <ul>
                  <li>Use sample predictions to quickly test the system</li>
                  <li>Ensure all 20 features are entered correctly</li>
                  <li>Refer to tooltips for each feature description</li>
                  <li>Higher kurtosis (>6) usually indicates defects</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BearingPredictor;