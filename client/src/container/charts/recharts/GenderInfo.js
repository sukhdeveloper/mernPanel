import React from 'react';
import { Row, Col } from 'antd';
import { PageHeader } from '../../../components/page-headers/page-headers';
import { Cards } from '../../../components/cards/frame/cards-frame';
import {
  pieChartData,
} from '../../../demoData/google-charts.json';
import {
  Google3dPieChart,
} from '../../../components/charts/google-chart';

const GenderInfo = () => {
  return (
    <>
            <Cards title="Gender Information" size="large">
              <Google3dPieChart
                data={pieChartData}
                width="100%"
                chartArea="100%"
              />
            </Cards>
    </>
  );
};
export default GenderInfo;
