# Warhammer Galaxy Backend

Django backend for the Warhammer Galaxy application.

## Setup

1. Create a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Configure environment variables in `.env` (already created).

4. Run migrations:
   ```bash
   python manage.py migrate
   ```

5. Seed database (optional, populates with initial data):
   ```bash
   python manage.py seed_db
   ```

6. Run server:
   ```bash
   python manage.py runserver
   ```

The API will be available at `http://localhost:8000/api/`.

## API Endpoints

- `/api/armies/` - List/Create armies
- `/api/guides/` - List/Create painting guides
- `/api/battle-reports/` - List/Create battle reports

## Admin Interface

Access the Django Admin at `http://localhost:8000/admin/`.
You'll need to create a superuser first:
```bash
python manage.py createsuperuser
```
