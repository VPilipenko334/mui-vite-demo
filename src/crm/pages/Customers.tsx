import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import { DataGrid, GridColDef, GridRowParams } from "@mui/x-data-grid";

// User data type based on the API response
interface User {
  login: {
    uuid: string;
    username: string;
    password: string;
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
    coordinates: {
      latitude: number;
      longitude: number;
    };
    timezone: {
      offset: string;
      description: string;
    };
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

interface ApiResponse {
  page: number;
  perPage: number;
  total: number;
  span: string;
  effectivePage: number;
  data: User[];
}

// Custom hook for debounced search
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Avatar component for user profile pictures
const UserAvatar: React.FC<{ user: User }> = ({ user }) => {
  return (
    <Avatar
      src={user.picture.thumbnail}
      alt={`${user.name.first} ${user.name.last}`}
      sx={{ width: 32, height: 32 }}
    >
      {`${user.name.first.charAt(0)}${user.name.last.charAt(0)}`}
    </Avatar>
  );
};

// Full name display component
const FullName: React.FC<{ user: User }> = ({ user }) => {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <UserAvatar user={user} />
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {`${user.name.first} ${user.name.last}`}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {user.login.username}
        </Typography>
      </Box>
    </Box>
  );
};

// Location display component
const LocationDisplay: React.FC<{ user: User }> = ({ user }) => {
  return (
    <Box>
      <Typography variant="body2">
        {user.location.city}, {user.location.state}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {user.location.country}
      </Typography>
    </Box>
  );
};

// Gender chip component
const GenderChip: React.FC<{ gender: string }> = ({ gender }) => {
  const color = gender === "male" ? "primary" : "secondary";
  return (
    <Chip
      label={gender.charAt(0).toUpperCase() + gender.slice(1)}
      size="small"
      color={color}
      variant="outlined"
    />
  );
};

// Format date function
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  return new Date(dateString).toLocaleDateString("en-US", options);
};

// Data grid columns definition
const columns: GridColDef[] = [
  {
    field: "fullName",
    headerName: "Customer",
    flex: 1.5,
    minWidth: 200,
    renderCell: (params) => <FullName user={params.row} />,
    sortable: false,
  },
  {
    field: "email",
    headerName: "Email",
    flex: 1.2,
    minWidth: 200,
  },
  {
    field: "phone",
    headerName: "Phone",
    flex: 1,
    minWidth: 140,
  },
  {
    field: "location",
    headerName: "Location",
    flex: 1.2,
    minWidth: 180,
    renderCell: (params) => <LocationDisplay user={params.row} />,
    sortable: false,
  },
  {
    field: "age",
    headerName: "Age",
    flex: 0.5,
    minWidth: 80,
    align: "center",
    headerAlign: "center",
    valueGetter: (value, row) => row?.dob?.age || 0,
  },
  {
    field: "gender",
    headerName: "Gender",
    flex: 0.8,
    minWidth: 100,
    align: "center",
    headerAlign: "center",
    renderCell: (params) => <GenderChip gender={params.row.gender} />,
  },
  {
    field: "registered",
    headerName: "Registered",
    flex: 1,
    minWidth: 120,
    valueGetter: (value, row) =>
      row?.registered?.date ? formatDate(row.registered.date) : "",
  },
];

export default function Customers() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [paginationModel, setPaginationModel] = React.useState({
    page: 0,
    pageSize: 25,
  });
  const [totalUsers, setTotalUsers] = React.useState(0);

  // Debounce search term to avoid too many API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Fetch users from API
  const fetchUsers = React.useCallback(
    async (page: number, pageSize: number, search: string = "") => {
      setLoading(true);
      setError(null);

      try {
        const searchParams = new URLSearchParams({
          page: (page + 1).toString(), // API is 1-indexed
          perPage: pageSize.toString(),
          ...(search && { search }),
        });

        const response = await fetch(
          `https://user-api.builder-io.workers.dev/api/users?${searchParams}`,
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ApiResponse = await response.json();
        setUsers(data.data);
        setTotalUsers(data.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch users");
        setUsers([]);
        setTotalUsers(0);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Fetch users when pagination or search changes
  React.useEffect(() => {
    fetchUsers(
      paginationModel.page,
      paginationModel.pageSize,
      debouncedSearchTerm,
    );
  }, [
    fetchUsers,
    paginationModel.page,
    paginationModel.pageSize,
    debouncedSearchTerm,
  ]);

  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPaginationModel((prev) => ({ ...prev, page: 0 })); // Reset to first page when searching
  };

  // Handle pagination change
  const handlePaginationModelChange = (model: typeof paginationModel) => {
    setPaginationModel(model);
  };

  // Transform users for DataGrid (add id field)
  const rows = users.map((user) => ({
    ...user,
    id: user.login.uuid,
  }));

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3, display: { xs: "none", sm: "flex" } }}
      >
        <Box>
          <Typography variant="h5" component="h2" sx={{ mb: 1 }}>
            Customer Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage and view all your customer data in one place
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Total: <strong>{totalUsers.toLocaleString()}</strong>
          </Typography>
        </Box>
      </Stack>

      {/* Mobile Header */}
      <Box sx={{ display: { xs: "block", sm: "none" }, mb: 3 }}>
        <Typography variant="h5" component="h2" sx={{ mb: 1 }}>
          Customer Management
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Manage and view all your customer data
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Total: <strong>{totalUsers.toLocaleString()}</strong>
        </Typography>
      </Box>

      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <TextField
          placeholder="Search customers by name, email, or location..."
          value={searchTerm}
          onChange={handleSearchChange}
          fullWidth
          sx={{ maxWidth: 500 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Data Grid */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ height: 700, width: "100%" }}>
            <DataGrid
              rows={rows}
              columns={columns}
              loading={loading}
              paginationModel={paginationModel}
              onPaginationModelChange={handlePaginationModelChange}
              pageSizeOptions={[10, 25, 50, 100]}
              rowCount={totalUsers}
              paginationMode="server"
              disableRowSelectionOnClick
              getRowClassName={(params: GridRowParams) =>
                params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd"
              }
              sx={{
                border: 0,
                "& .MuiDataGrid-cell": {
                  borderBottom: "1px solid",
                  borderColor: "divider",
                },
                "& .MuiDataGrid-columnHeaders": {
                  borderBottom: "2px solid",
                  borderColor: "divider",
                  backgroundColor: "grey.50",
                  ...(theme) =>
                    theme.palette.mode === "dark" && {
                      backgroundColor: "grey.900",
                    },
                },
                "& .MuiDataGrid-row:hover": {
                  backgroundColor: "action.hover",
                },
                "& .even": {
                  backgroundColor: "grey.50",
                  ...(theme) =>
                    theme.palette.mode === "dark" && {
                      backgroundColor: "grey.900",
                    },
                },
                "& .odd": {
                  backgroundColor: "background.paper",
                },
              }}
              slots={{
                loadingOverlay: () => (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                    }}
                  >
                    <CircularProgress />
                  </Box>
                ),
                noRowsOverlay: () => (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                      flexDirection: "column",
                      gap: 1,
                    }}
                  >
                    <Typography variant="h6" color="text.secondary">
                      No customers found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Try adjusting your search criteria
                    </Typography>
                  </Box>
                ),
              }}
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
