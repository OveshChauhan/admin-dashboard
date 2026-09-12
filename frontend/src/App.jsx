// Configures React Router v6 routes, lazy-loaded pages, the shared layout, and role-protected settings.
import React, { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { CircularProgress, Box } from "@mui/material";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

const Login = lazy(function () { return import("./pages/Login"); });
const Dashboard = lazy(function () { return import("./pages/Dashboard"); });
const Users = lazy(function () { return import("./pages/Users"); });
const Events = lazy(function () { return import("./pages/Events"); });
const Profile = lazy(function () { return import("./pages/Profile"); });
const Settings = lazy(function () { return import("./pages/Settings"); });

function Loading() {
  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <CircularProgress />
    </Box>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/users" element={<Users />} />
              <Route path="/events" element={<Events />} />
              <Route path="/profile" element={<Profile />} />

              <Route element={<ProtectedRoute roles={["admin"]} />}>
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
