import React, { useEffect } from 'react';
import { Table } from 'antd';
import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CardGroup } from '../../style';
import { Cards } from '../../../../components/cards/frame/cards-frame';
import { socialTrafficGetData, socialTrafficFilterData } from '../../../../redux/chartContent/actionCreator';

const TopTenLinks = () => {
  const dispatch = useDispatch();
  const { socialTrafficState } = useSelector(state => {
    return {
      socialTrafficState: state.chartContent.socialTrafficData,
      soIsLoading: state.chartContent.soLoading,
    };
  });

  useEffect(() => {
    if (socialTrafficGetData) {
      dispatch(socialTrafficGetData());
    }
  }, [dispatch]);

  const moreContent = (
    <>
      <NavLink to="#">
        <span>2 years</span>
      </NavLink>
      <NavLink to="#">
        <span>3 years</span>
      </NavLink>
      <NavLink to="#">
        <span>4 years</span>
      </NavLink>
    </>
  );

  const trafficTableColumns = [
    {
      dataIndex: 'sr_no',
      key: 'sr_no',
    },
    {
      title: 'Acquisition',
      dataIndex: 'users',
      key: 'users',
    },
    {
      dataIndex: 'newUsers',
      key: 'newUsers',
    }
  ];

  // const { facebook, twitter, youtube, linkdin, pinterest, google } = socialTrafficState !== null && socialTrafficState;

  const trafficTableData =
    socialTrafficState !== null
      ? [
          {
            key: '1',
            sr_no: <span className="traffic-title">Sr. No.</span>,
            users: <span className="traffic-title">Trend</span>,
            newUsers: <span className="traffic-title">Values</span>
          },
          {
            key: '2',
            sr_no: (
                <span className="social-name">1</span>
            ),
            users: 'Funfetti Cake ...',
            newUsers: '430K'
          },
          {
            key: '3',
            sr_no: (
              <span className="social-name">2</span>
          ),
          users: 'Warm Chocolate ...',
          newUsers: '375K'
          },
          {
            key: '4',
            sr_no: (
              <span className="social-name">3</span>
            ),
            users: 'Plant-Based ...',
            newUsers: '370K'
          },
          {
            key: '5',
            sr_no: (
              <span className="social-name">4</span>
            ),
            users: 'Smart Lock Boxes',
            newUsers: '320K'
          },
          {
            key: '6',
            sr_no: (
              <span className="social-name">5</span>
            ),
            users: 'Net-Zero ...',
            newUsers: '300K'
          },
          {
            key: '7',
            sr_no: (
              <span className="social-name">6</span>
            ),
            users: 'Structural ...',
            newUsers: '290K'
          },
          {
            key: '8',
            sr_no: (
              <span className="social-name">7</span>
            ),
            users: 'Customizable ...',
            newUsers: '280K'
          },
          {
            key: '9',
            sr_no: (
              <span className="social-name">8</span>
            ),
            users: 'Passive Investment ...',
            newUsers: '250K'
          },
          {
            key: '10',
            sr_no: (
              <span className="social-name">9</span>
            ),
            users: 'Streamlined ...',
            newUsers: '230K'
          },
          {
            key: '11',
            sr_no: (
              <span className="social-name">10</span>
            ),
            users: 'Handmade Ghanaian ...',
            newUsers: '200K'
          },
        ]
      : [];

  // const socialTraffic = e => {
  //   dispatch(socialTrafficFilterData(e.target.value));
  // };

  return (
    <CardGroup>
      <div className="full-width-table">
        <Cards
          title="Top 10 Liked Trends"
          size="large"
        >
          <div className="traffic-table table-responsive">
          <style dangerouslySetInnerHTML={{__html: "\nthead tr {\n    display: none;\n}\n" }} />
          <style dangerouslySetInnerHTML={{__html: "\n.hXEWQW .traffic-table {\n    min-height: 390px;\n}\n" }} />
            <Table columns={trafficTableColumns} dataSource={trafficTableData} pagination={false} className="tabletextdesign"/>
          </div>
        </Cards>
      </div>
    </CardGroup>
  );
};

export default TopTenLinks;
