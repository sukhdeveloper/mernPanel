import React, { useState } from 'react';
import { Row, Col, Form, Input, Button } from 'antd';
import { ChangePasswordWrapper } from './style';
import { Cards } from '../../../../components/cards/frame/cards-frame';
import { BasicFormWrapper } from '../../../styled';
import Heading from '../../../../components/heading/heading';

import { axiosDataUpdate } from '../../../../redux/crud/axios/actionCreator';
import { useDispatch, useSelector } from 'react-redux';
const Password = () => {
  const dispatch = useDispatch();

  const [form] = Form.useForm();
  const [state, setState] = useState({
    values: null,
  });

  let handleSubmit = e => {
    var formData = {};
    formData.api_url = 'v1/admin/change_password_with_auth';
    formData.previous_password = e.previous_password;
    formData.new_password = e.new_password;
    formData.confirm_password = e.confirm_password;
    dispatch(axiosDataUpdate(formData));
  };
  const handleCancel = e => {
    e.preventDefault();
    form.resetFields();
  };

  return (
    <ChangePasswordWrapper>
      <Cards
        title={
          <div className="setting-card-title">
            <Heading as="h4">Password Settings</Heading>
            <span>Change or reset your account password</span>
          </div>
        }
      >
        <Row justify="center">
          <Col xxl={12} xl={20} sm={24} xs={24}>
            <BasicFormWrapper>
              <Form form={form} name="changepassword" onFinish={handleSubmit}>
                <Form.Item
                  name="previous_password"
                  label="Previous Password"
                  rules={[
                    {
                      required: true,
                      message: 'Required!',
                      whitespace: true,
                    },
                  ]}
                >
                  <Input.Password />
                </Form.Item>
                <Form.Item
                  name="new_password"
                  label="New Password"
                  rules={[
                    {
                      required: true,
                      message: 'Required!',
                      whitespace: true,
                    },
                  ]}
                >
                  <Input.Password />
                </Form.Item>
                <Form.Item
                  name="confirm_password"
                  label="Confirm Password"
                  rules={[
                    {
                      required: true,
                      message: 'Required!',
                      whitespace: true,
                    },
                  ]}
                >
                  <Input.Password />
                </Form.Item>
                {/* <p className="input-message">Minimum 6 characters</p> */}
                <Form.Item>
                  <div className="setting-form-actions">
                    <Button htmlType="submit" type="primary">
                      Save Changes
                    </Button>
                  </div>
                </Form.Item>
              </Form>
            </BasicFormWrapper>
          </Col>
        </Row>
      </Cards>
    </ChangePasswordWrapper>
  );
};

export default Password;
