import tensorflow as tf
import numpy as np
from PIL import Image, ImageOps
import os
from tensorflow.keras.preprocessing.image import img_to_array
from .config import MODEL_PATH, LABELS_PATH, DEFAULT_LABELS

class LeafDiseaseModel:
    _instance = None
    _model = None
    _labels = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(LeafDiseaseModel, cls).__new__(cls)
        return cls._instance

    def load_model(self):
        if self._model is None:
            try:
                self._model = tf.keras.models.load_model(MODEL_PATH)
            except Exception as e:
                print(f"Error loading model: {e}")
        return self._model

    def load_labels(self):
        if self._labels is None:
            if os.path.exists(LABELS_PATH):
                with open(LABELS_PATH, 'r') as f:
                    self._labels = [line.strip() for line in f.readlines()]
            else:
                self._labels = DEFAULT_LABELS
        return self._labels

    def predict(self, image: Image.Image):
        model = self.load_model()
        labels = self.load_labels()
        
        if model is None: return None, 0.0

        try:
            image = ImageOps.exif_transpose(image) # Fixes smartphone rotation bugs
            if image.mode != "RGB": image = image.convert("RGB")
                
            img = image.resize((224, 224), Image.BILINEAR)
            img_array = img_to_array(img)
            img_array = tf.keras.applications.efficientnet.preprocess_input(img_array)
            img_array = np.expand_dims(img_array, axis=0) 

            predictions = model.predict(img_array)
            predicted_class = labels[np.argmax(predictions[0])]
            confidence = float(100 * np.max(predictions[0]))
            
            return predicted_class, confidence
        except Exception as e:
            print(f"Error during prediction: {e}")
            return None, 0.0