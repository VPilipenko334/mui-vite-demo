import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import { User, CreateUserRequest, UpdateUserRequest, usersApiService } from '../services/usersApi';

interface CustomerModalProps {
  open: boolean;
  onClose: () => void;
  customer?: User | null;
  onSave: () => void;
}

interface FormData {
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  gender: string;
  phone: string;
  cell: string;
  streetNumber: string;
  streetName: string;
  city: string;
  state: string;
  country: string;
  postcode: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;
  phone?: string;
  streetNumber?: string;
  streetName?: string;
  city?: string;
  state?: string;
  country?: string;
  postcode?: string;
}

export default function CustomerModal({ open, onClose, customer, onSave }: CustomerModalProps) {
  const [formData, setFormData] = React.useState<FormData>({
    title: '',
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    gender: 'male',
    phone: '',
    cell: '',
    streetNumber: '',
    streetName: '',
    city: '',
    state: '',
    country: '',
    postcode: '',
  });

  const [errors, setErrors] = React.useState<FormErrors>({});
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const isEditing = Boolean(customer);

  React.useEffect(() => {
    if (customer) {
      // Populate form with customer data for editing
      setFormData({
        title: customer.name.title || '',
        firstName: customer.name.first || '',
        lastName: customer.name.last || '',
        email: customer.email || '',
        username: customer.login.username || '',
        gender: customer.gender || 'male',
        phone: customer.phone || '',
        cell: customer.cell || '',
        streetNumber: customer.location.street?.number?.toString() || '',
        streetName: customer.location.street?.name || '',
        city: customer.location.city || '',
        state: customer.location.state || '',
        country: customer.location.country || '',
        postcode: customer.location.postcode || '',
      });
    } else {
      // Reset form for new customer
      setFormData({
        title: 'Mr',
        firstName: '',
        lastName: '',
        email: '',
        username: '',
        gender: 'male',
        phone: '',
        cell: '',
        streetNumber: '',
        streetName: '',
        city: '',
        state: '',
        country: '',
        postcode: '',
      });
    }
    setErrors({});
    setError(null);
  }, [customer, open]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!isEditing && !formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (formData.phone && !/^\d{10,15}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (formData.streetNumber && !/^\d+$/.test(formData.streetNumber)) {
      newErrors.streetNumber = 'Street number must be a number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
    
    // Clear error for this field when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isEditing && customer) {
        // Update existing customer
        const updateData: UpdateUserRequest = {
          name: {
            title: formData.title,
            first: formData.firstName,
            last: formData.lastName,
          },
          email: formData.email,
          gender: formData.gender,
          phone: formData.phone,
          cell: formData.cell,
          location: {
            street: {
              number: formData.streetNumber ? parseInt(formData.streetNumber, 10) : undefined,
              name: formData.streetName,
            },
            city: formData.city,
            state: formData.state,
            country: formData.country,
            postcode: formData.postcode,
          },
        };

        await usersApiService.updateUser(customer.login.uuid, updateData);
      } else {
        // Create new customer
        const createData: CreateUserRequest = {
          email: formData.email,
          login: {
            username: formData.username,
            password: 'defaultPassword123', // You might want to make this configurable
          },
          name: {
            title: formData.title,
            first: formData.firstName,
            last: formData.lastName,
          },
          gender: formData.gender,
          location: {
            street: {
              number: formData.streetNumber ? parseInt(formData.streetNumber, 10) : 0,
              name: formData.streetName,
            },
            city: formData.city,
            state: formData.state,
            country: formData.country,
            postcode: formData.postcode,
          },
        };

        await usersApiService.createUser(createData);
      }

      onSave();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save customer');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const getInitials = () => {
    return `${formData.firstName.charAt(0)}${formData.lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '600px' }
      }}
    >
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {isEditing ? 'Edit Customer' : 'Add New Customer'}
          </Typography>
          <IconButton onClick={handleClose} disabled={loading}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Avatar
            src={customer?.picture?.large}
            sx={{ width: 80, height: 80, mx: 'auto', mb: 1 }}
          >
            {formData.firstName && formData.lastName ? getInitials() : <PersonIcon />}
          </Avatar>
          <Typography variant="body2" color="text.secondary">
            {isEditing ? 'Customer Profile' : 'New Customer'}
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Personal Information
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Title"
                  value={formData.title}
                  onChange={handleInputChange('title')}
                  size="small"
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={formData.firstName}
                  onChange={handleInputChange('firstName')}
                  error={Boolean(errors.firstName)}
                  helperText={errors.firstName}
                  required
                  size="small"
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={formData.lastName}
                  onChange={handleInputChange('lastName')}
                  error={Boolean(errors.lastName)}
                  helperText={errors.lastName}
                  required
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  error={Boolean(errors.email)}
                  helperText={errors.email}
                  required
                  size="small"
                />
              </Grid>
              {!isEditing && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Username"
                    value={formData.username}
                    onChange={handleInputChange('username')}
                    error={Boolean(errors.username)}
                    helperText={errors.username}
                    required
                    size="small"
                  />
                </Grid>
              )}
              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Gender</FormLabel>
                  <RadioGroup
                    row
                    value={formData.gender}
                    onChange={handleInputChange('gender')}
                  >
                    <FormControlLabel value="male" control={<Radio />} label="Male" />
                    <FormControlLabel value="female" control={<Radio />} label="Female" />
                  </RadioGroup>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={formData.phone}
                  onChange={handleInputChange('phone')}
                  error={Boolean(errors.phone)}
                  helperText={errors.phone}
                  size="small"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Cell Phone"
                  value={formData.cell}
                  onChange={handleInputChange('cell')}
                  size="small"
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Address Information
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Street Number"
                  value={formData.streetNumber}
                  onChange={handleInputChange('streetNumber')}
                  error={Boolean(errors.streetNumber)}
                  helperText={errors.streetNumber}
                  size="small"
                />
              </Grid>
              <Grid item xs={8}>
                <TextField
                  fullWidth
                  label="Street Name"
                  value={formData.streetName}
                  onChange={handleInputChange('streetName')}
                  error={Boolean(errors.streetName)}
                  helperText={errors.streetName}
                  size="small"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="City"
                  value={formData.city}
                  onChange={handleInputChange('city')}
                  error={Boolean(errors.city)}
                  helperText={errors.city}
                  size="small"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="State/Province"
                  value={formData.state}
                  onChange={handleInputChange('state')}
                  error={Boolean(errors.state)}
                  helperText={errors.state}
                  size="small"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Country"
                  value={formData.country}
                  onChange={handleInputChange('country')}
                  error={Boolean(errors.country)}
                  helperText={errors.country}
                  size="small"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Postal Code"
                  value={formData.postcode}
                  onChange={handleInputChange('postcode')}
                  error={Boolean(errors.postcode)}
                  helperText={errors.postcode}
                  size="small"
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : undefined}
        >
          {loading ? 'Saving...' : isEditing ? 'Update Customer' : 'Add Customer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
