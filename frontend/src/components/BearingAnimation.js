import React, { useEffect, useRef } from 'react';
import './BearingAnimation.css';

const BearingAnimation = ({ defectType = 0, isRotating = false, severity = 0.5 }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const rotationRef = useRef(0);
  const vibrationRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    const drawBearing = (rotation) => {
      ctx.clearRect(0, 0, width, height);
      
      // Bearing dimensions
      const outerRadius = 120;
      const innerRadius = 80;
      const ballRadius = 12;
      const numBalls = 8;
      
      // Draw outer race
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 8;
      ctx.stroke();
      
      // Draw inner race (rotating)
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotation);
      ctx.translate(-centerX, -centerY);
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
      ctx.strokeStyle = '#007bff';
      ctx.lineWidth = 6;
      ctx.stroke();
      
      // Draw balls
      for (let i = 0; i < numBalls; i++) {
        const angle = (i * 2 * Math.PI) / numBalls;
        const ballX = centerX + (innerRadius + (outerRadius - innerRadius) / 2) * Math.cos(angle);
        const ballY = centerY + (innerRadius + (outerRadius - innerRadius) / 2) * Math.sin(angle);
        
        // Highlight defective ball
        let ballColor = '#666';
        if (defectType === 3 && i === 2) { // Ball defect
          ballColor = '#ff4444';
          ctx.shadowColor = '#ff4444';
          ctx.shadowBlur = 15;
        }
        
        ctx.beginPath();
        ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
        ctx.fillStyle = ballColor;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      
      // Draw defect indicators
      if (defectType === 1) { // Inner race defect
        ctx.beginPath();
        ctx.arc(centerX, centerY, innerRadius + 5, 0.2, 0.8);
        ctx.strokeStyle = '#ff4444';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.stroke();
      }
      
      if (defectType === 2) { // Outer race defect
        ctx.beginPath();
        ctx.arc(centerX, centerY, outerRadius - 5, 1.2, 1.8);
        ctx.strokeStyle = '#ff4444';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.stroke();
      }
      
      ctx.restore();
      
      // Draw vibration indicators
      drawVibrationIndicators(ctx, centerX, centerY, outerRadius);
    };
    
    const drawVibrationIndicators = (ctx, cx, cy, radius) => {
      const amplitude = 15 * severity;
      const vibration = Math.sin(vibrationRef.current) * amplitude;
      
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2;
        const startX = cx + (radius + 20) * Math.cos(angle);
        const startY = cy + (radius + 20) * Math.sin(angle);
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        
        // Draw vibration waves
        for (let j = 0; j < 4; j++) {
          const waveX = startX + (j * 8 + vibration) * Math.cos(angle);
          const waveY = startY + (j * 8 + vibration) * Math.sin(angle);
          ctx.lineTo(waveX, waveY);
        }
        
        ctx.strokeStyle = defectType === 0 ? '#4CAF50' : '#ff4444';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    };
    
    const animate = () => {
      if (isRotating) {
        rotationRef.current += 0.02;
        vibrationRef.current += 0.1;
      }
      drawBearing(rotationRef.current);
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [defectType, isRotating, severity]);
  
  const defectLabels = {
    0: "Normal Bearing",
    1: "Inner Race Defect",
    2: "Outer Race Defect",
    3: "Ball Defect"
  };
  
  return (
    <div className="bearing-animation-container">
      <h3 className="bearing-title">{defectLabels[defectType]}</h3>
      <div className="bearing-canvas-wrapper">
        <canvas 
          ref={canvasRef} 
          width={300} 
          height={300}
          className="bearing-canvas"
        />
        <div className={`defect-indicator ${defectType === 0 ? 'normal' : 'defect'}`}>
          <div className="status-dot"></div>
          <span>{defectType === 0 ? 'Healthy' : 'Defective'}</span>
        </div>
      </div>
      
      <div className="vibration-meter">
        <div className="meter-label">
          <span>Vibration Level</span>
          <span>{Math.round(severity * 100)}%</span>
        </div>
        <div className="meter-bar">
          <div 
            className="meter-fill"
            style={{ width: `${severity * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default BearingAnimation;