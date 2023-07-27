import React, { useEffect, useState, Fragment } from 'react';
import { Row, Col, Button, Form, Input, Radio, InputNumber, Select, Checkbox } from 'antd';
import { Main, BasicFormWrapper } from '../styled';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Cards } from '../../components/cards/frame/cards-frame';

const CreateAIReports = () => {
  return (
    <>
      <PageHeader ghost title="Create AI Report" />

      <Main>
        <Row gutter={25}>
          <Col xs={24} sm={24}>
            <BasicFormWrapper className="mb-25">
              <Cards title="Coming Soon"></Cards>
            </BasicFormWrapper>
          </Col>
        </Row>
      </Main>
    </>
  );
};

export default CreateAIReports;