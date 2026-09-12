// Displays the authenticated user's account and role information.
import React from "react";
import { Avatar, Card, CardContent, Chip, Divider, Stack, Typography } from "@mui/material";
import { useSelector } from "react-redux";

export default function Profile() {
  const user = useSelector(function (state) { return state.auth.user; });

  return (
    <Stack spacing={3} maxWidth={720}>
      <Typography variant="h4">Profile</Typography>
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={3}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ width: 64, height: 64, bgcolor: "primary.main", fontSize: 26 }}>{user?.name?.charAt(0)}</Avatar>
              <Stack>
                <Typography variant="h5">{user?.name}</Typography>
                <Typography color="text.secondary">{user?.email}</Typography>
              </Stack>
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Typography color="text.secondary">Role</Typography>
              <Chip label={user?.role} sx={{ textTransform: "capitalize", fontWeight: 800 }} />
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography color="text.secondary">Account status</Typography>
              <Typography fontWeight={800}>{user?.isActive ? "Active" : "Inactive"}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography color="text.secondary">Created</Typography>
              <Typography fontWeight={700}>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</Typography>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
