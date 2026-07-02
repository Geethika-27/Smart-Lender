from flask import Flask, render_template, request
import pickle
import numpy as np
import math

app = Flask(__name__)

import os
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Load the model and scaler
model = pickle.load(open(os.path.join(BASE_DIR, 'rdf.pkl'), 'rb'))
scaler = pickle.load(open(os.path.join(BASE_DIR, 'scale.pkl'), 'rb'))

FIELD_RULES = {
    'Gender': {'type': int, 'allowed': {0, 1}},
    'Married': {'type': int, 'allowed': {0, 1}},
    'Dependents': {'type': int, 'allowed': {0, 1, 2, 3}},
    'Education': {'type': int, 'allowed': {0, 1}},
    'Self_Employed': {'type': int, 'allowed': {0, 1}},
    'ApplicantIncome': {'type': float, 'min': 0},
    'CoapplicantIncome': {'type': float, 'min': 0},
    'LoanAmount': {'type': float, 'min': 0},
    'Loan_Amount_Term': {'type': float, 'min': 1},
    'Credit_History': {'type': float, 'allowed': {0.0, 1.0}},
    'Property_Area': {'type': int, 'allowed': {0, 1, 2}},
}


def parse_and_validate_form(form_data):
    parsed = {}
    errors = []

    for field, rule in FIELD_RULES.items():
        raw_value = form_data.get(field, '')
        value = raw_value.strip() if isinstance(raw_value, str) else ''

        if value == '':
            errors.append(f"{field} is required.")
            continue

        try:
            casted = rule['type'](value)
        except (ValueError, TypeError):
            errors.append(f"{field} has an invalid value.")
            continue

        if isinstance(casted, float) and (math.isnan(casted) or math.isinf(casted)):
            errors.append(f"{field} must be a valid finite number.")
            continue

        if 'min' in rule and casted < rule['min']:
            errors.append(f"{field} must be greater than or equal to {rule['min']}.")
            continue

        if 'allowed' in rule and casted not in rule['allowed']:
            errors.append(f"{field} contains an unsupported option.")
            continue

        parsed[field] = casted

    return parsed, errors


def get_risk_band(approval_probability):
    if approval_probability >= 0.75:
        return "Low Risk"
    if approval_probability >= 0.50:
        return "Moderate Risk"
    return "High Risk"

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/predict')
def predict_page():
    return render_template('predict.html')

@app.route('/submit', methods=['POST'])
def submit():
    try:
        validated, validation_errors = parse_and_validate_form(request.form)
        if validation_errors:
            return render_template(
                'submit.html',
                prediction_text='Validation error: ' + ' '.join(validation_errors),
                status='error',
            )
        
        # Prepare feature vector
        features = np.array([[ 
            validated['Gender'],
            validated['Married'],
            validated['Dependents'],
            validated['Education'],
            validated['Self_Employed'],
            validated['ApplicantIncome'],
            validated['CoapplicantIncome'],
            validated['LoanAmount'],
            validated['Loan_Amount_Term'],
            validated['Credit_History'],
            validated['Property_Area'],
        ]])
        
        # Scale features
        scaled_features = scaler.transform(features)
        
        # Predict
        prediction = model.predict(scaled_features)
        proba = model.predict_proba(scaled_features)[0][1] if hasattr(model, 'predict_proba') else None
        
        if prediction[0] == 1:
            result = "Loan Approved"
            status = "approved"
        else:
            result = "Loan Rejected"
            status = "rejected"

        confidence_percent = round(proba * 100, 2) if proba is not None else None
        risk_band = get_risk_band(proba) if proba is not None else "Not Available"
            
        return render_template(
            'submit.html',
            prediction_text=result,
            status=status,
            confidence=confidence_percent,
            risk_band=risk_band,
        )
    
    except ValueError as ve:
         return render_template('submit.html', prediction_text=f"Error: Invalid input format. Details: {str(ve)}", status="error")
    except Exception as e:
         return render_template('submit.html', prediction_text=f"An error occurred: {str(e)}", status="error")

if __name__ == "__main__":
    app.run(debug=True)
