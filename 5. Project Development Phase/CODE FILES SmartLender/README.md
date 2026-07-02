# Smart Lender – Loan Eligibility Prediction System

A complete end-to-end Machine Learning web application that predicts whether a loan applicant is eligible for loan approval based on their details.

## Interactive Flask Web Application
This project includes an interactive Flask-based web app with:
- Home Page Introduction
- Loan Eligibility Prediction Interface
- User Input Forms
- Prediction Result Display

### Interactive UI Features
1. Creative banking-themed responsive UI
2. Theme toggle (dark/light)
3. Real-time form completion progress bar
4. Scenario preset buttons (low-risk, high-risk, clear)
5. Live loan burden indicator
6. Live profile hint engine
7. Browser draft save/load for form inputs
8. Result dashboard with confidence and risk band

## Project Structure
*   `Dataset/`: Contains the loan prediction CSV and Excel datasets.
*   `Flask/`: Contains the web app frontend templates, static styling, scripts, and `app.py` backend.
*   `Training/`: Contains the Jupyter Notebook demonstrating the full ML training pipeline.
*   `IBM/`: Deployment configurations and guidelines for IBM Cloud.

## How to Run Locally

1. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Run Model Training:**
   To train models and export serialized model files (`rdf.pkl` and `scale.pkl`), execute:
   - `Training/Loan_Prediction_using_ML.ipynb`

3. **Start Flask Server:**
   ```bash
   cd Flask
   python app.py
   ```
   Navigate to `http://localhost:5000` to interact with the application.

## Deployment
- we can deploy it in render
