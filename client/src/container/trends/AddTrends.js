import React, { useEffect, useState, Fragment, useRef } from 'react';
import { Row, Col, Button, Form, Input, Radio, InputNumber, Select, Checkbox, Collapse } from 'antd';
import { Main, BasicFormWrapper } from '../styled';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Cards } from '../../components/cards/frame/cards-frame';
import UploadImage from '../categories/UploadImage';
import { axiosDataSubmit, axiosDataRead, storeFileName } from '../../redux/crud/axios/actionCreator';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';

const { Option } = Select;
const { TextArea } = Input;
const FormLayout = () => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const history = useHistory();

  const { Panel } = Collapse;

  const [summary, setsummary] = useState('');
  const [featured, setfeatured] = useState(false);
  const [referenceArray, setReferenceArray] = useState(['']);
  const [seoHeadSchemaArray, setSeoHeadSchemaArray] = useState(['']);
  const [seoBodySchemaArray, setSeoBodySchemaArray] = useState(['']);
  const [featureImagesIdsArray, setFeatureImagesIdsArray] = useState([]);
  const [published, setpublished] = useState(false)
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
  const [trendlisting, settrendlistings] = useState([]);
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

  const getTrendsList = e => {
    settrendlistings([]);
    var getData = {};
    getData.api_url = `/v1/admin/get_selected_categories_subcategories_trends?subcategories_ids=${JSON.stringify(e)}`;
    dispatch(axiosDataRead(getData)).then(res => {
      if (res && res.success) {
        //console.log(res);
        settrendlistings(res.data);
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
  let handlepublish = (e) => {
    setpublished(e)
  }
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
  const handleSubmit = (e, publish) => {
    //e.preventDefault();
    console.log(e, "event");
    var formData = e;
    formData.api_url = 'v1/admin/add_trend';
    formData.summary = summary;
    formData.publication_status = published;
    formData.featured = featured;
    formData.featured_images = featureImagesIdsArray;
    formData.reference_links = referenceArray;
    formData.head_scripts = seoHeadSchemaArray;
    formData.body_scripts = seoBodySchemaArray;
    dispatch(axiosDataSubmit(formData)).then(res => {
      if (res && res.success) {
        history.push('all');
      }
    });
  };

  // const onaccordionChange = key => {
  //   console.log(key);
  // };
  const handleEditorChange = content => {
    console.log(content);
    setsummary(content);
  };

  const onCheckTrendChange = e => {
    console.log(`checked = ${e.target.checked}`);
    setfeatured(e.target.checked)
  };

  return (
    <>
      <PageHeader
        ghost
        title="Add New Trend"
      // buttons={[
      //   <div key="1" className="page-header-actions">
      //     <Button size="small" type="primary">
      //       Draft
      //     </Button>
      //     <Button size="small" type="primary">
      //       Publish
      //     </Button>
      //   </div>,
      // ]}
      />
      <Main>
        <Row gutter={25}>
          <Col xs={24} sm={24}>
            <BasicFormWrapper className="mb-25">
              <Cards title="Add Trend">
                <Form name="multi-form"
                  onFinish={e => handleSubmit(e)}
                  layout="horizontal" className="form-trends">

                  <Row gutter={30}>
                    <Col sm={16} xs={24}>
                      <Form.Item
                        name="title"
                        rules={[
                          {
                            required: true,
                            message: 'Required!',
                            whitespace: true,
                          },
                        ]}
                        label="Title"
                      >
                        <Input placeholder="Title" />
                      </Form.Item>
                      <Form.Item name="author_type" style={{ display: 'none' }} initialValue={1} label="Author Type">
                        <Input />
                      </Form.Item>

                      <Form.Item
                        name="sub_heading"
                        rules={[
                          {
                            required: true,
                            message: 'Required!',
                            whitespace: true,
                          },
                        ]}
                        label="Sub Heading"
                      >
                        <Input placeholder="Sub Heading" />
                      </Form.Item>
                      <Row gutter={10}>
                        <Col sm={24} xs={24} className="mb-15">
                          <Form.Item
                            name="summary"
                            rules={[
                              {
                                required: true,
                                message: 'Required!',
                                whitespace: true,
                              },
                            ]}
                            label="Summary"
                          >
                            <SunEditor
                              height="300"
                              // setOptions={{
                              //   height: 400,
                              // }}
                              showToolbar={true}
                              onChange={handleEditorChange}
                            // setDefaultStyle="height: auto"
                            />
                            {/* <TextArea placeholder="Summary" /> */}
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={10}>
                        {/* <Col sm={12} xs={24} className="mb-15">
                          <Form.Item
                            name="summary"
                            rules={[
                              {
                                required: true,
                                message: 'Required!',
                                whitespace: true,
                              },
                            ]}
                            label="Summary"
                          >
                            <TextArea placeholder="Summary" />
                          </Form.Item>
                        </Col> */}
                        <Col sm={24} xs={24} lg={24} md={24} className="mb-15">
                          <Form.Item
                            name="review_summary"
                            rules={[
                              {
                                required: true,
                                message: 'Required!',
                                whitespace: true,
                              },
                            ]}
                            label="Review summary"
                          >
                            <TextArea placeholder="Review Summary" />
                          </Form.Item>
                        </Col>

                        <Form.Item name={`reference_links`} style={{ display: 'none' }} value={referenceArray}>
                          <Input placeholder="Reference Link" />
                        </Form.Item>

                        <label className="custom-labels">
                          <span style={{ color: 'Red' }} className="red-star">
                            *
                          </span>{' '}
                          Reference Links :{' '}
                        </label>
                        {referenceArray.length > 0 &&
                          referenceArray.map((referenceData, index) => (
                            <Fragment key={index}>
                              <Col sm={22} xs={19} xl={21} xxl={22} className="mb-25">
                                <input
                                  type="url"
                                  value={referenceData}
                                  id={`reference_${index}`}
                                  placeholder={`Reference Link ${index + 1}`}
                                  className="ant-input"
                                  onChange={e => handleChange(index, e.target.value)}
                                  required
                                />
                              </Col>
                              <Col sm={1} xs={1} className="mb-25"></Col>
                              <Col sm={1} xs={1} className="mb-25">
                                {index == 0 ? (
                                  <Button
                                    className="btn-signin add_trend_plus-btn"
                                    style={{ height: '100%' }}
                                    type="primary"
                                    size="large"
                                    onClick={() => setReferenceArray(prevState => [...prevState, ''])}
                                  >
                                    +
                                  </Button>
                                ) : (
                                  <Button
                                    className="btn-signin add_trend_cross-btn"
                                    type="danger"
                                    size="large"
                                    style={{ height: '100%' }}
                                    onClick={() =>
                                      setReferenceArray(referenceArray.filter((s, sindex) => index !== sindex))
                                    }
                                  >
                                    x
                                  </Button>
                                )}
                              </Col>
                            </Fragment>
                          ))}
                        <Col sm={24} xs={24} lg={24} md={24} className="mb-15">
                          <Form.Item
                            name="read_time"
                            rules={[
                              {
                                required: true,
                                message: 'Required!',
                              },
                            ]}
                            label="Read Time"
                          >
                            <InputNumber placeholder="10min" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={10}>
                        <Col sm={24} xs={24} md={24} lg={24}>
                          <Collapse accordion className="trends_accordion_info">
                            <Panel header="Compass Metric" key="1">
                              <Row gutter={10}>
                                <Col sm={12} xs={24} className="mb-25">
                                  <Form.Item
                                    name="popularity"
                                    rules={[
                                      {
                                        required: true,
                                        message: 'Required!',
                                      },
                                    ]}
                                    label="Popularity (out of 10)"
                                  >
                                    <InputNumber placeholder="10" />
                                  </Form.Item>
                                </Col>
                                <Col sm={12} xs={24} className="mb-25">
                                  <Form.Item
                                    name="inventiveness"
                                    rules={[
                                      {
                                        required: true,
                                        message: 'Required!',
                                      },
                                    ]}
                                    label="Inventiveness (out of 10)"
                                  >
                                    <InputNumber placeholder="10" />
                                  </Form.Item>
                                </Col>
                                <Col sm={12} xs={24} className="mb-25">
                                  <Form.Item
                                    name="engagement"
                                    rules={[
                                      {
                                        required: true,
                                        message: 'Required!',
                                      },
                                    ]}
                                    label="Engagement (out of 10)"
                                  >
                                    <InputNumber placeholder="10" />
                                  </Form.Item>
                                </Col>
                                <Col sm={12} xs={24} className="mb-25">
                                  <Form.Item
                                    name="human_centricity"
                                    rules={[
                                      {
                                        required: true,
                                        message: 'Required!',
                                      },
                                    ]}
                                    label="Human Centricity (out of 10)"
                                  >
                                    <InputNumber placeholder="10" />
                                  </Form.Item>
                                </Col>
                                <Col sm={12} xs={24} className="mb-25">
                                  <Form.Item
                                    name="score"
                                    rules={[
                                      {
                                        required: true,
                                        message: 'Required!',
                                      },
                                    ]}
                                    label="Score (out of 10)"
                                  >
                                    <InputNumber placeholder="10" />
                                  </Form.Item>
                                  {/* <Form.Item
                                    name="read_time"
                                    rules={[
                                      {
                                        required: true,
                                        message: 'Required!',
                                      },
                                    ]}
                                    label="Read Time"
                                  >
                                    <InputNumber placeholder="10min" />
                                  </Form.Item> */}
                                </Col>
                                {/* <Col sm={12} xs={24} className="mb-25">
                                  <Form.Item
                                    name="mern2_compass"
                                    rules={[{ required: true, message: 'Required!' }]}
                                    label="Compass Matrics"
                                  >
                                    <Select
                                      size="medium"
                                      mode="multiple"
                                      placeholder="Compass Matrics"
                                      className="sDash_fullwidth-select shrt-size"
                                    >
                                      {trendsInfo.mern2_compass.length > 0 &&
                                        trendsInfo.mern2_compass.map(
                                          (data, index) =>
                                            index > 0 && (
                                              <Option key={index} value={index}>
                                                {data}
                                              </Option>
                                            ),
                                        )}
                                    </Select>
                                  </Form.Item>
                                </Col> */}
                                <Col sm={12} xs={24} className="mb-25">
                                  <Form.Item
                                    name="geography"
                                    rules={[{ required: true, message: 'Required!' }]}
                                    label="Geography"
                                  >
                                    <Select
                                      size="medium"
                                      mode="multiple"
                                      placeholder="Geography"
                                      className="sDash_fullwidth-select shrt-size"
                                    >
                                      {trendsInfo.regions.length > 0 &&
                                        trendsInfo.regions.map((geographyData, index) => (
                                          <Option key={index} value={index}>
                                            {geographyData}
                                          </Option>
                                        ))}
                                    </Select>
                                  </Form.Item>
                                </Col>
                                <Col sm={12} xs={24} className="mb-25">
                                  <Form.Item
                                    name="gender"
                                    rules={[{ required: true, message: 'Required!' }]}
                                    label="Gender"
                                  >
                                    <Select
                                      size="medium"
                                      mode="multiple"
                                      placeholder="Gender"
                                      className="sDash_fullwidth-select shrt-size"
                                    >
                                      {trendsInfo.genders.length > 0 &&
                                        trendsInfo.genders.map(
                                          (data, index) =>
                                            index > 0 && (
                                              <Option key={index} value={index}>
                                                {data}
                                              </Option>
                                            ),
                                        )}
                                    </Select>
                                  </Form.Item>
                                </Col>
                                <Col sm={12} xs={24} className="mb-25">
                                  <Form.Item
                                    name="age_group"
                                    rules={[{ required: true, message: 'Required!' }]}
                                    label="Age Group"
                                  >
                                    <Select
                                      size="medium"
                                      mode="multiple"
                                      placeholder="Age Group"
                                      className="sDash_fullwidth-select shrt-size"
                                    >
                                      {trendsInfo.age_group.length > 0 &&
                                        trendsInfo.age_group.map(
                                          (data, index) =>
                                            index > 0 && (
                                              <Option key={index} value={index}>
                                                {data}
                                              </Option>
                                            ),
                                        )}
                                    </Select>
                                  </Form.Item>
                                </Col>
                                <Col sm={12} xs={24} className="mb-25">
                                  <Form.Item
                                    name="views_count_start_from"
                                    rules={[
                                      {
                                        required: true,
                                        message: 'Required!',
                                      },
                                    ]}
                                    label="Views Count Start From"
                                  >
                                    <InputNumber placeholder="100" />
                                  </Form.Item>
                                </Col>
                                {/* <Col sm={12} xs={24} className="mb-25">
                                  <Form.Item
                                    name="category_ids"
                                    rules={[{ required: true, message: 'Required!' }]}
                                    label="Categories"
                                  >
                                    <Select
                                      size="medium"
                                      mode="multiple"
                                      placeholder="Categories"
                                      className="sDash_fullwidth-select shrt-size"
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
                                <Col sm={12} xs={24} className="mb-25">
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
                                        className="sDash_fullwidth-select shrt-size"
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
                                </Col> */}
                              </Row>
                            </Panel>
                            <Panel header="SEO" key="2">
                              <Form.Item
                                name="h1_tag"
                                rules={[
                                  {
                                    message: 'Required!',
                                    whitespace: true,
                                  },
                                ]}
                                label="H1 Tag"
                              >
                                <Input placeholder="H1 Tag" />
                              </Form.Item>
                              <Form.Item
                                name="meta_content"
                                rules={[
                                  {
                                    message: 'Required!',
                                    whitespace: true,
                                  },
                                ]}
                                label="Meta Content"
                              >
                                <Input placeholder="Meta Content" />
                              </Form.Item>
                              <Form.Item
                                name={`head_schema`}
                                style={{ display: 'none' }}
                                value={seoHeadSchemaArray}
                              //rules={[{ required: true, message: 'Required!' }]}
                              >
                                <Input placeholder="Reference Link" />
                              </Form.Item>

                              <Form.Item
                                name={`body_schema`}
                                style={{ display: 'none' }}
                                value={seoBodySchemaArray}
                              //rules={[{ required: true, message: 'Required!' }]}
                              >
                                <Input placeholder="Reference Link" />
                              </Form.Item>
                              <Row>
                                <Col sm={12} xs={24}>
                                  <label className="custom-labels">
                                    {/* <span style={{ color: 'Red' }} class="red-star">
                                      *
                                    </span>{' '} */}
                                    Head Schema :{/* {' '} */}
                                  </label>
                                  <Row gutter={8}>
                                    {seoHeadSchemaArray.length > 0 &&
                                      seoHeadSchemaArray.map((seoData, index) => (
                                        <Fragment key={index}>
                                          <Col sm={21} xs={20} md={19} lg={19} xxl={21} className="mb-25">
                                            <input
                                              type="text"
                                              value={seoData}
                                              id={`head_${index}`}
                                              placeholder={`Head Schema ${index + 1}`}
                                              className="ant-input"
                                              onChange={e => handleChangeSeoHead(index, e.target.value)}
                                            />
                                          </Col>
                                          <Col sm={1} xs={1} className="mb-25">
                                            {index == 0 ? (
                                              <Button
                                                className="btn-signin add_trend_plus-btn"
                                                style={{ height: '100%' }}
                                                type="primary"
                                                size="large"
                                                onClick={() => setSeoHeadSchemaArray(prevState => [...prevState, ''])}
                                              >
                                                +
                                              </Button>
                                            ) : (
                                              <Button
                                                className="btn-signin add_trend_cross-btn"
                                                type="danger"
                                                size="large"
                                                style={{ height: '100%' }}
                                                onClick={() =>
                                                  setSeoHeadSchemaArray(
                                                    seoHeadSchemaArray.filter((s, sindex) => index !== sindex),
                                                  )
                                                }
                                              >
                                                x
                                              </Button>
                                            )}
                                          </Col>
                                        </Fragment>
                                      ))}
                                  </Row>
                                </Col>
                                <Col sm={12} xs={24}>
                                  <label className="custom-labels">
                                    {/* <span style={{ color: 'Red' }} class="red-star">
                                      *
                                    </span>{' '} */}
                                    Body Schema :{/* {' '} */}
                                  </label>
                                  <Row gutter={8}>
                                    {seoBodySchemaArray.length > 0 &&
                                      seoBodySchemaArray.map((seoData, index) => (
                                        <Fragment key={index}>
                                          <Col sm={21} xs={20} md={19} lg={19} xxl={21} className="mb-25">
                                            <input
                                              type="text"
                                              value={seoData}
                                              id={`body_${index}`}
                                              placeholder={`Body Schema ${index + 1}`}
                                              className="ant-input"
                                              onChange={e => handleChangeSeoBody(index, e.target.value)}
                                            />
                                          </Col>

                                          <Col sm={1} xs={1} className="mb-25">
                                            {index == 0 ? (
                                              <Button
                                                className="btn-signin add_trend_plus-btn"
                                                style={{ height: '100%' }}
                                                type="primary"
                                                size="large"
                                                onClick={() => setSeoBodySchemaArray(prevState => [...prevState, ''])}
                                              >
                                                +
                                              </Button>
                                            ) : (
                                              <Button
                                                className="btn-signin add_trend_cross-btn"
                                                type="danger"
                                                size="large"
                                                style={{ height: '100%' }}
                                                onClick={() =>
                                                  setSeoBodySchemaArray(
                                                    seoBodySchemaArray.filter((s, sindex) => index !== sindex),
                                                  )
                                                }
                                              >
                                                x
                                              </Button>
                                            )}
                                          </Col>
                                        </Fragment>
                                      ))}
                                  </Row>
                                </Col>
                              </Row>
                            </Panel>
                            {/* <Panel header="This is panel header 3" key="3">
                              <p>{accareatext}</p>
                            </Panel> */}
                          </Collapse>
                        </Col>
                      </Row>

                      {/* <Form.Item
                        name="video_link"
                        rules={[
                          {
                            required: true,
                            message: 'Required!',
                            whitespace: true,
                          },
                        ]}
                        label="Video Link"
                      >
                        <Input placeholder="Video Link" />
                      </Form.Item> */}
                      {/* <div className="seo_infoarea"> */}
                      {/* <Form.Item
                        name="h1_tag"
                        rules={[
                          {
                            required: true,
                            message: 'Required!',
                            whitespace: true,
                          },
                        ]}
                        label="H1 Tag"
                      >
                        <Input placeholder="H1 Tag" />
                      </Form.Item>
                      <Form.Item
                        name="meta_content"
                        rules={[
                          {
                            required: true,
                            message: 'Required!',
                            whitespace: true,
                          },
                        ]}
                        label="Meta Content"
                      >
                        <Input placeholder="Meta Content" />
                      </Form.Item>
                      <Form.Item
                        name={`head_schema`}
                        style={{ display: 'none' }}
                        value={seoHeadSchemaArray}
                        //rules={[{ required: true, message: 'Required!' }]}
                      >
                        <Input placeholder="Reference Link" />
                      </Form.Item>
                      <Form.Item
                        name={`body_schema`}
                        style={{ display: 'none' }}
                        value={seoBodySchemaArray}
                        //rules={[{ required: true, message: 'Required!' }]}
                      >
                        <Input placeholder="Reference Link" />
                      </Form.Item> */}
                    </Col>
                    <Col sm={8} xs={24} className="mb-25 trend-right-side">
                      <Form.Item name="format" rules={[{ required: true, message: 'Required!' }]}>
                        <div className="sDash_check-list-wrap">
                          <p className="fontweight600">Format</p>
                          <Radio.Group>
                            <ul className="sDash_check-list sDash_check-list--right format_list_trends">
                              {trendsInfo.format.length > 0 &&
                                trendsInfo.format.map(
                                  (formatData, index) =>
                                    index > 0 && (
                                      <li key={index}>
                                        <Radio value={index}>{formatData}</Radio>
                                      </li>
                                    ),
                                )}
                            </ul>
                          </Radio.Group>
                        </div>
                      </Form.Item>
                      <Form.Item
                        name="mern2_compass"
                        rules={[{ required: true, message: 'Required!' }]}
                        label="Compass Matrics"
                      >
                        <Select
                          size="medium"
                          mode="multiple"
                          placeholder="Compass Matrics"
                          className="sDash_fullwidth-select shrt-size"
                        >
                          {trendsInfo.mern2_compass.length > 0 &&
                            trendsInfo.mern2_compass.map(
                              (data, index) =>
                                index > 0 && (
                                  <Option key={index} value={index}>
                                    {data}
                                  </Option>
                                ),
                            )}
                        </Select>
                      </Form.Item>
                      {/* <Form.Item
                        name="mern2_compass"
                        rules={[{ required: true, message: 'Required!' }]}
                        label="Compass Matrics"
                      >
                        <Select
                          size="large"
                          mode="multiple"
                          placeholder="Compass Matrics"
                          className="sDash_fullwidth-select shrt-size"
                        >
                          {trendsInfo.mern2_compass.length > 0 &&
                            trendsInfo.mern2_compass.map(
                              (data, index) =>
                                index > 0 && (
                                  <Option key={index} value={index}>
                                    {data}
                                  </Option>
                                ),
                            )}
                        </Select>
                      </Form.Item> */}

                      <Form.Item
                        name="category_ids"
                        rules={[{ required: true, message: 'Required!' }]}
                        label="Categories"
                      >
                        <Select
                          size="medium"
                          mode="multiple"
                          placeholder="Categories"
                          className="sDash_fullwidth-select shrt-size"
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
                            size="medium"
                            mode="multiple"
                            placeholder="Subcategories"
                            className="sDash_fullwidth-select shrt-size"
                            onChange={e => getTrendsList(e)}
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
                      {trendlisting.length > 0 && (
                        <Form.Item
                          name="related_trend_ids"
                          rules={[{ required: true, message: 'Required!' }]}
                          label="Trends"
                        >
                          <Select
                            size="medium"
                            mode="multiple"
                            placeholder="Trends"
                            className="sDash_fullwidth-select shrt-size"
                          >
                            {trendlisting.length > 0 &&
                              trendlisting.map((data, index) => (
                                <Option key={index} value={data._id}>
                                  {data.title}
                                </Option>
                              ))}
                          </Select>
                        </Form.Item>
                      )}

                      {/* <Col sm={12} xs={24} className="mb-25"> */}
                      <Form.Item name="tags_ids" rules={[{ required: true, message: 'Required!' }]} label="Tags">
                        <Select
                          size="medium"
                          mode="multiple"
                          placeholder="Tags"
                          className="sDash_fullwidth-select shrt-size"
                        >
                          {trendTags.length > 0 &&
                            trendTags.map((tagData, index) => (
                              <Option key={index} value={tagData._id}>
                                {tagData.tag_name}
                              </Option>
                            ))}
                        </Select>
                      </Form.Item>
                      {/* </Col> */}
                      {/* <Col sm={12} xs={24} className="mb-25"> */}
                      <Form.Item
                        name="focus_tags_ids"
                        rules={[{ required: true, message: 'Required!' }]}
                        label="Focused Tags"
                      >
                        <Select
                          size="medium"
                          mode="multiple"
                          placeholder="Focused Tags"
                          className="sDash_fullwidth-select shrt-size"
                        >
                          {trendTags.length > 0 &&
                            trendTags.map((tagData, index) => (
                              <Option key={index} value={tagData._id}>
                                {tagData.tag_name}
                              </Option>
                            ))}
                        </Select>
                      </Form.Item>
                      {/* </Col> */}

                      {/* <Form.Item name="tags_ids" rules={[{ required: true, message: 'Required!' }]} label="Tags">
                        <Select
                          size="large"
                          mode="multiple"
                          placeholder="Tags"
                          className="sDash_fullwidth-select shrt-size"
                        >
                          {trendTags.length > 0 &&
                            trendTags.map((tagData, index) => (
                              <Option key={index} value={tagData._id}>
                                {tagData.tag_name}
                              </Option>
                            ))}
                        </Select>
                      </Form.Item>
                      <Form.Item
                        name="focus_tags_ids"
                        rules={[{ required: true, message: 'Required!' }]}
                        label="Focused Tags"
                      >
                        <Select
                          size="large"
                          mode="multiple"
                          placeholder="Focused Tags"
                          className="sDash_fullwidth-select shrt-size"
                        >
                          {trendTags.length > 0 &&
                            trendTags.map((tagData, index) => (
                              <Option key={index} value={tagData._id}>
                                {tagData.tag_name}
                              </Option>
                            ))}
                        </Select>
                      </Form.Item> */}
                      {/* <Form.Item name="gender" rules={[{ required: true, message: 'Required!' }]} label="Gender">
                        <Select
                          size="large"
                          mode="multiple"
                          placeholder="Gender"
                          className="sDash_fullwidth-select shrt-size"
                        >
                          {trendsInfo.genders.length > 0 &&
                            trendsInfo.genders.map(
                              (data, index) =>
                                index > 0 && (
                                  <Option key={index} value={index}>
                                    {data}
                                  </Option>
                                ),
                            )}
                        </Select>
                      </Form.Item> */}
                      {/* <Form.Item name="age_group" rules={[{ required: true, message: 'Required!' }]} label="Age Group">
                        <Select
                          size="large"
                          mode="multiple"
                          placeholder="Age Group"
                          className="sDash_fullwidth-select shrt-size"
                        >
                          {trendsInfo.age_group.length > 0 &&
                            trendsInfo.age_group.map(
                              (data, index) =>
                                index > 0 && (
                                  <Option key={index} value={index}>
                                    {data}
                                  </Option>
                                ),
                            )}
                        </Select>
                      </Form.Item> */}
                      {/* <Form.Item name="geography" rules={[{ required: true, message: 'Required!' }]} label="Geography">
                        <Select
                          size="large"
                          mode="multiple"
                          placeholder="Geography"
                          className="sDash_fullwidth-select shrt-size"
                        >
                          {trendsInfo.regions.length > 0 &&
                            trendsInfo.regions.map((geographyData, index) => (
                              <Option key={index} value={index}>
                                {geographyData}
                              </Option>
                            ))}
                        </Select>
                      </Form.Item> */}

                      <Form.Item
                        name="video_link"
                        rules={[
                          {
                            required: true,
                            message: 'Required!',
                            whitespace: true,
                          },
                        ]}
                        label="Video Link"
                      >
                        <Input placeholder="Video Link" />
                      </Form.Item>

                      <Form.Item name="featured_images" rules={[{ required: true, message: 'Required!' }]}>
                        <div className="sDash_check-list-wrap">
                          <p className="fontweight600 m-0">Featured Images</p>
                          <UploadImage uploadedFileName={uploadedFileName} />
                          <p className="fontweight600">Please use Image size 700px x 700px.</p>
                        </div>
                      </Form.Item>

                      <Form.Item>
                        <Checkbox onChange={onCheckTrendChange}>Add as Featured Trend</Checkbox>
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={12} xs={24}>
                      <div className="sDash_form-action">
                        <Button className="btn-signin"
                          htmlType="submit"
                          type="light"
                          size="large"
                          onClick={() => handlepublish(false)}
                        >
                          Save as Draft
                        </Button>
                        <Button
                          className="btn-signin"
                          htmlType="submit"
                          type="primary"
                          size="large"
                          onClick={() => handlepublish(true)}
                        >
                          Publish
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

export default FormLayout;
