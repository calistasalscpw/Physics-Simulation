import React from 'react';
import { Box, Slider, Typography, Paper } from '@mui/material';

interface ControlSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  marks?: Array<{ value: number; label: string }>;
}

const ControlSlider: React.FC<ControlSliderProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  step = 0.1,
  marks,
}) => {
  return (
    <Paper elevation={0} sx={{ p: 3, border: '2px solid #C4B5FD', borderRadius: '16px' }}>
      <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
        {label}
      </Typography>
      <Slider
        value={value}
        onChange={(_, newValue) => onChange(newValue as number)}
        min={min}
        max={max}
        step={step}
        marks={marks}
        valueLabelDisplay="auto"
        sx={{
          color: '#C4B5FD',
          '& .MuiSlider-thumb': {
            backgroundColor: '#8B5CF6',
            '&:hover': {
              boxShadow: '0 0 0 8px rgba(139, 92, 246, 0.16)',
            },
          },
          '& .MuiSlider-track': {
            backgroundColor: '#C4B5FD',
          },
          '& .MuiSlider-rail': {
            backgroundColor: '#E5E7EB',
          },
        }}
      />
    </Paper>
  );
};

export default ControlSlider;
