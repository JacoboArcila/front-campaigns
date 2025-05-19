import { Routes, Route } from 'react-router-dom';

import Home from '@pages/Home/Home.jsx';
import NotFound from '@pages/NotFound';

import { ROUTES } from '@constants/routes';
import Layout from '@components/layout/Layout';

const AppRoutes = () => {
  return (
    <Layout>
      <Routes>
        <Route path={ROUTES.HOME} element={<Home />} />
        <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
      </Routes>
    </Layout>
  );
};

export default AppRoutes;
