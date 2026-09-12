// Renders the top navigation bar with the current user identity and logout action.
import React from "react";
import { AppBar, Avatar, Box, Chip, IconButton, Toolbar, Tooltip, Typography } from "@mui/material";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { useDispatch, useSelector } from "react-redux";
import { useLogoutMutation } from "../features/api/apiSlice";
import { clearCredentials } from "../features/auth/authSlice";

export default function Navbar() {
  const dispatch = useDispatch();
  const [logout] = useLogoutMutation();
  const user = useSelector(function (state) {
    return state.auth.user;
  });

  async function handleLogout() {
    try {
      await logout().unwrap();
    } catch (error) {
      // The local credentials are cleared even if the server session is already invalid.
    }
    dispatch(clearCredentials());
  }

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{ borderBottom: "1px solid #E9EBF2", bgcolor: "rgba(255,255,255,.92)", backdropFilter: "blur(12px)" }}
    >
      <Toolbar sx={{ justifyContent: "flex-end", gap: 2 }}>
        <Box sx={{ textAlign: "right", display: { xs: "none", sm: "block" } }}>
          <Typography sx={{ fontWeight: 800, fontSize: 14 }}>{user?.name}</Typography>
          <Typography sx={{ color: "text.secondary", fontSize: 12 }}>{user?.email}</Typography>
        </Box>
        <Avatar sx={{ bgcolor: "primary.main", fontWeight: 800 }}>
          {user?.name?.charAt(0)?.toUpperCase()}
        </Avatar>
        <Chip size="small" label={user?.role} sx={{ fontWeight: 800, textTransform: "capitalize" }} />
        <Tooltip title="Logout">
          <IconButton onClick={handleLogout}>
            <LogoutRoundedIcon />
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}
