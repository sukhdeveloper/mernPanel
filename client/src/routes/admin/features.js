import React, { lazy } from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';

const Tables = lazy(() => import('./table'));
const FormLayouts = lazy(() => import('../../container/forms/FormLayout'));
const FormElements = lazy(() => import('../../container/forms/FormElements'));
const FormComponents = lazy(() => import('../../container/forms/FormComponents'));
const FormValidation = lazy(() => import('../../container/forms/FormValidation'));
const Editors = lazy(() => import('../../container/pages/Editor'));
const Banners = lazy(() => import('../../container/pages/Banners'));
const Components = lazy(() => import('./components'));
const Maps = lazy(() => import('./maps'));
const Icons = lazy(() => import('./icons'));
const Charts = lazy(() => import('./charts'));
const Testimonials = lazy(() => import('../../container/pages/Testimonials'));
const Import = lazy(() => import('../../container/importExport/Import'));
const Export = lazy(() => import('../../container/importExport/Export'));
const ImportTrends = lazy(() => import('../../container/trends/Import'));
const ExportTrends = lazy(() => import('../../container/trends/Export'));
const AddTrends = lazy(() => import('../../container/trends/AddTrends'));
const EditTrends = lazy(() => import('../../container/trends/EditTrend'));
const AddWarriors = lazy(() => import ('../../container/mern2-warrior/AddWarriors'));

const AllWarriors = lazy(() => import ('../../container/mern2-warrior/ViewWarriors'));
const EditWarrior = lazy(() => import ('../../container/mern2-warrior/EditWarrior'));
const ActivateWarrior = lazy(() => import ('../../container/mern2-warrior/ActivateWarrior'));
const LeaderBoard =  lazy(() => import ('../../container/mern2-warrior/LeaderBoard'));

const UploadMedia =  lazy(() => import ('../../container/upload/UploadMedia'));

const TrafficStats = lazy(() => import ('../../container/traffics/TrafficStats'));
const TrafficListing = lazy(() => import ('../../container/traffics/TrafficListing'));

const AddNewEvents = lazy(() => import ('../../container/event/AddEvent'));
const AllEvents =  lazy(() => import ('../../container/event/AllEvents'));

const AllTransactions = lazy(() => import ('../../container/transactions/Transactions'));
const AllSubscribers = lazy(() => import ('../../container/subscribers/Subscribers'));

const Enquiries = lazy(() => import ('../../container/enquiries/Enquiries'));
const CreateAnalyticReport = lazy(() => import ('../../container/reports/CreateAnalyticsReport'));
const ViewAnalyticReport = lazy(() => import ('../../container/reports/ViewAnalyticsReports'));
const CreateAiReport = lazy(() => import ('../../container/reports/CreateAIReports'));

const SidebarTrends = lazy(() => import ('../../container/sidebar/Sidebar'));

const FeaturesRoute = () => {
  const { path } = useRouteMatch();
  return (
    <Switch>
      <Route path={`${path}/editor`} component={Editors} />
      <Route path={`${path}/banners`} component={Banners} />
      <Route path={`${path}/components`} component={Components} />
      <Route path={`${path}/maps`} component={Maps} />
      <Route path={`${path}/icons`} component={Icons} />
      <Route path={`${path}/charts`} component={Charts} />
      <Route path={`${path}/tables`} component={Tables} />
      <Route path={`${path}/form-layout`} component={FormLayouts} />
      <Route path={`${path}/form-elements`} component={FormElements} />
      <Route path={`${path}/form-components`} component={FormComponents} />
      <Route path={`${path}/form-validation`} component={FormValidation} />
      <Route path={`${path}/testimonials`} component={Testimonials} />
      <Route path={`${path}/importExport/import`} component={Import} />
      <Route path={`${path}/importExport/export`} component={Export} />
      <Route path={`${path}/trends/import`} component={ImportTrends} />
      <Route path={`${path}/trends/all`} component={ExportTrends} />
      <Route path={`${path}/trends/add-trend`} component={AddTrends} />
      <Route path={`${path}/trends/edit-trend/:id`} component={EditTrends} />
      <Route path={`${path}/mern2-warrior/add-warrior`} component={AddWarriors} />

      <Route path={`${path}/mern2-warrior/edit-warrior/:id`} component={EditWarrior} />
      <Route path={`${path}/mern2-warrior/all`} component={AllWarriors} />
      <Route path={`${path}/mern2-warrior/activate-warrior`} component={ActivateWarrior} />
      <Route path={`${path}/mern2-warrior/leader-board`} component={LeaderBoard} />
      <Route path={`${path}/upload/upload-media`} component={UploadMedia} />

      <Route path={`${path}/traffic/traffic-stats`} component={TrafficStats} />
      <Route path={`${path}/traffic/traffic-listing`} component={TrafficListing} />
      
      <Route path={`${path}/event/add-new`} component={AddNewEvents} />
      <Route path={`${path}/event/all`} component={AllEvents} />
      <Route path={`${path}/transactions`} component={AllTransactions} />
      <Route path={`${path}/subscribers`} component={AllSubscribers} />
      <Route path={`${path}/enquiries`} component={Enquiries} />
      <Route path={`${path}/reports/create-analytics-report`} component={CreateAnalyticReport} />
      <Route path={`${path}/reports/all`} component={ViewAnalyticReport} />
      <Route path={`${path}/reports/create-ai-report`} component={CreateAiReport} />
      <Route path={`${path}/sidebar`} component={SidebarTrends} />

    </Switch>
  );
};

export default FeaturesRoute;
