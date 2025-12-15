Setup and run (Windows PowerShell)

1) Create and activate a virtual environment

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

2) Install backend requirements

```powershell
pip install -r requirements.txt
```

3) (Optional) If using MySQL, set DB env vars in a `.env` file at project root, or set `DB_ENGINE=mysql`.

4) Apply migrations and create a superuser

```powershell
python manage.py migrate
python manage.py createsuperuser
```

5) Run development server

```powershell
python manage.py runserver
```

Frontend (in `nutrifit_frontend`):

```powershell
cd ..\nutrifit_frontend
npm install
npm run dev
```

Notes:
- By default the Django project will use `db.sqlite3` located at the project root for local development.
- To switch to MySQL, set `DB_ENGINE=mysql` and the other DB_* env vars; ensure `mysqlclient` is installed.
- If you use the JWT token blacklist feature, ensure `djangorestframework-simplejwt` is installed (included in `requirements.txt`).

Frontend environment:
- The frontend reads the backend base URL from `VITE_API_BASE_URL` (example file at `nutrifit_frontend/.env.example`).
- Default value: `http://localhost:8000/api` (no trailing slash). If your backend runs on a different host/port, update this before running the frontend.

Note about Supabase:
- This project uses a Django REST API as the backend. The frontend is configured to call the Django endpoints (see `VITE_API_BASE_URL`).
- Supabase is not required; any references to Supabase in older branches/files were removed to avoid confusion.
