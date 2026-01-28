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

export const Gravity = {
  /**
   * Newton's Law of Universal Gravitation
   * F = G * m1 * m2 / r^2
   */
  calculateForceMagnitude: (
    G: number,
    mass1: number,
    mass2: number,
    distance: number
  ): number => {
    if (distance <= 0) return 0;
    return (G * mass1 * mass2) / (distance * distance);
  },

  /**
   * Convert force magnitude into a visual arrow length.
   * Uses sqrt scaling to compress extreme values while preserving physics.
   * Common in scientific visualization (PhET, NASA sims).
   */
  forceToArrowLength: (
    force: number,
    scale = 120,
    min = 20,
    max = 180
  ): number => {
    return Math.min(Math.max(Math.sqrt(force) * scale, min), max);
  },
};
