# Admin Dashboard System

Production-oriented MERN admin dashboard demonstrating authentication, RBAC, REST APIs, RTK Query, MongoDB aggregation, server-side tables, and a Material UI SaaS interface.

## Stack
- React 18
- Webpack 5
- Redux Toolkit
- RTK Query
- React Router v6
- Material UI
- Recharts
- Node.js / Express
- MongoDB / Mongoose
- JWT / bcrypt

## Roles
- Admin: full access
- Manager: view/create/update, no destructive admin operations
- Tenant: restricted read-only access to permitted data

## Run
1. Start MongoDB.
2. Backend:
   `cd backend && npm install && npm run dev`
3. Frontend in another terminal:
   `cd frontend && npm install && npm run dev`
4. Open http://localhost:5173

Default seeded accounts are created automatically:
- admin@example.com / Admin@12345
- manager@example.com / Manager@12345
- tenant@example.com / Tenant@12345

Change these credentials before any real deployment.
