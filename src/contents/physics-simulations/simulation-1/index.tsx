import React, { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import NewtonsThirdLawSimulation from './NewtonsThirdLawSimulation';
import GravitySimulation from './GravitySimulation';

// ==================== TAB PANEL COMPONENT ====================

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = (props) => {
  const { children, value, index } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`scenario-tabpanel-${index}`}
      aria-labelledby={`scenario-tab-${index}`}
      style={{ width: '100%', height: value === index ? '100vh' : 0 }}
    >
      {value === index && <Box sx={{ height: '100%' }}>{children}</Box>}
    </div>
  );
};

// ==================== MAIN COMPONENT ====================

const ForceLabSimulation: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header with Tabs */}
      <Box
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: '#F8F9FA',
          px: 2,
        }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="Scenario tabs"
          sx={{
            '& .MuiTab-root': {
              fontSize: '1.1rem',
              fontWeight: 600,
              color: '#666666',
              '&.Mui-selected': {
                color: '#8B5CF6',
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#8B5CF6',
            },
          }}
        >
          <Tab label="Example 1: Contact Force" id="scenario-tab-0" />
          <Tab label="Example 2: Non-Contact Force" id="scenario-tab-1" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <TabPanel value={tabValue} index={0}>
          <NewtonsThirdLawSimulation />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <GravitySimulation />
        </TabPanel>
      </Box>
    </Box>
  );
};

export default ForceLabSimulation;