import React, { useState, useEffect } from 'react';
import './App.css';
import BearingDemo from './components/BearingDemo';
import ComparisonMode from './components/ComparisonMode';
import BearingPredictor from './components/BearingPredictor';
import axios from 'axios';

// API Configuration
const API_URL = 'http://localhost:8000/api';

function App() {
  const [activeTab, setActiveTab] = useState('demo');
  const [apiStatus, setApiStatus] = useState('checking');
  const [featureNames, setFeatureNames] = useState([]);

  useEffect(() => {
    // Check API health on component mount
    checkApiHealth();
    fetchFeatureNames();
  }, []);

  const checkApiHealth = async () => {
    try {
      const response = await axios.get(`${API_URL}/health/`);
      if (response.data.status === 'API is running') {
        setApiStatus('online');
      } else {
        setApiStatus('offline');
      }
    } catch (error) {
      console.error('API Health Check failed:', error);
      setApiStatus('offline');
    }
  };

 const fetchFeatureNames = async () => {
  try {
    // ✅ CHANGE 1: Yeh line change karo
    const response = await axios.get(`${API_URL}/features/`);
    
    if (response.data.success) {
      setFeatureNames(response.data.feature_names);
      
      // ✅ CHANGE 2: Check karo if descriptions exist
      if (response.data.feature_descriptions) {
        localStorage.setItem('feature_descriptions', 
          JSON.stringify(response.data.feature_descriptions));
      }
    }
  } catch (error) {
    console.error('Failed to fetch feature names:', error);
    // Fallback to default 20 features
    setFeatureNames([
      'RMS', 'Kurtosis', 'Skewness', 'Peak', 'Variance', 'Mean_Abs', 
      'Peak_to_Peak', 'Crest_Factor', 'Shape_Factor', 'Impulse_Factor',
      'Spectral_Centroid', 'Spectral_Spread', 'Dominant_Freq', 'Dominant_Mag',
      'RMS_MA10', 'RMS_Trend', 'Kurtosis_MA10', 'Kurtosis_Trend', 
      'Peak_MA10', 'Peak_Trend'
    ]);
  }
};

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <h1>🔧 Bearing Health Monitoring System</h1>
          <p>Machine Learning-based Early Fault Detection</p>
          <div className="api-status">
            <span className={`status-dot ${apiStatus === 'online' ? 'online' : 'offline'}`}></span>
            <span>API: {apiStatus === 'online' ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
      </header>

      <div className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'demo' ? 'active' : ''}`}
          onClick={() => setActiveTab('demo')}
        >
          🎮 Interactive Demo
        </button>
        <button 
          className={`tab-btn ${activeTab === 'compare' ? 'active' : ''}`}
          onClick={() => setActiveTab('compare')}
        >
          🔍 Comparison Mode
        </button>
        <button 
          className={`tab-btn ${activeTab === 'predict' ? 'active' : ''}`}
          onClick={() => setActiveTab('predict')}
        >
          📊 Manual Prediction
        </button>
        <button 
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          📜 Prediction History
        </button>
      </div>

      <main className="App-main">
        {activeTab === 'demo' && (
          <BearingDemo featureNames={featureNames} />
        )}
        
        {activeTab === 'compare' && (
          <ComparisonMode featureNames={featureNames} />
        )}
        
        {activeTab === 'predict' && (
          <BearingPredictor featureNames={featureNames} />
        )}
        
        {activeTab === 'history' && (
          <div className="history-section">
            <h2>📜 Prediction History</h2>
            <p>Coming soon... Predictions will be saved and displayed here.</p>
          </div>
        )}
      </main>

      <footer className="App-footer">
        <div className="footer-content">
          <p>© 2024 Bearing Health Prediction System | Using Gradient Boosting ML Model</p>
          <p className="footer-note">
            This system demonstrates early bearing fault detection using vibration analysis and machine learning.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;