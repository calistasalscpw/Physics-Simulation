import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Ensure this component exists, or use a simple <div> for now
// import { RouteLoader } from './common-components/PageLoader'; 
import routes from './App.routes';

const App: React.FC = () => {
  // Now routes() works because we updated App.routes.tsx to export a function
  const router = React.useMemo(() => createBrowserRouter(routes()), []);

  return (
    // <React.Suspense fallback={<RouteLoader />}>
      <RouterProvider router={router} />
    // </React.Suspense>
  );
};

export default App;