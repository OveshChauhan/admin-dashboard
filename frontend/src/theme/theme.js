// Creates the shared Material UI theme used throughout the SaaS-style dashboard.
import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#5B5BD6"
    },
    secondary: {
      main: "#10B981"
    },
    background: {
      default: "#F6F7FB",
      paper: "#FFFFFF"
    },
    text: {
      primary: "#171A2B",
      secondary: "#697386"
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 800,
      letterSpacing: "-0.03em"
    },
    h5: {
      fontWeight: 800,
      letterSpacing: "-0.02em"
    },
    button: {
      textTransform: "none",
      fontWeight: 700
    }
  },
  shape: {
    borderRadius: 14
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 8px 30px rgba(24, 32, 56, 0.06)",
          border: "1px solid #E9EBF2"
        }
      }
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true
      }
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 800,
          color: "#697386",
          background: "#FAFBFD"
        }
      }
    }
  }
});
