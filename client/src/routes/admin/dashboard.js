import React, { lazy } from 'react';
import { Switch, Route } from 'react-router-dom';
import { useRouteMatch } from 'react-router-dom/cjs/react-router-dom.min';

const Dashboard = lazy(() => import('../../container/dashboard'));
const mern2WarriorDashboard = lazy(() => import('../../container/dashboard/mern2warrior'));
const Ecommerce = lazy(() => import('../../container/dashboard/Ecommerce'));
const Business = lazy(() => import('../../container/dashboard/Business'));
const Performance = lazy(() => import('../../container/dashboard/Performance'));
const CRM = lazy(() => import('../../container/dashboard/CRM'));
const Sales = lazy(() => import('../../container/dashboard/Sales'));
const ComingSoon = lazy(() => import('../../container/pages/ComingSoon'));

const DashboardRoutes = () => {
  const { path } = useRouteMatch();
  return (
    <Switch>
      {/* <Route exact path={path} component={Dashboard} /> */}
      <Route exact path={path} component={Dashboard} />
      <Route exact path={`${path}/mern2warrior`} component={mern2WarriorDashboard} />
      <Route path={`${path}/social`} component={Dashboard} />
      <Route exact path={`${path}/eco`} component={Ecommerce} />
      <Route exact path={`${path}/business`} component={Business} />
      <Route exact path={`${path}/performance`} component={Performance} />
      <Route exact path={`${path}/crm`} component={CRM} />
      <Route exact path={`${path}/sales`} component={Sales} />
    </Switch>
  );
};

export default DashboardRoutes;
