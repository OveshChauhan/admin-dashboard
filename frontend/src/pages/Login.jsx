// Provides the public login page and stores JWT credentials in Redux after successful authentication.
import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Alert, Box, Button, Card, CardContent, CircularProgress, Stack, TextField, Typography } from "@mui/material";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import { useSelector, useDispatch } from "react-redux";
import { useLoginMutation } from "../features/api/apiSlice";
import { setCredentials } from "../features/auth/authSlice";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { accessToken } = useSelector(function (state) { return state.auth; });
  const [login, { isLoading }] = useLoginMutation();
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("Admin@12345");
  const [error, setError] = useState("");

  if (accessToken) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      const result = await login({ email, password }).unwrap();
      dispatch(setCredentials(result.data));
      navigate("/dashboard", { replace: true });
    } catch (requestError) {
      setError(requestError?.data?.message || "Unable to sign in.");
    }
  }

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", gridTemplateColumns: { md: "1.15fr 0.85fr" }, bgcolor: "#F6F7FB" }}>
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          p: 8,
          bgcolor: "#11142A",
          color: "#fff",
          flexDirection: "column",
          justifyContent: "space-between"
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 900 }}>Admin<span style={{ color: "#8B8BF0" }}>OS</span></Typography>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 900, maxWidth: 600, lineHeight: 1.05 }}>
            A serious control center for modern operations.
          </Typography>
          <Typography sx={{ color: "#AEB3CB", mt: 3, maxWidth: 520, fontSize: 17, lineHeight: 1.7 }}>
            Authentication, RBAC, analytics and data operations in one production-style MERN application.
          </Typography>
        </Box>
        <Typography sx={{ color: "#717795", fontSize: 13 }}>React 18 · Redux Toolkit · RTK Query · Node · MongoDB</Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: 3 }}>
        <Card sx={{ width: "100%", maxWidth: 460 }}>
          <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
            <Stack spacing={3}>
              <Box>
                <Box sx={{ width: 48, height: 48, borderRadius: 3, bgcolor: "rgba(91,91,214,.1)", color: "primary.main", display: "grid", placeItems: "center", mb: 3 }}>
                  <LockRoundedIcon />
                </Box>
                <Typography variant="h4">Welcome back</Typography>
                <Typography sx={{ color: "text.secondary", mt: 1 }}>Sign in to your admin workspace.</Typography>
              </Box>

              {error && <Alert severity="error">{error}</Alert>}

              <Box component="form" onSubmit={handleSubmit}>
                <Stack spacing={2}>
                  <TextField label="Email" type="email" value={email} onChange={function (e) { setEmail(e.target.value); }} fullWidth />
                  <TextField label="Password" type="password" value={password} onChange={function (e) { setPassword(e.target.value); }} fullWidth />
                  <Button type="submit" variant="contained" size="large" disabled={isLoading} sx={{ py: 1.5 }}>
                    {isLoading ? <CircularProgress size={22} color="inherit" /> : "Sign in"}
                  </Button>
                </Stack>
              </Box>

              <Box sx={{ p: 2, bgcolor: "#F7F8FC", borderRadius: 2 }}>
                <Typography sx={{ fontWeight: 800, fontSize: 12 }}>Demo credentials</Typography>
                <Typography sx={{ color: "text.secondary", fontSize: 12, mt: 0.5 }}>admin@example.com / Admin@12345</Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
