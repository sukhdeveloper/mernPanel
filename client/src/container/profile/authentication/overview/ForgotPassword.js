import React, { useState } from 'react';
import { NavLink } from 'react-router-dom/cjs/react-router-dom.min';
import { Form, Input, Button } from 'antd';
import { AuthWrapper } from './style';
import Heading from '../../../../components/heading/heading';
import { useHistory } from "react-router-dom";
import { axiosDataSubmit } from '../../../../redux/crud/axios/actionCreator';
import { useDispatch, useSelector } from 'react-redux';

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const [state, setState] = useState({
    values: null,
  });
  // const handleSubmit = values => {
  //   setState({ ...state, values });
  // };

  const history = useHistory();

  // const routeChange = () =>{ 
  //   let path = `/otp-verify`; 
  //   history.push(path);
  // }

  const [emailData, setEmailData] = useState({
    email:''
  });

  const handleSubmit = (e) => {
    var formData = {};
    formData.api_url='v1/admin/forgotPassword';
    formData.email=e.email;
    dispatch(axiosDataSubmit(formData)).then(res => {
      // console.log('res',res);

      if(res && res.success){
        setEmailData(res.msg);
        let user_id = res.data;
        localStorage.setItem("data", user_id);
        localStorage.setItem("Email", formData.email);
        history.push('/otp-verify');
        // console.log(res.msg);
      }
    });
  };
  return (
    <AuthWrapper>
      <div className="auth-contents">
        <Form name="forgotPass" onFinish={handleSubmit} layout="vertical">
          <Heading as="h3"> Forgot Password ? </Heading>
          <p className="forgot-text">
            Enter the email address you used when you joined and we’ ll send you otp to reset your password.
          </p>
          <Form.Item
            label="Email Address"
            name="email"
            rules={[{ required: true, message: 'Please enter email!', type: 'email' }]}
          >
            <Input placeholder="name@example.com" />
          </Form.Item>
          <Form.Item>
            <Button className="btn-reset" htmlType="submit" type="primary" size="large">
              Send Otp
            </Button>
          </Form.Item>
          <p className="return-text">
            Already have an account ? <NavLink className="outer-signin" to="/"> Sign In </NavLink>
          </p>
        </Form>
      </div>
    </AuthWrapper>
  );
};

export default ForgotPassword;
