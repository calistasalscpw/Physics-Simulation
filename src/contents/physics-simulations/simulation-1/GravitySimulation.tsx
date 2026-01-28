import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Typography,
  Stack,
  Paper,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { PlayArrow, Pause as PauseIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import ControlSlider from './components/ControlSlider';
import { Vector2D } from '../physics-simulations';

// ==================== TYPES ====================

type GravitySimState = 'idle' | 'running' | 'paused';

interface AnimationState {
  state: GravitySimState;
  moonX: number;
  moonY: number;
  moonAngle: number;
  moonDistance: number;
  moonVelocity: number;
  forceMagnitude: number;
  pathPoints: Array<{ x: number; y: number }>;
}

// ==================== CONFIGURATION ====================

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

const EARTH_X = 400;
const EARTH_Y = 300;
const EARTH_RADIUS = 40;

const MOON_RADIUS = 15;
const MIN_DISTANCE = 150;
const MAX_DISTANCE = 400;
const INITIAL_DISTANCE = 280;

// Physics Constants
const MASS_MAP = { '0.5': 0.5, 'earth': 1, '1.5': 1.5, '2': 2 };
const GRAVITATIONAL_CONSTANT = 15000; // Adjusted for visualization

// ==================== COMPONENT ====================

const GravitySimulation: React.FC = () => {
  // --- UI State ---
  const [earthMass, setEarthMass] = useState<'0.5' | 'earth' | '1.5' | '2'>('earth');
  const [moonMass, setMoonMass] = useState<'0.5' | 'earth' | '1.5' | '2'>('0.5');
  const [simState, setSimState] = useState<GravitySimState>('idle');
  const [showForceArrows, setShowForceArrows] = useState(true);
  const [showOrbitalPath, setShowOrbitalPath] = useState(true);

  // --- Animation Refs ---
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);

  const physicsRef = useRef<AnimationState>({
    state: 'idle',
    moonX: EARTH_X + INITIAL_DISTANCE,
    moonY: EARTH_Y,
    moonAngle: 0,
    moonDistance: INITIAL_DISTANCE,
    moonVelocity: 0,
    forceMagnitude: 0,
    pathPoints: [],
  });

  // ==================== PHYSICS LOGIC ====================

  const calculateGravitationalForce = (earthMassVal: number, moonMassVal: number, distance: number): number => {
    if (distance <= 0) return 0;
    return (GRAVITATIONAL_CONSTANT * earthMassVal * moonMassVal) / (distance * distance);
  };

  const calculateOrbitalVelocity = (earthMassVal: number, distance: number): number => {
    if (distance <= 0) return 0;
    // v = sqrt(G * M / r)
    return Math.sqrt((GRAVITATIONAL_CONSTANT * earthMassVal) / distance);
  };

  // ==================== DRAWING LOGIC ====================

  const drawScene = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const phys = physicsRef.current;

    // 1. Clear & Background (Space)
    ctx.fillStyle = '#0B0E27';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Add some stars
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 50; i++) {
      const x = (i * 157) % CANVAS_WIDTH;
      const y = (i * 211) % CANVAS_HEIGHT;
      ctx.fillRect(x, y, 2, 2);
    }

    // 2. Orbital Path
    if (showOrbitalPath && phys.pathPoints.length > 1) {
      ctx.strokeStyle = 'rgba(200, 150, 255, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(phys.pathPoints[0].x, phys.pathPoints[0].y);
      for (let i = 1; i < phys.pathPoints.length; i++) {
        ctx.lineTo(phys.pathPoints[i].x, phys.pathPoints[i].y);
      }
      ctx.stroke();
    }

    // 3. Earth
    ctx.fillStyle = '#4A90E2';
    ctx.beginPath();
    ctx.arc(EARTH_X, EARTH_Y, EARTH_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#2E5C8A';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 4. Moon
    ctx.fillStyle = '#D3D3D3';
    ctx.beginPath();
    ctx.arc(phys.moonX, phys.moonY, MOON_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#A9A9A9';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 5. Force Arrows
    if (showForceArrows) {
      const contactX = phys.moonX;
      const contactY = phys.moonY;

      // F_E (Earth on Moon) — toward Earth
      const dirToEarth = {
        x: EARTH_X - phys.moonX,
        y: EARTH_Y - phys.moonY,
      };
      const dirMag = Math.sqrt(dirToEarth.x ** 2 + dirToEarth.y ** 2);
      const dirNorm = {
        x: dirToEarth.x / dirMag,
        y: dirToEarth.y / dirMag,
      };

      drawArrow(
        ctx,
        contactX,
        contactY,
        dirNorm,
        phys.forceMagnitude,
        '#FF6B6B',
        'F_E',
        'right'
      );

      // F_M (Moon on Earth) — toward Moon
      const dirToMoon = {
        x: phys.moonX - EARTH_X,
        y: phys.moonY - EARTH_Y,
      };
      const dirMag2 = Math.sqrt(dirToMoon.x ** 2 + dirToMoon.y ** 2);
      const dirNorm2 = {
        x: dirToMoon.x / dirMag2,
        y: dirToMoon.y / dirMag2,
      };

      drawArrow(
        ctx,
        EARTH_X,
        EARTH_Y,
        dirNorm2,
        phys.forceMagnitude,
        '#4ECDC4',
        'F_M',
        'left'
      );
    }

    // 6. Distance Label
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px Arial';
    ctx.fillText(
      `Distance: ${Math.round(phys.moonDistance)} px`,
      20,
      40
    );
  }, [showForceArrows, showOrbitalPath]);

  const drawArrow = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    dir: Vector2D,
    length: number,
    color: string,
    label: string,
    labelAlign: 'left' | 'right'
  ) => {
    const endX = x + dir.x * length;
    const endY = y + dir.y * length;
    const headSize = 15;

    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';

    // Shaft
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Arrowhead
    const angle = Math.atan2(dir.y, dir.x);
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX - headSize * Math.cos(angle - Math.PI / 6), endY - headSize * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(endX - headSize * Math.cos(angle + Math.PI / 6), endY - headSize * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();

    // Label
    ctx.fillStyle = 'white';
    const textOffset = 20;
    let labelX = endX + (labelAlign === 'right' ? textOffset : -textOffset - 20);
    let labelY = endY;

    ctx.font = 'bold 24px Arial';
    ctx.fillText('F', labelX, labelY);

    ctx.font = 'bold 14px Arial';
    const subscriptChar = label === 'F_E' ? 'E' : 'M';
    ctx.fillText(subscriptChar, labelX + 16, labelY + 8);

    ctx.restore();
  };

  // ==================== ANIMATION LOOP ====================

  const update = useCallback(() => {
    const phys = physicsRef.current;

    if (phys.state === 'running') {
      const earthMassVal = MASS_MAP[earthMass];
      const moonMassVal = MASS_MAP[moonMass];

      // Calculate gravitational force
      phys.forceMagnitude = calculateGravitationalForce(earthMassVal, moonMassVal, phys.moonDistance);

      // Calculate orbital velocity
      const orbitalSpeed = calculateOrbitalVelocity(earthMassVal, phys.moonDistance);
      phys.moonVelocity = orbitalSpeed * 0.1; // Scale for animation

      // Update moon position (circular orbit approximation)
      phys.moonAngle += phys.moonVelocity / phys.moonDistance;

      phys.moonX = EARTH_X + phys.moonDistance * Math.cos(phys.moonAngle);
      phys.moonY = EARTH_Y + phys.moonDistance * Math.sin(phys.moonAngle);

      // Record path
      if (phys.pathPoints.length > 500) {
        phys.pathPoints.shift();
      }
      phys.pathPoints.push({ x: phys.moonX, y: phys.moonY });
    }

    drawScene();
    rafRef.current = requestAnimationFrame(update);
  }, [earthMass, moonMass, drawScene]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(update);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [update]);

  // ==================== CANVAS INTERACTION ====================

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (CANVAS_WIDTH / rect.width);
    const y = (e.clientY - rect.top) * (CANVAS_HEIGHT / rect.height);

    const phys = physicsRef.current;
    const distToMoon = Math.sqrt((x - phys.moonX) ** 2 + (y - phys.moonY) ** 2);

    if (distToMoon < MOON_RADIUS + 10) {
      isDraggingRef.current = true;
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (CANVAS_WIDTH / rect.width);
    const y = (e.clientY - rect.top) * (CANVAS_HEIGHT / rect.height);

    const phys = physicsRef.current;
    let dx = x - EARTH_X;
    let dy = y - EARTH_Y;
    let distance = Math.sqrt(dx * dx + dy * dy);

    // Constrain distance
    distance = Math.max(MIN_DISTANCE, Math.min(MAX_DISTANCE, distance));

    phys.moonDistance = distance;
    phys.moonAngle = Math.atan2(dy, dx);
    phys.moonX = EARTH_X + distance * Math.cos(phys.moonAngle);
    phys.moonY = EARTH_Y + distance * Math.sin(phys.moonAngle);
  };

  const handleCanvasMouseUp = () => {
    isDraggingRef.current = false;
  };

  // ==================== HANDLERS ====================

  const handlePlay = () => {
    physicsRef.current.state = 'running';
    setSimState('running');
  };

  const handlePause = () => {
    physicsRef.current.state = 'paused';
    setSimState('paused');
  };

  const handleReset = () => {
    const phys = physicsRef.current;
    phys.state = 'idle';
    phys.moonX = EARTH_X + INITIAL_DISTANCE;
    phys.moonY = EARTH_Y;
    phys.moonAngle = 0;
    phys.moonDistance = INITIAL_DISTANCE;
    phys.moonVelocity = 0;
    phys.forceMagnitude = 0;
    phys.pathPoints = [];
    setSimState('idle');
  };

  // ==================== UI RENDER ====================

  return (
    <Box sx={{ width: '100%', height: '100vh', display: 'flex', bgcolor: '#F8F9FA' }}>
      {/* --- Left Control Panel --- */}
      <Box
        sx={{
          flex: '0 0 320px',
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          overflowY: 'auto',
        }}
      >
        {/* Earth Mass */}
        <ControlSlider
          label="Earth Mass"
          value={parseFloat(earthMass === 'earth' ? '1' : earthMass)}
          onChange={(val: number) => {
            const key = val === 1 ? 'earth' : val === 0.5 ? '0.5' : val === 1.5 ? '1.5' : '2';
            setEarthMass(key as any);
          }}
          min={0.5}
          max={2}
          step={0.5}
          marks={[
            { value: 0.5, label: '0.5x' },
            { value: 1, label: 'Earth' },
            { value: 1.5, label: '1.5x' },
            { value: 2, label: '2x' },
          ]}
        />

        {/* Moon Mass */}
        <ControlSlider
          label="Moon Mass"
          value={parseFloat(moonMass === 'earth' ? '1' : moonMass)}
          onChange={(val: number) => {
            const key = val === 1 ? 'earth' : val === 0.5 ? '0.5' : val === 1.5 ? '1.5' : '2';
            setMoonMass(key as any);
          }}
          min={0.5}
          max={2}
          step={0.5}
          marks={[
            { value: 0.5, label: '0.5x' },
            { value: 1, label: 'Earth' },
            { value: 1.5, label: '1.5x' },
            { value: 2, label: '2x' },
          ]}
        />

        {/* Checkboxes */}
        <Paper elevation={0} sx={{ p: 3, border: '2px solid #C4B5FD', borderRadius: '16px' }}>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
            Display Options
          </Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={showForceArrows}
                onChange={(e) => setShowForceArrows(e.target.checked)}
                sx={{ color: '#C4B5FD', '&.Mui-checked': { color: '#8B5CF6' } }}
              />
            }
            label="Force Arrows"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={showOrbitalPath}
                onChange={(e) => setShowOrbitalPath(e.target.checked)}
                sx={{ color: '#C4B5FD', '&.Mui-checked': { color: '#8B5CF6' } }}
              />
            }
            label="Orbital Path"
          />
        </Paper>

        {/* Buttons */}
        <Stack direction="row" spacing={2} mt="auto">
          <Button
            variant="contained"
            fullWidth
            onClick={handlePlay}
            disabled={simState === 'running'}
            sx={{
              bgcolor: '#C4B5FD',
              color: 'white',
              py: 1.5,
              fontSize: '1rem',
              borderRadius: '12px',
              '&:hover': { bgcolor: '#8B5CF6' },
              '&:disabled': { bgcolor: '#E5E7EB' },
            }}
          >
            <PlayArrow sx={{ marginRight: '8px' }} />
            PLAY
          </Button>
          <Button
            variant="contained"
            onClick={handlePause}
            disabled={simState !== 'running'}
            sx={{
              bgcolor: '#C4B5FD',
              color: 'white',
              py: 1.5,
              borderRadius: '12px',
              minWidth: '60px',
              '&:hover': { bgcolor: '#8B5CF6' },
              '&:disabled': { bgcolor: '#E5E7EB' },
            }}
          >
            <PauseIcon />
          </Button>
          <Button
            variant="outlined"
            onClick={handleReset}
            sx={{
              minWidth: '60px',
              borderRadius: '12px',
              borderColor: '#000',
              color: '#000',
            }}
          >
            <RefreshIcon />
          </Button>
        </Stack>
      </Box>

      {/* --- Main Simulation Area --- */}
      <Box sx={{ flex: 1, position: 'relative', bgcolor: '#FFFFFF', overflow: 'hidden' }}>
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            cursor: 'grab',
          }}
        />

        {/* --- Legend Overlay --- */}
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            top: 40,
            right: 40,
            width: 450,
            p: 3,
            borderRadius: '8px',
            border: '1px solid #E5E7EB',
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            zIndex: 10,
          }}
        >
          {/* Variable Definitions */}
          <Box sx={{ border: '1px solid #E0E0E0', p: 2, mb: 2, borderRadius: '4px' }}>
            <Typography>
              <strong>F<sub>E</sub></strong> : Gravitational force exerted by the Earth on the Moon
            </Typography>
            <Typography>
              <strong>F<sub>M</sub></strong> : Gravitational force exerted by the Moon on the Earth
            </Typography>
          </Box>

          {/* Checklist */}
          <Box sx={{ border: '1px solid #E0E0E0', p: 2, borderRadius: '4px' }}>
            <Typography variant="body1" fontWeight="bold" gutterBottom>
              The forces F<sub>E</sub> and F<sub>M</sub> are:
            </Typography>
            <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.8' }}>
              <li>equal in magnitude</li>
              <li>acting in opposite directions</li>
              <li>not acting on the same object</li>
            </ul>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default GravitySimulation;
