import React, { useEffect, useState, Fragment } from 'react';
import { Row, Col, Button, Form, Input, Radio, InputNumber, Select, Checkbox } from 'antd';
import { Main, BasicFormWrapper } from '../styled';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Cards } from '../../components/cards/frame/cards-frame';
import UploadImage from '../categories/UploadImage';
import { axiosDataSubmit, axiosDataRead, storeFileName } from '../../redux/crud/axios/actionCreator';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

const { Option } = Select;
const { TextArea } = Input;
const EditWarrior = () => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const history = useHistory();

  const [password, setPassword] = useState('');
  const [uploadImage, setImage] = useState(null);

  const generatePassword = () => {
    var length = 10,
      charset = '@#*&!.abcdefghijk@#*&!.lmnopqrstuvwxyz@#*&!.ABCDEFGHIJKLM@#*&!.NOPQRSTUVWXYZ@#*&!.0123@#*&!.456789',
      retVal = '';
    for (var i = 0, n = charset.length; i < length; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    setPassword(retVal);
    console.log(retVal);
  };

  const [referenceArray, setReferenceArray] = useState(['']);
  const [seoHeadSchemaArray, setSeoHeadSchemaArray] = useState(['']);
  const [seoBodySchemaArray, setSeoBodySchemaArray] = useState(['']);
  const [featureImagesIdsArray, setFeatureImagesIdsArray] = useState([]);
  const [trendsInfo, setTrendsInfo] = useState({
    regions: [],
    genders: [],
    age_group: [],
    mern2_compass: [],
    format: [],
  });
  const [trendTags, setTrendTags] = useState([]);
  const [trendCategories, setTrendCategories] = useState([]);
  const [trendSubcategories, setTrendSubcategories] = useState([]);
  useEffect(() => {
    var getData = {};
    getData.api_url = 'v1/admin/get_trends_ids_info';
    dispatch(axiosDataRead(getData)).then(res => {
      if (res && res.success) {
        //console.log(res);
        setTrendsInfo(res.data);
      }
    });
  }, []);
  useEffect(() => {
    var getData = {};
    getData.api_url = 'v1/admin/get_tags';
    dispatch(axiosDataRead(getData)).then(res => {
      if (res && res.success) {
        //console.log(res);
        setTrendTags(res.data);
      }
    });
  }, []);
  useEffect(() => {
    var getData = {};
    getData.api_url = 'v1/admin/get_categories_subcategories';
    dispatch(axiosDataRead(getData)).then(res => {
      if (res && res.success) {
        //console.log(res);
        setTrendCategories(res.data);
      }
    });
  }, []);
  const getSubcategoriesList = e => {
    setTrendSubcategories([]);

    var getData = {};
    getData.api_url = `v1/admin/get_selected_categories_subcategories?category_ids=${JSON.stringify(e)}`;
    dispatch(axiosDataRead(getData)).then(res => {
      if (res && res.success) {
        //console.log(res);
        setTrendSubcategories(res.data);
      }
    });
  };
  let handleChange = (i, e) => {
    let newFormValues = [...referenceArray];
    newFormValues[i] = e;
    setReferenceArray(newFormValues);
  };

  let handleChangeSeoHead = (i, e) => {
    let newFormValue = [...seoHeadSchemaArray];
    newFormValue[i] = e;
    setSeoHeadSchemaArray(newFormValue);
  };

  let handleChangeSeoBody = (i, e) => {
    let newFormValueBody = [...seoBodySchemaArray];
    newFormValueBody[i] = e;
    setSeoBodySchemaArray(newFormValueBody);
  };
  let uploadedFileName = file => {
    var index = featureImagesIdsArray.indexOf(file.url);
    if (file.status == 'done') {
      if (index == -1) {
        setFeatureImagesIdsArray(prevState => [...prevState, file.url]);
      }
    } else if (file.status == 'removed') {
      setFeatureImagesIdsArray(featureImagesIdsArray.filter((s, sindex) => index !== sindex));
    }
  };
  // const handleSubmit = e => {
  //   var formData = e;
  //   formData.api_url = 'v1/admin/add_trend';
  //   formData.featured_images = featureImagesIdsArray;
  //   formData.reference_links = referenceArray;
  //   formData.head_scripts = seoHeadSchemaArray;
  //   formData.body_scripts = seoBodySchemaArray;
  //   dispatch(axiosDataSubmit(formData)).then(res => {
  //     if (res && res.success) {
  //       history.push('all');
  //     }
  //   });
  // };
  return (
    <>
      <PageHeader
        ghost
        title="mern2 Warriors"
        // buttons={[
        //   <div key="1" className="page-header-actions">
        //     <Button size="small" type="primary">
        //       Preview
        //     </Button>
        //   </div>,
        // ]}
      />
      <Main>
        <Row gutter={25}>
          <Col xs={24} sm={24}>
            <BasicFormWrapper className="mb-25">
              <Cards title="Edit Warrior">
                <Form name="multi-form" layout="horizontal" className="add_mern2_warrior">
                  <Row gutter={30}>
                    <Col sm={16} xs={24} className="mb-25">
                      <Row gutter={10}>
                        <Col sm={24} xs={24} lg={12} md={12} className="mb-25">
                          <Form.Item
                            name="username"
                            rules={[
                              {
                                required: true,
                                message: 'Required!',
                                whitespace: true,
                              },
                            ]}
                            label="Username"
                          >
                            <Input placeholder="Username" />
                          </Form.Item>
                        </Col>
                        <Col sm={24} xs={24} lg={12} md={12} className="mb-25">
                          <Form.Item
                            name="email"
                            rules={[
                              {
                                required: true,
                                message: 'Required!',
                                whitespace: true,
                              },
                            ]}
                            label="Email"
                          >
                            <Input placeholder="email" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={10}>
                        <Col sm={24} xs={24} lg={12} md={12} className="mb-25">
                          <Form.Item
                            name="firstname"
                            rules={[
                              {
                                required: true,
                                message: 'Required!',
                                whitespace: true,
                              },
                            ]}
                            label="First Name"
                          >
                            <Input placeholder="Firstname" />
                          </Form.Item>
                        </Col>
                        <Col sm={24} xs={24} lg={12} md={12} className="mb-25">
                          <Form.Item
                            name="lastname"
                            rules={[
                              {
                                required: true,
                                message: 'Required!',
                                whitespace: true,
                              },
                            ]}
                            label="Last Name"
                          >
                            <Input placeholder="Lastname" />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={10}>
                        <Col sm={24} xs={24} lg={12} md={12} className="mb-25">
                        <Form.Item
                        name="contact"
                        rules={[
                          {
                            required: true,
                            message: 'Required!',
                            whitespace: true,
                          },
                        ]}
                        label="Contact Number"
                      >
                        <Input placeholder="Contact" />
                      </Form.Item>
                        </Col>
                        <Col sm={24} xs={24} lg={12} md={12} className="mb-25">
                        <Form.Item
                            name="password"
                            rules={[
                              {
                                required: true,
                                message: 'Required!',
                                whitespace: true,
                              },
                            ]}
                            label="Password"
                          >
                            <Input.Password placeholder="Password" />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={10}>
                        <Col sm={24} xs={24} lg={12} md={12} className="mb-25">
                        <Form.Item
                        name="displayname"
                        rules={[
                          {
                            required: true,
                            message: 'Required!',
                          },
                        ]}
                        label="Display Name"
                      >
                        <Input placeholder="Display name" />
                      </Form.Item>
                        </Col>
                        <Col sm={24} xs={24} lg={12} md={12} className="mb-25">
                        <Form.Item
                        name="profiledescription"
                        rules={[
                          {
                            required: true,
                            message: 'Required!',
                          },
                        ]}
                        label="Profile Description"
                      >
                        <Input placeholder="Profile description" />
                      </Form.Item>
                        </Col>
                      </Row>

                      {/* <Row>
                        <Col sm={24} xs={24} lg={22} md={22} xxl={22} className="mb-25">
                          Send User Notification
                        </Col>
                        <Col sm={24} xs={24} lg={2} md={2} xxl={2} className="mb-25 text-right">
                          <Form.Item>
                            <Checkbox checked="check"></Checkbox>
                          </Form.Item>
                        </Col>
                      </Row> */}
                      
                     
                    </Col>
                    <Col sm={8} xs={24} className="mb-25 trend-right-side">
                      <Form.Item
                        name="category_ids"
                        rules={[{ required: true, message: 'Required!' }]}
                        label="Categories"
                      >
                        <Select
                          size="small"
                          mode="multiple"
                          placeholder="Categories"
                          className="sDash_fullwidth-select"
                          onChange={e => getSubcategoriesList(e)}
                        >
                          {trendCategories.length > 0 &&
                            trendCategories.map((data, index) => (
                              <Option key={index} value={data._id}>
                                {data.title}
                              </Option>
                            ))}
                        </Select>
                      </Form.Item>
                      {trendSubcategories.length > 0 && (
                        <Form.Item
                          name="subcategory_ids"
                          rules={[{ required: true, message: 'Required!' }]}
                          label="Sub Categories"
                        >
                          <Select
                            size="small"
                            mode="multiple"
                            placeholder="Subcategories"
                            className="sDash_fullwidth-select"
                          >
                            {trendSubcategories.length > 0 &&
                              trendSubcategories.map((data, index) => (
                                <Option key={index} value={data._id}>
                                  {data.title}
                                </Option>
                              ))}
                          </Select>
                        </Form.Item>
                      )}
                      <Form.Item name="tags_ids" rules={[{ required: true, message: 'Required!' }]} label="Tags">
                        <Select size="small" mode="multiple" placeholder="Tags" className="sDash_fullwidth-select">
                          {trendTags.length > 0 &&
                            trendTags.map((tagData, index) => (
                              <Option key={index} value={tagData._id}>
                                {tagData.tag_name}
                              </Option>
                            ))}
                        </Select>
                      </Form.Item>
                      
                      <Form.Item
                        label="Profile Image"
                        name="Profileimage"
                        rules={[
                          {
                            required: true,
                            message: 'Required!',
                          },
                        ]}
                      >
                        <UploadImage uploadedFileName={uploadedFileName} limitOfImageUpload={1} />
                      </Form.Item>
                      
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={12} xs={24}>
                      <div className="sDash_form-action">
                        <Button className="btn-signin" htmlType="submit" type="primary" size="large">
                          Update Warrior
                        </Button>
                      </div>
                    </Col>
                  </Row>
                </Form>
              </Cards>
            </BasicFormWrapper>
          </Col>
        </Row>
      </Main>
    </>
  );
};

export default EditWarrior;
