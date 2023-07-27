import React, { useEffect, useState, Fragment } from 'react';
import {
  Row,
  Col,
  Button,
  Form,
  Input,
  Radio,
  InputNumber,
  Select,
  Checkbox,
  DatePicker,
  TimePicker,
  Collapse,
} from 'antd';
import { Main, EventsFormWrapper } from '../styled';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Cards } from '../../components/cards/frame/cards-frame';
import moment from 'moment';
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';
import { useDispatch, useSelector } from 'react-redux';
import { axiosDataSubmit, axiosDataRead, storeFileName } from '../../redux/crud/axios/actionCreator';
import UploadImage from '../categories/UploadImage';

const AddEvent = () => {
  const dispatch = useDispatch();
  const [trendCategories, setTrendCategories] = useState([]);
  const [trendSubcategories, setTrendSubcategories] = useState([]);
  const [seoHeadSchemaArray, setSeoHeadSchemaArray] = useState(['']);
  const [seoBodySchemaArray, setSeoBodySchemaArray] = useState(['']);

  const { Panel } = Collapse;

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

  const onCheckEventChange = e => {
    console.log(`checked = ${e.target.checked}`);
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

  return (
    <>
      <PageHeader ghost title="Add Event" />

      <Main>
        <Row gutter={25}>
          <Col xs={24} sm={24}>
            <EventsFormWrapper className="mb-25">
              <Cards title="Add New Event">
                <Form name="multi-form" layout="horizontal" className="add-events-form">
                  <Row gutter={30}>
                    <Col sm={16} xs={24}>
                      <Row gutter={6} className="mb-10">
                        <Col sm={12} xs={24}>
                          <Form.Item
                            name="event-title"
                            rules={[
                              {
                                required: true,
                                message: 'Required!',
                                whitespace: true,
                              },
                            ]}
                            label="Event Title"
                          >
                            <Input placeholder="Event Title" />
                          </Form.Item>
                        </Col>
                        <Col sm={12} xs={24}>
                          <Form.Item
                            name="Organizer"
                            rules={[
                              {
                                required: true,
                                message: 'Required!',
                                whitespace: true,
                              },
                            ]}
                            label="Organizer"
                          >
                            <Input placeholder="Organizer" />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={6} className="mb-10">
                        {/* <Col sm={12} xs={24}>
                          <Form.Item
                            label="Category"
                            rules={[
                              {
                                required: true,
                              },
                            ]}
                          >
                            <Select placeholder="Select a category">
                              <Select.Option value="category">Category </Select.Option>
                            </Select>
                          </Form.Item>
                        </Col> */}
                        <Col sm={24} xs={24}>
                          <Form.Item
                            label="Event Type"
                            rules={[
                              {
                                required: true,
                              },
                            ]}
                          >
                            <Select placeholder="Select a Location">
                              <Select.Option value="online">Online </Select.Option>
                              <Select.Option value="offline">Offline </Select.Option>
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={6} className="mb-10">
                        <Col sm={24} xs={24}>
                          <Form.Item
                            name="location-name"
                            rules={[
                              {
                                required: true,
                                message: 'Required!',
                                whitespace: true,
                              },
                            ]}
                            label="Enter Location"
                          >
                            <Input placeholder="Enter Location" />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={6} className="mb-10">
                        <Col sm={12} xs={24}>
                          <Form.Item
                            rules={[
                              {
                                required: true,
                                message: 'Required!',
                              },
                            ]}
                            label="Event Start Date"
                          >
                            <DatePicker />
                          </Form.Item>
                        </Col>
                        <Col sm={12} xs={24}>
                          <Form.Item
                            rules={[
                              {
                                required: true,
                                message: 'Required!',
                              },
                            ]}
                            label="Event End Date"
                          >
                            <DatePicker />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={6} className="mb-10">
                        <Col sm={12} xs={24}>
                          <Form.Item label="Event Start Time">
                            <TimePicker defaultValue={moment('12:08:23', 'HH:mm:ss')} />
                          </Form.Item>
                        </Col>
                        <Col sm={12} xs={24}>
                          <Form.Item label="Event End Time">
                            <TimePicker defaultValue={moment('12:08:23', 'HH:mm:ss')} />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={6} className="mb-10">
                        <Col sm={24} xs={24}>
                          <Form.Item label="Event Description">
                            <SunEditor height="300" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={6} className="mb-10">
                        <Col sm={24} xs={24}>
                          <Collapse accordion className="events_accordion_info">
                            <Panel header="SEO" key="1">
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
                          </Collapse>
                        </Col>
                      </Row>
                      <Row>
                    <Col sm={12} xs={24}>
                      <div className="sDash_form-action">
                        <Button className="btn-signin" htmlType="submit" type="primary" size="large">
                          Add Event
                        </Button>
                      </div>
                    </Col>
                  </Row>
                    </Col>
                    <Col sm={8} xs={24}>
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
                              <Select.Option key={index} value={data._id}>
                                {data.title}
                              </Select.Option>
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
                          >
                            {trendSubcategories.length > 0 &&
                              trendSubcategories.map((data, index) => (
                                <Select.Option key={index} value={data._id}>
                                  {data.title}
                                </Select.Option>
                              ))}
                          </Select>
                        </Form.Item>
                      )}

                      <Form.Item name="event_featured_images" rules={[{ required: true, message: 'Required!' }]}>
                        <div className="sDash_check-list-wrap">
                          <p className="fontweight600 m-0">Event Featured Images</p>
                          <UploadImage />
                          <p className="fontweight600">Please use Image size 700px x 700px.</p>
                        </div>
                      </Form.Item>

                      <Form.Item>
                        <Checkbox onChange={onCheckEventChange}>Add as Featured Event</Checkbox>
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              </Cards>
            </EventsFormWrapper>
          </Col>
        </Row>
      </Main>
    </>
  );
};

export default AddEvent;
