import React, { useState, useEffect } from 'react';
import { Link, NavLink, useHistory } from 'react-router-dom';
import { Form, Input, Button, Col, Row } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { AuthWrapper } from './style';
import Heading from '../../../../components/heading/heading';
import { axiosDataSubmit} from '../../../../redux/crud/axios/actionCreator';

const Otp = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  const handleOtpSubmit = (e) => {
    var formData = {};
    var userId = localStorage.getItem("data")
    //console.log("user id " , userId)
    formData.api_url=`v1/admin/verifyOtp/${userId}`;
    formData.otp=e.otp;
    dispatch(axiosDataSubmit(formData)).then(res => {
      //console.log('res',res);
      if(res && res.success){
          //let otp_token = res.data.otp_token;
          history.push('/change-password');
          console.log(res.message);
          console.log(res.data);
          localStorage.removeItem("Email");
          localStorage.setItem("otp_response", res.data.otptoken);
      }
    });
  };

  const ResendOtp = () => {
    var formData = {};
    var email_id = localStorage.getItem("Email");
    formData.api_url='v1/admin/forgotPassword';
    formData.email=email_id;
    dispatch(axiosDataSubmit(formData)).then(res => {
        //console.log('res',res);
        if(res && res.success){
           console.log(res.data);
        }
      });
    
    
  }

  return (
    <AuthWrapper>
      <div className="auth-contents">
        {/* <Form name="otp" layout="vertical" onFinish={handleOtpSubmit}> */}
        <Form name="otp-form" layout="vertical" onFinish={handleOtpSubmit}>
          <Heading as="h3">
            OTP <span className="color-secondary">Verification</span>
          </Heading>
          <p>
            Enter OTP code sent to your email <span>test@gmail.com</span>
          </p>
          <Form.Item name="otp" rules={[
            {
              pattern: /^(?:\d*)$/,
              message: "Value should contain just number",
            },
            {
              max: 6,
              message: "Value should be less than 6 character",
            },
            { message: 'Please enter otp.', required: true }
            
            ]} label="Enter OTP">
            <Input />
          </Form.Item>
          <Row className='under-otp' align="middle">
            <Col span={18}>
              <Form.Item>
                <Button className="btn-verify" htmlType="submit" type="primary" size="large">
                  Verify Otp
                </Button>
              </Form.Item>
            </Col>
            <Col span={6}>
                <Button onClick={ResendOtp} className="resend-button">Resend OTP</Button>
                {/* <Link to="/" className="color-secondary" >Resend OTP</Link> */}
            </Col>
          </Row>
        </Form>
      </div>
    </AuthWrapper>
  );
};

export default Otp;
