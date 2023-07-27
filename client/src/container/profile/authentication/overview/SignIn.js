import React, { useState } from 'react';
import { Link, NavLink, useHistory } from 'react-router-dom';
import { Form, Input, Button } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { AuthWrapper } from './style';
import { axiosDataSubmit } from '../../../../redux/crud/axios/actionCreator';
import { login } from '../../../../redux/authentication/actionCreator';
import Heading from '../../../../components/heading/heading';

const SignIn = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const isLoading = useSelector(state => state.auth.loading);
  const [form] = Form.useForm();
  localStorage.removeItem("otp_response");
  localStorage.removeItem("data");
  var getUserRole = localStorage.getItem('userRole')

  
  const handleSubmit = (e) => {
    var formData = {};
    formData.api_url='v1/admin/login';
    formData.email=e.email;
    formData.password=e.password;
    dispatch(axiosDataSubmit(formData)).then(res => {
      if(res && res.success){
        dispatch(login(res.data));
        console.log(res,getUserRole, "response")
        // ${path}/mern2warrior
        if(res.data.userRole === 1){
          history.push('/admin/mern2warrior');
        }
        if(res.data.userRole === 0){
          history.push({
            pathname:'/admin'});
        }
      }
    });
  };

  return (
    <AuthWrapper>
      <div className="auth-contents">
        <Form name="login" form={form} onFinish={e => handleSubmit(e)} layout="vertical">
          <Heading as="h3">
            Sign in to <span className="color-secondary">Admin</span>
          </Heading>
          <Form.Item
            name="email"
            rules={[{ message: 'Please enter email.', required: true }]}
            //initialValue="mern2pr.admin@gmail.com"
            label="Email Address"
          >
            <Input placeholder="Enter email " />
          </Form.Item>
          <Form.Item
            name="password"
            //initialValue="mern2pr@admin1"
            rules={[{ message: 'Please enter password.', required: true }]}
            label="Password"
          >
            <Input.Password placeholder="Password" />
          </Form.Item>
          <div className="auth-form-action">
            <NavLink className="forgot-pass-link" to="/forgot-password">
              Forgot password?
            </NavLink>
          </div>
          <Form.Item>
            <Button className="btn-signin" htmlType="submit" type="primary" size="large">
              {isLoading ? 'Loading...' : 'Sign In'}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </AuthWrapper>
  );
};

export default SignIn;
