// Provides a server-side events table with date/status filtering and role-aware CRUD actions.
import React, { useCallback, useMemo, useState } from "react";
import {
  Alert, Box, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControl, Grid, InputLabel, MenuItem, Select, Stack, Table, TableBody, TableCell,
  TableContainer, TableHead, TablePagination, TableRow, TextField, Typography
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EventRow from "../components/EventRow";
import { useSelector } from "react-redux";
import {
  useCreateEventMutation, useDeleteEventMutation, useGetEventsQuery, useGetUsersQuery, useUpdateEventMutation
} from "../features/api/apiSlice";

const blank = { title: "", description: "", eventDate: "", status: "scheduled", tenant: "" };

export default function Events() {
  const role = useSelector(function (state) { return state.auth.user?.role; });
  const canEdit = role === "admin" || role === "manager";
  const canDelete = role === "admin";
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank);
  const [error, setError] = useState("");

  const params = useMemo(function () {
    return { page: page + 1, limit: 10, status, from, to, order: "asc" };
  }, [page, status, from, to]);

  const { data } = useGetEventsQuery(params);
  const { data: tenantData } = useGetUsersQuery({ page: 1, limit: 100, role: "tenant", sort: "name", order: "asc" });
  const [createEvent] = useCreateEventMutation();
  const [updateEvent] = useUpdateEventMutation();
  const [deleteEvent] = useDeleteEventMutation();

  const items = data?.data?.items || [];
  const pagination = data?.data?.pagination;
  const tenants = tenantData?.data?.items || [];

  const openCreate = useCallback(function () {
    setEditing(null);
    setForm(blank);
    setError("");
    setDialog(true);
  }, []);

  const openEdit = useCallback(function (event) {
    setEditing(event);
    setForm({
      title: event.title,
      description: event.description || "",
      eventDate: new Date(event.eventDate).toISOString().slice(0, 16),
      status: event.status,
      tenant: event.tenant?._id || ""
    });
    setError("");
    setDialog(true);
  }, []);

  const handleDelete = useCallback(async function (event) {
    if (!window.confirm(`Delete ${event.title}?`)) return;
    try {
      await deleteEvent(event._id).unwrap();
    } catch (requestError) {
      setError(requestError?.data?.message || "Delete failed.");
    }
  }, [deleteEvent]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      if (editing) {
        await updateEvent({ id: editing._id, body: form }).unwrap();
      } else {
        await createEvent(form).unwrap();
      }
      setDialog(false);
    } catch (requestError) {
      setError(requestError?.data?.message || "Unable to save event.");
    }
  }

  return (
    <Stack spacing={3}>
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
        <Box>
          <Typography variant="h4">Events</Typography>
          <Typography sx={{ color: "text.secondary", mt: 0.7 }}>Plan and track tenant activity.</Typography>
        </Box>
        {canEdit && <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openCreate}>Add event</Button>}
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      <Card>
        <CardContent>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="From" type="date" InputLabelProps={{ shrink: true }} value={from} onChange={function (e) { setFrom(e.target.value); setPage(0); }} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="To" type="date" InputLabelProps={{ shrink: true }} value={to} onChange={function (e) { setTo(e.target.value); setPage(0); }} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select value={status} label="Status" onChange={function (e) { setStatus(e.target.value); setPage(0); }}>
                  <MenuItem value="">All statuses</MenuItem>
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Event</TableCell>
                  <TableCell>Tenant</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map(function (event) {
                  return <EventRow key={event._id} event={event} canEdit={canEdit} canDelete={canDelete} onEdit={openEdit} onDelete={handleDelete} />;
                })}
                {items.length === 0 && <TableRow><TableCell colSpan={5} align="center">No events found.</TableCell></TableRow>}
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

      <Dialog open={dialog} onClose={function () { setDialog(false); }} fullWidth maxWidth="sm">
        <Box component="form" onSubmit={handleSubmit}>
          <DialogTitle>{editing ? "Edit event" : "Create event"}</DialogTitle>
          <DialogContent>
            <Stack spacing={2.2} sx={{ mt: 1 }}>
              <TextField required label="Title" value={form.title} onChange={function (e) { setForm({ ...form, title: e.target.value }); }} />
              <TextField label="Description" multiline rows={3} value={form.description} onChange={function (e) { setForm({ ...form, description: e.target.value }); }} />
              <TextField required label="Event date" type="datetime-local" InputLabelProps={{ shrink: true }} value={form.eventDate} onChange={function (e) { setForm({ ...form, eventDate: e.target.value }); }} />
              <FormControl fullWidth>
                <InputLabel>Tenant</InputLabel>
                <Select required value={form.tenant} label="Tenant" onChange={function (e) { setForm({ ...form, tenant: e.target.value }); }}>
                  {tenants.map(function (tenant) {
                    return <MenuItem key={tenant.id} value={tenant.id}>{tenant.name} — {tenant.email}</MenuItem>;
                  })}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select value={form.status} label="Status" onChange={function (e) { setForm({ ...form, status: e.target.value }); }}>
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={function () { setDialog(false); }}>Cancel</Button>
            <Button type="submit" variant="contained">Save changes</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Stack>
  );
}
