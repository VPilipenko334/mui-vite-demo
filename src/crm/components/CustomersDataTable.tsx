import * as React from 'react';
import {
  DataGrid,
  GridColDef,
  GridActionsCellItem,
  GridRenderCellParams,
  GridValueGetterParams,
} from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import { User, usersApiService } from '../services/usersApi';

interface CustomersDataTableProps {
  onEditCustomer: (customer: User) => void;
  onAddCustomer: () => void;
}

export default function CustomersDataTable({ onEditCustomer, onAddCustomer }: CustomersDataTableProps) {
  const [customers, setCustomers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [page, setPage] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(25);
  const [total, setTotal] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);

  const fetchCustomers = React.useCallback(async (searchTerm = '', currentPage = 0, currentPageSize = 25) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await usersApiService.getUsers({
        page: currentPage + 1, // API uses 1-based pagination
        perPage: currentPageSize,
        search: searchTerm || undefined,
        sortBy: 'name.first',
      });
      
      setCustomers(response.data);
      setTotal(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch customers');
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchCustomers(searchQuery, page, pageSize);
  }, [fetchCustomers, searchQuery, page, pageSize]);

  const handleSearch = React.useCallback((query: string) => {
    setSearchQuery(query);
    setPage(0); // Reset to first page when searching
  }, []);

  const handleDeleteCustomer = async (customerId: string) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) {
      return;
    }

    try {
      await usersApiService.deleteUser(customerId);
      // Refresh the data after deletion
      fetchCustomers(searchQuery, page, pageSize);
    } catch (err) {
      console.error('Error deleting customer:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete customer');
    }
  };

  const handleRefresh = () => {
    fetchCustomers(searchQuery, page, pageSize);
  };

  const formatAddress = (location: User['location']) => {
    return `${location.city}, ${location.state}, ${location.country}`;
  };

  const formatPhoneNumber = (phone: string) => {
    // Simple phone number formatting
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  };

  const getInitials = (name: User['name']) => {
    return `${name.first.charAt(0)}${name.last.charAt(0)}`.toUpperCase();
  };

  const getAgeRange = (age: number) => {
    if (age < 25) return '18-24';
    if (age < 35) return '25-34';
    if (age < 45) return '35-44';
    if (age < 55) return '45-54';
    if (age < 65) return '55-64';
    return '65+';
  };

  const getAgeRangeColor = (age: number): 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'info' => {
    if (age < 25) return 'info';
    if (age < 35) return 'primary';
    if (age < 45) return 'success';
    if (age < 55) return 'warning';
    if (age < 65) return 'secondary';
    return 'default';
  };

  const columns: GridColDef[] = [
    {
      field: 'avatar',
      headerName: '',
      width: 60,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params: GridRenderCellParams<User>) => {
        if (!params.row?.name) return null;
        return (
          <Avatar
            src={params.row.picture?.thumbnail}
            sx={{ width: 32, height: 32 }}
          >
            {getInitials(params.row.name)}
          </Avatar>
        );
      },
    },
    {
      field: 'name',
      headerName: 'Name',
      width: 200,
      valueGetter: (params: GridValueGetterParams<User>) =>
        params.row?.name ? `${params.row.name.first} ${params.row.name.last}` : '',
      renderCell: (params: GridRenderCellParams<User>) => {
        if (!params.row?.name) return null;
        return (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {params.row.name.title} {params.row.name.first} {params.row.name.last}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              @{params.row.login?.username || 'N/A'}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 250,
      renderCell: (params: GridRenderCellParams<User>) => (
        <Typography variant="body2">{params.row?.email || 'N/A'}</Typography>
      ),
    },
    {
      field: 'phone',
      headerName: 'Phone',
      width: 150,
      renderCell: (params: GridRenderCellParams<User>) => (
        <Typography variant="body2">
          {params.row?.phone ? formatPhoneNumber(params.row.phone) : 'N/A'}
        </Typography>
      ),
    },
    {
      field: 'location',
      headerName: 'Location',
      width: 200,
      valueGetter: (params: GridValueGetterParams<User>) =>
        params.row?.location ? formatAddress(params.row.location) : '',
      renderCell: (params: GridRenderCellParams<User>) => (
        <Typography variant="body2">
          {params.row?.location ? formatAddress(params.row.location) : 'N/A'}
        </Typography>
      ),
    },
    {
      field: 'age',
      headerName: 'Age',
      width: 100,
      renderCell: (params: GridRenderCellParams<User>) => (
        <Chip
          label={getAgeRange(params.row.dob.age)}
          size="small"
          color={getAgeRangeColor(params.row.dob.age)}
          variant="outlined"
        />
      ),
    },
    {
      field: 'registered',
      headerName: 'Customer Since',
      width: 150,
      valueGetter: (params: GridValueGetterParams<User>) => 
        new Date(params.row.registered.date).toLocaleDateString(),
      renderCell: (params: GridRenderCellParams<User>) => (
        <Typography variant="body2">
          {new Date(params.row.registered.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </Typography>
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          onClick={() => onEditCustomer(params.row)}
          color="primary"
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => handleDeleteCustomer(params.row.login.uuid)}
          color="error"
        />,
      ],
    },
  ];

  if (error) {
    return (
      <Card variant="outlined">
        <CardContent>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="error" gutterBottom>
              Error loading customers
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {error}
            </Typography>
            <Button
              variant="outlined"
              onClick={handleRefresh}
              startIcon={<RefreshIcon />}
            >
              Try Again
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ pb: 0 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <Typography variant="h6" component="h2">
            Customers ({total})
          </Typography>
          <Stack direction="row" spacing={1}>
            <IconButton onClick={handleRefresh} disabled={loading}>
              <RefreshIcon />
            </IconButton>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onAddCustomer}
              size="small"
            >
              Add Customer
            </Button>
          </Stack>
        </Stack>
        
        <TextField
          fullWidth
          placeholder="Search customers by name, email, or city..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
          size="small"
        />
      </CardContent>
      
      <Box sx={{ flexGrow: 1, px: 2, pb: 2 }}>
        <DataGrid
          rows={customers}
          columns={columns}
          getRowId={(row) => row.login.uuid}
          pagination
          paginationMode="server"
          page={page}
          pageSize={pageSize}
          rowCount={total}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[10, 25, 50, 100]}
          loading={loading}
          disableRowSelectionOnClick
          autoHeight={false}
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid',
              borderBottomColor: 'divider',
            },
            '& .MuiDataGrid-columnHeaders': {
              borderBottom: '2px solid',
              borderBottomColor: 'divider',
              backgroundColor: 'background.paper',
            },
            '& .MuiDataGrid-footerContainer': {
              borderTop: '1px solid',
              borderTopColor: 'divider',
            },
          }}
        />
      </Box>
    </Card>
  );
}
