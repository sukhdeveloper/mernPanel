import React, { useState, lazy, Suspense, useLayoutEffect, useEffect } from 'react';
import { Row, Col, Form, Input, Select, Spin, Upload, message } from 'antd';
import Ant from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import FeatherIcon from 'feather-icons-react';
import { Link, useRouteMatch, Switch, Route, NavLink, useHistory } from 'react-router-dom';
import { NoteNav, NoteWrapper, Bullet } from './style';
import { BasicFormWrapper, Main } from '../styled';
import { Button } from '../../components/buttons/buttons';
import { Cards } from '../../components/cards/frame/cards-frame';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Modal } from '../../components/modals/antd-modals';
import { addData } from '../../redux/categories/actionCreator';
import { axiosDataSubmit, axiosDataRead } from '../../redux/crud/axios/actionCreator';
import UploadImage from './UploadImage';
const All = lazy(() => import('./overview/all'));
const Favorite = lazy(() => import('./overview/favorite'));
const Personal = lazy(() => import('./overview/personal'));

const { Option } = Select;
const Note = () => {
  const [categories, setCategories] = useState([]);
  const [pinToSidebar, setPinToSidebar] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [hideSwitch, setHideSwitch] = useState(false);
  const [bannersArray, setBannersArray] = useState([]);

  const props = {
    name: 'file',
    action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
    headers: {
      authorization: 'authorization-text',
    },
    onChange(info) {
      if (info.file.status !== 'uploading') {
        // console.log(info.file, info.fileList);
      }
      if (info.file.status === 'done') {
        message.success(`${info.file.name} file uploaded successfully`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
  };
  const dispatch = useDispatch();
  const history = useHistory();

  const [form] = Form.useForm();
  const { path } = useRouteMatch();
  const [state, setState] = useState({
    visible: false,
    modalType: 'primary',
    checked: [],
    responsive: 0,
    collapsed: false,
  });

  const { responsive, collapsed } = state;
  let uploadedFileName = file => {
    var index = bannersArray.indexOf(file.url);
    if (file.status == 'done') {
      if (index == -1) {
        setBannersArray(prevState => [...prevState, file.url]);
      }
    } else if (file.status == 'removed') {
      setBannersArray(bannersArray.filter((s, sindex) => index !== sindex));
    }
  };
  useEffect(() => {
    var getData = {};
    getData.api_url = 'v1/admin/get_categories_subcategories';
    dispatch(axiosDataRead(getData)).then(res => {
      if (res && res.success) {
        //console.log(res);
        setCategories(res.data);
      }
    });
  }, [formSubmitted, window.location.pathname]);
  useLayoutEffect(() => {
    function updateSize() {
      const width = window.innerWidth;
      setState({ responsive: width });
    }
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const showModal = () => {
    setState({
      ...state,
      visible: true,
    });
  };

  const onCancel = () => {
    setState({
      ...state,
      visible: false,
    });
  };

  const handleOk = e => {
    onCancel();
    // const arrayData = [];
    // data.map(data => {
    //   return arrayData.push(data.key);
    // });
    // const max = Math.max(...arrayData);
    // dispatch(
    //   axiosDataSubmit([
    //     ...data,
    //     {
    //       ...values,
    //       key: max + 1,
    //       time: new Date().getTime(),
    //       stared: false,
    //     },
    //   ]),
    // );

    var formData = {};
    formData.api_url = 'v1/admin/add_category_subcategory';
    formData.title = e.title;
    (formData.description = e.description), (formData.banners = bannersArray);
    formData.pin_to_sidebar = pinToSidebar;
    if(e.category_id && e.category_id != 0){
      formData.category_id = e.category_id;
    }
    formData.publication_status = true;
    dispatch(axiosDataSubmit(formData)).then(res => {
      if (res && res.success) {
        //console.log(res);
        setFormSubmitted(!formSubmitted);
        form.resetFields();
        history.push(path);

        // dispatch(login(res.data));
        // history.push('/admin');
      }
    });
  };

  const handleCancel = () => {
    onCancel();
  };

  const toggleCollapsed = () => {
    setState({
      ...state,
      collapsed: !collapsed,
    });
  };

  const collapseSidebar = () => {
    setState({
      ...state,
      collapsed: false,
    });
  };

  return (
    <>
      <PageHeader
        ghost
        title="Categories"
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
        <NoteWrapper>
          <Row className="justify-content-center" gutter={25}>
            <Col className="trigger-col" xxl={5} xl={7} lg={9} xs={24}>
              {responsive <= 991 && (
                <Button type="link" className="mail-sidebar-trigger" style={{ marginTop: 0 }} onClick={toggleCollapsed}>
                  <FeatherIcon icon={collapsed ? 'align-left' : 'align-right'} />
                </Button>
              )}
              {responsive > 991 ? (
                <div className="sidebar-card">
                  <Cards headless>
                    <div className="note-sidebar-top">
                      <Button onClick={showModal} shape="round" type="primary" size="default" block>
                        <FeatherIcon icon="plus" size={18} /> Add Category
                      </Button>
                    </div>

                    <div className="note-sidebar-bottom">
                      <NoteNav className="categories_sidenav">
                        <ul>
                          <li>
                            <NavLink to={`${path}`}>
                              <FeatherIcon icon="edit" size={18} />
                              <span className="nav-text">
                                <span>All</span>
                              </span>
                            </NavLink>
                          </li>
                          <li>
                            <NavLink to={`${path}/pin-to-sidebar`}>
                              <FeatherIcon icon="star" size={18} />
                              <span className="nav-text">
                                <span>Pin to Sidebar</span>
                              </span>
                            </NavLink>
                          </li>
                        </ul>
                        <div className="nav-labels">
                          <p>
                            <img src={require('../../static/img/icon/label.png')} alt="icon" /> Categories
                          </p>
                          <ul>
                            {categories &&
                              categories.length > 0 &&
                              categories.map((category, index) => (
                                <li key={index}>
                                  <NavLink to={`${path}/subcategories/${category._id}`} onClick={collapseSidebar}>
                                    <Bullet className="personal" /> {category.title}
                                  </NavLink>
                                </li>
                              ))}
                          </ul>
                        </div>
                      </NoteNav>
                    </div>
                  </Cards>
                </div>
              ) : (
                <div className={collapsed ? 'sidebar-card note-sideabr show' : 'sidebar-card note-sideabr hide'}>
                  <Cards headless>
                    <Button
                      type="link"
                      className="mail-sidebar-trigger trigger-close"
                      style={{ marginTop: 0 }}
                      onClick={toggleCollapsed}
                    >
                      <FeatherIcon icon="x" />
                    </Button>
                    <div className="note-sidebar-top">
                      <Button onClick={showModal} shape="round" type="primary" size="default" block>
                        <FeatherIcon icon="plus" size={18} /> Add Category
                      </Button>
                    </div>

                    <div className="note-sidebar-bottom">
                      <NoteNav>
                        <ul>
                          <li>
                            <NavLink to={`${path}`} onClick={collapseSidebar}>
                              <FeatherIcon icon="edit" size={18} />
                              <span className="nav-text">
                                <span>All</span>
                              </span>
                            </NavLink>
                          </li>
                          <li>
                            <NavLink to={`${path}/pin-to-sidebar`}>
                              <FeatherIcon icon="star" size={18} />
                              <span className="nav-text">
                                <span>Pin to Sidebar</span>
                              </span>
                            </NavLink>
                          </li>
                        </ul>
                        <div className="nav-labels">
                          <p>
                            <img src={require('../../static/img/icon/label.png')} alt="icon" /> Categories
                          </p>
                          <ul>
                            {categories &&
                              categories.length > 0 &&
                              categories.map((category, index) => (
                                <li>
                                  <NavLink to={`${path}/subcategories/${category._id}`} onClick={collapseSidebar}>
                                    <Bullet className="personal" /> {category.title}
                                  </NavLink>
                                </li>
                              ))}
                          </ul>
                        </div>
                      </NoteNav>
                    </div>
                  </Cards>
                </div>
              )}
            </Col>
            <Col xxl={19} xl={17} lg={15} xs={24}>
              {(window.location.pathname == '/admin/categories' ||
                window.location.pathname == '/admin/categories/') && <All data={categories} />}
              <Switch>
                <Suspense
                  fallback={
                    <div className="spin">
                      <Spin />
                    </div>
                  }
                >
                  {/* <Route exact path={`${path}`} component={All} /> */}
                  <Route path={`${path}/pin-to-sidebar`} component={Favorite} />
                  <Route path={`${path}/subcategories/:id`} component={Personal} />
                </Suspense>
              </Switch>
            </Col>
          </Row>
        </NoteWrapper>
        <Modal type={state.modalType} title={null} visible={state.visible} footer={null} onCancel={handleCancel}>
          <div className="project-modal">
            <BasicFormWrapper>
              <Form form={form} name="createProject" onFinish={handleOk}>
                <Form.Item rules={[{ required: true, message: 'Please enter title!' }]} name="title" label="Title">
                  <Input placeholder="Title" />
                </Form.Item>

                <Form.Item
                  rules={[{ required: true, message: 'Please enter description!' }]}
                  name="description"
                  label="Description"
                >
                  <Input.TextArea rows={4} placeholder="Description" />
                </Form.Item>
                <Form.Item name="category_id" label="Parent Category" initialValue={0}>
                  <Select
                    style={{ width: '100%' }}
                    onChange={e => {
                      if (e != 0) {
                        setHideSwitch(true);
                      } else {
                        setHideSwitch(false);
                      }
                    }}
                  >
                    <Option key={0} value={0}>Select Parent Category</Option>

                    {categories &&
                      categories.length > 0 &&
                      categories.map((category, index) => (
                        <Option key={category._id} value={category._id}>
                          {category.title}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>
                {/* <Upload className="sDash_upload-basic" {...props}>
                  <span className="sDash_upload-text">Select File</span>
                  <Link to="#" className="sDash_upload-browse">
                    Browse
                  </Link>
                </Upload> */}
                <UploadImage uploadedFileName={uploadedFileName}/>
                {!hideSwitch && (
                  <>
                    <Ant.Switch onChange={() => setPinToSidebar(!pinToSidebar)} />
                    <br />
                    <br />
                  </>
                )}
                <Button htmlType="submit" size="default" type="primary" key="submit">
                  Add
                </Button>
              </Form>
            </BasicFormWrapper>
          </div>
        </Modal>
      </Main>
    </>
  );
};

Note.propTypes = {
  // match: PropTypes.shape(PropTypes.object),
};
export default Note;
