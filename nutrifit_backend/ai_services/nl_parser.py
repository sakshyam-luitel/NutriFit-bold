"""
Natural Language Parser using Google Gemini AI.
"""

from .gemini_service import GeminiService


class NaturalLanguageParser:
    """Parse natural language input to extract diet plan parameters."""
    
    def __init__(self):
        self.gemini = GeminiService()
    
    def parse(self, user_input, user):
        """
        Parse natural language input to extract structured data.
        
        Args:
            user_input (str): Natural language description from user
            user (User): The user object for context
            
        Returns:
            dict: Structured data extracted from input
        """
        
        # Get user profile for context if available
        profile_context = ""
        try:
            profile = user.profile
            profile_context = f"""
Current user profile:
- Age: {profile.age}
- Weight: {profile.weight} kg
- Height: {profile.height} cm
- Sex: {profile.sex}
- Activity Level: {profile.activity_level}
"""
        except:
            profile_context = "No existing profile found."
        
        prompt = f"""
You are a nutrition AI assistant. Parse the following user input and extract structured information.

{profile_context}

User Input: "{user_input}"

Extract and return ONLY a JSON object with the following structure (use null for missing values):
{{
    "age": <number or null>,
    "weight": <number in kg or null>,
    "height": <number in cm or null>,
    "sex": "<male/female/other or null>",
    "activityLevel": "<sedentary/light/moderate/active/very_active or null>",
    "goalType": "<lose_weight/gain_weight/maintain/muscle_gain/health_management>",
    "medicalConditions": [
        {{"name": "<condition name>", "severity": "moderate"}}
    ],
    "preferences": {{
        "dietaryType": "<vegetarian/vegan/keto/paleo/mediterranean/none or null>",
        "allergies": ["<allergy1>", "<allergy2>"]
    }}
}}

Rules:
1. Only include fields that are explicitly mentioned in the user input
2. For goalType, infer from phrases like "lose weight", "gain muscle", "maintain", etc.
3. For activityLevel, infer from phrases like "sedentary", "exercise 5 times a week", etc.
4. Extract any medical conditions mentioned
5. Extract dietary preferences (vegetarian, vegan, etc.) and allergies
6. Return ONLY valid JSON, no additional text
"""
        
        try:
            parsed_data = self.gemini.parse_json_response(prompt)
            return parsed_data
        except Exception as e:
            raise Exception(f"Failed to parse natural language input: {str(e)}")
