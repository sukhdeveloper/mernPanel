import React, { useState, useEffect } from 'react';
import { Row, Col, Table, Modal, Form, Input, Select } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { useSelector, useDispatch } from 'react-redux';
import { CSVLink } from 'react-csv';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Main, ExportStyleWrap } from '../styled';
import { Cards } from '../../components/cards/frame/cards-frame';
import { Button } from '../../components/buttons/buttons';
import { ShareButtonPageHeader } from '../../components/buttons/share-button/share-button';
import { ExportButtonPageHeader } from '../../components/buttons/export-button/export-button';
import { CalendarButtonPageHeader } from '../../components/buttons/calendar-button/calendar-button';
import { AutoComplete } from '../../components/autoComplete/autoComplete';
import { contactSearchData } from '../../redux/contact/actionCreator';
import { alertModal } from '../../components/modals/antd-modals';
import { axiosDataSubmit, axiosDataRead, axiosDataUpdate } from '../../redux/crud/axios/actionCreator';
import { Tag } from '../../components/tags/tags';
import { Checkbox } from 'antd';
import { Anchor } from 'antd';
import { Tabs } from 'antd';

const { Link } = Anchor;

const { TabPane } = Tabs;

const onTrendsStatusChange = key => {
  console.log(key);
};

const Import = () => {
  const dispatch = useDispatch();
  const { users } = useSelector(state => {
    return {
      users: state.Contact.data,
    };
  });
  const [data, setData] = useState([]);
  const [publishdeddata, setpublisheddata] = useState([]);
  const [Draftdata, setDraftdata] = useState([]);
  const [featured, setfeatured] = useState([]);
  const [Deleteddata, setDeleteddata] = useState([]);
  const [Actions, setActions] = useState('');
  const [targetOffset, setTargetOffset] = useState(undefined);
  const [somethingChanged, setSomethingChanged] = useState(false);
  const [current, setCurrent] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecord, setTotalRecord] = useState(0);
  const [selectedTabPanel, setSelectedTabPanel] = useState(1);
  const onChange = page => {
    //console.log(page.current);
    setCurrent(page.current);
  };
  useEffect(() => {
    setTargetOffset(window.innerHeight / 2);
  }, []);
  useEffect(() => {
    var getData = {};
    var queryString = '';
    if (selectedTabPanel == 2) {
      queryString += 'published=true';
    } else if (selectedTabPanel == 3) {
      queryString += 'draft=true';
    } else if (selectedTabPanel == 3) {
      queryString += 'trash=true';
    } else if (selectedTabPanel == 5) {
      queryString += 'featured=true';
    }
    getData.api_url = `v1/admin/get_trends?pageNo=${currentPage}&${queryString}`;
    dispatch(axiosDataRead(getData)).then(res => {
      if (res && res.success) {
        setTotalRecord(res.data.totalCount);
        var originData = [];
        for (let i = 0; i < res.data.trends.length; i++) {
          originData.push({
            key: i.toString(),
            ...res.data.trends[i],
          });
        }
        setData(originData);
      }
    });
  }, [somethingChanged, currentPage]);
  useEffect(() => {
    var getData = {};
    var queryString = '';
    if (selectedTabPanel == 2) {
      queryString += 'published=true';
    } else if (selectedTabPanel == 3) {
      queryString += 'draft=true';
    } else if (selectedTabPanel == 4) {
      queryString += 'trash=true';
    } else if (selectedTabPanel == 5) {
      queryString += 'featured=true';
    }
    getData.api_url = `v1/admin/get_trends?pageNo=${currentPage}&${queryString}`;
    dispatch(axiosDataRead(getData)).then(res => {
      if (res && res.success) {
        setTotalRecord(res.data.totalCount);
        var originData = [];
        for (let i = 0; i < res.data.trends.length; i++) {
          originData.push({
            key: i.toString(),
            ...res.data.trends[i],
          });
        }
        setData(originData);
        setCurrentPage(1);
      }
    });
  }, [selectedTabPanel]);
  const [state, setState] = useState({
    isModalVisible: false,
    fileName: 'trends-records',
    convertedTo: 'csv',
    selectedRowKeys: 0,
    selectedRows: [],
  });

  const publishUnpublishTrend = (e, trend_id, publication_status) => {
    e.preventDefault();
    var updateData = {};
    updateData.api_url = 'v1/admin/publish_unpublish_trends';
    updateData.trend_id = [trend_id];
    updateData.publication_status = publication_status;

    dispatch(axiosDataUpdate(updateData)).then(res => {
      if (res && res.success) {
        setSomethingChanged(!somethingChanged);
      }
    });
  };
  const trash = (e, trend_id, deleted) => {
    e.preventDefault();
    var updateData = {};
    updateData.api_url = 'v1/admin/trash_trends';
    updateData.trend_ids = [trend_id];
    updateData.deleted = deleted;

    dispatch(axiosDataUpdate(updateData)).then(res => {
      if (res && res.success) {
        setSomethingChanged(!somethingChanged);
      }
    });
  };
  const onOffCommentOnTrend = (e, trend_id, comment_status) => {
    e.preventDefault();
    var updateData = {};
    updateData.api_url = 'v1/admin/toggle_comments_trends';
    updateData.trend_id = [trend_id];
    updateData.comment_status = comment_status;

    dispatch(axiosDataUpdate(updateData)).then(res => {
      if (res && res.success) {
        setSomethingChanged(!somethingChanged);
      }
    });
  };
  const showModal = () => {
    setState({
      ...state,
      isModalVisible: true,
    });
  };
  const handleCancel = () => {
    setState({
      ...state,
      isModalVisible: false,
    });
  };

  const handleSearch = searchText => {
    dispatch(contactSearchData(searchText));
  };

  const usersTableData = [];
  const csvData = [
    ['id', 'title', 'author', 'category_ids', 'subcategory_ids', 'focus_tags_ids', 'comment_status', 'actions'],
  ];

  users
    .sort((a, b) => {
      return b.time - a.time;
    })
    .map(user => {
      const { id, name, designation, email, company } = user;
      return usersTableData.push({
        key: id,
        user: name,
        email,
        company,
        position: designation,
      });
    });

  const usersTableColumns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (titleData, row) => (
        <div id="title_of_trend">
          <p>{titleData}</p>
          <div id="hidden_options">
            <Anchor targetOffset={targetOffset} className="del_extbrdr">
              <Link href={`edit-trend/${row._id}`} title="Edit" />
              {/* <Link href="#" title="Quick Edit" /> */}
              <Link href="#" title="View" />
              {console.log(row)}
              <p
                className="unpublish_text"
                style={{ cursor: 'pointer' }}
                onClick={e => publishUnpublishTrend(e, row._id, !row.publication_status)}
              >
                {row.publication_status ? 'Draft' : 'Publish'}
              </p>
              <p className="trash_text" style={{ cursor: 'pointer' }} onClick={e => trash(e, row._id, !row.deleted)}>
                {row.deleted ? 'UnTrash' : 'Trash'}
              </p>
              {/* <Link href="#" title="Trash" /> */}
            </Anchor>
          </div>
        </div>
      ),
    },
    {
      title: 'Author',
      dataIndex: 'author',
      key: 'author',
      render: author => (
        <>
          <Tag color="geekblue">{author.first_name.toUpperCase()}</Tag>
          {/* {author.map((authorData, index) => (
            <Tag color="geekblue" key={index}>
              {authorData.first_name.toUpperCase()}
            </Tag>
          ))} */}
        </>
      ),
    },
    {
      title: 'Categories',
      dataIndex: 'category_ids',
      key: 'category_ids',
      render: category => (
        <>
          {category.map((categoryData, index) => (
            <p key={index}>{categoryData.title}</p>
          ))}
        </>
      ),
    },
    {
      title: 'Subcategories',
      dataIndex: 'subcategory_ids',
      key: 'subcategory_ids',
      render: subcategory => (
        <>
          {subcategory.map((subcategoryData, index) => (
            <p key={index}>{subcategoryData.title}</p>
          ))}
        </>
      ),
    },
    {
      title: 'Focused Tags',
      dataIndex: 'focus_tags_ids',
      key: 'focus_tags_ids',
      render: tags => (
        <>
          {tags.map((singleTag, index) => (
            <p key={index}>{singleTag.tag_name}</p>
          ))}
        </>
      ),
    },
    {
      title: 'Comments',
      dataIndex: 'comment_status',
      key: 'comment_status',
      render: (comment, row) => (
        <div className="cmnts_cntr">
          <span>
            <Checkbox
              onChange={e => onOffCommentOnTrend(e, row._id, !row.comment_status)}
              defaultChecked={row.comment_status}
            />
          </span>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_, row) => (
        <span className="action_for_trend_list">
          <FeatherIcon icon="eye" onClick={e => console.log(e, 'custom eye event')} />
          <FeatherIcon icon="lock" onClick={e => console.log(e, 'custom lock event')} />
          {/* <FeatherIcon icon="unlock" onClick={e => console.log(e, 'custom removeIcon event')} /> */}
        </span>
      ),
    },
  ];

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      setState({ ...state, selectedRowKeys, selectedRows });
    },
    getCheckboxProps: record => ({
      disabled: record.name === 'Disabled User', // Column configuration not to be checked
      name: record.name,
    }),
  };

  state.selectedRows.map(member => {
    const { key, user, position, email, company } = member;
    return csvData.push([key, user, email, company, position]);
  });

  const ids = [];
  state?.selectedRows.map(member => {
    return ids.push(member._id);
  });

  const selecthandleChange = e => {
    console.log(e);
    setActions(e);
  };

  const applyActions = () => {
    if (Actions == 'draft') {
      var updateData = {};
      updateData.api_url = 'v1/admin/publish_unpublish_trends';
      updateData.trend_id = ids;
      updateData.publication_status = false;

      dispatch(axiosDataUpdate(updateData)).then(res => {
        if (res && res.success) {
          setSomethingChanged(!somethingChanged);
        }
      });
    } else if (Actions == 'trash') {
      var updateData = {};
      updateData.api_url = 'v1/admin/trash_trends';
      updateData.trend_ids = ids;
      updateData.deleted = true;

      dispatch(axiosDataUpdate(updateData)).then(res => {
        if (res && res.success) {
          setSomethingChanged(!somethingChanged);
        }
      });
    } else if (Actions == 'publish') {
      var updateData = {};
      updateData.api_url = 'v1/admin/publish_unpublish_trends';
      updateData.trend_id = ids;
      updateData.publication_status = true;

      dispatch(axiosDataUpdate(updateData)).then(res => {
        if (res && res.success) {
          setSomethingChanged(!somethingChanged);
        }
      });
    } else if (Actions == 'untrash') {
      var updateData = {};
      updateData.api_url = 'v1/admin/trash_trends';
      updateData.trend_ids = ids;
      updateData.deleted = false;

      dispatch(axiosDataUpdate(updateData)).then(res => {
        if (res && res.success) {
          setSomethingChanged(!somethingChanged);
        }
      });
    } else {
    }
  };
  const { isModalVisible } = state;

  const warning = () => {
    alertModal.warning({
      title: 'Please Select your Required Rows!',
    });
  };

  const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
  const xlsxExtension = '.xlsx';

  const exportToXLSX = (inputData, fileName) => {
    const ws = XLSX.utils.json_to_sheet(inputData);
    const wb = { Sheets: { data: ws }, SheetNames: ['data'] };
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, fileName + xlsxExtension);
    setState({
      ...state,
      isModalVisible: false,
    });
  };

  const updateFileName = e => {
    setState({
      ...state,
      fileName: e.target.value,
    });
  };
  const updateFileType = value => {
    setState({
      ...state,
      convertedTo: value,
    });
  };
  const { Option } = Select;
  const { fileName, convertedTo } = state;
  return (
    <>
      <PageHeader
        title="All Trends"
        // buttons={[
        //   <div key="1" className="page-header-actions">
        //     <CalendarButtonPageHeader />
        //     <ExportButtonPageHeader />
        //     <ShareButtonPageHeader />
        //     <Button size="small" type="primary">
        //       <FeatherIcon icon="plus" size={14} />
        //       Add New
        //     </Button>
        //   </div>,
        // ]}
      />
      <Main>
        <Row gutter={25}>
          <Col sm={24} xs={24}>
            <ExportStyleWrap>
              <Cards headless className="trends-table-data">
                <Tabs defaultActiveKey={selectedTabPanel} onChange={setSelectedTabPanel}>
                  <TabPane tab="All" key="1">
                    <Row>
                      <Col sm={24} xs={24}>
                        <div className="table-header">
                          <Form>
                            <Row gutter={12}>
                              <Col xs={12} sm={12} lg={4} md={4} xl={4} xxl={3}>
                                <Form.Item>
                                  <Select
                                    defaultValue="Bulk Actions"
                                    style={{
                                      width: '100%',
                                    }}
                                    onChange={selecthandleChange}
                                  >
                                    <Option value="disabled">Bulk Actions</Option>
                                    <Option value="publish">Publish</Option>
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
                                    onClick={applyActions}
                                  >
                                    Apply
                                  </Button>
                                </Form.Item>
                              </Col>
                              <Col xs={12} sm={12} lg={16} md={16} xl={18} xxl={18}></Col>
                            </Row>
                          </Form>
                        </div>
                      </Col>
                    </Row>

                    <Row className="all_trends_data">
                      <Col sm={24} xs={24}>
                        {/* <ExportStyleWrap> */}
                        <Cards headless className="trends-table-data">
                          <div className="sDash_export-box" style={{ display: 'None' }}>
                            {state.selectedRows.length ? (
                              <>
                                {/* <Button className="btn-export" onClick={showModal} type="primary">
                        Export
                      </Button> */}
                                <Modal
                                  title="Export File"
                                  wrapClassName="sDash_export-wrap"
                                  visible={isModalVisible}
                                  footer={null}
                                  onCancel={handleCancel}
                                >
                                  <Form name="contact">
                                    <Form.Item name="f_name">
                                      <Input placeholder="File Name" value={fileName} onChange={updateFileName} />
                                    </Form.Item>
                                    <Form.Item initialValue="CSV" name="f_type">
                                      <Select onChange={updateFileType}>
                                        <Option value="csv">CSV</Option>
                                        <Option value="xlxs">xlxs</Option>
                                      </Select>
                                    </Form.Item>
                                    <div className="sDash-button-grp">
                                      {convertedTo === 'csv' ? (
                                        <CSVLink filename={`${fileName}.csv`} data={csvData}>
                                          <Button onClick={handleCancel} className="btn-export" type="primary">
                                            Export
                                          </Button>
                                        </CSVLink>
                                      ) : (
                                        <Button
                                          className="btn-export"
                                          onClick={() => exportToXLSX(csvData, fileName)}
                                          type="primary"
                                        >
                                          Export
                                        </Button>
                                      )}
                                      <Button
                                        htmlType="submit"
                                        onClick={handleCancel}
                                        size="default"
                                        type="white"
                                        outlined
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  </Form>
                                </Modal>
                              </>
                            ) : (
                              <>
                                {/* <Button className="btn-export" onClick={warning} type="primary">
                      Export
                    </Button> */}
                              </>
                            )}

                            {/* <AutoComplete
                    onSearch={handleSearch}
                    // dataSource={notData}
                    placeholder="Search by Name"
                    width="100%"
                    patterns
                  /> */}
                          </div>
                          <div className="sDash_export-file-table table-bordered table-responsive">
                            <Table
                              rowSelection={rowSelection}
                              dataSource={data}
                              columns={usersTableColumns}
                              pagination={{
                                defaultPageSize: 10,
                                total: totalRecord,
                                onChange: e => {
                                  e && setCurrentPage(e);
                                },
                                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                              }}
                              onChange={onChange}
                            />
                          </div>
                        </Cards>
                        {/* </ExportStyleWrap> */}
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
                                <Form.Item>
                                  <Select
                                    defaultValue="Bulk Actions"
                                    style={{
                                      width: '100%',
                                    }}
                                    onChange={selecthandleChange}
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
                                    onClick={applyActions}
                                  >
                                    Apply
                                  </Button>
                                </Form.Item>
                              </Col>
                              <Col xs={12} sm={12} lg={16} md={16} xl={18} xxl={18}></Col>
                            </Row>
                          </Form>
                        </div>
                        <div className="sDash_export-file-table table-bordered table-responsive">
                          <Table
                            rowSelection={rowSelection}
                            dataSource={data}
                            columns={usersTableColumns}
                            pagination={{
                              defaultPageSize: 10,
                              total: totalRecord,
                              onChange: e => {
                                e && setCurrentPage(e);
                              },
                              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                            }}
                            onChange={onChange}
                          />
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
                                <Form.Item>
                                  <Select
                                    defaultValue="Bulk Actions"
                                    style={{
                                      width: '100%',
                                    }}
                                    onChange={selecthandleChange}
                                  >
                                    <Option value="disabled">Bulk Actions</Option>
                                    <Option value="publish">Publish</Option>
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
                                    onClick={applyActions}
                                  >
                                    Apply
                                  </Button>
                                </Form.Item>
                              </Col>
                              <Col xs={12} sm={12} lg={16} md={16} xl={18} xxl={18}></Col>
                            </Row>
                          </Form>
                        </div>
                        <div className="sDash_export-file-table table-bordered table-responsive">
                          <Table
                            rowSelection={rowSelection}
                            dataSource={data}
                            columns={usersTableColumns}
                            pagination={{
                              defaultPageSize: 10,
                              total: totalRecord,
                              onChange: e => {
                                e && setCurrentPage(e);
                              },
                              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                            }}
                            onChange={onChange}
                          />
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
                                <Form.Item>
                                  <Select
                                    defaultValue="Bulk Actions"
                                    style={{
                                      width: '100%',
                                    }}
                                    onChange={selecthandleChange}
                                  >
                                    <Option value="disabled">Bulk Actions</Option>
                                    <Option value="publish">Publish</Option>
                                    <Option value="draft">Draft</Option>
                                    <Option value="untrash">UnTrash</Option>
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
                                    onClick={applyActions}
                                  >
                                    Apply
                                  </Button>
                                </Form.Item>
                              </Col>
                              <Col xs={12} sm={12} lg={16} md={16} xl={18} xxl={18}></Col>
                            </Row>
                          </Form>
                        </div>
                        <div className="sDash_export-file-table table-bordered table-responsive">
                          <Table
                            rowSelection={rowSelection}
                            dataSource={data}
                            columns={usersTableColumns}
                            pagination={{
                              defaultPageSize: 10,
                              total: totalRecord,
                              onChange: e => {
                                e && setCurrentPage(e);
                              },
                              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                            }}
                            onChange={onChange}
                          />
                        </div>
                      </Col>
                    </Row>
                  </TabPane>
                  <TabPane tab="Featured" key="5">
                    <Row>
                      <Col sm={24} xs={24}>
                        <div className="table-header">
                          <Form>
                            <Row gutter={12}>
                              <Col xs={12} sm={12} lg={4} md={4} xl={4} xxl={3}>
                                <Form.Item>
                                  <Select
                                    defaultValue="Bulk Actions"
                                    style={{
                                      width: '100%',
                                    }}
                                    onChange={selecthandleChange}
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
                                    onClick={applyActions}
                                  >
                                    Apply
                                  </Button>
                                </Form.Item>
                              </Col>
                              <Col xs={12} sm={12} lg={16} md={16} xl={18} xxl={18}></Col>
                            </Row>
                          </Form>
                        </div>
                        <div className="sDash_export-file-table table-bordered table-responsive">
                          <Table
                            rowSelection={rowSelection}
                            dataSource={data}
                            columns={usersTableColumns}
                            pagination={{
                              defaultPageSize: 10,
                              total: totalRecord,
                              onChange: e => {
                                e && setCurrentPage(e);
                              },
                              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                            }}
                            onChange={onChange}
                          />
                        </div>
                      </Col>
                    </Row>
                  </TabPane>
                </Tabs>
              </Cards>
            </ExportStyleWrap>
          </Col>
        </Row>
      </Main>
    </>
  );
};

export default Import;
