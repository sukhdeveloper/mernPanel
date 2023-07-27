import React, { useState, useLayoutEffect, useEffect } from 'react';
import FeatherIcon from 'feather-icons-react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Dropdown } from '../dropdown/dropdown';
import { noteDeleteData, onLabelUpdate } from '../../redux/note/actionCreator';
import { axiosDataUpdate } from '../../redux/crud/axios/actionCreator';
import { Modal } from '../../components/modals/antd-modals';
import { Form, Input } from 'antd';
import { BasicFormWrapper } from '../../container/styled';
import UploadImage from '../../container/categories/UploadImage';
import { Button } from '../../components/buttons/buttons';

const CategoryPopup = ({ data, Dragger }) => {
  const [bannersArray, setBannersArray] = useState([]);

  const [state, setState] = useState({
    visible: false,
    modalType: 'primary',
    checked: [],
    responsive: 0,
    collapsed: false,
  });

  const dispatch = useDispatch();
  const { noteData } = useSelector(state => {
    return {
      noteData: state.Note.data,
    };
  });
  const { title, key, description, pin_to_sidebar, label, category_id, _id, banners } = data;
  const [latestPinStatus, setLatestPinStatus] = useState(pin_to_sidebar);
  const [featureImagesIdsArray, setFeatureImagesIdsArray] = useState([]);
  const [defaultImages, setDefaultImages] = useState([]);
  const [form] = Form.useForm();

  const showModal = () => {
    setState({
      ...state,
      visible: true,
    });
  };
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
  const onCancel = () => {
    setState({
      ...state,
      visible: false,
    });
  };
  const content = (
    <>
      <div className="nav-labels">
        <ul>
          <li onClick={showModal}>
            <Link to="#">Edit</Link>
          </li>
          {/* <li>
            <Link onClick={() => onLabelChange('work')} to="#">
              <Bullet className="work" /> Change Publication Status
            </Link>
          </li> */}
        </ul>
      </div>
    </>
  );
  const onHandleDelete = () => {
    const value = noteData.filter(item => item.key !== key);
    dispatch(noteDeleteData(value));
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
    formData.api_url = `v1/admin/update_category_subcategory`;
    formData.title = e.title;
    (formData.description = e.description), (formData.banners = bannersArray);
    formData.pin_to_sidebar = latestPinStatus;
    formData.category_id = category_id;
    formData.publication_status = true;
    formData._id = _id;
    dispatch(axiosDataUpdate(formData)).then(res => {
      if (res && res.success) {
        //setFormSubmitted(!formSubmitted);
        form.resetFields();
        //window.location.reload();
      }
    });
    // dispatch(axiosDataSubmit(formData)).then(res => {
    //   if (res && res.success) {
    //     //console.log(res);
    //     setFormSubmitted(!formSubmitted);
    //     form.resetFields();
    //     history.push(path);

    //     // dispatch(login(res.data));
    //     // history.push('/admin');
    //   }
    // });
  };
  useEffect(() => {
    if (banners) {
      setBannersArray(banners);
      var fileList = [];
      banners.forEach((element, index) => {
        fileList.push({
          uid: index,
          name: element,
          status: 'done',
          url: element,
          originFileObj: {
            uid: index,
            name: element,
          },
        });
      });
      setDefaultImages(fileList);
    }
  }, []);
  const handleCancel = () => {
    onCancel();
  };
  const randomLabel = ['personal', 'work', 'important', 'social'];

  const random = Math.floor(Math.random() * randomLabel.length);
  return (
    <>
      <div className="actions">
        <Dropdown content={content}>
          <Link to="#">
            <FeatherIcon icon="more-vertical" size={20} />
          </Link>
        </Dropdown>
      </div>
      <Modal type={state.modalType} title={null} visible={state.visible} footer={null} onCancel={handleCancel}>
        <div className="project-modal">
          <BasicFormWrapper>
            <Form form={form} name="createProject" onFinish={handleOk}>
              <Form.Item
                rules={[{ required: true, message: 'Please enter title!' }]}
                name="title"
                label="Title"
                initialValue={title}
              >
                <Input placeholder="Title" />
              </Form.Item>

              <Form.Item
                rules={[{ required: true, message: 'Please enter description!' }]}
                name="description"
                label="Description"
                initialValue={description}
              >
                <Input.TextArea rows={4} placeholder="Description" />
              </Form.Item>
              {/* <Form.Item name="category_id" label="Parent Category">
                  <Select style={{ width: '100%' }}>
                    {categories &&
                      categories.length > 0 &&
                      categories.map((category, index) => (
                        <Option key={index} value={category._id}>
                          {category.title}
                        </Option>
                      ))}
                  </Select>
                </Form.Item> */}
              {/* <Upload className="sDash_upload-basic" {...props}>
                  <span className="sDash_upload-text">Select File</span>
                  <Link to="#" className="sDash_upload-browse">
                    Browse
                  </Link>
                </Upload> */}
              <UploadImage
                uploadedFileName={uploadedFileName}
                defaultImages={defaultImages}
                featureImagesIdsArray={bannersArray}
              />
              <Button htmlType="submit" size="default" type="primary" key="submit">
                Update
              </Button>
            </Form>
          </BasicFormWrapper>
        </div>
      </Modal>
    </>
  );
};

CategoryPopup.propTypes = {
  data: PropTypes.object,
};
export default CategoryPopup;
