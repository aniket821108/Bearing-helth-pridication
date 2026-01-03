import React, { useState } from 'react';
import './FeatureInput20.css';

const FeatureInput20 = ({ features, featureNames, onFeatureChange, featureDescriptions = {} }) => {
  const [activeCategory, setActiveCategory] = useState('all');
  
  // Categorize features based on your JSON
  const categories = {
    'time_domain': ['RMS', 'Peak', 'Variance', 'Mean_Abs', 'Peak_to_Peak'],
    'statistical': ['Kurtosis', 'Skewness', 'Crest_Factor', 'Shape_Factor', 'Impulse_Factor'],
    'frequency_domain': ['Spectral_Centroid', 'Spectral_Spread', 'Dominant_Freq', 'Dominant_Mag'],
    'rolling': ['RMS_MA10', 'RMS_Trend', 'Kurtosis_MA10', 'Kurtosis_Trend', 'Peak_MA10', 'Peak_Trend']
  };
  
  const getFeaturesByCategory = () => {
    if (activeCategory === 'all') {
      return featureNames.map((name, index) => ({ name, index, category: getCategory(name) }));
    }
    return featureNames
      .map((name, index) => ({ name, index, category: getCategory(name) }))
      .filter(item => categories[activeCategory]?.includes(item.name));
  };
  
  const getCategory = (featureName) => {
    for (const [category, features] of Object.entries(categories)) {
      if (features.includes(featureName)) {
        return category;
      }
    }
    return 'other';
  };
  
  const categoryColors = {
    'time_domain': '#4CAF50',
    'statistical': '#2196F3',
    'frequency_domain': '#9C27B0',
    'rolling': '#FF9800',
    'other': '#795548'
  };
  
  const categoryIcons = {
    'time_domain': '📈',
    'statistical': '📊',
    'frequency_domain': '📡',
    'rolling': '🔄',
    'other': '📋'
  };

  return (
    <div className="feature-input-20">
      <div className="category-tabs">
        <button 
          className={`tab-btn ${activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => setActiveCategory('all')}
        >
          📋 All Features (20)
        </button>
        {Object.keys(categories).map(category => (
          <button
            key={category}
            className={`tab-btn ${activeCategory === category ? 'active' : ''}`}
            style={{ borderLeftColor: categoryColors[category] }}
            onClick={() => setActiveCategory(category)}
          >
            {categoryIcons[category]} {category.replace('_', ' ')} ({categories[category].length})
          </button>
        ))}
      </div>
      
      <div className="features-grid">
        {getFeaturesByCategory().map(({ name, index, category }) => (
          <div 
            key={index} 
            className="feature-input-group"
            style={{ borderLeftColor: categoryColors[category] }}
          >
            <div className="feature-header">
              <label htmlFor={`feature-${index}`}>
                <span className="feature-category-badge" style={{ backgroundColor: categoryColors[category] }}>
                  {categoryIcons[category]}
                </span>
                {name}
              </label>
              {featureDescriptions[name] && (
                <div className="feature-tooltip">
                  <span className="tooltip-icon">ℹ️</span>
                  <div className="tooltip-content">
                    <strong>{name}:</strong> {featureDescriptions[name]}
                  </div>
                </div>
              )}
            </div>
            
            <input
              id={`feature-${index}`}
              type="number"
              step="any"
              value={features[index] || ''}
              onChange={(e) => onFeatureChange(index, e.target.value)}
              placeholder={`Enter ${name}`}
              className={features[index] ? 'has-value' : ''}
            />
            
            <div className="feature-meta">
              <span className="feature-index">#{index + 1}</span>
              <span className="feature-category">{category.replace('_', ' ')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeatureInput20;