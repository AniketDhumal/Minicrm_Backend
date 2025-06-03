import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Tabs, 
  Tab, 
  Typography, 
  Button, 
  CircularProgress,
  Grid,
  Paper,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCampaigns, fetchCampaignStats } from '../store/actions/campaignActions';
import CampaignForm from '../components/campaigns/CampaignForm';
import CampaignList from '../components/campaigns/CampaignList';
import CampaignStats from '../components/campaigns/CampaignStats';
import { Add } from '@mui/icons-material';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Campaigns = () => {
  const [tabValue, setTabValue] = useState(0);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { campaigns, stats, status, error } = useSelector(state => state.campaigns);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchCampaigns());
    dispatch(fetchCampaignStats());
  }, [dispatch]);

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    setTabValue(1);
    dispatch(fetchCampaigns());
    dispatch(fetchCampaignStats());
  };

  if (status === 'loading' && campaigns.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4">Campaign Management</Typography>
        {!showCreateForm && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setShowCreateForm(true)}
          >
            New Campaign
          </Button>
        )}
      </Box>

      {showCreateForm ? (
        <Paper sx={{ p: 4, mb: 4 }}>
          <CampaignForm onSuccess={handleCreateSuccess} />
        </Paper>
      ) : (
        <>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="Overview" />
            <Tab label="Campaign History" />
          </Tabs>
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <CampaignStats stats={stats} />
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Quick Actions
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{ mb: 2 }}
                    onClick={() => setShowCreateForm(true)}
                  >
                    Create Campaign
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate('/customers')}
                  >
                    View Customers
                  </Button>
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <CampaignList campaigns={campaigns} />
          </TabPanel>
        </>
      )}
    </Box>
  );
};

export default Campaigns;