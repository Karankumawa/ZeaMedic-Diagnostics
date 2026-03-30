import os
from flask import Flask, render_template, request, jsonify
import tensorflow as tf
import google.generativeai as genai
from PIL import Image
import numpy as np
import io

app = Flask(__name__)

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
gemini_model = genai.GenerativeModel('gemini-1.5-flash')

# Load your local ML model
model = tf.keras.models.load_model('model_corn.h5')
labels = ["Healthy", "Common Rust", "Gray Leaf Spot", "Blight"]

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'})
    
    file = request.files['file']
    img = Image.open(file.stream).convert('RGB')
    
    # 1. Local Prediction
    img_resized = img.resize((224, 224))
    img_array = np.array(img_resized) / 255.0
    pred = model.predict(np.expand_dims(img_array, axis=0))
    disease_name = labels[np.argmax(pred)]
    
    # 2. Gemini Details
    prompt = f"The corn leaf has {disease_name}. Provide a short treatment plan."
    response = gemini_model.generate_content(prompt)
    
    return jsonify({
        'disease': disease_name,
        'details': response.text
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=7860)