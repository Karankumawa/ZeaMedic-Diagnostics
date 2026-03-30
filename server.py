from flask import Flask, request, jsonify, send_file, render_template
from flask_cors import CORS
import os
import base64
from io import BytesIO
from PIL import Image

from src.model import LeafDiseaseModel
from src.api_handler import GeminiHandler
from src.pdf_handler import create_pdf_report

app = Flask(__name__)
CORS(app)

model_handler = LeafDiseaseModel()
api_handler = GeminiHandler()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
        
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
        
    try:
        img = Image.open(file)
        predicted_class, confidence = model_handler.predict(img)
        
        if not predicted_class:
            return jsonify({'error': 'Prediction failed'}), 500

        # Confidence Threshold - Ignores blurry/bad photos
        if confidence < 65.0:
             predicted_class = "Healthy" 
            
        plan = api_handler.get_treatment_plan(predicted_class)
        
        return jsonify({
            'success': True,
            'predicted_class': predicted_class,
            'confidence': confidence,
            'plan': plan
        })
        
    except Exception as e:
        print(f"Prediction error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/generate_report', methods=['POST'])
def generate_report():
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        predicted_class = data.get('predicted_class')
        confidence = data.get('confidence')
        plan = data.get('plan')
        image_base64 = data.get('image_base64') 
        
        image = None
        if image_base64:
            try:
                if ',' in image_base64:
                    image_base64 = image_base64.split(',')[1]
                image_bytes = base64.b64decode(image_base64)
                image = Image.open(BytesIO(image_bytes))
            except Exception as e:
                print(f"Could not load image for PDF: {e}")

        pdf_bytes = create_pdf_report(predicted_class, confidence, plan, image)
        
        mem = BytesIO(pdf_bytes)
        mem.seek(0)
        
        safe_name = plan.get('name', 'Disease').replace(' ', '_')
        return send_file(
            mem,
            as_attachment=True,
            download_name=f"Corn_Doctor_Report_{safe_name}.pdf",
            mimetype='application/pdf'
        )
    except Exception as e:
        print(f"Report Generation Error: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)