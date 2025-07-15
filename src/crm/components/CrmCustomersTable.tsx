import * as React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";

// User type definition based on the API
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

interface CrmCustomersTableProps {
  onEditUser: (user: User) => void;
}

export default function CrmCustomersTable({
  onEditUser,
}: CrmCustomersTableProps) {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [total, setTotal] = React.useState(0);

  // Fetch users from API
  const fetchUsers = React.useCallback(
    async (searchQuery = "", currentPage = 0, perPage = 10) => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          page: (currentPage + 1).toString(),
          perPage: perPage.toString(),
          ...(searchQuery && { search: searchQuery }),
        });

        const response = await fetch(
          `https://user-api.builder-io.workers.dev/api/users?${params}`,
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch users: ${response.statusText}`);
        }

        const data = await response.json();
        setUsers(data.data || []);
        setTotal(data.total || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch users");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Initial data fetch
  React.useEffect(() => {
    fetchUsers(searchTerm, page, rowsPerPage);
  }, [fetchUsers, searchTerm, page, rowsPerPage]);

  // Handle search
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    setPage(0); // Reset to first page when searching
  };

  // Handle pagination
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Format full name
  const getFullName = (user: User) => {
    return `${user.name.title} ${user.name.first} ${user.name.last}`;
  };

  // Format address
  const getAddress = (user: User) => {
    return `${user.location.city}, ${user.location.state}, ${user.location.country}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get initials for avatar
  const getInitials = (user: User) => {
    return `${user.name.first[0]}${user.name.last[0]}`.toUpperCase();
  };

  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardContent>
        <Stack spacing={2}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <Typography variant="h6" component="h3">
              Customers
            </Typography>
            <TextField
              size="small"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={handleSearchChange}
              sx={{ minWidth: 250 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Stack>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 300,
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table size="small" aria-label="customers table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Customer</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Phone</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell>Age</TableCell>
                      <TableCell>Registered</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.login.uuid} hover>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                            }}
                          >
                            <Avatar
                              src={user.picture.thumbnail}
                              sx={{ width: 40, height: 40 }}
                            >
                              {getInitials(user)}
                            </Avatar>
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 500 }}
                              >
                                {getFullName(user)}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                @{user.login.username}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{user.email}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{user.phone}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {getAddress(user)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {user.dob.age}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(user.registered.date)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => onEditUser(user)}
                            aria-label="edit customer"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={total}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
