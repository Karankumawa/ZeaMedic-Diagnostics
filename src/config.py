from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = BASE_DIR / "models"
MODEL_PATH = MODELS_DIR / "plant_disease_model.keras"
LABELS_PATH = MODELS_DIR / "labels.txt"

from dotenv import load_dotenv

load_dotenv() # Loads environment variables from a .env file if it exists

# Make sure to set this in your .env file!
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "") 
DEFAULT_LABELS = ['Blight', 'Common_Rust', 'Gray_Leaf_Spot', 'Healthy']

TREATMENT_PLANS = {
    'Fallback': {
        'name': 'Unknown',
        'scientific_name': 'N/A',
        'symptoms': 'Please configure Gemini API Key for detailed analysis.',
        'prevention': 'Consult local agricultural extension.',
        'organic': 'N/A',
        'chemical': 'N/A'
    }
}