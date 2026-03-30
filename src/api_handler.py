import google.generativeai as genai
import json
from .config import GEMINI_API_KEY, TREATMENT_PLANS

class GeminiHandler:
    def __init__(self):
        self.api_key = GEMINI_API_KEY
        if self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-2.5-flash')
        else:
            self.model = None

    def get_treatment_plan(self, disease_name):
        if not self.model: return TREATMENT_PLANS['Fallback']

        prompt = f"""
        You are an elite agricultural expert. Provide a concise, user-friendly treatment plan for the corn disease: "{disease_name}".
        IMPORTANT: Your response MUST be short. Use brief, punchy sentences. Use 2-3 short bullet points per section instead of paragraphs. 
        Return the response strictly as a JSON object with the following keys exactly:
        - name: The common name of the disease.
        - scientific_name: The scientific name of the pathogen.
        - symptoms: 2-3 brief bullet points on key visual symptoms.
        - prevention: 2-3 brief bullet points on preventative practices.
        - organic: 1-2 brief bullet points on organic/biological controls.
        - chemical: 1-2 brief bullet points on chemical controls.
        CRITICAL: The value for EVERY key MUST be a single formatted STRING. Do NOT use JSON arrays. To separate your bullet points, use newline characters ('\\n') within the string itself.
        Do not include markdown formatting like ```json ... ```. Just the raw JSON.
        """
        try:
            response = self.model.generate_content(prompt)
            text = response.text.strip()
            if text.startswith("```json"):
                text = text[len("```json"):].strip()
            if text.endswith("```"):
                text = text[:-len("```")].strip()
            return json.loads(text)
        except Exception as e:
            print(f"Error parsing Gemini response: {e}")
            return TREATMENT_PLANS['Fallback']