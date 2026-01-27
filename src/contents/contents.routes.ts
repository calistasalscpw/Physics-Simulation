import type { RouteObject } from 'react-router-dom';

const simulationRoutes: RouteObject[] = [
  {
    path: 'physics/newtons-third-law',
    lazy: async () => ({
      Component: (
        await import('./physics-simulations/simulation-1')
      ).default,
    }),
  },
];

export default simulationRoutes;
