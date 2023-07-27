import React, { useEffect, useState } from 'react';
import { Row, Col, Button, Form, Input, Radio, InputNumber, Select, Checkbox, Space, Table } from 'antd';
import { Main, MediaFormWrapper } from '../styled';
import { Cards } from '../../components/cards/frame/cards-frame';
import { PageHeader } from '../../components/page-headers/page-headers';
import UploadImage from '../categories/UploadImage';
import { Modal } from '../../components/modals/antd-modals';

const UploadMedia = () => {
  const [uploadmedia, setUploadMedia] = useState(null);
  const [state, setState] = useState({
    visible: false,
  });
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

  const handleCancel = () => {
    onCancel();
  };

  const columns = [
    {
      title: 'Sr No.',
      dataIndex: 'sno',
      render: text => <a>{text}</a>,
    },
    {
      title: 'Image',
      dataIndex: 'image',
      render: url => (
        <div className="media_new_image">
          <img src={url} className="w-100" />
        </div>
      ),
    },
    {
      title: 'Url',
      dataIndex: 'url',
    },
  ];
  const data = [
    {
      key: '1',
      sno: 1,
      url: 'https://www.google.com/',
      image: '../../image-100.png',
    },
    {
      key: '2',
      sno: 2,
      url: 'https://www.google.com/',
      image: '../../image-100.png',
    },
    {
      key: '3',
      sno: 3,
      url: 'https://www.google.com/',
      image: '../../image-100.png',
    },
  ];

  // rowSelection object indicates the need for row selection
  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
    },
    getCheckboxProps: record => ({
      disabled: record.name === 'Disabled User',
      name: record.name,
    }),
  };

  let uploadMediaFile = file => {
    if (file.status == 'done') {
      setUploadMedia(file.url);
    } else if (file.status == 'removed') {
      setUploadMedia(null);
    }
  };
  return (
    <>
      <PageHeader
        ghost
        title="Upload Media"
        buttons={[
          <div key="1" className="page-header-actions">
            <div className="new-media-wrap">
              <Button onClick={showModal} className="btn-media-add" transparented type="primary" size="large">
                + Add Media
              </Button>
            </div>
          </div>,
        ]}
      />

      <Main>
        <Row gutter={25}>
          <Col xs={24} sm={24}>
            <MediaFormWrapper className="mb-25">
              <Cards title="Add Media Here">
                <Table rowSelection={rowSelection} columns={columns} dataSource={data} />
              </Cards>
            </MediaFormWrapper>
          </Col>
        </Row>

        <Modal
          className="add_new_tag_popup"
          type={state.modalType}
          title="Add New Media"
          visible={state.visible}
          footer={null}
          onCancel={handleCancel}
        >
          <div className="todo-modal">
            <MediaFormWrapper>
              <Form className="addmedia-form" name="Add Media">
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                  <div className="addmedia_image">
                    <UploadImage uploadedFileName={uploadMediaFile} limitOfImageUpload={1} />
                    <Button type="primary" htmlType="submit" className="mt-20">
                      Add Media
                    </Button>
                  </div>
                </Space>
              </Form>
            </MediaFormWrapper>
          </div>
        </Modal>
      </Main>
    </>
  );
};

export default UploadMedia;
