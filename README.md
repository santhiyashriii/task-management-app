# TaskFlow — Task Management Application

A full-stack internship project for creating, updating, tracking and deleting tasks.

## Features

- User registration and login
- Password hashing with bcrypt
- JWT authentication and protected task APIs
- Create, read, update and delete tasks
- Task status: Pending, In Progress, Completed
- Priority: Low, Medium, High
- Due dates
- Search and status filtering
- Responsive desktop/mobile UI
- MongoDB persistence
- REST API

## Tech stack

Frontend: React + Vite + Axios  
Backend: Node.js + Express + Mongoose  
Database: MongoDB Atlas  
Authentication: JWT + bcrypt

## Run locally

### Backend

```bash
cd backend
npm install
copy .env.example .env
```

Edit `.env` with your MongoDB URI and JWT secret.

Then:

```bash
npm run dev
```

Backend runs at `http://localhost:5000`.

### Frontend

Open another terminal:

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Frontend runs at the Vite URL shown in the terminal, normally `http://localhost:5173`.

## API endpoints

### Authentication

POST `/api/auth/register`

POST `/api/auth/login`

### Tasks (Bearer JWT required)

GET `/api/tasks`

POST `/api/tasks`

PUT `/api/tasks/:id`

DELETE `/api/tasks/:id`

## Deployment

### Backend

Deploy the `backend` folder to a Node hosting service such as Render. Add environment variables:

- `MONGO_URI`
- `JWT_SECRET`
- `CLIENT_URL`
- `PORT` (the host may provide this automatically)

### Frontend

Deploy the `frontend` folder to Netlify. Build command:

```bash
npm run build
```

Publish directory:

```text
dist
```

Set:

```text
VITE_API_URL=https://YOUR-BACKEND-URL/api
```

After deployment, test registration, login, creating a task, editing, filtering and deleting.

## Internship submission checklist

- [ ] Registration works
- [ ] Login works
- [ ] Tasks are saved in MongoDB
- [ ] Create task works
- [ ] Edit task works
- [ ] Delete task works
- [ ] Status and priority work
- [ ] Search/filter works
- [ ] Mobile layout works
- [ ] Frontend is deployed
- [ ] Backend is deployed
- [ ] README included
- [ ] No `.env` or passwords are uploaded
