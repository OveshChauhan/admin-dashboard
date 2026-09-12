// Renders role-aware navigation for the SaaS dashboard.
import React from "react";
import { NavLink } from "react-router-dom";
import { Box, Divider, List, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import { useSelector } from "react-redux";

const links = [
  { label: "Overview", to: "/dashboard", icon: <DashboardRoundedIcon /> },
  { label: "Users", to: "/users", icon: <PeopleRoundedIcon /> },
  { label: "Events", to: "/events", icon: <EventRoundedIcon /> },
  { label: "Profile", to: "/profile", icon: <AccountCircleRoundedIcon /> }
];

export default function Sidebar() {
  const role = useSelector(function (state) {
    return state.auth.user?.role;
  });

  return (
    <Box
      sx={{
        width: { xs: 76, md: 250 },
        flexShrink: 0,
        bgcolor: "#11142A",
        color: "#fff",
        minHeight: "100vh",
        position: "sticky",
        top: 0,
        alignSelf: "flex-start"
      }}
    >
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: "-0.03em" }}>
          Admin<span style={{ color: "#8B8BF0" }}>OS</span>
        </Typography>
        <Typography sx={{ color: "#8F94AE", fontSize: 12, mt: 0.5 }}>
          Control center
        </Typography>
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,.08)" }} />

      <List sx={{ p: 1.5 }}>
        {links.map(function (link) {
          return (
            <ListItemButton
              key={link.to}
              component={NavLink}
              to={link.to}
              sx={{
                color: "#AEB3CB",
                borderRadius: 2.5,
                mb: 0.7,
                "&.active": {
                  color: "#fff",
                  bgcolor: "rgba(91,91,214,.28)"
                },
                "&:hover": {
                  bgcolor: "rgba(255,255,255,.07)",
                  color: "#fff"
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: { xs: 0, md: 42 }, color: "inherit" }}>
                {link.icon}
              </ListItemIcon>
              <ListItemText
                primary={link.label}
                sx={{ display: { xs: "none", md: "block" } }}
                primaryTypographyProps={{ fontWeight: 700, fontSize: 14 }}
              />
            </ListItemButton>
          );
        })}

        {role === "admin" && (
          <ListItemButton
            component={NavLink}
            to="/settings"
            sx={{
              color: "#AEB3CB",
              borderRadius: 2.5,
              mb: 0.7,
              "&.active": { color: "#fff", bgcolor: "rgba(91,91,214,.28)" },
              "&:hover": { bgcolor: "rgba(255,255,255,.07)", color: "#fff" }
            }}
          >
            <ListItemIcon sx={{ minWidth: { xs: 0, md: 42 }, color: "inherit" }}>
              <SettingsRoundedIcon />
            </ListItemIcon>
            <ListItemText
              primary="Settings"
              sx={{ display: { xs: "none", md: "block" } }}
              primaryTypographyProps={{ fontWeight: 700, fontSize: 14 }}
            />
          </ListItemButton>
        )}
      </List>
    </Box>
  );
}
