import React, { useState, useEffect, Fragment } from 'react';
import { Row, Col, Form, Input, Space, Upload, Divider } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { AccountWrapper } from './style';
import { Cards } from '../../../../components/cards/frame/cards-frame';
import { Button } from '../../../../components/buttons/buttons';
import { BasicFormWrapper } from '../../../styled';
import Heading from '../../../../components/heading/heading';
import { Link } from 'react-router-dom';
import FeatherIcon from 'feather-icons-react';
import placeholder from '../../../../images/placeholder.png';
import { Tabs } from 'antd';
import { axiosDataSubmit, axiosDataRead, storeFileName } from '../../../../redux/crud/axios/actionCreator';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import UploadImage from '../../../categories/UploadImage';
const { TabPane } = Tabs;

const onChange = key => {
  // console.log(key);
};

const Account = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [state, setState] = useState({
    name: 'clayton',
    values: null,
  });
  const [uploadImage, setImage] = useState(null);
  const [apiHit, setApiHit] = useState(false);
  const [data, setData] = useState({
    logo: '',
    payment_gateways: {
      razorpay: {
        key: '',
        secret_key: '',
      },
    },
    email_addresses_to_get_notifications: [],
    invoice_details: {
      company_address: '',
      gst_number: '',
      gst: 0,
      igst: 0,
    },
  });

  const handleSubmit = values => {
    setState({ ...state, values });
  };
  let uploadedFileName = file => {
    if (file.status == 'done') {
      setImage(file.url);
    } else if (file.status == 'removed') {
      setImage(null);
    }
  };
  const handleCancel = e => {
    e.preventDefault();
    form.resetFields();
  };

  const handleChange = e => {
    setState({
      name: e.target.value,
    });
  };

  const [emailArray, setEmailArray] = useState(['']);

  let handleEmailChange = (i, e) => {
    let newFormValues = [...emailArray];
    newFormValues[i] = e;
    setEmailArray(newFormValues);
  };

  const [{ alt, src }, setImg] = useState({
    src: placeholder,
    alt: 'Upload an Image',
  });

  const handleImg = e => {
    if (e.target.files[0]) {
      setImg({
        src: URL.createObjectURL(e.target.files[0]),
        alt: e.target.files[0].name,
      });
    }
  };
  const uploadLogo = () => {
    var formData = {};
    formData.api_url = 'v1/admin/portal_settings/logo';
    formData.logo = uploadImage;
    dispatch(axiosDataSubmit(formData));
  };
  const paymentGateway = e => {
    var formData = {};
    formData.api_url = 'v1/admin/portal_settings/payment_gateway';
    formData.key = e.key;
    formData.secret_key = e.secret_key;
    dispatch(axiosDataSubmit(formData));
  };
  let handleEmailSubmit = (i, e) => {
    var formData = {};
    formData.api_url = 'v1/admin/portal_settings/email_addresses_to_get_notifications';
    formData.email_addresses_to_get_notifications = emailArray;
    dispatch(axiosDataSubmit(formData));
  };
  let handleInvoiceSubmit = e => {
    var formData = {};
    formData.api_url = 'v1/admin/portal_settings/invoice_details';
    formData.company_address = e.company_address;
    formData.gst_number = e.gst_number;
    formData.gst = e.gst;
    formData.igst = e.igst;
    dispatch(axiosDataSubmit(formData));
  };
  useEffect(() => {
    var getData = {};
    getData.api_url = 'v1/admin/portal_settings';
    dispatch(axiosDataRead(getData)).then(res => {
      if (res && res.success) {
        //console.log(res);
        setData(res.data);
        setEmailArray(res.data.email_addresses_to_get_notifications);
        setApiHit(true);
      }
    });
  }, []);
  return (
    apiHit && (
      <AccountWrapper>
        <Cards
          title={
            <div className="setting-card-title">
              <Heading as="h4" className="profile-head">Portal Settings</Heading>
              <span>Update your portal settings</span>
            </div>
          }
        >
          <Row justify="center" className="tabbed-sect">
            <Col xxl={12} xl={20} sm={24} xs={24}>
              <Tabs defaultActiveKey="1" onChange={onChange}>
                <TabPane tab="Logo" key="1">
                  <Form form={form} name="editAccount" onFinish={uploadLogo}>
                    <div className="portal-form-top">
                      <h3>Web Logo :</h3>
                      <Space direction="vertical" style={{ width: '100%' }} size="large">
                        <img src={data.logo} alt={data.logo} />
                        <div className="portals-web-icon">
                          <UploadImage uploadedFileName={uploadedFileName} limitOfImageUpload={1} />
                        </div>
                      </Space>

                      <Button className="btn-signin" htmlType="submit" type="primary" size="large">
                        Update
                      </Button>
                    </div>
                  </Form>
                </TabPane>
                <TabPane tab="Keys" key="2">
                  <Form form={form} name="paymentkeys" onFinish={paymentGateway} layout="vertical" className="tabs_form">
                    <h3>Payment Gateway Keys :</h3>

                    <Form.Item
                      name="key"
                      initialValue={data.payment_gateways.razorpay.key}
                      label="Publication Key"
                      rules={[
                        {
                          required: true,
                          message: 'Required!',
                          whitespace: true,
                        },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      name="secret_key"
                      initialValue={data.payment_gateways.razorpay.secret_key}
                      label="Secret Key"
                      rules={[
                        {
                          required: true,
                          message: 'Required!',
                          whitespace: true,
                        },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                    <Button className="btn-signin" htmlType="submit" type="primary" size="large">
                      Save Changes
                    </Button>
                  </Form>
                </TabPane>
                <TabPane tab="Emails" key="3">
                  <Form form={form} name="addemails" className="emailform-tabs" onFinish={e => handleEmailSubmit(e)}>
                    <h3>Email on which you want email notification:</h3>
                    <Form.Item name={`email_links`} style={{ display: 'none' }} value={emailArray}>
                      <Input placeholder="Email Link" />
                    </Form.Item>
                    {emailArray.length > 0 &&
                      emailArray.map((emailData, index) => (
                        <Fragment key={index}>
                          <Row className="mb-25" gutter={12}>
                            <Col sm={20} xs={18} xl={20} xxl={20}>
                              <input
                                type="email"
                                name={`email_%${index}`}
                                value={emailData}
                                id={`email_${index}`}
                                placeholder={`Email Link ${index + 1}`}
                                className="ant-input"
                                onChange={e => handleEmailChange(index, e.target.value)}
                                required
                              />
                            </Col>
                            <Col sm={4} xs={6} xl={4} xxl={4}>
                              {index == 0 ? (
                                <Button
                                  className="btn-signin"
                                  style={{ height: '100%' }}
                                  type="primary"
                                  size="large"
                                  onClick={() => setEmailArray(prevState => [...prevState, ''])}
                                >
                                  +
                                </Button>
                              ) : (
                                <Button
                                  className="btn-signin"
                                  type="danger"
                                  size="large"
                                  style={{ height: '100%' }}
                                  onClick={() => setEmailArray(emailArray.filter((s, sindex) => index !== sindex))}
                                >
                                  x
                                </Button>
                              )}
                            </Col>
                          </Row>
                        </Fragment>
                      ))}
                    <Button className="btn-signin" htmlType="submit" type="primary" size="large">
                      Save Changes
                    </Button>
                  </Form>
                </TabPane>
                <TabPane tab="Invoice" key="4">
                  <Form form={form} name="addeinvoice" layout="vertical" onFinish={e => handleInvoiceSubmit(e)} className="tabs_form">
                    <h3>Invoice Details Settings :</h3>
                    <Form.Item
                      name="company_address"
                      initialValue={data.invoice_details.company_address}
                      label="Company Address"
                      rules={[
                        {
                          required: true,
                          message: 'Required!',
                          whitespace: true,
                        },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      name="gst_number"
                      initialValue={data.invoice_details.gst_number}
                      label="GST Number"
                      rules={[
                        {
                          required: true,
                          message: 'Required!',
                          whitespace: true,
                        },
                      ]}
                    >
                      <Input />
                    </Form.Item>

                    <Row gutter={16}>
                      <Col className="gutter-row" span={12}>
                        <Form.Item
                          name="gst"
                          initialValue={data.invoice_details.gst}
                          label="GST % * (For your State)"
                          rules={[
                            {
                              required: true,
                              message: 'Required!'
                            },
                          ]}
                        >
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col className="gutter-row" span={12}>
                        <Form.Item
                          name="igst"
                          initialValue={data.invoice_details.igst}
                          label="IGST % * (For other State)"
                          rules={[
                            {
                              required: true,
                              message: 'Required!'
                            },
                          ]}
                        >
                          <Input />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Button className="btn-signin" htmlType="submit" type="primary" size="large">
                      Save Changes
                    </Button>
                  </Form>
                </TabPane>
              </Tabs>
            </Col>
          </Row>
        </Cards>
      </AccountWrapper>
    )
  );
};

export default Account;
