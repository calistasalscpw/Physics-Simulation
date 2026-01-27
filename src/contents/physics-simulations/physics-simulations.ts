/**
 * Physics Utilities for Newton's Third Law Simulations
 * All forces are calculated once and shared between objects
 * This ensures force symmetry at the logic level
 */

export interface Vector2D {
  x: number;
  y: number;
}

export const Vector = {
  normalize: (v: Vector2D): Vector2D => {
    const length = Math.sqrt(v.x * v.x + v.y * v.y);
    if (length === 0) return { x: 0, y: 0 };
    return { x: v.x / length, y: v.y / length };
  },
  scale: (v: Vector2D, scalar: number): Vector2D => ({
    x: v.x * scalar,
    y: v.y * scalar,
  }),
  invert: (v: Vector2D): Vector2D => ({
    x: -v.x,
    y: -v.y,
  }),
  magnitude: (v: Vector2D): number => Math.sqrt(v.x * v.x + v.y * v.y),
};

export const HammerNail = {
  /**
   * Calculate impulse (J = m * v)
   */
  calculateImpulse: (mass: number, velocity: number): number => {
    return Math.abs(mass * velocity);
  },

  /**
   * Calculate penetration depth (pixels) based on impulse.
   * Visual scaling factor adjusted for the canvas size.
   */
  calculatePenetrationDepth: (impulse: number): number => {
    // Max depth approx 60px for heavy/fast combination
    return Math.min(impulse * 0.8, 60); 
  },

  /**
   * Calculate the visual length of the force arrow based on impulse.
   */
  calculateForceMagnitude: (impulse: number): number => {
    return Math.max(Math.min(impulse * 1.5, 150), 50);
    }

};


// /**
//  * Physics Utilities for Newton's Third Law Simulations
//  * All forces are calculated once and shared between objects
//  * This ensures force symmetry at the logic level
//  */

// /**
//  * Vector operations for force calculations
//  */
// export interface Vector2D {
//   x: number;
//   y: number;
// }

// export const Vector = {
//   /**
//    * Normalize a vector to unit length
//    */
//   normalize: (v: Vector2D): Vector2D => {
//     const length = Math.sqrt(v.x * v.x + v.y * v.y);
//     if (length === 0) return { x: 0, y: 0 };
//     return { x: v.x / length, y: v.y / length };
//   },

//   /**
//    * Scale a vector by a scalar
//    */
//   scale: (v: Vector2D, scalar: number): Vector2D => ({
//     x: v.x * scalar,
//     y: v.y * scalar,
//   }),

//   /**
//    * Invert a vector (negate both components)
//    */
//   invert: (v: Vector2D): Vector2D => ({
//     x: -v.x,
//     y: -v.y,
//   }),

//   /**
//    * Get magnitude of a vector
//    */
//   magnitude: (v: Vector2D): number =>
//     Math.sqrt(v.x * v.x + v.y * v.y),

//   /**
//    * Distance between two points
//    */
//   distance: (a: Vector2D, b: Vector2D): number => {
//     const dx = b.x - a.x;
//     const dy = b.y - a.y;
//     return Math.sqrt(dx * dx + dy * dy);
//   },
// };

// /**
//  * Contact Force Calculations (Hammer & Nail)
//  * Impulse = mass × velocity
//  * Force is proportional to impulse magnitude
//  */

// export const HammerNail = {
//   /**
//    * Calculate impulse from hammer (mass × velocity)
//    * Returns the magnitude of force applied
//    */
//   calculateImpulse: (mass: number, velocity: number): number => {
//     return Math.abs(mass * velocity);
//   },

//   /**
//    * Calculate contact force
//    * Force is derived from the impulse and impacts the nail
//    * Returns: { force: magnitude, direction }
//    * The hammer force points to the right (direction of impact)
//    */
//   calculateContactForce: (
//     hammerMass: number,
//     hammerVelocity: number
//   ): { force: number; direction: Vector2D } => {
//     const impulse = HammerNail.calculateImpulse(hammerMass, hammerVelocity);
//     // Scale impulse to a reasonable force value for visualization
//     const force = impulse * 0.5;
//     return {
//       force,
//       direction: { x: 1, y: 0 }, // Direction of hammer impact
//     };
//   },

//   /**
//    * Calculate nail penetration depth based on impulse
//    * Deeper penetration for larger impulses
//    */
//   calculatePenetrationDepth: (impulse: number): number => {
//     // Penetration scales with impulse
//     // Cap at reasonable maximum (e.g., 50 pixels)
//     return Math.min(impulse * 0.03, 50);
//   },
// };

// /**
//  * Gravitational Force Calculations (Earth & Moon)
//  * Newton's Law of Universal Gravitation: F = G * m1 * m2 / r^2
//  */

// const GRAVITATIONAL_CONSTANT = 1; // Normalized for simulation
// const EARTH_MASS_BASE = 5.972e24; // kg
// const MOON_MASS_BASE = 7.342e22; // kg
// const EARTH_MOON_DISTANCE = 3.844e8; // meters

// export const EarthMoon = {
//   /**
//    * Get actual mass value from multiplier
//    * multiplier: 0.5, 1, 1.5, 2
//    */
//   getEarthMass: (multiplier: number): number => EARTH_MASS_BASE * multiplier,
//   getMoonMass: (multiplier: number): number => MOON_MASS_BASE * multiplier,

//   /**
//    * Calculate gravitational force between two bodies
//    * F = G * m1 * m2 / r^2
//    * Returns the magnitude of force
//    */
//   calculateGravitationalForce: (
//     mass1: number,
//     mass2: number,
//     distance: number
//   ): number => {
//     if (distance <= 0) return 0;
//     return (GRAVITATIONAL_CONSTANT * mass1 * mass2) / (distance * distance);
//   },

//   /**
//    * Calculate orbital velocity from distance
//    * v = sqrt(G * M / r)
//    * where M is the primary body mass
//    */
//   calculateOrbitalVelocity: (
//     primaryMass: number,
//     distance: number
//   ): number => {
//     if (distance <= 0) return 0;
//     return Math.sqrt((GRAVITATIONAL_CONSTANT * primaryMass) / distance);
//   },

//   /**
//    * Get force direction (unit vector pointing from source to target)
//    */
//   getForceDirection: (from: Vector2D, to: Vector2D): Vector2D => {
//     const dx = to.x - from.x;
//     const dy = to.y - from.y;
//     return Vector.normalize({ x: dx, y: dy });
//   },

//   /**
//    * Scale distance (in pixels) to normalized distance value
//    * for force calculations
//    */
//   pixelsToDistance: (pixels: number): number => {
//     // Normalize pixel distance to a reasonable scale
//     // 300 pixels = 1 unit distance
//     return Math.max(pixels / 300, 0.5);
//   },

//   /**
//    * Scale force magnitude to arrow length (pixels)
//    */
//   forceToArrowLength: (force: number): number => {
//     // Scale down the force for visualization
//     // Cap at reasonable maximum
//     return Math.min(Math.sqrt(force) * 0.5, 100);
//   },
// };
