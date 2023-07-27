import React, { useEffect, useState, Fragment } from 'react';
import { Row, Col, Button, Form, Input, Radio, InputNumber, Select, Checkbox } from 'antd';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Main, BasicFormWrapper } from '../styled';
import { useDispatch, useSelector } from 'react-redux';
import { Cards } from '../../components/cards/frame/cards-frame';
import { EyeOutlined, EyeInvisibleOutlined} from '@ant-design/icons';
// import UploadImage from '../categories/UploadImage';
import { axiosDataSubmit, axiosDataRead, storeFileName, axiosDataUpdate } from '../../redux/crud/axios/actionCreator';
import { useHistory, useLocation } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
// import { useHistory } from 'react-router-dom';

const { Option } = Select;
const ActivateWarrior = () => {
  const dispatch = useDispatch();
  const history = useHistory()
  const [trendTags, setTrendTags] = useState([]);
  const [trendCategories, setTrendCategories] = useState([]);
  const [trendSubcategories, setTrendSubcategories] = useState([]);
  const [categoriesId , setCategoriesId] = useState([])
  const [subCategoriesId , setSubCategoriesId] = useState([])

  const [passwordView, setPasswordView] = useState('password');
  const [genpwd, setGenPwd] = useState('');
  const location = useLocation()
  const pathName = location.pathname
  const userId = pathName.split('/').slice(-1)[0]
  //const [password, setPassword] = useState('');

  const generatePassword = () => {
    var length = 10,
        charset = "@#*&!.abcdefghijk@#*&!.lmnopqrstuvwxyz@#*&!.ABCDEFGHIJKLM@#*&!.NOPQRSTUVWXYZ@#*&!.0123@#*&!.456789",
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    setGenPwd(retVal)
    console.log (retVal);          
}

const getTags = () => {
  //get tags 
  var getData = {};
  getData.api_url = 'v1/admin/get_tags';
  dispatch(axiosDataRead(getData)).then(res => {
    if (res && res.success) {
      //console.log(res);
      setTrendTags(res.data);
    }
  });
  // get the subcategory
  getData={}
  getData.api_url = 'v1/admin/get_categories_subcategories';
  dispatch(axiosDataRead(getData)).then(res => {
    if (res && res.success) {
      setTrendCategories(res.data);
    }
  }).catch(err => console.log("errr" , err));
}

const getCategoriesList =  e => {
  setSubCategoriesId(e)
}

const getSubcategoriesList = e => {
  setCategoriesId(e);
  var getData = {};
  getData.api_url = `v1/admin/get_selected_categories_subcategories?category_ids=${JSON.stringify(e)}`;
  dispatch(axiosDataRead(getData)).then(res => {
    if (res && res.success) {
      //console.log(res);
      setTrendSubcategories(res.data);
    }
  }).catch(err => console.log("errr" , err));
};



//activate the mern2 warrior account 

const activatemern2WarriorAccount = () => {
var updateData = {
  cw_id : userId,
  categories_id:categoriesId,
  subcategories_id:subCategoriesId,
  password:genpwd
}
updateData.api_url = `v1/admin/approve_mern2_warrior`;
dispatch(axiosDataUpdate(updateData)).then(res => {
  if (res && res.success) {
    setSubCategoriesId([])
    setCategoriesId([])
    history.push(`/admin/mern2-warrior/all`);
  }
}).catch( err =>  console.log("errr" , err));
}

useEffect(() => {
  getTags()
}, []);


  return (
    <>
      <PageHeader
        ghost
        title="Activate Warrior"
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
              {/* <Row gutter={25}>
                <Col xs={24} sm={24} md={24} lg={24}>
                  <h2 className="color-black-head" align="center">
                    Assign mern2 Warriors Permissions
                  </h2>
                </Col>
              </Row> */}
              <Cards title="Assign mern2 Warriors Permissions">
                {/* <Form name="multi-form" onFinish={e => handleSubmit(e)} layout="horizontal"> */}
                <Form name="multi-form" layout="horizontal"  >
                  <Row gutter={30}>
                    {/* <Col sm={24} xs={24} md={12} lg={12} xxl={12} className="mb-25">
                      <Form.Item name="tags_ids" rules={[{ required: true, message: 'Required!' }]} label="Tags">
                        <Select size="large" mode="multiple" placeholder="Tags" className="sDash_fullwidth-select">
                          {trendTags.length > 0 &&
                            trendTags.map((tagData, index) => (
                              <Option key={index} value={tagData._id}>
                                {tagData.tag_name}
                              </Option>
                            ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col sm={24} xs={24} md={12} lg={12} xxl={12} className="mb-25">
                      <Form.Item
                        name="focus_tags_ids"
                        rules={[{ required: true, message: 'Required!' }]}
                        label="Focused Tags"
                      >
                        <Select
                          size="large"
                          mode="multiple"
                          placeholder="Focused Tags"
                          className="sDash_fullwidth-select"
                        >
                          {trendTags.length > 0 &&
                            trendTags.map((tagData, index) => (
                              <Option key={index} value={tagData._id}>
                                {tagData.tag_name}
                              </Option>
                            ))}
                        </Select>
                      </Form.Item>
                    </Col> */}
                    <Col sm={24} xs={24} md={12} lg={12} xxl={12} className="mb-25">
                      <Form.Item
                        name="category_ids"
                        rules={[{ required: true, message: 'Required!' }]}
                        label="Categories"
                      >
                        <Select
                          size="medium"
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
                    </Col>
                    <Col sm={24} xs={24} md={12} lg={12} xxl={12} className="mb-25">
                      {trendSubcategories.length > 0 && (
                        <Form.Item
                          name="subcategory_ids"
                          rules={[{ required: true, message: 'Required!' }]}
                          label="Sub Categories"
                        >
                          <Select
                            size="medium"
                            mode="multiple"
                            placeholder="Subcategories"
                            className="sDash_fullwidth-select"
                            onChange={e => getCategoriesList(e)}
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
                    </Col>
                  </Row>
                  <Row className="gen-passwrd" gutter={25}>
                    <Col sm={24} xs={24} md={8} lg={8} xxl={8} className="mb-25">

                      {/* {genpwd !== "" && 
                      <Form.Item
                        label="Password"
                        name="password"
                        initialValue={genpwd}
                        // value={genpwd}
                        // initialValue={genpwd}
                        rules={[{ required: true, message: 'Please input your password!' }]}
                        onChange={e => setGenPwd(e.target.value)}
                      >
                        <Input.Password />
                      </Form.Item>}
                      
                      {genpwd} */}
                      <div className="input-group mb-3 side-b-side">
                        <div className="input-group-prepend">
                            <span className="input-group-text" id="basic-addon1">
                                {passwordView == 'password' ?
                                    <EyeOutlined onClick={() => setPasswordView('text')} /> :
                                    <EyeInvisibleOutlined onClick={() => setPasswordView('password')} />}
                            </span>
                        </div>
                        <input type={passwordView} className="form-control activate_pass_gen" value={genpwd} onChange={e => setGenPwd(e.target.value)} />
                    </div>
                    {/* <Input size="small" defaultValue={genpwd} onChange={e => setGenPwd(e.target.value)} placeholder="small size" prefix={<EyeOutlined />} /> */}
                      {/* <input defaultValue={genpwd} onChange={e => setGenPwd(e.target.value)}/> */}
                    </Col>
                    <Col sm={24} xs={24} md={7} lg={7} xxl={7} className="mb-25">
                      <Form.Item>
                        <Button type="primary" onClick={() => generatePassword()}>Generate Password</Button>
                      </Form.Item>
                    </Col>
                    <Col sm={24} xs={24} md={8} lg={8} xxl={8} className="mb-25"></Col>
                  </Row>
                  <Row>
                    <Col sm={24} xs={24} md={8} lg={8} xxl={8} className="mb-25">
                      <Form.Item name="notification" valuePropName="checked">
                        <Checkbox>Send User Notification</Checkbox>
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={24} xs={24} md={8} lg={8} xxl={8} className="mb-25">
                      <Form.Item>
                         <Button htmlType="submit" onClick={() => activatemern2WarriorAccount()} type="primary">Activate</Button>
                      </Form.Item>
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

export default ActivateWarrior;
