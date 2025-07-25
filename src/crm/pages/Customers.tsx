import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CustomersDataTable from '../components/CustomersDataTable';
import CustomerModal from '../components/CustomerModal';
import { User } from '../services/usersApi';

export default function Customers() {
  const [modalOpen, setModalOpen] = React.useState(false);
  const [selectedCustomer, setSelectedCustomer] = React.useState<User | null>(null);
  const [refreshKey, setRefreshKey] = React.useState(0);

  const handleEditCustomer = (customer: User) => {
    setSelectedCustomer(customer);
    setModalOpen(true);
  };

  const handleAddCustomer = () => {
    setSelectedCustomer(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedCustomer(null);
  };

  const handleSaveCustomer = () => {
    // Refresh the data table by updating the key
    setRefreshKey(prev => prev + 1);
  };

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
        Customers Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Manage your customer database with advanced search, filtering, and editing capabilities.
      </Typography>
      
      <Box sx={{ height: 'calc(100vh - 200px)', minHeight: '500px' }}>
        <CustomersDataTable
          key={refreshKey}
          onEditCustomer={handleEditCustomer}
          onAddCustomer={handleAddCustomer}
        />
      </Box>

      <CustomerModal
        open={modalOpen}
        onClose={handleCloseModal}
        customer={selectedCustomer}
        onSave={handleSaveCustomer}
      />
    </Box>
  );
}
