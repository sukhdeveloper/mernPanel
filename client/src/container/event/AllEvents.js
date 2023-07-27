import React, { useEffect, useState, Fragment } from 'react';
import { Row, Col, Button, Form, Table, Select, Checkbox, Tabs, Tag, Space,Anchor } from 'antd';
import { Main, EventsFormWrapper } from '../styled';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Cards } from '../../components/cards/frame/cards-frame';
import FeatherIcon from 'feather-icons-react';

const { TabPane } = Tabs;
const { Link } = Anchor;

const { Option } = Select;

const onEventsStatusChange = key => {
  console.log(key);
};

const columns = [
  {
    title: 'Event Name',
    dataIndex: 'eventname',
    key: 'eventname',
    render: text => (
      <div class="event_table_info">
        <p>{text}</p>
        <div id="event_edit_options">
          <Anchor  className="events_options-beneath">
            <Link href='#' title="Edit" />
            <Link href="#" title="Publish" />
            <Link href="#" title="View" />
            <Link href="#" title="Trash" />
          </Anchor>
        </div>
      </div>
    ),
  },
  {
    title: 'Categories',
    dataIndex: 'categories',
    key: 'categories',
  },
  {
    title: 'Organizer',
    dataIndex: 'organizer',
    key: 'organizer',
  },
  {
    title: 'Location',
    dataIndex: 'location',
    key: 'location',
  },
  {
    title: 'Start Date',
    dataIndex: 'startdate',
    key: 'startdate',
  },
  {
    title: 'Actions',
    key: 'action',
    render: (_, row) => (
      <span className="action_for_event_list">
        <FeatherIcon icon="eye" onClick={e => console.log(e, 'custom eye event')} />
        <FeatherIcon icon="lock" onClick={e => console.log(e, 'custom lock event')} />
      </span>
    ),
  },
];
const data = [
  {
    key: '1',
    eventname: 'Event One',
    categories: 'Technology',
    organizer: 'New York No. 1 Lake Park',
    location: 'Location One',
    startdate: '23 Aug, 2022',
  },
  {
    key: '2',
    eventname: 'Event Two',
    categories: 'Music',
    organizer: 'London No. 1 Lake Park',
    location: 'Location two',
    startdate: '24 Aug, 2022',
  },
  {
    key: '3',
    eventname: 'Event Three',
    categories: 'Pop mern2',
    organizer: 'Sidney No. 1 Lake Park',
    location: 'Location three',
    startdate: '25 Aug, 2022',
  },
  {
    key: '3',
    eventname: 'Event Four',
    categories: 'Lifestyle',
    organizer: 'Sidney No. 1 Lake Park',
    location: 'Location Four',
    startdate: '26 Aug, 2022',
  },
];

const AllEvents = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const onSelectChange = newSelectedRowKeys => {
    console.log('selectedRowKeys changed: ', selectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };
  return (
    <>
      <PageHeader ghost title="All Events" />

      <Main>
        <Row gutter={25}>
          <Col xs={24} sm={24}>
            <EventsFormWrapper className="mb-25">
              <Cards headless className="events-table-data">
                <Tabs defaultActiveKey="1" onChange={onEventsStatusChange}>
                  <TabPane tab="All" key="1">
                    <Row>
                      <Col sm={24} xs={24}>
                        <div className="table-header">
                          <Form>
                            <Row gutter={12}>
                              <Col xs={12} sm={12} lg={4} md={4} xl={4} xxl={3}>
                                <Form.Item size="small">
                                  <Select
                                    defaultValue="Bulk Actions"
                                    style={{
                                      width: '100%',
                                    }}
                                    // onChange={selecthandleChange}
                                  >
                                    <Option value="disabled">Bulk Actions</Option>
                                    <Option value="draft">Draft</Option>
                                    <Option value="trash">Trash</Option>
                                  </Select>
                                </Form.Item>
                              </Col>
                              <Col xs={12} sm={12} lg={4} md={4} xl={4} xxl={3}>
                                <Form.Item>
                                  <Button
                                    className="btn-action"
                                    type="primary"
                                    size="large"
                                    style={{ height: 38, width: '100%' }}
                                  >
                                    Apply
                                  </Button>
                                </Form.Item>
                              </Col>
                              <Col xs={12} sm={12} lg={16} md={16} xl={18} xxl={18}></Col>
                            </Row>
                          </Form>
                        </div>

                        <div className="sDash_export-file-table table-bordered table-responsive events_table_records">
                          <Table rowSelection={rowSelection} columns={columns} dataSource={data} />
                          {/* <Table
                              rowSelection={rowSelection} columns={columns} dataSource={data}
                            /> */}
                        </div>
                      </Col>
                    </Row>
                  </TabPane>
                  <TabPane tab="Published" key="2">
                    <Row>
                      <Col sm={24} xs={24}>
                        <div className="table-header">
                          <Form>
                            <Row gutter={12}>
                              <Col xs={12} sm={12} lg={4} md={4} xl={4} xxl={3}>
                                <Form.Item size="small">
                                  <Select
                                    defaultValue="Bulk Actions"
                                    style={{
                                      width: '100%',
                                    }}
                                    // onChange={selecthandleChange}
                                  >
                                    <Option value="disabled">Bulk Actions</Option>
                                    <Option value="draft">Draft</Option>
                                    <Option value="trash">Trash</Option>
                                  </Select>
                                </Form.Item>
                              </Col>
                              <Col xs={12} sm={12} lg={4} md={4} xl={4} xxl={3}>
                                <Form.Item>
                                  <Button
                                    className="btn-action"
                                    type="primary"
                                    size="large"
                                    style={{ height: 38, width: '100%' }}
                                  >
                                    Apply
                                  </Button>
                                </Form.Item>
                              </Col>
                              <Col xs={12} sm={12} lg={16} md={16} xl={18} xxl={18}></Col>
                            </Row>
                          </Form>
                        </div>
                        <div className="sDash_export-file-table table-bordered table-responsive events_table_records">
                          <Table rowSelection={rowSelection} columns={columns} dataSource={data} />
                          {/* <Table
                              rowSelection={rowSelection} columns={columns} dataSource={data}
                            /> */}
                        </div>
                      </Col>
                    </Row>
                  </TabPane>
                  <TabPane tab="Drafts" key="3">
                    <Row>
                      <Col sm={24} xs={24}>
                        <div className="table-header">
                          <Form>
                            <Row gutter={12}>
                              <Col xs={12} sm={12} lg={4} md={4} xl={4} xxl={3}>
                                <Form.Item size="small">
                                  <Select
                                    defaultValue="Bulk Actions"
                                    style={{
                                      width: '100%',
                                    }}
                                    // onChange={selecthandleChange}
                                  >
                                    <Option value="disabled">Bulk Actions</Option>
                                    <Option value="draft">Draft</Option>
                                    <Option value="trash">Trash</Option>
                                  </Select>
                                </Form.Item>
                              </Col>
                              <Col xs={12} sm={12} lg={4} md={4} xl={4} xxl={3}>
                                <Form.Item>
                                  <Button
                                    className="btn-action"
                                    type="primary"
                                    size="large"
                                    style={{ height: 38, width: '100%' }}
                                  >
                                    Apply
                                  </Button>
                                </Form.Item>
                              </Col>
                              <Col xs={12} sm={12} lg={16} md={16} xl={18} xxl={18}></Col>
                            </Row>
                          </Form>
                        </div>
                        <div className="sDash_export-file-table table-bordered table-responsive events_table_records">
                          <Table rowSelection={rowSelection} columns={columns} dataSource={data} />
                          {/* <Table
                              rowSelection={rowSelection} columns={columns} dataSource={data}
                            /> */}
                        </div>
                      </Col>
                    </Row>
                  </TabPane>
                  <TabPane tab="Trash" key="4">
                    <Row>
                      <Col sm={24} xs={24}>
                        <div className="table-header">
                          <Form>
                            <Row gutter={12}>
                              <Col xs={12} sm={12} lg={4} md={4} xl={4} xxl={3}>
                                <Form.Item size="small">
                                  <Select
                                    defaultValue="Bulk Actions"
                                    style={{
                                      width: '100%',
                                    }}
                                    // onChange={selecthandleChange}
                                  >
                                    <Option value="disabled">Bulk Actions</Option>
                                    <Option value="draft">Draft</Option>
                                    <Option value="trash">Trash</Option>
                                  </Select>
                                </Form.Item>
                              </Col>
                              <Col xs={12} sm={12} lg={4} md={4} xl={4} xxl={3}>
                                <Form.Item>
                                  <Button
                                    className="btn-action"
                                    type="primary"
                                    size="large"
                                    style={{ height: 38, width: '100%' }}
                                  >
                                    Apply
                                  </Button>
                                </Form.Item>
                              </Col>
                              <Col xs={12} sm={12} lg={16} md={16} xl={18} xxl={18}></Col>
                            </Row>
                          </Form>
                        </div>
                        <div className="sDash_export-file-table table-bordered table-responsive events_table_records">
                          <Table rowSelection={rowSelection} columns={columns} dataSource={data} />
                          {/* <Table
                              rowSelection={rowSelection} columns={columns} dataSource={data}
                            /> */}
                        </div>
                      </Col>
                    </Row>
                  </TabPane>
                  <TabPane tab="Event Requests" key="5">
                    <Row>
                      <Col sm={24} xs={24}>
                        <div className="table-header">
                          <Form>
                            <Row gutter={12}>
                              <Col xs={12} sm={12} lg={4} md={4} xl={4} xxl={3}>
                                <Form.Item size="small">
                                  <Select
                                    defaultValue="Bulk Actions"
                                    style={{
                                      width: '100%',
                                    }}
                                    // onChange={selecthandleChange}
                                  >
                                    <Option value="disabled">Bulk Actions</Option>
                                    <Option value="draft">Draft</Option>
                                    <Option value="trash">Trash</Option>
                                  </Select>
                                </Form.Item>
                              </Col>
                              <Col xs={12} sm={12} lg={4} md={4} xl={4} xxl={3}>
                                <Form.Item>
                                  <Button
                                    className="btn-action"
                                    type="primary"
                                    size="large"
                                    style={{ height: 38, width: '100%' }}
                                  >
                                    Apply
                                  </Button>
                                </Form.Item>
                              </Col>
                              <Col xs={12} sm={12} lg={16} md={16} xl={18} xxl={18}></Col>
                            </Row>
                          </Form>
                        </div>
                        <div className="sDash_export-file-table table-bordered table-responsive events_table_records">
                          <Table rowSelection={rowSelection} columns={columns} dataSource={data} />
                          {/* <Table
                              rowSelection={rowSelection} columns={columns} dataSource={data}
                            /> */}
                        </div>
                      </Col>
                    </Row>
                  </TabPane>
                </Tabs>
              </Cards>
            </EventsFormWrapper>
          </Col>
        </Row>
      </Main>
    </>
  );
};

export default AllEvents;
