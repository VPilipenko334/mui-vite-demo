import * as React from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CrmCustomersTable from "../components/CrmCustomersTable";
import CrmEditUserModal from "../components/CrmEditUserModal";
import CrmStatCard from "../components/CrmStatCard";

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

export default function Customers() {
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);
  const [customerStats, setCustomerStats] = React.useState({
    total: 0,
    newThisMonth: 0,
    activeUsers: 0,
    averageAge: 0,
  });

  // Handle edit user
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  // Handle close modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
  };

  // Handle save user
  const handleSaveUser = (user: User) => {
    // Trigger refresh of the table
    setRefreshTrigger((prev) => prev + 1);
    handleCloseModal();
  };

  // Fetch customer statistics
  const fetchStats = React.useCallback(async () => {
    try {
      const response = await fetch(
        "https://user-api.builder-io.workers.dev/api/users?perPage=100",
      );
      const data = await response.json();

      if (data.data) {
        const users = data.data;
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const newThisMonth = users.filter((user: User) => {
          const registeredDate = new Date(user.registered.date);
          return (
            registeredDate.getMonth() === currentMonth &&
            registeredDate.getFullYear() === currentYear
          );
        }).length;

        const totalAge = users.reduce(
          (sum: number, user: User) => sum + user.dob.age,
          0,
        );
        const averageAge =
          users.length > 0 ? Math.round(totalAge / users.length) : 0;

        setCustomerStats({
          total: data.total || users.length,
          newThisMonth,
          activeUsers: users.length, // For demo purposes, assuming all are active
          averageAge,
        });
      }
    } catch (error) {
      console.error("Failed to fetch customer stats:", error);
    }
  }, []);

  // Fetch stats on mount and refresh
  React.useEffect(() => {
    fetchStats();
  }, [fetchStats, refreshTrigger]);

  // Sample stat cards data
  const statCardsData = [
    {
      title: "Total Customers",
      value: customerStats.total.toLocaleString(),
      interval: "All time",
      trend: "up" as const,
      trendValue: "+12%",
      data: Array.from({ length: 30 }, (_, i) =>
        Math.floor(
          customerStats.total * 0.7 + Math.random() * customerStats.total * 0.3,
        ),
      ),
    },
    {
      title: "New This Month",
      value: customerStats.newThisMonth.toString(),
      interval: "Current month",
      trend: "up" as const,
      trendValue: "+23%",
      data: Array.from({ length: 30 }, (_, i) =>
        Math.floor(
          customerStats.newThisMonth * 0.5 +
            Math.random() * customerStats.newThisMonth * 1.5,
        ),
      ),
    },
    {
      title: "Active Users",
      value: customerStats.activeUsers.toLocaleString(),
      interval: "Last 30 days",
      trend: "up" as const,
      trendValue: "+8%",
      data: Array.from({ length: 30 }, (_, i) =>
        Math.floor(
          customerStats.activeUsers * 0.8 +
            Math.random() * customerStats.activeUsers * 0.4,
        ),
      ),
    },
    {
      title: "Average Age",
      value: `${customerStats.averageAge} years`,
      interval: "Current cohort",
      trend: "down" as const,
      trendValue: "-2%",
      data: Array.from({ length: 30 }, (_, i) =>
        Math.floor(
          customerStats.averageAge * 0.9 +
            Math.random() * customerStats.averageAge * 0.2,
        ),
      ),
    },
  ];

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* Header with action buttons */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3, display: { xs: "none", sm: "flex" } }}
      >
        <Typography variant="h5" component="h2">
          Customer Management
        </Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            sx={{ mr: 1 }}
          >
            Add Customer
          </Button>
          <Button variant="outlined" startIcon={<AddRoundedIcon />}>
            Import CSV
          </Button>
        </Box>
      </Stack>

      {/* Stats Cards row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {statCardsData.map((card, index) => (
          <Grid key={index} item xs={12} sm={6} lg={3}>
            <CrmStatCard
              title={card.title}
              value={card.value}
              interval={card.interval}
              trend={card.trend}
              trendValue={card.trendValue}
              data={card.data}
            />
          </Grid>
        ))}
      </Grid>

      {/* Customers Table */}
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <CrmCustomersTable
            onEditUser={handleEditUser}
            key={refreshTrigger} // Force re-render when refreshTrigger changes
          />
        </Grid>
      </Grid>

      {/* Edit User Modal */}
      <CrmEditUserModal
        open={modalOpen}
        user={selectedUser}
        onClose={handleCloseModal}
        onSave={handleSaveUser}
      />
    </Box>
  );
}
