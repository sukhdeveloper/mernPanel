import React, { useState, useEffect } from 'react';
import { Row, Col, Table, Modal, Form, Input, Select, Button, Checkbox, Tabs } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { useSelector, useDispatch } from 'react-redux';
import { CSVLink } from 'react-csv';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Main, ExportStyleWrap } from '../styled';
import { Cards } from '../../components/cards/frame/cards-frame';
//import { Button } from '../../components/buttons/buttons';
import { ShareButtonPageHeader } from '../../components/buttons/share-button/share-button';
import { ExportButtonPageHeader } from '../../components/buttons/export-button/export-button';
import { CalendarButtonPageHeader } from '../../components/buttons/calendar-button/calendar-button';
import { AutoComplete } from '../../components/autoComplete/autoComplete';
import { contactSearchData } from '../../redux/contact/actionCreator';
import { alertModal } from '../../components/modals/antd-modals';
import { axiosDataSubmit, axiosDataRead, axiosDataUpdate } from '../../redux/crud/axios/actionCreator';
import { Tag } from '../../components/tags/tags';
import { useHistory } from 'react-router-dom';

import { Anchor } from 'antd';
const { Link } = Anchor;
const { Option } = Select;
const { TabPane } = Tabs;

const selecthandleChange = value => {
  console.log(`selected ${value}`);
};

const selectactivehandleChange = value => {
  console.log(`selected ${value}`);
};

const selectpendinghandleChange = value => {
  console.log(`selected ${value}`);
};

const ViewWarriors = () => {
  const dispatch = useDispatch();

  const history = useHistory();

  const activateaccount = id => {
    history.push(`/admin/mern2-warrior/activate-warrior/${id}`);
  };
  const { users } = useSelector(state => {
    return {
      users: state.Contact.data,
    };
  });

  const [ispowerModalVisible, setIsPowerModalVisible] = useState(false);
  const [totalPageCount, setTotalPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentTab, setCurrentTab] = useState(1);
  const [apiHit, setApiHit] = useState(false);

  const onWarriorStatusChange = key => {
    setCurrentTab(key);
    var getData = {};
    var queryString = '';
    if (key == 2) {
      queryString = 'verified=1';
    } else if (key == 3) {
      queryString = 'verified=0';
    }
    getData.api_url = `v1/admin/mern2_warrior_list/1?${queryString}`;
    dispatch(axiosDataRead(getData)).then(res => {
      if (res && res.success) {
        //console.log(res);
        var originData = [];
        for (let i = 0; i < res.data.userList.length; i++) {
          console.log(res.data[i]);
          originData.push({
            key: i.toString(),
            ...res.data.userList[i],
          });
        }
        setTotalPageCount(res.data.totalCount);
        setCurrentPage(1);
        setData(originData);
      }
    });
  };

  const powershowModal = () => {
    setIsPowerModalVisible(true);
  };

  const powerhandleOk = () => {
    setIsPowerModalVisible(false);
  };

  const powerhandleCancel = () => {
    setIsPowerModalVisible(false);
  };

  const [isregenerateModalVisible, setIsRegenerateModalVisible] = useState(false);

  const regenerateshowModal = () => {
    setIsRegenerateModalVisible(true);
  };

  const regeneratehandleOk = () => {
    setIsRegenerateModalVisible(false);
  };

  const regeneratehandleCancel = () => {
    setIsRegenerateModalVisible(false);
  };

  const accountdatahandleChange = value => {
    //console.log(`selected ${value}`);
  };

  const onsendEmailChange = e => {
    console.log(`checked = ${e.target.checked}`);
  };

  const [data, setData] = useState([]);
  const [targetOffset, setTargetOffset] = useState(undefined);
  useEffect(() => {
    setTargetOffset(window.innerHeight / 2);
  }, []);
  useEffect(() => {
    var getData = {};
    var queryString = '';
    if (currentTab == 2) {
      queryString = 'verified=1';
    } else if (currentTab == 3) {
      queryString = 'verified=0';
    }
    getData.api_url = `v1/admin/mern2_warrior_list/${currentPage}?${queryString}`;
    dispatch(axiosDataRead(getData)).then(res => {
      if (res && res.success) {
        //console.log(res);
        var originData = [];
        for (let i = 0; i < res.data.userList.length; i++) {
          console.log(res.data[i]);
          originData.push({
            key: i.toString(),
            ...res.data.userList[i],
          });
        }
        setTotalPageCount(res.data.totalCount);
        setData(originData);
      }
    });
  }, []);

  const onPageChange = page => {
    var getData = {};
    var queryString = '';
    if (currentTab == 2) {
      queryString = 'verified=1';
    } else if (currentTab == 3) {
      queryString = 'verified=0';
    }
    getData.api_url = `v1/admin/mern2_warrior_list/${page}?${queryString}`;
    dispatch(axiosDataRead(getData)).then(res => {
      if (res && res.success) {
        //console.log(res);
        var originData = [];
        for (let i = 0; i < res.data.userList.length; i++) {
          console.log(res.data[i]);
          originData.push({
            key: i.toString(),
            ...res.data.userList[i],
          });
        }
        setTotalPageCount(res.data.totalCount);
        setCurrentPage(page);
        setData(originData);
      }
    });
  };
  const [state, setState] = useState({
    isModalVisible: false,
    fileName: 'trends-records',
    convertedTo: 'csv',
    selectedRowKeys: 0,
    selectedRows: [],
  });

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
      title: 'Username',
      dataIndex: 'user_name',
      key: 'user_name',
      render: (user_name, row) => (
        // <div id="title_of_trend">
        //   <p>{titleData}</p>
        //   <div id="hidden_options">
        //     <Anchor targetOffset={targetOffset}>
        //       <Link href={`edit-trend/${row._id}`} title="Edit" />
        //       <Link href="#" title="Quick Edit" />
        //       <Link href="#" title="View" />
        //       <Link href="#" title="Publish/Unpublish" />
        //     </Anchor>
        //   </div>
        // </div>
        <div id="username_data">
          <p>{user_name}</p>
          <div id="hidden_data">
            <Anchor className="hiddn-clss" targetOffset={targetOffset}>
              <Link href={`edit-warrior/${row._id}`} title="Edit" />
              <Button className="button-powertransfer" onClick={powershowModal}>
                Power Transfer
              </Button>
              <Button className="button-regenerate" onClick={regenerateshowModal}>
                Regenerate Password
              </Button>
              {/* <Link href="#" title="Regenerate Password" /> */}
            </Anchor>
            <Modal
              title="Power Transfer"
              className="modalpower"
              visible={ispowerModalVisible}
              onOk={powerhandleOk}
              onCancel={powerhandleCancel}
              width={700}
            >
              <Form layout="vertical">
                <Form.Item label="Show account to migrate account’s Data">
                  <Select
                    defaultValue="mern2 Warriors"
                    style={{
                      width: '100%',
                    }}
                    onChange={accountdatahandleChange}
                  >
                    <Option value="mern2 warrior one">mern2 Warrior One</Option>
                    <Option value="mern2 warrior two">mern2 Warrior Two</Option>
                    <Option value="mern2 Warrior three">mern2 Warrior Three</Option>
                  </Select>
                </Form.Item>
                <Row gutter={12}>
                  <Col xs={24} sm={24} md={12} xl={12} xxl={12}>
                    <Form.Item>
                      <Button style={{ width: '100%' }} className="btn-migrate" size="large">
                        Migrate Data and Delete
                      </Button>
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={24} md={12} xl={12} xxl={12}>
                    <Form.Item>
                      <Button style={{ width: '100%' }} className="btn-migrate" type="primary" size="large">
                        Delete Record Without Migrate
                      </Button>
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Modal>

            <Modal
              title="Regenerate Password"
              className="modalpower"
              visible={isregenerateModalVisible}
              onOk={regeneratehandleOk}
              onCancel={regeneratehandleCancel}
            >
              <Form layout="vertical">
                <Form.Item label="Password:">
                  <Input.Password />
                </Form.Item>
                <Form.Item label="Confirm Password:">
                  <Input.Password />
                </Form.Item>
                <Form.Item>
                  <Checkbox onChange={onsendEmailChange}>Send Email to this account user</Checkbox>
                </Form.Item>
                <Form.Item>
                  <Button type="primary" size="large">
                    Regenerate
                  </Button>
                </Form.Item>
              </Form>
            </Modal>
          </div>
        </div>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'first_name',
      key: 'first_name',
      render: first_name => (
        <>
          {/* {author.map((authorData, index) => (
            <Tag color="geekblue" key={index}>
              {authorData.first_name.toUpperCase()}
            </Tag>
          ))} */}
          <div id="name_data">
            <p>{first_name}</p>
          </div>
        </>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: email => (
        <>
          {/* {category.map((categoryData, index) => (
            <p key={index}>{categoryData.title}</p>
          ))} */}
          <div id="email_data">
            <p>{email}</p>
          </div>
        </>
      ),
    },
    {
      title: 'Trends',
      dataIndex: 'totalTrends',
      key: 'totalTrends',
      render: totalTrends => (
        <>
          {/* {subcategory.map((subcategoryData, index) => (
            <p key={index}>{subcategoryData.title}</p>
          ))} */}
          <div id="posts_data">
            <p>{totalTrends}</p>
          </div>
        </>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'account_status',
      key: 'account_status',
      render: account_status => (
        <>
          {/* {tags.map((singleTag, index) => (
            <p key={index}>{singleTag.tag_name}</p>
          ))} */}
          <div id="status_data">
            <p>{account_status ? 'Active' : 'Deactivated'}</p>
          </div>
        </>
      ),
    },
    // {
    //   title: 'Comments',
    //   dataIndex: 'comment_status',
    //   key: 'comment_status',
    //   render: comment => (
    //     <span>
    //       <Checkbox />
    //     </span>
    //   ),
    // },
    {
      title: 'Actions',
      key: 'action',
      render: (_, row) => (
        <>
          {/* {console.log("asjdf" , )} */}
          <Button type="primary" size="large" onClick={() => activateaccount(row._id)}>
            Give Permissions
          </Button>
        </>
        // <span className="action_for_trend_list">
        //   <FeatherIcon icon="eye" onClick={e => console.log(e, 'custom eye event')} />
        //   <FeatherIcon icon="lock" onClick={e => console.log(e, 'custom lock event')} />
        //   {/* <FeatherIcon icon="unlock" onClick={e => console.log(e, 'custom removeIcon event')} /> */}
        // </span>
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
      <PageHeader title="All Warriors" />
      <Main>
        <Row gutter={25}>
          <Col sm={24} xs={24}>
            <ExportStyleWrap>
              <Cards headless>
                <Tabs defaultActiveKey="1" onChange={onWarriorStatusChange}>
                  <TabPane tab="All" key="1">
                    <div className="sDash_export-box" style={{ display: 'None' }}>
                      {state.selectedRows.length ? (
                        <>
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
                                <Button htmlType="submit" onClick={handleCancel} size="default" type="white" outlined>
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
                    </div>
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
                                <Option value="edit">Edit</Option>
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
                                Action
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
                          //current:1,
                          total: totalPageCount,
                          onChange: e => {
                            e && onPageChange(e);
                          },
                          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                        }}
                      />
                    </div>
                  </TabPane>
                  <TabPane tab="Active" key="2">
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
                                onChange={selectactivehandleChange}
                              >
                                <Option value="disabled">Bulk Actions</Option>
                                <Option value="edit">Edit</Option>
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
                                Action
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
                          //current:1,
                          total: totalPageCount,
                          onChange: e => {
                            e && onPageChange(e);
                          },
                          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                        }}
                      />
                    </div>
                  </TabPane>
                  <TabPane tab="Pending" key="3">
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
                                onChange={selectpendinghandleChange}
                              >
                                <Option value="disabled">Bulk Actions</Option>
                                <Option value="edit">Edit</Option>
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
                                Action
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
                          //current:1,
                          total: totalPageCount,
                          onChange: e => {
                            e && onPageChange(e);
                          },
                          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                        }}
                      />
                    </div>
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

export default ViewWarriors;
