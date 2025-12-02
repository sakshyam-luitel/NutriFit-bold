/*
  # Diet Planner Database Schema

  ## Overview
  Creates comprehensive database schema for AI-powered personalized diet planning application.
  
  ## 1. New Tables
  
  ### `user_profiles`
  - `id` (uuid, primary key) - Unique user identifier
  - `email` (text, unique) - User email address
  - `age` (integer) - User age in years
  - `weight` (decimal) - Current weight in kg
  - `height` (decimal) - Height in cm
  - `sex` (text) - Biological sex (male/female/other)
  - `activity_level` (text) - Physical activity level (sedentary/light/moderate/active/very_active)
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last profile update timestamp
  
  ### `medical_conditions`
  - `id` (uuid, primary key) - Condition identifier
  - `user_id` (uuid, foreign key) - References user_profiles
  - `condition_name` (text) - Name of medical condition (diabetes, hypertension, etc.)
  - `severity` (text) - Severity level (mild/moderate/severe)
  - `dietary_restrictions` (jsonb) - Specific dietary restrictions related to condition
  - `created_at` (timestamptz) - Record creation timestamp
  
  ### `diet_goals`
  - `id` (uuid, primary key) - Goal identifier
  - `user_id` (uuid, foreign key) - References user_profiles
  - `goal_type` (text) - Type of goal (lose_weight/gain_weight/maintain/muscle_gain/health_management)
  - `target_weight` (decimal, nullable) - Target weight in kg
  - `target_date` (date, nullable) - Target achievement date
  - `calorie_target` (integer) - Daily calorie target
  - `is_active` (boolean) - Whether this goal is currently active
  - `created_at` (timestamptz) - Goal creation timestamp
  
  ### `ingredients`
  - `id` (uuid, primary key) - Ingredient identifier
  - `name` (text, unique) - Ingredient name (cauliflower, chicken breast, etc.)
  - `category` (text) - Food category (vegetable/protein/grain/fruit/dairy)
  - `calories_per_100g` (decimal) - Calories per 100g
  - `protein_per_100g` (decimal) - Protein in grams per 100g
  - `carbs_per_100g` (decimal) - Carbohydrates in grams per 100g
  - `fat_per_100g` (decimal) - Fat in grams per 100g
  - `fiber_per_100g` (decimal) - Fiber in grams per 100g
  - `image_url` (text, nullable) - URL to ingredient image
  - `is_vegetarian` (boolean) - Suitable for vegetarians
  - `is_vegan` (boolean) - Suitable for vegans
  - `common_allergens` (text[], default array) - Array of allergens
  - `created_at` (timestamptz) - Record creation timestamp
  
  ### `diet_plans`
  - `id` (uuid, primary key) - Diet plan identifier
  - `user_id` (uuid, foreign key) - References user_profiles
  - `goal_id` (uuid, foreign key, nullable) - References diet_goals
  - `plan_name` (text) - Name/title of the diet plan
  - `ai_description` (text) - AI-generated natural language description of the plan
  - `total_calories` (integer) - Total daily calories
  - `total_protein` (decimal) - Total daily protein in grams
  - `total_carbs` (decimal) - Total daily carbohydrates in grams
  - `total_fat` (decimal) - Total daily fat in grams
  - `is_favorite` (boolean) - User marked as favorite
  - `created_at` (timestamptz) - Plan creation timestamp
  
  ### `diet_plan_items`
  - `id` (uuid, primary key) - Plan item identifier
  - `diet_plan_id` (uuid, foreign key) - References diet_plans
  - `ingredient_id` (uuid, foreign key) - References ingredients
  - `quantity_grams` (decimal) - Quantity in grams
  - `meal_type` (text) - Meal category (breakfast/lunch/dinner/snack)
  - `ai_description` (text) - AI-generated description for this specific ingredient portion
  - `preparation_notes` (text, nullable) - Optional preparation instructions
  - `order_index` (integer) - Display order within meal
  
  ### `user_preferences`
  - `id` (uuid, primary key) - Preference identifier
  - `user_id` (uuid, foreign key) - References user_profiles
  - `dietary_type` (text, nullable) - Diet type (vegetarian/vegan/keto/paleo/none)
  - `allergies` (text[], default array) - Array of allergies
  - `disliked_foods` (text[], default array) - Array of disliked foods
  - `preferred_cuisines` (text[], default array) - Array of preferred cuisines
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### `natural_language_inputs`
  - `id` (uuid, primary key) - Input identifier
  - `user_id` (uuid, foreign key) - References user_profiles
  - `raw_input` (text) - Original user input in natural language
  - `parsed_data` (jsonb) - AI-extracted structured data from input
  - `created_at` (timestamptz) - Input timestamp
  
  ## 2. Security
  - Enable Row Level Security (RLS) on all tables
  - Users can only access their own data
  - Public read access to ingredients table for all authenticated users
  - Restrictive policies ensuring data isolation between users
  
  ## 3. Indexes
  - Added indexes on foreign keys for better query performance
  - Composite index on diet_plan_items for efficient meal retrieval
  - Index on ingredients name for search functionality
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  age integer CHECK (age > 0 AND age < 150),
  weight decimal(5,2) CHECK (weight > 0),
  height decimal(5,2) CHECK (height > 0),
  sex text CHECK (sex IN ('male', 'female', 'other')),
  activity_level text DEFAULT 'moderate' CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create medical_conditions table
CREATE TABLE IF NOT EXISTS medical_conditions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  condition_name text NOT NULL,
  severity text DEFAULT 'moderate' CHECK (severity IN ('mild', 'moderate', 'severe')),
  dietary_restrictions jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create diet_goals table
CREATE TABLE IF NOT EXISTS diet_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  goal_type text NOT NULL CHECK (goal_type IN ('lose_weight', 'gain_weight', 'maintain', 'muscle_gain', 'health_management')),
  target_weight decimal(5,2),
  target_date date,
  calorie_target integer CHECK (calorie_target > 0),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create ingredients table
CREATE TABLE IF NOT EXISTS ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  category text NOT NULL CHECK (category IN ('vegetable', 'protein', 'grain', 'fruit', 'dairy', 'legume', 'nut', 'spice', 'oil', 'other')),
  calories_per_100g decimal(6,2) NOT NULL CHECK (calories_per_100g >= 0),
  protein_per_100g decimal(5,2) DEFAULT 0 CHECK (protein_per_100g >= 0),
  carbs_per_100g decimal(5,2) DEFAULT 0 CHECK (carbs_per_100g >= 0),
  fat_per_100g decimal(5,2) DEFAULT 0 CHECK (fat_per_100g >= 0),
  fiber_per_100g decimal(5,2) DEFAULT 0 CHECK (fiber_per_100g >= 0),
  image_url text,
  is_vegetarian boolean DEFAULT true,
  is_vegan boolean DEFAULT false,
  common_allergens text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create diet_plans table
CREATE TABLE IF NOT EXISTS diet_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  goal_id uuid REFERENCES diet_goals(id) ON DELETE SET NULL,
  plan_name text NOT NULL,
  ai_description text NOT NULL,
  total_calories integer NOT NULL,
  total_protein decimal(6,2) NOT NULL,
  total_carbs decimal(6,2) NOT NULL,
  total_fat decimal(6,2) NOT NULL,
  is_favorite boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create diet_plan_items table
CREATE TABLE IF NOT EXISTS diet_plan_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  diet_plan_id uuid NOT NULL REFERENCES diet_plans(id) ON DELETE CASCADE,
  ingredient_id uuid NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  quantity_grams decimal(6,2) NOT NULL CHECK (quantity_grams > 0),
  meal_type text NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  ai_description text NOT NULL,
  preparation_notes text,
  order_index integer DEFAULT 0
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  dietary_type text CHECK (dietary_type IN ('vegetarian', 'vegan', 'keto', 'paleo', 'mediterranean', 'none')),
  allergies text[] DEFAULT '{}',
  disliked_foods text[] DEFAULT '{}',
  preferred_cuisines text[] DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);

-- Create natural_language_inputs table
CREATE TABLE IF NOT EXISTS natural_language_inputs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  raw_input text NOT NULL,
  parsed_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_medical_conditions_user_id ON medical_conditions(user_id);
CREATE INDEX IF NOT EXISTS idx_diet_goals_user_id ON diet_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_diet_goals_active ON diet_goals(user_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_diet_plans_user_id ON diet_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_diet_plans_created ON diet_plans(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_diet_plan_items_plan_id ON diet_plan_items(diet_plan_id);
CREATE INDEX IF NOT EXISTS idx_diet_plan_items_meal ON diet_plan_items(diet_plan_id, meal_type, order_index);
CREATE INDEX IF NOT EXISTS idx_ingredients_name ON ingredients(name);
CREATE INDEX IF NOT EXISTS idx_ingredients_category ON ingredients(category);
CREATE INDEX IF NOT EXISTS idx_natural_language_inputs_user_id ON natural_language_inputs(user_id);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE natural_language_inputs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for medical_conditions
CREATE POLICY "Users can view own medical conditions"
  ON medical_conditions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own medical conditions"
  ON medical_conditions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own medical conditions"
  ON medical_conditions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own medical conditions"
  ON medical_conditions FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for diet_goals
CREATE POLICY "Users can view own diet goals"
  ON diet_goals FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own diet goals"
  ON diet_goals FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own diet goals"
  ON diet_goals FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own diet goals"
  ON diet_goals FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for ingredients (public read for all authenticated users)
CREATE POLICY "Authenticated users can view all ingredients"
  ON ingredients FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for diet_plans
CREATE POLICY "Users can view own diet plans"
  ON diet_plans FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own diet plans"
  ON diet_plans FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own diet plans"
  ON diet_plans FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own diet plans"
  ON diet_plans FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for diet_plan_items
CREATE POLICY "Users can view own diet plan items"
  ON diet_plan_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM diet_plans
      WHERE diet_plans.id = diet_plan_items.diet_plan_id
      AND diet_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own diet plan items"
  ON diet_plan_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM diet_plans
      WHERE diet_plans.id = diet_plan_items.diet_plan_id
      AND diet_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own diet plan items"
  ON diet_plan_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM diet_plans
      WHERE diet_plans.id = diet_plan_items.diet_plan_id
      AND diet_plans.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM diet_plans
      WHERE diet_plans.id = diet_plan_items.diet_plan_id
      AND diet_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own diet plan items"
  ON diet_plan_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM diet_plans
      WHERE diet_plans.id = diet_plan_items.diet_plan_id
      AND diet_plans.user_id = auth.uid()
    )
  );

-- RLS Policies for user_preferences
CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for natural_language_inputs
CREATE POLICY "Users can view own natural language inputs"
  ON natural_language_inputs FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own natural language inputs"
  ON natural_language_inputs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Insert sample ingredients data
INSERT INTO ingredients (name, category, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, is_vegetarian, is_vegan, common_allergens, image_url) VALUES
('Cauliflower', 'vegetable', 25, 1.9, 5, 0.3, 2, true, true, '{}', 'https://images.pexels.com/photos/1508666/pexels-photo-1508666.jpeg'),
('Chicken Breast', 'protein', 165, 31, 0, 3.6, 0, false, false, '{}', 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg'),
('Brown Rice', 'grain', 123, 2.6, 25.6, 1, 1.6, true, true, '{}', 'https://images.pexels.com/photos/7456392/pexels-photo-7456392.jpeg'),
('Broccoli', 'vegetable', 34, 2.8, 7, 0.4, 2.6, true, true, '{}', 'https://images.pexels.com/photos/47347/broccoli-vegetable-food-healthy-47347.jpeg'),
('Salmon', 'protein', 208, 20, 0, 13, 0, false, false, '{}', 'https://images.pexels.com/photos/3296287/pexels-photo-3296287.jpeg'),
('Sweet Potato', 'vegetable', 86, 1.6, 20, 0.1, 3, true, true, '{}', 'https://images.pexels.com/photos/1586947/pexels-photo-1586947.jpeg'),
('Spinach', 'vegetable', 23, 2.9, 3.6, 0.4, 2.2, true, true, '{}', 'https://images.pexels.com/photos/2255935/pexels-photo-2255935.jpeg'),
('Almonds', 'nut', 579, 21, 22, 50, 12.5, true, true, '{"tree nuts"}', 'https://images.pexels.com/photos/1295572/pexels-photo-1295572.jpeg'),
('Greek Yogurt', 'dairy', 59, 10, 3.6, 0.4, 0, true, false, '{"dairy"}', 'https://images.pexels.com/photos/5337799/pexels-photo-5337799.jpeg'),
('Quinoa', 'grain', 120, 4.4, 21, 1.9, 2.8, true, true, '{}', 'https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg'),
('Eggs', 'protein', 155, 13, 1.1, 11, 0, true, false, '{"eggs"}', 'https://images.pexels.com/photos/1556707/pexels-photo-1556707.jpeg'),
('Avocado', 'fruit', 160, 2, 9, 15, 7, true, true, '{}', 'https://images.pexels.com/photos/557659/pexels-photo-557659.jpeg'),
('Lentils', 'legume', 116, 9, 20, 0.4, 7.9, true, true, '{}', 'https://images.pexels.com/photos/4110256/pexels-photo-4110256.jpeg'),
('Carrots', 'vegetable', 41, 0.9, 10, 0.2, 2.8, true, true, '{}', 'https://images.pexels.com/photos/3650647/pexels-photo-3650647.jpeg'),
('Blueberries', 'fruit', 57, 0.7, 14, 0.3, 2.4, true, true, '{}', 'https://images.pexels.com/photos/1120581/pexels-photo-1120581.jpeg')
ON CONFLICT (name) DO NOTHING;
