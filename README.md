# 🌽 ZeaMedic Diagnostics (Corn Leaf Disease Detector)

ZeaMedic Diagnostics is an AI-powered diagnostic web application designed to help farmers and agricultural specialists quickly identify corn leaf diseases. By leveraging advanced Deep Learning techniques and Generative AI, this project provides both confident disease classifications and actionable treatment plans.

## ✨ Features

- **Disease Identification**: Analyzes uploaded images of corn leaves to detect diseases such as **Common Rust**, **Gray Leaf Spot**, and **Blight** (as well as identifying healthy leaves).
- **High Accuracy ML Model**: Built using a fine-tuned EfficientNetB0 architecture for robust and accurate image classification.
- **Smart Treatment Plans**: Integrates Google Generative AI (Gemini 1.5 Flash) to automatically provide detailed, context-aware treatment and mitigation strategies based on the diagnosis.
- **PDF Report Generation**: Users can download a comprehensive, professionally formatted PDF report containing the disease analysis and recommended treatment plan.
- **Modern Web Interface**: A user-friendly frontend built with Flask templates and static assets.

## 🛠️ Technology Stack

- **Backend / Web Framework**: Python, Flask, Flask-CORS
- **Machine Learning**: TensorFlow, Keras, Pillow (for image processing), scikit-learn
- **Generative AI**: Google Generative AI (Gemini)
- **PDF Generation**: FPDF

## 🚀 How to Run Locally

### 1. Clone the repository
```bash
git clone https://github.com/Karankumawa/ZeaMedic-Diagnostics.git
cd ZeaMedic-Diagnostics
```

### 2. Create a Virtual Environment
It is recommended to use a virtual environment to manage dependencies.
```bash
python -m venv .venv
# On Windows
.venv\Scripts\activate
# On Linux/macOS
source .venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Setup Environment Variables
Create a `.env` file in the root directory and add your Google Gemini API key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 5. Start the Application
You can run the secondary or primary server:
```bash
python server.py
# or
python app.py
```
The application will be accessible at `http://localhost:5000` (or `http://localhost:7860`).

## 📂 Project Structure

- `server.py` & `app.py`: Application entry points.
- `src/`: Core Python modules (model handlers, API handlers, PDF generators).
- `models/`: Contains the trained `.h5` or `.keras` models.
- `templates/` & `static/`: Frontend HTML, CSS, and JS assets.
- `corn_leaf_diassess_model.py`: Model training pipeline (EfficientNetB0 fine-tuning).

## 🔒 Security Note
Certain files such as `.env` and `.venv` are intentionally excluded from version control to protect sensitive API keys and maintain a clean repository.

## 📄 License
This project is licensed under the [MIT License](LICENSE).
