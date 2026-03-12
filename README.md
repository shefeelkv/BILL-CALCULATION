# Project Overview: Bill Management System

This repository contains TWO separate applications for managing bills and notes.

## 1. The Old System (Django)
- **URL**: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)
- **Technology**: Python, Django, HTML Templates.
- **Status**: This is your existing system containing all your **Old Bills and Data**.
- **Appearance**: The screenshots showing "WiseWaxPro" and the white "Login" screen.

## 2. The New System (React + Node.js)
- **URL**: [http://localhost:5173/](http://localhost:5173/)
- **Technology**: React (Frontend), Node.js/Express (Backend).
- **Status**: This is a **New Application**. It starts with a fresh, empty database.
- **Appearance**: The third screenshot showing the dark blue sidebar and "Enterprise Billing".

## Key Differences

| Feature | Old System (Django) | New System (React) |
| :--- | :--- | :--- |
| **Port** | 8000 | 5173 (Frontend) / 5000 (Backend) |
| **Database** | SQLite (`db.sqlite3`) | SQLite (`server/database.sqlite`) |
| **Data** | Contains History | Starts Empty |
| **Login** | Django Admin/User | Separate JWT Auth |

## How to Run

### Start the Old System (Django)
```bash
cd django_project
python manage.py runserver
```

### Start the New System (React + Node)
**Backend (Process 1)**
```bash
cd server
npm start
```

**Frontend (Process 2)**
```bash
cd client
npm run dev
```
