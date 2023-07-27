import React from 'react';
import { Row, Col } from 'antd';
import { Aside, Content } from './overview/style';
import Heading from '../../../components/heading/heading';

const AuthLayout = WraperContent => {
  return () => {
    return (
      <Row className="main-login-area">
        <Col xxl={8} xl={9} lg={12} md={8} xs={24}>
          <Aside>
            <div className="auth-side-content dash-sidebar-login">
              <img src={require('../../../static/img/auth/topShape.png')} alt="" className="topShape" />
              <img src={require('../../../static/img/auth/bottomShape.png')} alt="" className="bottomShape" />
              <Content>
                <Heading as="h1">
                  India’s <strong>First</strong> mern2 Mapping,<strong> Trend Spotting Platform</strong>. Find Your
                  Daily Dose Of Inspiration, Micro-Trends, News &amp; Pop mern2.
                </Heading>
                <img
                  className="auth-content-figure"
                  src={require('../../../static/img/53logo.8302e4fd.8302e4fd.png')}
                  alt=""
                />
              </Content>
            </div>
          </Aside>
        </Col>

        <Col xxl={16} xl={15} lg={12} md={16} xs={24}>
          <WraperContent />
        </Col>
      </Row>
    );
  };
};

export default AuthLayout;
