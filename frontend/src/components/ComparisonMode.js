import React, { useState } from 'react';
import axios from 'axios';
import BearingAnimation from './BearingAnimation';
import './ComparisonMode.css';

const API_URL = 'http://localhost:8000/api';

const ComparisonMode = ({ featureNames }) => {
  const [normalData, setNormalData] = useState(null);
  const [defectData, setDefectData] = useState(null);
  const [selectedDefect, setSelectedDefect] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isRotating, setIsRotating] = useState(true);

  const defectTypes = [
    { id: 1, name: "Inner Race", color: "#FF9800" },
    { id: 2, name: "Outer Race", color: "#F44336" },
    { id: 3, name: "Ball", color: "#2196F3" }
  ];

  const compareBearings = async () => {
    setLoading(true);
    
    try {
      const [normal, defect] = await Promise.all([
        axios.post(`${API_URL}/demo/generate/`, { defect_type: 0 }),
        axios.post(`${API_URL}/demo/generate/`, { defect_type: selectedDefect })
      ]);
      
      if (normal.data.success && defect.data.success) {
        setNormalData(normal.data);
        setDefectData(defect.data);
      }
    } catch (error) {
      console.error('Error comparing bearings:', error);
      alert('Failed to compare bearings. Please check if backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const FeatureTable = ({ data }) => {
    if (!data?.synthetic_data?.features) return null;
    
    return (
      <div className="feature-table">
        <h4>Feature Comparison</h4>
        <table>
          <thead>
            <tr>
              <th>Feature</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {featureNames.map((name, index) => (
              <tr key={index}>
                <td>{name}</td>
                <td>{data.synthetic_data.features[index]?.toFixed(4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const getDifference = (normalVal, defectVal) => {
    if (!normalVal || !defectVal) return 'N/A';
    const diff = Math.abs(defectVal - normalVal);
    const percent = (diff / normalVal) * 100;
    return `${diff.toFixed(4)} (${percent.toFixed(1)}%)`;
  };

  return (
    <div className="comparison-container">
      <div className="comparison-header">
        <div className="header-content">
          <h1>🔍 Side-by-Side Bearing Comparison</h1>
          <p>Compare normal vs defective bearing characteristics</p>
        </div>
        
        <div className="header-controls">
          <div className="defect-selector">
            <label>Select Defect Type:</label>
            <select 
              value={selectedDefect}
              onChange={(e) => setSelectedDefect(parseInt(e.target.value))}
              disabled={loading}
            >
              {defectTypes.map(defect => (
                <option key={defect.id} value={defect.id}>
                  {defect.name} Defect
                </option>
              ))}
            </select>
          </div>
          
          <button 
            className="compare-btn"
            onClick={compareBearings}
            disabled={loading}
          >
            {loading ? 'Comparing...' : '🔄 Compare Bearings'}
          </button>
          
          <button 
            className="toggle-btn"
            onClick={() => setIsRotating(!isRotating)}
          >
            {isRotating ? '⏸️ Stop' : '▶️ Start'}
          </button>
        </div>
      </div>

      <div className="comparison-grid">
        {/* Normal Bearing */}
        <div className="comparison-card normal">
          <div className="card-header">
            <h2>✅ Normal Bearing</h2>
            <div className="status-badge healthy">Healthy</div>
          </div>
          
          <div className="card-content">
            <div className="animation-section">
              <BearingAnimation 
                defectType={0}
                isRotating={isRotating}
                severity={normalData?.prediction?.confidence || 0.3}
              />
            </div>
            
            {normalData ? (
              <div className="results-section">
                <div className="prediction-info">
                  <h3>Prediction Results</h3>
                  <div className="result-row">
                    <span>Predicted:</span>
                    <span className="result-value normal-text">
                      {normalData.prediction?.defect_type}
                    </span>
                  </div>
                  <div className="result-row">
                    <span>Confidence:</span>
                    <span className="result-value">
                      {(normalData.prediction?.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                <FeatureTable data={normalData} />
              </div>
            ) : (
              <div className="placeholder">
                <p>Click "Compare Bearings" to load data</p>
              </div>
            )}
          </div>
        </div>

        {/* Defective Bearing */}
        <div className="comparison-card defect">
          <div className="card-header">
            <h2>⚠️ Defective Bearing</h2>
            <div className="status-badge defective">
              {defectTypes.find(d => d.id === selectedDefect)?.name || 'Defect'}
            </div>
          </div>
          
          <div className="card-content">
            <div className="animation-section">
              <BearingAnimation 
                defectType={selectedDefect}
                isRotating={isRotating}
                severity={defectData?.prediction?.confidence || 0.7}
              />
            </div>
            
            {defectData ? (
              <div className="results-section">
                <div className="prediction-info">
                  <h3>Prediction Results</h3>
                  <div className="result-row">
                    <span>Predicted:</span>
                    <span className="result-value defect-text">
                      {defectData.prediction?.defect_type}
                    </span>
                  </div>
                  <div className="result-row">
                    <span>Confidence:</span>
                    <span className="result-value">
                      {(defectData.prediction?.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="result-row">
                    <span>Match:</span>
                    <span className={`match-indicator ${defectData.match ? 'match' : 'no-match'}`}>
                      {defectData.match ? '✅ Correct' : '❌ Incorrect'}
                    </span>
                  </div>
                </div>
                
                <FeatureTable data={defectData} />
              </div>
            ) : (
              <div className="placeholder">
                <p>Click "Compare Bearings" to load data</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comparison Insights */}
      {normalData && defectData && (
        <div className="insights-panel">
          <h2>📊 Comparison Insights</h2>
          
          <div className="insights-grid">
            <div className="insight-card">
              <h3>RMS Value</h3>
              <div className="insight-values">
                <div className="value-item">
                  <span>Normal:</span>
                  <span>{normalData.synthetic_data?.features[0]?.toFixed(4)}</span>
                </div>
                <div className="value-item">
                  <span>Defect:</span>
                  <span>{defectData.synthetic_data?.features[0]?.toFixed(4)}</span>
                </div>
                <div className="value-item difference">
                  <span>Difference:</span>
                  <span>{getDifference(
                    normalData.synthetic_data?.features[0],
                    defectData.synthetic_data?.features[0]
                  )}</span>
                </div>
              </div>
            </div>
            
            <div className="insight-card">
              <h3>Kurtosis</h3>
              <div className="insight-values">
                <div className="value-item">
                  <span>Normal:</span>
                  <span>{normalData.synthetic_data?.features[1]?.toFixed(2)}</span>
                </div>
                <div className="value-item">
                  <span>Defect:</span>
                  <span>{defectData.synthetic_data?.features[1]?.toFixed(2)}</span>
                </div>
                <div className="value-item difference">
                  <span>Difference:</span>
                  <span>{getDifference(
                    normalData.synthetic_data?.features[1],
                    defectData.synthetic_data?.features[1]
                  )}</span>
                </div>
              </div>
            </div>
            
            <div className="insight-card">
              <h3>Prediction Confidence</h3>
              <div className="insight-values">
                <div className="value-item">
                  <span>Normal:</span>
                  <span>{(normalData.prediction?.confidence * 100).toFixed(1)}%</span>
                </div>
                <div className="value-item">
                  <span>Defect:</span>
                  <span>{(defectData.prediction?.confidence * 100).toFixed(1)}%</span>
                </div>
                <div className="value-item difference">
                  <span>Difference:</span>
                  <span>
                    {Math.abs(
                      (defectData.prediction?.confidence || 0) - 
                      (normalData.prediction?.confidence || 0)
                    ).toFixed(3)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="insight-card">
              <h3>Key Observation</h3>
              <div className="observation">
                {defectData.synthetic_data?.features[1] > 6 ? (
                  <p>High kurtosis indicates impact peaks typical of bearing defects.</p>
                ) : (
                  <p>Feature patterns show clear differences from normal operation.</p>
                )}
                <p className="recommendation">
                  Recommendation: {defectData.match ? 
                    'Model correctly identified defect - suitable for deployment.' : 
                    'Model needs improvement in distinguishing this defect type.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="educational-section">
        <h3>🎓 What to Look For</h3>
        <div className="educational-grid">
          <div className="edu-item">
            <div className="edu-icon">📈</div>
            <h4>Increased RMS</h4>
            <p>Higher vibration energy indicates developing defects</p>
          </div>
          <div className="edu-item">
            <div className="edu-icon">⚡</div>
            <h4>High Kurtosis</h4>
            <p>Peak values above 6 suggest impact-type defects</p>
          </div>
          <div className="edu-item">
            <div className="edu-icon">🔄</div>
            <h4>Feature Patterns</h4>
            <p>Combination of multiple features provides reliable diagnosis</p>
          </div>
          <div className="edu-item">
            <div className="edu-icon">🎯</div>
            <h4>Confidence Level</h4>
            <p>High confidence (>85%) indicates clear defect patterns</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonMode;