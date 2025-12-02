# NutriFit Backend

Django REST API backend for NutriFit diet planning application with AI-powered features.

## Setup Instructions

### 1. Install Dependencies

```bash
cd nutrifit_backend
pip install -r requirements.txt
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update with your settings:

```bash
cp .env.example .env
```

Update the following in `.env`:
- `SECRET_KEY`: Generate a new Django secret key
- `DB_PASSWORD`: Your MySQL root password
- `GEMINI_API_KEY`: Your Google Gemini AI API key

### 3. Create MySQL Database

```sql
CREATE DATABASE nutrifit_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 5. Load Initial Data (Ingredients)

```bash
python manage.py load_ingredients
```

### 6. Create Superuser (Optional)

```bash
python manage.py createsuperuser
```

### 7. Run Development Server

```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/api/`

## API Endpoints

### Authentication
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login and get JWT tokens
- `POST /api/auth/refresh/` - Refresh access token

### User Profile
- `GET /api/profiles/me/` - Get current user profile
- `POST /api/profiles/` - Create user profile
- `PATCH /api/profiles/me/` - Update profile

### Medical Conditions
- `GET /api/medical-conditions/` - List user's medical conditions
- `POST /api/medical-conditions/` - Add medical condition

### Preferences
- `GET /api/preferences/` - Get user preferences
- `POST /api/preferences/` - Create/update preferences

### Diet Goals
- `GET /api/diet-goals/` - List user's diet goals
- `POST /api/diet-goals/` - Create diet goal

### Diet Plans
- `GET /api/diet-plans/` - List user's diet plans
- `POST /api/diet-plans/generate/` - Generate AI diet plan
- `POST /api/diet-plans/generate-from-nl/` - Generate from natural language
- `GET /api/diet-plans/{id}/` - Get plan details
- `PATCH /api/diet-plans/{id}/` - Update plan
- `DELETE /api/diet-plans/{id}/` - Delete plan

### AI Services
- `POST /api/ai/parse-natural-language/` - Parse natural language input

### Ingredients
- `GET /api/ingredients/` - Search ingredients
- `GET /api/ingredients/{id}/` - Get ingredient details

## Project Structure

```
nutrifit_backend/
├── manage.py
├── requirements.txt
├── .env.example
├── nutrifit/          # Main project settings
├── accounts/          # User authentication
├── profiles/          # User profiles and preferences
├── diet/              # Diet plans and ingredients
└── ai_services/       # AI integration
```

## Technologies

- **Django 4.2**: Web framework
- **Django REST Framework**: API development
- **MySQL**: Database
- **JWT**: Authentication
- **Google Gemini AI**: Diet plan generation and NLP
- **CORS**: Cross-origin resource sharing
