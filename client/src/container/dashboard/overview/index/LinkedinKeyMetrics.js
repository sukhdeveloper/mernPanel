import React, { useState, useEffect } from 'react';
import { Row, Col, Spin } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Cards } from '../../../../components/cards/frame/cards-frame';
import Heading from '../../../../components/heading/heading';
import { ChartjsLineChart } from '../../../../components/charts/chartjs';
import { linkdinOverviewGetData, linkdinOverviewFilterData } from '../../../../redux/chartContent/actionCreator';
import { customTooltips } from '../../../../components/utilities/utilities';
import { ChartContainer, LineChartWrapper } from '../../style';

const LinkedinKeyMetrics = () => {
  const dispatch = useDispatch();
  const { linkdinOverviewState, liIsLoading } = useSelector(state => {
    return {
      linkdinOverviewState: state.chartContent.linkdinOverviewData,
      liIsLoading: state.chartContent.liLoading,
    };
  });

  useEffect(() => {
    if (linkdinOverviewGetData) {
      dispatch(linkdinOverviewGetData());
    }
  }, [dispatch]);

  const [state, setState] = useState({
    linkdinOverviewTabActive: 'month',
  });

  const chartOptions = {
    tooltips: {
      yAlign: 'bottom',
      xAlign: 'center',
      mode: 'nearest',
      position: 'nearest',
      intersect: false,
      enabled: false,
      custom: customTooltips,
      callbacks: {
        labelColor(tooltipItem, chart) {
          return {
            backgroundColor: '#20C997',
          };
        },
      },
    },
    hover: {
      mode: 'nearest',
      intersect: false,
    },
    layout: {
      padding: {
        left: '0',
        right: 8,
        top: 15,
        bottom: -10,
      },
    },
    maintainAspectRatio: true,
    responsive: true,
    legend: {
      display: false,
      labels: {
        display: false,
      },
    },
    elements: {
      line: {
        tension: 0,
      },
    },
    scales: {
      yAxes: [
        {
          stacked: true,
          gridLines: {
            display: false,
            color: '#e5e9f2',
            borderDash: [8, 4],
            zeroLineColor: 'transparent',
            beginAtZero: true,
          },
          ticks: {
            display: false,
          },
        },
      ],
      xAxes: [
        {
          stacked: true,
          gridLines: {
            display: false,
            color: '#e5e9f2',
            borderDash: [8, 4],
            zeroLineColor: 'transparent',
          },
          ticks: {
            display: false,
          },
        },
      ],
    },
  };

  const handleActiveChangeLinkdin = value => {
    setState({
      ...state,
      linkdinOverviewTabActive: value,
    });
    dispatch(linkdinOverviewFilterData(value));
  };

  const lineChartPointStyle = {
    borderColor: '#C6D0DC',
    borderWidth: 2,
    fill: false,
    pointRadius: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6],
    pointBackgroundColor: [
      'transparent',
      'transparent',
      'transparent',
      'transparent',
      'transparent',
      'transparent',
      'transparent',
      'transparent',
      'transparent',
      'transparent',
      'transparent',
      '#20C997',
    ],
    pointHoverBackgroundColor: '#20C997',
    pointHoverRadius: 6,
    pointBorderColor: 'transparent',
  };

  return (
    <LineChartWrapper>
      {linkdinOverviewState !== null && (
        <Cards
          title="Transactions"
          size="large"
        >
          {liIsLoading ? (
            <div className="sd-spin">
              <Spin />
            </div>
          ) : (
            <div className="linkedin-chart-wrap">
              <Row className="line-chart-row">
                <Col xxl={10} xs={24}>
                  <div className="growth-upward">
                    <p>Today</p>
                    <Heading as="h4">
                      {linkdinOverviewState.post.data}
                      <sub>
                        <FeatherIcon icon="arrow-up" size={14} />
                        25%
                      </sub>
                    </Heading>
                  </div>
                </Col>
                <Col xxl={14} xs={24}>
                  <div className="border-linechart">
                    <ChartContainer className="parentContainer">
                      <ChartjsLineChart
                        height={55}
                        datasets={[
                          {
                            data: linkdinOverviewState.post.chartValue,
                            ...lineChartPointStyle,
                          },
                        ]}
                        options={chartOptions}
                      />
                    </ChartContainer>
                  </div>
                </Col>
              </Row>
              <Row className="line-chart-row">
                <Col xxl={10} xs={24}>
                  <div className="growth-upward">
                    <p>Week</p>
                    <Heading as="h4">
                      {linkdinOverviewState.like.data}
                      <sub>
                        <FeatherIcon icon="arrow-up" size={14} />
                        108%
                      </sub>
                    </Heading>
                  </div>
                </Col>
                <Col xxl={14} xs={24}>
                  <div className="border-linechart">
                    <ChartContainer className="parentContainer">
                      <ChartjsLineChart
                        height={55}
                        datasets={[
                          {
                            data: linkdinOverviewState.like.chartValue,
                            ...lineChartPointStyle,
                          },
                        ]}
                        options={chartOptions}
                      />
                    </ChartContainer>
                  </div>
                </Col>
              </Row>
              <Row className="line-chart-row">
                <Col xxl={10} xs={24}>
                  <div className="growth-downward">
                    <p>Months</p>
                    <Heading as="h4">
                      {linkdinOverviewState.comments.data}
                      <sub>
                        <FeatherIcon icon="arrow-down" size={14} />
                        30%
                      </sub>
                    </Heading>
                  </div>
                </Col>
                <Col xxl={14} xs={24}>
                  <div className="border-linechart">
                    <ChartContainer className="parentContainer">
                      <ChartjsLineChart
                        height={55}
                        datasets={[
                          {
                            data: linkdinOverviewState.comments.chartValue,
                            ...lineChartPointStyle,
                          },
                        ]}
                        options={chartOptions}
                      />
                    </ChartContainer>
                  </div>
                </Col>
              </Row>
              <Row className="line-chart-row">
                <Col xxl={10} xs={24}>
                  <div className="growth-upward">
                    <p>year</p>
                    <Heading as="h4">
                      {linkdinOverviewState.rate.data}
                      <sub>
                        <FeatherIcon icon="arrow-up" size={14} />
                        34%
                      </sub>
                    </Heading>
                  </div>
                </Col>
                <Col xxl={14} xs={24}>
                  <div className="border-linechart">
                    <ChartContainer className="parentContainer">
                      <ChartjsLineChart
                        height={55}
                        datasets={[
                          {
                            data: linkdinOverviewState.rate.chartValue,
                            ...lineChartPointStyle,
                          },
                        ]}
                        options={chartOptions}
                      />
                    </ChartContainer>
                  </div>
                </Col>
              </Row>
            </div>
          )}
        </Cards>
      )}
    </LineChartWrapper>
  );
};

export default LinkedinKeyMetrics;
