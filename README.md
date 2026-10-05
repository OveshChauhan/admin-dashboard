# Admin Dashboard

Admin dashboard built with React 18, Redux Toolkit, RTK Query, Material UI, Node.js, Express.js and MongoDB.

## Tech Stack

**Frontend**
- React 18
- Redux Toolkit
- RTK Query
- React Router
- Material UI
- Recharts

**Backend**
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt

## Features

- JWT based login
- Role based access control
- Admin, Manager and Tenant roles
- Protected routes
- User management
- Event management
- Dashboard analytics
- Server-side pagination, sorting and filtering
- MongoDB aggregation for dashboard statistics
- RTK Query for API requests and caching
- Material UI based dashboard

## Project Structure

```text
admin-dashboard/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   ├── utils/
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── features/
│   │   ├── pages/
│   │   └── theme/
│   └── webpack.config.js
│
├── .gitignore
└── README.md
```

## Backend environment and initial production admin

Create `backend/.env` from `backend/.env.example` for local development. The API requires `NODE_ENV`, `MONGO_URI`, separate JWT secrets of at least 32 bytes, and `CLIENT_URL`. Generate unique JWT secrets and keep `.env` out of Git.

The fixed demo users and sample events are seeded only when `NODE_ENV=development`. Production startup never creates demo accounts. To create the first production administrator, set `NODE_ENV=production` and the production database settings in `backend/.env`, then run `npm run create-admin` from `backend/` with these one-time variables set in the shell: `BOOTSTRAP_ADMIN_NAME`, `BOOTSTRAP_ADMIN_EMAIL`, and `BOOTSTRAP_ADMIN_PASSWORD`. The password must be 12–72 bytes. After the command succeeds, remove those three bootstrap variables from the shell. The command refuses to create another bootstrap admin if an admin already exists.
