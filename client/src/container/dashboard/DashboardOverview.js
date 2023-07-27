import React, { lazy } from 'react'
import { Row, Col, Skeleton, Progress } from "antd";
import { Cards } from "../../components/cards/frame/cards-frame";
import { PageHeader } from '../../components/page-headers/page-headers';
import { Main } from '../styled';
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


const CategoryChart = lazy(() => import('../charts/recharts/CategoryChart'));
const GenderInfo = lazy(() => import('../charts/recharts/GenderInfo'));

const DashboardOverview = () => {
    return (
        <Row justify="center" gutter={25} className="firstcharts-dashborad">
        <Col sm={24} xs={24} lg={12} xxl={12} md={12} style={{marginBottom:25}}>
          <Cards title="Users Information">
              <span className="label">
                <Progress percent={85} showInfo={false} />
                12k Active Users
              </span>
              <span className="label">
                <Progress percent={70} showInfo={false} />
                8k Free Subscribers
              </span>
              <span className="label">
                <Progress percent={40} showInfo={false} />
                4k Paid Users
              </span>
            </Cards>
        </Col>
        <Col sm={24} xs={24} md={12} lg={12} xxl={12} style={{marginBottom:25}}><CategoryChart/></Col>
        {/* <Col sm={24} xs={24} md={6} lg={6} xxl={6} style={{marginBottom:25}}> 
          <Cards title="Posts Per Category" size="large">
              <ChartjsStackedChart />
          </Cards>
        </Col> */}
        {/* <Col sm={24} xs={24} md={6} lg={6} xxl={6} style={{marginBottom:25}}><GenderInfo/></Col> */}
      </Row>
    )
}

export default DashboardOverview
