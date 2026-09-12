// Provides a server-side users table with search, role filtering, sorting, pagination, and role-aware CRUD actions.
import React, { useCallback, useMemo, useState } from "react";
import {
  Alert, Box, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControl, Grid, InputLabel, MenuItem, Select, Stack, Table, TableBody, TableCell,
  TableContainer, TableHead, TablePagination, TableRow, TextField, Typography
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import UserRow from "../components/UserRow";
import {
  useCreateUserMutation, useDeleteUserMutation, useGetUsersQuery, useUpdateUserMutation
} from "../features/api/apiSlice";
import { useSelector } from "react-redux";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  role: "tenant",
  isActive: true
};

export default function Users() {
  const currentRole = useSelector(function (state) { return state.auth.user?.role; });
  const canEdit = currentRole === "admin" || currentRole === "manager";
  const canDelete = currentRole === "admin";
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [sort, setSort] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const params = useMemo(function () {
    return { page: page + 1, limit: 10, search, role, sort, order };
  }, [page, search, role, sort, order]);

  const { data, isLoading } = useGetUsersQuery(params);
  const [createUser, createState] = useCreateUserMutation();
  const [updateUser, updateState] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  const items = data?.data?.items || [];
  const pagination = data?.data?.pagination;

  const openCreate = useCallback(function () {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback(function (user) {
    setEditing(user);
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      isActive: user.isActive
    });
    setError("");
    setDialogOpen(true);
  }, []);

  const closeDialog = useCallback(function () {
    setDialogOpen(false);
  }, []);

  const handleDelete = useCallback(async function (user) {
    if (!window.confirm(`Delete ${user.name}? This cannot be undone.`)) return;
    try {
      await deleteUser(user.id).unwrap();
    } catch (requestError) {
      setError(requestError?.data?.message || "Delete failed.");
    }
  }, [deleteUser]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      if (editing) {
        await updateUser({ id: editing.id, body: form }).unwrap();
      } else {
        await createUser(form).unwrap();
      }
      setDialogOpen(false);
    } catch (requestError) {
      setError(requestError?.data?.message || "Unable to save user.");
    }
  }

  return (
    <Stack spacing={3}>
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, alignItems: { sm: "center" }, flexDirection: { xs: "column", sm: "row" } }}>
        <Box>
          <Typography variant="h4">Users</Typography>
          <Typography sx={{ color: "text.secondary", mt: 0.7 }}>Manage identities and access levels.</Typography>
        </Box>
        {canEdit && <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openCreate}>Add user</Button>}
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      <Card>
        <CardContent>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={5}>
              <TextField fullWidth label="Search name or email" value={search} onChange={function (e) { setSearch(e.target.value); setPage(0); }} />
            </Grid>
            <Grid item xs={12} sm={4} md={2.5}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select value={role} label="Role" onChange={function (e) { setRole(e.target.value); setPage(0); }}>
                  <MenuItem value="">All roles</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="manager">Manager</MenuItem>
                  <MenuItem value="tenant">Tenant</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4} md={2.5}>
              <FormControl fullWidth>
                <InputLabel>Sort</InputLabel>
                <Select value={sort} label="Sort" onChange={function (e) { setSort(e.target.value); setPage(0); }}>
                  <MenuItem value="createdAt">Created date</MenuItem>
                  <MenuItem value="name">Name</MenuItem>
                  <MenuItem value="email">Email</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4} md={2}>
              <FormControl fullWidth>
                <InputLabel>Order</InputLabel>
                <Select value={order} label="Order" onChange={function (e) { setOrder(e.target.value); setPage(0); }}>
                  <MenuItem value="desc">Newest / Z-A</MenuItem>
                  <MenuItem value="asc">Oldest / A-Z</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map(function (user) {
                  return <UserRow key={user.id} user={user} canEdit={canEdit} canDelete={canDelete} onEdit={openEdit} onDelete={handleDelete} />;
                })}
                {!isLoading && items.length === 0 && (
                  <TableRow><TableCell colSpan={6} align="center">No users found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={pagination?.total || 0}
            page={page}
            rowsPerPage={10}
            rowsPerPageOptions={[10]}
            onPageChange={function (_, nextPage) { setPage(nextPage); }}
          />
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <Box component="form" onSubmit={handleSubmit}>
          <DialogTitle>{editing ? "Edit user" : "Create user"}</DialogTitle>
          <DialogContent>
            <Stack spacing={2.2} sx={{ mt: 1 }}>
              <TextField required label="Name" value={form.name} onChange={function (e) { setForm({ ...form, name: e.target.value }); }} />
              <TextField required label="Email" type="email" value={form.email} onChange={function (e) { setForm({ ...form, email: e.target.value }); }} />
              <TextField required={!editing} label={editing ? "New password (optional)" : "Password"} type="password" value={form.password} onChange={function (e) { setForm({ ...form, password: e.target.value }); }} />
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select value={form.role} label="Role" onChange={function (e) { setForm({ ...form, role: e.target.value }); }}>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="manager">Manager</MenuItem>
                  <MenuItem value="tenant">Tenant</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select value={form.isActive ? "active" : "inactive"} label="Status" onChange={function (e) { setForm({ ...form, isActive: e.target.value === "active" }); }}>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={closeDialog}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={createState.isLoading || updateState.isLoading}>
              Save changes
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Stack>
  );
}
