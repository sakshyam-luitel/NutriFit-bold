const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface ParseRequest {
  input: string;
  userId: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { input, userId }: ParseRequest = await req.json();

    const parsedData = parseNaturalLanguageInput(input);

    return new Response(
      JSON.stringify({
        success: true,
        data: parsedData,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error parsing natural language:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to parse input',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});

function parseNaturalLanguageInput(input: string) {
  const lowerInput = input.toLowerCase();
  const parsedData: any = {
    goalType: 'maintain',
    medicalConditions: [],
    preferences: {
      dietaryType: null,
      allergies: [],
      dislikedFoods: [],
    },
  };

  if (lowerInput.includes('lose weight') || lowerInput.includes('weight loss') || lowerInput.includes('slim down')) {
    parsedData.goalType = 'lose_weight';
  } else if (lowerInput.includes('gain weight') || lowerInput.includes('bulk up') || lowerInput.includes('put on weight')) {
    parsedData.goalType = 'gain_weight';
  } else if (lowerInput.includes('muscle') || lowerInput.includes('build muscle') || lowerInput.includes('gain muscle')) {
    parsedData.goalType = 'muscle_gain';
  } else if (lowerInput.includes('maintain') || lowerInput.includes('stay healthy') || lowerInput.includes('keep weight')) {
    parsedData.goalType = 'maintain';
  }

  const medicalKeywords = [
    { keywords: ['diabetes', 'diabetic', 'blood sugar'], name: 'Diabetes' },
    { keywords: ['hypertension', 'high blood pressure', 'blood pressure'], name: 'Hypertension' },
    { keywords: ['heart disease', 'cardiovascular', 'heart problem'], name: 'Heart Disease' },
    { keywords: ['cholesterol', 'high cholesterol'], name: 'High Cholesterol' },
    { keywords: ['thyroid'], name: 'Thyroid Condition' },
    { keywords: ['kidney', 'renal'], name: 'Kidney Disease' },
  ];

  medicalKeywords.forEach(({ keywords, name }) => {
    if (keywords.some((kw) => lowerInput.includes(kw))) {
      parsedData.medicalConditions.push({ name, severity: 'moderate' });
    }
  });

  if (lowerInput.includes('vegetarian') && !lowerInput.includes('vegan')) {
    parsedData.preferences.dietaryType = 'vegetarian';
  } else if (lowerInput.includes('vegan')) {
    parsedData.preferences.dietaryType = 'vegan';
  } else if (lowerInput.includes('keto') || lowerInput.includes('ketogenic')) {
    parsedData.preferences.dietaryType = 'keto';
  } else if (lowerInput.includes('paleo')) {
    parsedData.preferences.dietaryType = 'paleo';
  }

  const allergyKeywords = [
    { keywords: ['allergic to nuts', 'nut allergy', 'tree nut'], value: 'tree nuts' },
    { keywords: ['allergic to dairy', 'dairy allergy', 'lactose'], value: 'dairy' },
    { keywords: ['allergic to eggs', 'egg allergy'], value: 'eggs' },
    { keywords: ['gluten', 'celiac'], value: 'gluten' },
    { keywords: ['shellfish', 'seafood allergy'], value: 'shellfish' },
  ];

  allergyKeywords.forEach(({ keywords, value }) => {
    if (keywords.some((kw) => lowerInput.includes(kw))) {
      parsedData.preferences.allergies.push(value);
    }
  });

  const ageMatch = input.match(/\b(\d{1,2})\s*(?:years?\s*old|yo|y\.?o\.?)\b/i) || 
                   input.match(/\b(?:age|i'm|i am|im)\s*(\d{1,2})\b/i);
  if (ageMatch) {
    parsedData.age = parseInt(ageMatch[1]);
  }

  const weightMatch = input.match(/\b(\d+(?:\.\d+)?)\s*(?:kg|kilograms?)\b/i) ||
                      input.match(/\b(\d+(?:\.\d+)?)\s*(?:lbs?|pounds?)\b/i);
  if (weightMatch) {
    let weight = parseFloat(weightMatch[1]);
    if (input.toLowerCase().includes('lb') || input.toLowerCase().includes('pound')) {
      weight = weight * 0.453592;
    }
    parsedData.weight = Math.round(weight * 10) / 10;
  }

  const heightMatch = input.match(/\b(\d+(?:\.\d+)?)\s*(?:cm|centimeters?)\b/i) ||
                      input.match(/\b(\d)\s*(?:ft|foot|feet|')\s*(\d+)\s*(?:in|inches?|\")\b/i);
  if (heightMatch) {
    if (input.toLowerCase().includes('cm')) {
      parsedData.height = parseFloat(heightMatch[1]);
    } else if (heightMatch[2]) {
      const feet = parseInt(heightMatch[1]);
      const inches = parseInt(heightMatch[2]);
      parsedData.height = Math.round((feet * 30.48 + inches * 2.54) * 10) / 10;
    }
  }

  if (lowerInput.includes('male') || lowerInput.includes('man') || lowerInput.includes('guy')) {
    parsedData.sex = 'male';
  } else if (lowerInput.includes('female') || lowerInput.includes('woman') || lowerInput.includes('lady')) {
    parsedData.sex = 'female';
  }

  if (lowerInput.includes('sedentary') || lowerInput.includes('no exercise') || lowerInput.includes('desk job')) {
    parsedData.activityLevel = 'sedentary';
  } else if (lowerInput.includes('light') || lowerInput.includes('1-2 times') || lowerInput.includes('walk')) {
    parsedData.activityLevel = 'light';
  } else if (lowerInput.includes('moderate') || lowerInput.includes('3-4 times') || lowerInput.includes('regular')) {
    parsedData.activityLevel = 'moderate';
  } else if (lowerInput.includes('active') || lowerInput.includes('5-6 times') || lowerInput.includes('athlete')) {
    parsedData.activityLevel = 'active';
  } else if (lowerInput.includes('very active') || lowerInput.includes('daily') || lowerInput.includes('intense')) {
    parsedData.activityLevel = 'very_active';
  }

  return parsedData;
}
