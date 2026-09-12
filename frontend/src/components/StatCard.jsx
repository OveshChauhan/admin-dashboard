// Displays a reusable KPI card with an icon, primary metric, and contextual label.
import React from "react";
import { Avatar, Box, Card, CardContent, Typography } from "@mui/material";

function StatCard({ title, value, subtitle, icon }) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box>
            <Typography sx={{ color: "text.secondary", fontSize: 13, fontWeight: 700 }}>
              {title}
            </Typography>
            <Typography sx={{ fontSize: 32, fontWeight: 900, mt: 1 }}>
              {value}
            </Typography>
            <Typography sx={{ color: "text.secondary", fontSize: 12, mt: 0.5 }}>
              {subtitle}
            </Typography>
          </Box>
          <Avatar sx={{ bgcolor: "rgba(91,91,214,.1)", color: "primary.main" }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
}

export default React.memo(StatCard);
