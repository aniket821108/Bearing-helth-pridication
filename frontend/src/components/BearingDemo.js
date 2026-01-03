import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import BearingAnimation from './BearingAnimation';
import './BearingDemo.css';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const API_URL = 'http://localhost:8000/api';

const BearingDemo = ({ featureNames }) => {
  const [selectedDefect, setSelectedDefect] = useState(0);
  const [demoData, setDemoData] = useState(null);
  const [isRotating, setIsRotating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [vibrationHistory, setVibrationHistory] = useState([]);
  const [predictionHistory, setPredictionHistory] = useState([]);

  const defectTypes = [
    { id: 0, name: "Normal", color: "#4CAF50", description: "Healthy bearing operation with minimal vibration" },
    { id: 1, name: "Inner Race", color: "#FF9800", description: "Defect on inner race surface - high frequency impacts" },
    { id: 2, name: "Outer Race", color: "#F44336", description: "Defect on outer race surface - medium frequency impacts" },
    { id: 3, name: "Ball", color: "#2196F3", description: "Defect on rolling element - irregular impacts" }
  ];

  useEffect(() => {
    // Initialize with normal bearing
    generateDemo(0);
  }, []);

  const generateDemo = async (defectType) => {
    setIsGenerating(true);
    setIsRotating(true);
    
    try {
      const response = await axios.post(`${API_URL}/demo/generate/`, {
        defect_type: defectType
      });
      
      if (response.data.success) {
        setDemoData(response.data);
        
        // Add to prediction history
        setPredictionHistory(prev => [response.data, ...prev.slice(0, 4)]);
        
        // Simulate vibration data
        simulateVibrationData(defectType);
      }
    } catch (error) {
      console.error('Error generating demo:', error);
      alert('Failed to generate demo. Please check if backend is running.');
    } finally {
      setIsGenerating(false);
    }
  };

  const simulateVibrationData = (defectType) => {
    const history = [];
    const duration = 3000; // 3 seconds
    const interval = 50; // Update every 50ms
    
    let time = 0;
    const intervalId = setInterval(() => {
      let amplitude;
      
      switch(defectType) {
        case 0: // Normal
          amplitude = 0.1 + 0.05 * Math.sin(time / 500);
          break;
        case 1: // Inner Race
          amplitude = 0.6 + 0.3 * Math.sin(time / 200);
          break;
        case 2: // Outer Race
          amplitude = 0.4 + 0.2 * Math.sin(time / 300);
          break;
        case 3: // Ball
          amplitude = 0.5 + 0.25 * Math.sin(time / 250);
          break;
        default:
          amplitude = 0.1;
      }
      
      // Add some noise
      amplitude += Math.random() * 0.05;
      
      history.push({
        time: time / 1000,
        amplitude: amplitude
      });
      
      if (history.length > 40) history.shift();
      
      setVibrationHistory([...history]);
      time += interval;
      
      if (time >= duration) {
        clearInterval(intervalId);
      }
    }, interval);
  };

  const handleDefectSelect = (defectId) => {
    setSelectedDefect(defectId);
    generateDemo(defectId);
  };

  const vibrationChartData = {
    labels: vibrationHistory.map(d => d.time.toFixed(1)),
    datasets: [
      {
        label: 'Vibration Amplitude',
        data: vibrationHistory.map(d => d.amplitude),
        borderColor: defectTypes[selectedDefect].color,
        backgroundColor: `${defectTypes[selectedDefect].color}20`,
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }
    ]
  };

 const featureChartData = demoData ? {
  labels: featureNames || Array(20).fill('Feature'), // 20 features
  datasets: [
    {
      label: 'Feature Values',
      data: demoData.synthetic_data?.features || Array(20).fill(0), // 20 features
      backgroundColor: defectTypes[selectedDefect].color,
      borderColor: defectTypes[selectedDefect].color,
      borderWidth: 1,
      borderRadius: 5
    }
  ]
} : null;
  const probabilityChartData = demoData?.prediction?.probabilities ? {
    labels: ['Normal', 'Inner Race', 'Outer Race', 'Ball Defect'],
    datasets: [
      {
        label: 'Probability (%)',
        data: demoData.prediction.probabilities.map(p => p * 100),
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

  const vibrationChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Real-time Vibration Signal',
        font: {
          size: 14,
          weight: 'bold'
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Time (seconds)'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Amplitude'
        },
        beginAtZero: true
      }
    }
  };

  const featureChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Extracted Features',
        font: {
          size: 14,
          weight: 'bold'
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <div className="demo-container">
      <div className="demo-layout">
        {/* Left Panel - Controls */}
        <div className="control-panel">
          <h2 className="panel-title">🎮 Demo Controls</h2>
          
          <div className="defect-selector">
            <h3>Select Defect Type:</h3>
            <div className="defect-buttons">
              {defectTypes.map(defect => (
                <button
                  key={defect.id}
                  className={`defect-btn ${selectedDefect === defect.id ? 'active' : ''}`}
                  style={{ 
                    backgroundColor: selectedDefect === defect.id ? defect.color : '#f8f9fa',
                    color: selectedDefect === defect.id ? 'white' : '#333'
                  }}
                  onClick={() => handleDefectSelect(defect.id)}
                  disabled={isGenerating}
                >
                  {defect.name}
                </button>
              ))}
            </div>
          </div>

          <div className="defect-info">
            <h3>ℹ️ {defectTypes[selectedDefect].name}</h3>
            <p className="defect-description">{defectTypes[selectedDefect].description}</p>
            
            <div className="info-details">
              <h4>Characteristics:</h4>
              <ul>
                {selectedDefect === 0 ? (
                  <>
                    <li>Smooth vibration pattern</li>
                    <li>Low amplitude (0.01-0.05 g)</li>
                    <li>Regular maintenance cycle</li>
                    <li>No impact peaks</li>
                  </>
                ) : (
                  <>
                    <li>Impulsive vibration patterns</li>
                    <li>High kurtosis (> 6)</li>
                    <li>Increased RMS value</li>
                    <li>Characteristic frequency present</li>
                  </>
                )}
              </ul>
            </div>
          </div>

          <div className="control-buttons">
            <button
              className="generate-btn"
              onClick={() => generateDemo(selectedDefect)}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <span className="spinner"></span>
                  Generating...
                </>
              ) : (
                '🔄 Regenerate Data'
              )}
            </button>
            
            <button 
              className="toggle-btn"
              onClick={() => setIsRotating(!isRotating)}
            >
              {isRotating ? '⏸️ Stop Rotation' : '▶️ Start Rotation'}
            </button>
          </div>

          // In the feature-values section
            {featureNames && featureNames.length > 0 && (
           <div className="feature-values">
              <h4>Generated Features ({featureNames?.length || 20} total)</h4>
              <div className="feature-categories">
                <span className="category-tag time-domain">Time Domain: 5</span>
                <span className="category-tag statistical">Statistical: 5</span>
                <span className="category-tag frequency">Frequency: 4</span>
                <span className="category-tag rolling">Rolling: 6</span>
              </div>
              
              <div className="features-list-scroll">
                {(featureNames || Array(20).fill('Feature')).map((name, index) => (
                  <div key={index} className="feature-item">
                    <span className="feature-name">{name}:</span>
                    <span className="feature-value">
                      {demoData?.synthetic_data?.features[index]?.toFixed(4) || '0.0000'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            )}
        </div>

        {/* Center Panel - Animation & Results */}
        <div className="visualization-panel">
          <div className="animation-section">
            <BearingAnimation 
              defectType={selectedDefect}
              isRotating={isRotating}
              severity={demoData?.prediction?.confidence || 0.5}
            />
          </div>

          {demoData && demoData.prediction?.success && (
            <div className="prediction-section">
              <div className={`prediction-result ${demoData.match ? 'correct' : 'incorrect'}`}>
                <h3>🧠 ML Prediction Result</h3>
                <div className="result-details">
                  <div className="result-item">
                    <span className="result-label">Predicted:</span>
                    <span className="result-value defect-name">
                      {demoData.prediction.defect_type}
                    </span>
                  </div>
                  
                  <div className="result-item">
                    <span className="result-label">Confidence:</span>
                    <span className="result-value confidence">
                      {(demoData.prediction.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="result-item">
                    <span className="result-label">Actual Generated:</span>
                    <span className="result-value">{demoData.actual_generated}</span>
                  </div>
                  
                  <div className={`match-badge ${demoData.match ? 'match' : 'no-match'}`}>
                    {demoData.match ? '✅ Correct Match' : '❌ Mismatch'}
                  </div>
                </div>
              </div>

              <div className="charts-container">
                <div className="chart-wrapper">
                  <div className="chart-container">
                    {vibrationHistory.length > 0 && (
                      <Line data={vibrationChartData} options={vibrationChartOptions} />
                    )}
                  </div>
                </div>

                <div className="chart-wrapper">
                  <div className="chart-container">
                    {featureChartData && (
                      <Bar data={featureChartData} options={featureChartOptions} />
                    )}
                  </div>
                </div>

                <div className="chart-wrapper">
                  <div className="chart-container">
                    {probabilityChartData && (
                      <Bar data={probabilityChartData} options={{
                        ...featureChartOptions,
                        plugins: {
                          ...featureChartOptions.plugins,
                          title: {
                            ...featureChartOptions.plugins.title,
                            text: 'Probability Distribution'
                          }
                        }
                      }} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Statistics */}
        <div className="stats-panel">
          <h2 className="panel-title">📊 Statistics</h2>
          
          {demoData ? (
            <>
              <div className="stat-cards">
                <div className="stat-card">
                  <div className="stat-icon">📈</div>
                  <h4>RMS Value</h4>
                  <p className="stat-value">
                    {demoData.synthetic_data?.features[0]?.toFixed(4) || '0.0000'}
                  </p>
                  <p className="stat-label">Vibration Energy</p>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">📊</div>
                  <h4>Kurtosis</h4>
                  <p className="stat-value">
                    {demoData.synthetic_data?.features[1]?.toFixed(2) || '0.00'}
                  </p>
                  <p className="stat-label">Peakiness</p>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">⚡</div>
                  <h4>Peak-to-Peak</h4>
                  <p className="stat-value">
                    {demoData.synthetic_data?.features[3]?.toFixed(4) || '0.0000'}
                  </p>
                  <p className="stat-label">Max Range</p>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">🎯</div>
                  <h4>Confidence</h4>
                  <p className="stat-value">
                    {(demoData.prediction?.confidence * 100).toFixed(1)}%
                  </p>
                  <p className="stat-label">ML Certainty</p>
                </div>
              </div>

              <div className="probability-section">
                <h3>Probability Distribution</h3>
                {demoData.prediction?.probabilities?.map((prob, idx) => (
                  <div key={idx} className="probability-item">
                    <div className="prob-label">
                      <span className="defect-color" style={{ backgroundColor: defectTypes[idx].color }}></span>
                      <span>{defectTypes[idx].name}</span>
                    </div>
                    <div className="prob-bar-container">
                      <div 
                        className="prob-fill"
                        style={{
                          width: `${prob * 100}%`,
                          backgroundColor: defectTypes[idx].color
                        }}
                      ></div>
                      <span className="prob-value">{(prob * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="placeholder">
              <div className="placeholder-icon">📊</div>
              <p>Click "Generate" to see live statistics</p>
              <p>Features will be extracted and analyzed in real-time</p>
            </div>
          )}

          <div className="educational-info">
            <h3>📚 How It Works</h3>
            <ol className="steps-list">
              <li><strong>Step 1:</strong> Synthetic vibration signals are generated</li>
              <li><strong>Step 2:</strong> 8 statistical features are extracted</li>
              <li><strong>Step 3:</strong> Features are scaled using the trained scaler</li>
              <li><strong>Step 4:</strong> Gradient Boosting model makes prediction</li>
              <li><strong>Step 5:</strong> Results are visualized in real-time</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BearingDemo;