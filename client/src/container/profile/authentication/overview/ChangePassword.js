import React, { useState } from 'react';
import { Link, NavLink, useHistory } from 'react-router-dom';
import { Form, Input, Button, Col, Row } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { AuthWrapper } from './style';
import Heading from '../../../../components/heading/heading';
import { axiosDataUpdate } from '../../../../redux/crud/axios/actionCreator';

const ChangePassword = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  const handleSubmit = (e) => {
    var formData = {};
    var userId = localStorage.getItem("data");
    var otpRes = localStorage.getItem("otp_response")
    formData.api_url=`v1/admin/change_password/${userId}/${otpRes}`;
    formData.password=e.password;
    formData.confirm_password=e.confirm_password;
    dispatch(axiosDataUpdate(formData)).then(res => {
       console.log('res',res);

      if(res && res.success){
        // let user_id = res.data;
        history.push('/');
        // console.log(res.msg);
        //console.log('res',res.data);
        localStorage.removeItem("otp_response");
        localStorage.removeItem("data");
      }
    });
  };

  return (
    <AuthWrapper>
      <div className="auth-contents change-password-area">
        <Form name="change-password" onFinish={handleSubmit} layout="vertical">
          <Heading as="h3">
            Change <span className="color-secondary">Password</span>
          </Heading>
          <Form.Item
            name="password"
            rules={[{ message: 'Please enter new password.', required: true }]}
            label="Enter New Password"
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            name="confirm_password"
            rules={[{ message: 'Please re-enter new password.', required: true }]}
            label="Enter Confirm Password"
          >
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <Button className="btn-verify" htmlType="submit" type="primary" size="large">
              Update
            </Button>
          </Form.Item>
        </Form>
      </div>
    </AuthWrapper>
  );
};

export default ChangePassword;
