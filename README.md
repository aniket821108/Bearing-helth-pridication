🛠️ Bearing Health Prediction & Predictive Maintenance System
📌 Project Overview

This project focuses on predictive maintenance of rotating machinery by analyzing bearing vibration signals to detect early-stage faults and assess machine health conditions.

The system leverages machine learning–based techniques to identify anomalies and classify bearing faults, helping industries prevent unexpected failures, reduce maintenance costs, and minimize downtime.

🎯 Objectives

🔍 Detect bearing faults at an early stage

📈 Monitor overall system health condition

⏱️ Reduce unplanned machine downtime

🤖 Apply machine learning for fault classification

🧩 Build an end-to-end system (Model + Backend + Frontend)

⚙️ Problem Statement

Bearings are critical components in industrial machinery. Their failure can result in:

❌ Sudden machine breakdown

📉 Production loss

💰 Increased maintenance cost

Traditional maintenance approaches are reactive or schedule-based, often failing to detect faults early.

This project implements a data-driven predictive maintenance approach using vibration signal analysis and machine learning, enabling timely fault detection and proactive maintenance.

🧠 Methodology
1️⃣ Data Acquisition

Vibration signals collected from bearing-mounted sensors

Time-series vibration data used for further analysis

2️⃣ Signal Processing

Time-domain analysis

Statistical feature extraction

Frequency-domain analysis (FFT)

RMS-based fault severity estimation

3️⃣ Feature Extraction

Extracted features include:

RMS (Root Mean Square)

Mean

Standard Deviation

Kurtosis

Skewness

Peak-to-Peak

Frequency-domain energy features

🤖 Machine Learning Models

Multiple machine learning models were implemented and evaluated, including:

Random Forest

XGBoost

Gradient Boosting

Support Vector Machine (SVM)

Neural Network

✅ Observation:
Gradient Boosting achieved the highest accuracy and F1-score, indicating better generalization performance for bearing fault classification.

📊 Output & Results

Bearing condition classification:

Healthy

Inner Race Fault

Outer Race Fault

Ball Fault

Visualizations include:

Feature distributions

RMS trend for fault severity

Model prediction results

🏗️ Project Structure

(Refer to the directory tree in the repository)

📸 Project Screenshots

📌 Screenshots demonstrating signal analysis, feature extraction, model performance, and system output can be found in the screenshots/ directory.

🧪 Tools & Technologies

Python

NumPy, Pandas

Scikit-learn

Matplotlib, Seaborn

FastAPI / Flask (Backend)

React.js (Frontend)

Git & GitHub

🤝 Collaboration & Team Members

This project was developed through interdisciplinary collaboration by students of National Institute of Technology Mizoram, combining CSE and ECE expertise.

👩‍💻 🔹 Rifah Tamanna Sarkar

🎓 Roll Number: BT23EC001
📡 Department: Electronics and Communication Engineering (ECE)
🏫 Institute: National Institute of Technology Mizoram

Contributions:

📊 Vibration data understanding and preprocessing

📝 Signal analysis support and documentation

🔗 GitHub: https://github.com/USERNAME

🔗 LinkedIn: https://linkedin.com/in/USERNAME

👨‍🔧 🔹 Harsh Kumar

🎓 Roll Number: BT23EC017
📡 Department: Electronics and Communication Engineering (ECE)
🏫 Institute: National Institute of Technology Mizoram

Contributions:

📈 Feature analysis and result interpretation

✅ Model testing and validation

🔗 GitHub: https://github.com/Harsh924-max

🔗 LinkedIn: https://www.linkedin.com/in/harsh-kumar-27a6b5304/

👨‍💻 ⭐ 🔹 Aniket Kumar (Project Lead)

🎓 Department: Computer Science and Engineering (CSE)
🏫 Institute: National Institute of Technology Mizoram

Contributions:

🧠 System architecture and project design

🤖 Machine learning model development

⚙️ Backend development and system integration

📊 Final analysis, evaluation, and deployment

🔗 GitHub: https://github.com/aniket821108

🔗 LinkedIn: https://www.linkedin.com/in/aniket-kumar-1225a7284

⭐ Support the Project

If you find this project useful:

⭐ Star the repository

🍴 Fork it

🤝 Feel free to contribute or suggest improvements
