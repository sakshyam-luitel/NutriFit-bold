"""
Google Gemini AI service for NutriFit.
"""

from django.conf import settings


try:
    import google.generativeai as genai  # optional dependency
except Exception:
    genai = None


class GeminiService:
    """Wrapper for Google Gemini AI API.

    This class lazily checks for the `google.generativeai` package and provides
    clear error messages if it's missing or misconfigured so the server doesn't
    crash at import time.
    """

    def __init__(self):
        if genai is None:
            raise Exception(
                'google.generativeai package is not installed. Run `pip install google-generativeai` '
                'or disable the `ai_services` app if you do not intend to use Gemini.'
            )

        api_key = settings.GEMINI_API_KEY
        if not api_key:
            raise Exception('GEMINI_API_KEY is not set in environment; set it to use Gemini AI.')

        try:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-pro')
        except Exception as e:
            raise Exception(f'Failed to initialize Gemini model: {e}')

    def generate_text(self, prompt):
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            raise Exception(f'Gemini AI error: {str(e)}')

    def parse_json_response(self, prompt):
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
            raise Exception(f'Failed to parse JSON response: {str(e)}')
        except Exception as e:
            raise Exception(f'Gemini AI error: {str(e)}')
