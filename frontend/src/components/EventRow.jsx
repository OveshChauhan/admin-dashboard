// Memoized event table row used to render event records efficiently.
import React from "react";
import { Chip, IconButton, TableCell, TableRow, Tooltip } from "@mui/material";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";

function EventRow({ event, canEdit, canDelete, onEdit, onDelete }) {
  return (
    <TableRow hover>
      <TableCell sx={{ fontWeight: 800 }}>{event.title}</TableCell>
      <TableCell>{event.tenant?.name || "—"}</TableCell>
      <TableCell>{new Date(event.eventDate).toLocaleString()}</TableCell>
      <TableCell>
        <Chip
          size="small"
          label={event.status}
          color={event.status === "completed" ? "success" : event.status === "cancelled" ? "error" : "primary"}
          sx={{ textTransform: "capitalize", fontWeight: 700 }}
        />
      </TableCell>
      <TableCell align="right">
        {canEdit && (
          <Tooltip title="Edit">
            <IconButton onClick={function () { onEdit(event); }}>
              <EditRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        {canDelete && (
          <Tooltip title="Delete">
            <IconButton color="error" onClick={function () { onDelete(event); }}>
              <DeleteRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </TableCell>
    </TableRow>
  );
}

export default React.memo(EventRow);
