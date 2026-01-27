import type { RouteObject } from 'react-router-dom';
import simulationRoutes from './contents/contents.routes';

const routes = (): RouteObject[] => [
  {
    path: '/simulation',
    children: simulationRoutes,
  },
];

export default routes;