// Memoized user table row that exposes edit/delete actions according to the current role.
import React from "react";
import { Chip, IconButton, TableCell, TableRow, Tooltip } from "@mui/material";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";

function UserRow({ user, canEdit, canDelete, onEdit, onDelete }) {
  return (
    <TableRow hover>
      <TableCell sx={{ fontWeight: 800 }}>{user.name}</TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell>
        <Chip size="small" label={user.role} sx={{ textTransform: "capitalize", fontWeight: 700 }} />
      </TableCell>
      <TableCell>
        <Chip
          size="small"
          label={user.isActive ? "Active" : "Inactive"}
          color={user.isActive ? "success" : "default"}
          variant={user.isActive ? "filled" : "outlined"}
        />
      </TableCell>
      <TableCell>
        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
      </TableCell>
      <TableCell align="right">
        {canEdit && (
          <Tooltip title="Edit">
            <IconButton onClick={function () { onEdit(user); }}>
              <EditRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        {canDelete && (
          <Tooltip title="Delete">
            <IconButton color="error" onClick={function () { onDelete(user); }}>
              <DeleteRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </TableCell>
    </TableRow>
  );
}

export default React.memo(UserRow);
