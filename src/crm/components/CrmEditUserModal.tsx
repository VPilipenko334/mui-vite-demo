import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";

// User type definition
interface User {
  login: {
    uuid: string;
    username: string;
  };
  name: {
    title: string;
    first: string;
    last: string;
  };
  gender: string;
  location: {
    street: {
      number: number;
      name: string;
    };
    city: string;
    state: string;
    country: string;
    postcode: string;
  };
  email: string;
  dob: {
    date: string;
    age: number;
  };
  registered: {
    date: string;
    age: number;
  };
  phone: string;
  cell: string;
  picture: {
    large: string;
    medium: string;
    thumbnail: string;
  };
  nat: string;
}

interface CrmEditUserModalProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onSave: (user: User) => void;
}

export default function CrmEditUserModal({
  open,
  user,
  onClose,
  onSave,
}: CrmEditUserModalProps) {
  const [editedUser, setEditedUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Update editedUser when user prop changes
  React.useEffect(() => {
    if (user) {
      setEditedUser({ ...user });
      setError(null);
    }
  }, [user]);

  // Handle form field changes
  const handleFieldChange = (field: string, value: string) => {
    if (!editedUser) return;

    const updatedUser = { ...editedUser };
    const fieldParts = field.split(".");

    // Navigate to nested property and update
    let current: any = updatedUser;
    for (let i = 0; i < fieldParts.length - 1; i++) {
      current = current[fieldParts[i]];
    }
    current[fieldParts[fieldParts.length - 1]] = value;

    setEditedUser(updatedUser);
  };

  // Handle number field changes
  const handleNumberFieldChange = (field: string, value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue)) {
      handleFieldChange(field, numValue.toString());
    }
  };

  // Handle save
  const handleSave = async () => {
    if (!editedUser) return;

    try {
      setLoading(true);
      setError(null);

      // Prepare data for API
      const updateData = {
        email: editedUser.email,
        name: {
          title: editedUser.name.title,
          first: editedUser.name.first,
          last: editedUser.name.last,
        },
        gender: editedUser.gender,
        location: {
          street: {
            number: editedUser.location.street.number,
            name: editedUser.location.street.name,
          },
          city: editedUser.location.city,
          state: editedUser.location.state,
          country: editedUser.location.country,
          postcode: editedUser.location.postcode,
        },
        phone: editedUser.phone,
        cell: editedUser.cell,
      };

      const response = await fetch(
        `https://user-api.builder-io.workers.dev/api/users/${editedUser.login.uuid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to update user: ${response.statusText}`);
      }

      onSave(editedUser);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setError(null);
    onClose();
  };

  if (!editedUser) {
    return null;
  }

  // Get initials for avatar
  const getInitials = (user: User) => {
    return `${user.name.first[0]}${user.name.last[0]}`.toUpperCase();
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: "70vh" },
      }}
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar
            src={editedUser.picture.thumbnail}
            sx={{ width: 48, height: 48 }}
          >
            {getInitials(editedUser)}
          </Avatar>
          <Box>
            <Typography variant="h6">Edit Customer</Typography>
            <Typography variant="body2" color="text.secondary">
              @{editedUser.login.username}
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          {error && <Alert severity="error">{error}</Alert>}

          {/* Personal Information */}
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              Personal Information
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Title</InputLabel>
                  <Select
                    value={editedUser.name.title}
                    label="Title"
                    onChange={(e) =>
                      handleFieldChange("name.title", e.target.value)
                    }
                  >
                    <MenuItem value="Mr">Mr</MenuItem>
                    <MenuItem value="Ms">Ms</MenuItem>
                    <MenuItem value="Mrs">Mrs</MenuItem>
                    <MenuItem value="Dr">Dr</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 5 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="First Name"
                  value={editedUser.name.first}
                  onChange={(e) =>
                    handleFieldChange("name.first", e.target.value)
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 5 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Last Name"
                  value={editedUser.name.last}
                  onChange={(e) =>
                    handleFieldChange("name.last", e.target.value)
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Gender</InputLabel>
                  <Select
                    value={editedUser.gender}
                    label="Gender"
                    onChange={(e) =>
                      handleFieldChange("gender", e.target.value)
                    }
                  >
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Email"
                  type="email"
                  value={editedUser.email}
                  onChange={(e) => handleFieldChange("email", e.target.value)}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Contact Information */}
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              Contact Information
            </Typography>
            <Grid2 container spacing={2}>
              <Grid2 xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Phone"
                  value={editedUser.phone}
                  onChange={(e) => handleFieldChange("phone", e.target.value)}
                />
              </Grid2>
              <Grid2 xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Cell Phone"
                  value={editedUser.cell}
                  onChange={(e) => handleFieldChange("cell", e.target.value)}
                />
              </Grid2>
            </Grid2>
          </Box>

          {/* Address Information */}
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              Address Information
            </Typography>
            <Grid2 container spacing={2}>
              <Grid2 xs={12} sm={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Street Number"
                  type="number"
                  value={editedUser.location.street.number}
                  onChange={(e) =>
                    handleNumberFieldChange(
                      "location.street.number",
                      e.target.value,
                    )
                  }
                />
              </Grid2>
              <Grid2 xs={12} sm={9}>
                <TextField
                  fullWidth
                  size="small"
                  label="Street Name"
                  value={editedUser.location.street.name}
                  onChange={(e) =>
                    handleFieldChange("location.street.name", e.target.value)
                  }
                />
              </Grid2>
              <Grid2 xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="City"
                  value={editedUser.location.city}
                  onChange={(e) =>
                    handleFieldChange("location.city", e.target.value)
                  }
                />
              </Grid2>
              <Grid2 xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="State"
                  value={editedUser.location.state}
                  onChange={(e) =>
                    handleFieldChange("location.state", e.target.value)
                  }
                />
              </Grid2>
              <Grid2 xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Country"
                  value={editedUser.location.country}
                  onChange={(e) =>
                    handleFieldChange("location.country", e.target.value)
                  }
                />
              </Grid2>
              <Grid2 xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Postcode"
                  value={editedUser.location.postcode}
                  onChange={(e) =>
                    handleFieldChange("location.postcode", e.target.value)
                  }
                />
              </Grid2>
            </Grid2>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
