import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Typography,
  Stack,
  Paper,
} from '@mui/material';
import { Refresh } from '@mui/icons-material';
import { HammerNail, Vector2D } from '../physics-simulations';


// ==================== TYPES ====================

type SimulationState = 'idle' | 'swinging' | 'contact' | 'pause' | 'resetting';

interface AnimationState {
  state: SimulationState;
  hammerAngle: number; // radians
  nailDepth: number;   // pixels
  maxDepth: number;    // target depth calculated from physics
  forceMagnitude: number;
}

// ==================== CONFIGURATION ====================

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const GROUND_Y = 450; // Y position where ground starts
const NAIL_X = 400;   // Center of canvas
// The Nail Head rests exactly at GROUND_Y initially
const NAIL_INITIAL_Y = GROUND_Y; 

// Hammer Physics Mapping
const MASS_MAP = { light: 1, medium: 5, heavy: 10 };
const SPEED_MAP = { slow: 1, medium: 5, fast: 10 }; // Multiplier for animation speed
const SWING_SPEED_RADS = { slow: 0.05, medium: 0.1, fast: 0.15 };

// Visual Constants
const HAMMER_PIVOT_X = 480; // Pivot point (Hand grip location)
const HAMMER_PIVOT_Y = 450; // Pivot point Y
const HAMMER_LENGTH = 200;  // Distance from pivot to head center
const HAMMER_IMPACT_ANGLE = Math.PI / 20; // horizontal, pointing left
// Initial hammer angle in radians (start ~120°). Change this value to
// experiment with different raised positions. Counter-clockwise swing
// is implemented by decreasing `hammerAngle` toward `HAMMER_IMPACT_ANGLE`.
const INITIAL_HAMMER_ANGLE = Math.PI / 5; // ~120deg

// ==================== COMPONENT ====================

const NewtonsThirdLawSimulation: React.FC = () => {
  // --- UI State ---
  const [massOption, setMassOption] = useState<'light' | 'medium' | 'heavy'>('medium');
  const [speedOption, setSpeedOption] = useState<'slow' | 'medium' | 'fast'>('medium');
  const [simState, setSimState] = useState<SimulationState>('idle'); // Sync for UI rendering

  // --- Animation Refs ---
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const hammerImgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
     const img = new Image();
    img.src = require('./assets/blue-hammer-design.png').default || require('./assets/blue-hammer-design.png');
    hammerImgRef.current = img;
    }, []);

  
  const physicsRef = useRef<AnimationState>({
    state: 'idle',
    hammerAngle: INITIAL_HAMMER_ANGLE, // Start ~120 degrees up
    nailDepth: 0,
    maxDepth: 0,
    forceMagnitude: 0,
  });

  // ==================== DRAWING LOGIC ====================

  /**
   * Procedurally draws the "Blue Hammer" to match the design provided.
   * Origin (0,0) is the center of the hammer head.
   */



  const drawHammerImage = (ctx: CanvasRenderingContext2D) => {
  const img = hammerImgRef.current;
  if (!img || !img.complete) return;

  const imgWidth = 260;
  const imgHeight = 300;

  ctx.save();
  ctx.scale(1, -1);

  ctx.drawImage(
    img,
    -imgWidth,
    -imgHeight / 2,
    imgWidth,
    imgHeight
  );

  ctx.restore();
};


  const drawScene = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { state, hammerAngle, nailDepth, forceMagnitude } = physicsRef.current;

    // 1. Clear & Background
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 2. Ground (Brown)
    ctx.fillStyle = '#CD7F32'; // Bronze/Brown
    ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);
    // Darker edge
    ctx.fillStyle = '#A0522D';
    ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, 10);

    // 3. Nail
    // Calculate nail position. If physics has depth, it sinks below GROUND_Y.
    // Visual logic: Nail head is at GROUND_Y - initialHeight + depth
    const nailHeight = 60;
    const nailHeadWidth = 20;
    const nailShaftWidth = 8;
    // Current Y of the top of the nail
    const NAIL_INITIAL_OFFSET = 50; // nail head above ground
    const currentNailY =  GROUND_Y - NAIL_INITIAL_OFFSET + nailDepth;


    ctx.save();
    ctx.fillStyle = '#A9A9A9'; // Silver/Grey
    
    // Shaft
    ctx.fillRect(NAIL_X - nailShaftWidth/2, currentNailY + 10, nailShaftWidth, nailHeight);
    // Head
    ctx.fillStyle = '#C0C0C0';
    ctx.fillRect(NAIL_X - nailHeadWidth/2, currentNailY, nailHeadWidth, 10);
    ctx.restore();

    // 4. Hammer
    ctx.save();
    // Translate to Pivot Point (Hand Grip)
    ctx.translate(HAMMER_PIVOT_X, HAMMER_PIVOT_Y);

    // Initial horizontal orientation (90deg)
    ctx.rotate(Math.PI / 2 + hammerAngle);

    // Draw hammer with handle at pivot
    drawHammerImage(ctx);

    ctx.restore();

    // 5. Force Arrows (Only in Contact/Pause)
    if (state === 'pause') {
      const contactX = NAIL_X;
        const contactY = currentNailY + 5; // exact nail head contact

        // F_N (nail on hammer) — UP
        drawArrow(
        ctx,
        contactX,
        contactY,
        { x: 0, y: -1 },
        forceMagnitude,
        '#FF0000',
        'F_N',
        'right'
        );

        // F_H (hammer on nail) — DOWN
        drawArrow(
        ctx,
        contactX,
        contactY,
        { x: 0, y: 1 },
        forceMagnitude,
        '#00C853',
        'F_H',
        'right'
        );

    }

  }, []);

  const drawArrow = (
    ctx: CanvasRenderingContext2D, 
    x: number, y: number, 
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

    // Label with subscript formatting (e.g., F_N → F<sub>N</sub>)
    ctx.fillStyle = 'black'; // Text is black as per design
    const textOffset = 20;
    
    // Label placement logic
    let labelX = endX + (labelAlign === 'right' ? textOffset : -textOffset - 20);
    let labelY = endY;
    
    // Adjust for vertical arrows
    if (dir.x === 0) {
      labelX = endX + 15;
      labelY = endY + (dir.y > 0 ? 10 : -5);
    }

    // Draw label with subscript: "F" at normal size, subscript at smaller size
    ctx.font = 'bold 24px Arial';
    ctx.fillText('F', labelX, labelY);
    
    // Draw subscript (smaller font, offset below baseline)
    ctx.font = 'bold 14px Arial';
    const subscriptChar = label === 'F_N' ? 'N' : 'H'; // Extract N or H from F_N or F_H
    ctx.fillText(subscriptChar, labelX + 16, labelY + 8); // Offset for subscript position
    
    ctx.restore();
  };

  // ==================== ANIMATION LOOP ====================

  const update = useCallback(() => {
    const phys = physicsRef.current;
    
    // State Machine
    switch (phys.state) {
      case 'idle':
        phys.hammerAngle = INITIAL_HAMMER_ANGLE; // Reset to raised position (~120 deg)
        // phys.nailDepth = 0;
        break;

      case 'swinging': {
        const speed = SWING_SPEED_RADS[speedOption];
        // For a counter-clockwise swing we decrease the angle until
        // it reaches the impact angle.
        phys.hammerAngle -= speed;

        if (phys.hammerAngle <= HAMMER_IMPACT_ANGLE) {
            // Impact!
            phys.state = 'contact';

            const mass = MASS_MAP[massOption];
            const impulse = HammerNail.calculateImpulse(mass, speed);
            const depth = HammerNail.calculatePenetrationDepth(impulse);

            phys.maxDepth += depth;          // cumulative hits
            phys.forceMagnitude = HammerNail.calculateForceMagnitude(impulse);

            setSimState('contact');
        }
        break;
        }


      case 'contact':
        // Animate the nail driving down instantly or quickly
        if (phys.nailDepth < phys.maxDepth) {
          phys.nailDepth += 5; // Drive speed
        } else {
          phys.nailDepth = phys.maxDepth;
          phys.state = 'pause'; // Wait here
          setSimState('pause'); // Update UI
        }
        break;

      case 'pause':
        // Do nothing, just render arrows
        break;

      case 'resetting':
        // Move hammer back up (return toward initial raised angle)
        phys.hammerAngle += 0.1;
        // Move nail back up
        if (phys.nailDepth > 0) phys.nailDepth -= 2;
        
        if (phys.hammerAngle >= INITIAL_HAMMER_ANGLE) {
          phys.state = 'idle';
          phys.nailDepth = 0;
          phys.hammerAngle = INITIAL_HAMMER_ANGLE;
          setSimState('idle'); // Update UI
        }
        break;
    }

    drawScene();
    rafRef.current = requestAnimationFrame(update);
  }, [drawScene, massOption, speedOption]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(update);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [update]);

  // ==================== HANDLERS ====================

  const handleHit = () => {
    physicsRef.current.state = 'swinging';
    setSimState('swinging');
    };


  const handleReset = () => {
  const phys = physicsRef.current;

    phys.state = 'idle';
    phys.hammerAngle = INITIAL_HAMMER_ANGLE;
    phys.nailDepth = 0;
    phys.maxDepth = 0;
    phys.forceMagnitude = 0;

    setSimState('idle');
    };


  // ==================== UI RENDER ====================

  return (
    <Box sx={{ width: '100%', height: '100vh', display: 'flex', bgcolor: '#F8F9FA' }}>
      
      {/* --- Left Control Panel --- */}
      <Box sx={{ flex: '0 0 320px', p: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
        
        {/* Hammer Mass */}
        <Paper elevation={0} sx={{ p: 3, border: '2px solid #C4B5FD', borderRadius: '16px' }}>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>Hammer Mass</Typography>
          <RadioGroup value={massOption} onChange={(e) => setMassOption(e.target.value as any)}>
            {['heavy', 'medium', 'light'].map((opt) => (
              <FormControlLabel 
                key={opt} value={opt} 
                control={<Radio sx={{ color: '#C4B5FD', '&.Mui-checked': { color: '#8B5CF6' } }} />} 
                label={opt.charAt(0).toUpperCase() + opt.slice(1)} 
              />
            ))}
          </RadioGroup>
        </Paper>

        {/* Swing Speed */}
        <Paper elevation={0} sx={{ p: 3, border: '2px solid #C4B5FD', borderRadius: '16px' }}>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>Swing Speed</Typography>
          <RadioGroup value={speedOption} onChange={(e) => setSpeedOption(e.target.value as any)}>
            {['fast', 'medium', 'slow'].map((opt) => (
              <FormControlLabel 
                key={opt} value={opt} 
                control={<Radio sx={{ color: '#C4B5FD', '&.Mui-checked': { color: '#8B5CF6' } }} />} 
                label={opt.charAt(0).toUpperCase() + opt.slice(1)} 
              />
            ))}
          </RadioGroup>
        </Paper>

        {/* Buttons */}
        <Stack direction="row" spacing={2} mt="auto">
          <Button 
            variant="contained" 
            fullWidth 
            onClick={handleHit}
            disabled={simState === 'swinging'}
            sx={{ 
              bgcolor: '#C4B5FD', 
              color: 'white', 
              py: 1.5,
              fontSize: '1.2rem',
              borderRadius: '12px',
              '&:hover': { bgcolor: '#8B5CF6' },
              '&:disabled': { bgcolor: '#E5E7EB' }
            }}
          >
            {simState === 'idle' || simState === 'pause' ? 'HIT' : 'UP'}
          </Button>
          <Button 
            variant="outlined" 
            onClick={handleReset}
            sx={{ 
              minWidth: '60px', 
              borderRadius: '12px',
              borderColor: '#000',
              color: '#000'
            }}
          >
            <Refresh />
          </Button>
        </Stack>
      </Box>

      {/* --- Main Simulation Area --- */}
      <Box sx={{ flex: 1, position: 'relative', bgcolor: '#FFFFFF', overflow: 'hidden' }}>
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />

        {/* --- Legend Overlay (Visible only on Pause) --- */}
        {simState === 'pause' && (
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
              zIndex: 10
            }}
          >
            {/* Variable Definitions */}
            <Box sx={{ border: '1px solid #E0E0E0', p: 2, mb: 2, borderRadius: '4px' }}>
              <Typography>
                <strong>F<sub>H</sub></strong> : Force exerted by the hammer on the nail
                </Typography>
                <Typography>
                <strong>F<sub>N</sub></strong> : Force exerted by the nail on the hammer
                </Typography>
            </Box>

            {/* Checklist */}
            <Box sx={{ border: '1px solid #E0E0E0', p: 2, borderRadius: '4px' }}>
              <Typography variant="body1" fontWeight="bold" gutterBottom>
                The forces F<sub>H</sub> and F<sub>N</sub> are:
              </Typography>
              <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.8' }}>
                <li>equal in magnitude</li>
                <li>acting in opposite directions</li>
                <li>not acting on the same object</li>
              </ul>
            </Box>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default NewtonsThirdLawSimulation;
