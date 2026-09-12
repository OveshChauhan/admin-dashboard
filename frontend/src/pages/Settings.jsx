// Provides the admin-only settings page and documents the application's role model.
import React from "react";
import { Alert, Card, CardContent, Stack, Typography } from "@mui/material";

export default function Settings() {
  return (
    <Stack spacing={3} maxWidth={900}>
      <Typography variant="h4">Settings</Typography>
      <Typography color="text.secondary">Administration and access configuration.</Typography>
      <Alert severity="info">
        This page is restricted to Admin users by the React route and should also be protected by server-side authorization for any real settings mutations.
      </Alert>
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" fontWeight={800}>Role model</Typography>
          <Typography sx={{ mt: 2 }}><strong>Admin:</strong> full access, including destructive operations.</Typography>
          <Typography sx={{ mt: 1 }}><strong>Manager:</strong> operational view/create/update access.</Typography>
          <Typography sx={{ mt: 1 }}><strong>Tenant:</strong> restricted read-only access to permitted data.</Typography>
        </CardContent>
      </Card>
    </Stack>
  );
}
