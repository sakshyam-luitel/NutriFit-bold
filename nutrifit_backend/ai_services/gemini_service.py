"""
Google Gemini AI service for NutriFit.
"""

import google.generativeai as genai
from django.conf import settings


class GeminiService:
    """Wrapper for Google Gemini AI API."""
    
    def __init__(self):
        """Initialize Gemini AI with API key."""
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-pro')
    
    def generate_text(self, prompt):
        """
        Generate text using Gemini AI.
        
        Args:
            prompt (str): The prompt to send to Gemini
            
        Returns:
            str: Generated text response
        """
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            raise Exception(f"Gemini AI error: {str(e)}")
    
    def parse_json_response(self, prompt):
        """
        Generate and parse JSON response from Gemini.
        
        Args:
            prompt (str): The prompt requesting JSON output
            
        Returns:
            dict: Parsed JSON response
        """
        import json
        import re
        
        try:
            response_text = self.generate_text(prompt)
            
            # Extract JSON from response (handle markdown code blocks)
            json_match = re.search(r'```json\s*(.*?)\s*```', response_text, re.DOTALL)
            if json_match:
                json_str = json_match.group(1)
            else:
                # Try to find JSON object directly
                json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
                if json_match:
                    json_str = json_match.group(0)
                else:
                    json_str = response_text
            
            return json.loads(json_str)
        
        except json.JSONDecodeError as e:
            raise Exception(f"Failed to parse JSON response: {str(e)}")
        except Exception as e:
            raise Exception(f"Gemini AI error: {str(e)}")
