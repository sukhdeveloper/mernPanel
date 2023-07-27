import React, { lazy, Suspense } from 'react';
import { Row, Col, Skeleton } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Cards } from '../../components/cards/frame/cards-frame';
import { Button } from '../../components/buttons/buttons';
import { Main } from '../styled';
import { ShareButtonPageHeader } from '../../components/buttons/share-button/share-button';
import { ExportButtonPageHeader } from '../../components/buttons/export-button/export-button';
import { CalendarButtonPageHeader } from '../../components/buttons/calendar-button/calendar-button';
// import MostSearchedKeywords from './most-searched-keywords/MostSearchedKeywords';
const TopTenLinks = lazy(() => import('./overview/index/TopTenLinks'));
const TwitterOverview = lazy(() => import('./overview/index/TwitterOverview'));
const InstagramOverview = lazy(() => import('./overview/index/InstagramOverview'));
const LinkedinKeyMetrics = lazy(() => import('./overview/index/LinkedinKeyMetrics'));
const SocialTrafficMetrics = lazy(() => import('./overview/index/SocialTrafficMetrics'));
const MostSavedPosts = lazy(() => import('./overview/index/MostSavedPosts'));
const SessionsbyRegion = lazy(() => import('./overview/performance/SessionsbyRegion'));
const ProfessionWiseTrends = lazy(() => import('./profession-wise-trends/ProfessionWiseTrends'));

const DashboardOverview = lazy(() => import('../dashboard/DashboardOverview'));
const ChartJs = lazy(() => import('../charts/ChartJs'));
import {
  ChartjsBarChart,
  ChartjsHorizontalChart,
  ChartjsStackedChart,
  ChartjsLineChart,
  ChartjsAreaChart,
  ChartjsBarChartTransparent,
  ChartjsDonutChart,
  ChartjsPieChart,
} from '../../components/charts/chartjs';
const Dashboard = () => {
  return (
    <>
      <PageHeader
        ghost
        title="The Admin Dashboard "
        // buttons={[
        //   <div key="6" className="page-header-actions">
        //     <CalendarButtonPageHeader key="1" />
        //     <ExportButtonPageHeader key="2" />
        //     <ShareButtonPageHeader key="3" />
        //     <Button size="small" key="4" type="primary">
        //       <FeatherIcon icon="plus" size={14} />
        //       Add New
        //     </Button>
        //   </div>,
        // ]}
      />
      <Main>
        <Row justify="center" gutter={25}>
          <Col xxl={24} md={24} xs={24}>
            <DashboardOverview />
          </Col>
          {/* <Col xxl={24} xl={24} md={24} sm={24} xs={24}>
            <Suspense
              fallback={
                <Cards headless>
                  <Skeleton active />
                </Cards>
              }
            >
              <SessionsbyRegion />
            </Suspense>
          </Col> */}
          <Col xxl={24} xl={24} md={24} sm={24} xs={24}>
            <Suspense
              fallback={
                <Cards headless>
                  <Skeleton active />
                </Cards>
              }
            >
              <Cards title="Industries Or Profession Wise Trends">
                <ProfessionWiseTrends />
              </Cards>
            </Suspense>
          </Col>
          {/* <Col xxl={12} xl={12} md={12} sm={24} xs={24}>
            <Suspense
              fallback={
                <Cards headless>
                  <Skeleton active />
                </Cards>
              }
            >
               <p>Most Searched Key</p>
            </Suspense>
          </Col> */}
          <Col xxl={8} xl={8} xs={24}>
            <Suspense
              fallback={
                <Cards headless>
                  <Skeleton active />
                </Cards>
              }
            >
              <SocialTrafficMetrics />
            </Suspense>
          </Col>
          <Col xxl={8} xl={8} xs={24}>
            <Suspense
              fallback={
                <Cards headless>
                  <Skeleton active />
                </Cards>
              }
            >
              <TopTenLinks />
            </Suspense>
          </Col>
          <Col xxl={8} xl={8} xs={24}>
            <Suspense
              fallback={
                <Cards headless>
                  <Skeleton active />
                </Cards>
              }
            >
              <MostSavedPosts />
            </Suspense>
          </Col>

          <Col xxl={8} md={8} xs={24}>
            <Suspense
              fallback={
                <Cards headless>
                  <Skeleton active />
                </Cards>
              }
            >
              <TwitterOverview />
            </Suspense>
          </Col>
          <Col xxl={8} md={8} xs={24}>
            <Suspense
              fallback={
                <Cards headless>
                  <Skeleton active />
                </Cards>
              }
            >
              <InstagramOverview />
            </Suspense>
          </Col>
          <Col xxl={8} md={8} xs={24}>
            <Suspense
              fallback={
                <Cards headless>
                  <Skeleton active />
                </Cards>
              }
            >
              <LinkedinKeyMetrics />
            </Suspense>
          </Col>

          <Col xxl={12} md={12} xs={24}>
            <Suspense
              fallback={
                <Cards headless>
                  <Skeleton active />
                </Cards>
              }
            >
              <Cards title="Trend Per Category" size="large" more={false}>
                <ChartjsStackedChart
                  datasets={[
                    {
                      data: [10, 40, 30, 40, 60, 55, 45, 35, 30, 20, 15, 20],
                      backgroundColor: '#35394d',
                      barPercentage: 0.6,
                    },
                    {
                      data: [15, 40, 30, 40, 60, 55, 45, 35, 30, 20, 15, 20],
                      backgroundColor: '#5F63F2',
                      barPercentage: 0.6,
                    },
                  ]}
                />
              </Cards>
            </Suspense>
          </Col>
          <Col xxl={12} md={12} xs={24}>
            <Suspense
              fallback={
                <Cards headless>
                  <Skeleton active />
                </Cards>
              }
            >
              <Cards title="Traffic Per Category" size="large" more={false}>
                <ChartjsStackedChart
                  datasets={[
                    {
                      data: [10, 40, 30, 40, 60, 55, 45, 35, 30, 20, 15, 20],
                      backgroundColor: '#5F63F2',
                      barPercentage: 0.6,
                    },
                    {
                      data: [10, 40, 30, 40, 60, 55, 45, 35, 30, 20, 15, 20],
                      backgroundColor: '#35394d',
                      barPercentage: 0.6,
                    },
                  ]}
                />
              </Cards>
            </Suspense>
          </Col>
        </Row>
      </Main>
    </>
  );
};

export default Dashboard;
