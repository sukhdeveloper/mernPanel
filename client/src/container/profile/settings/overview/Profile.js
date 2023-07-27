import React, { useEffect, useState } from 'react';
import { Row, Col, Form, Input, Select } from 'antd';
import { Cards } from '../../../../components/cards/frame/cards-frame';
import { Button } from '../../../../components/buttons/buttons';
import { BasicFormWrapper, TagInput } from '../../../styled';
import Heading from '../../../../components/heading/heading';
import { Tag } from '../../../../components/tags/tags';
import { axiosDataRead, axiosDataUpdate } from '../../../../redux/crud/axios/actionCreator';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

//const { Option } = Select;
const Profile = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  const [form] = Form.useForm();

  const [profileinfo, setProfileInfo] = useState({
    first_name: '',
    email: '',
    author_name: '',
    bio: '',
  });
  const [apiHit, setApiHit] = useState(false);

  useEffect(() => {
    var getData = {};
    getData.api_url = 'v1/admin/settings/profile';
    dispatch(axiosDataRead(getData))
      .then(res => {
        if (res && res.success) {
          // console.log("insie" , res.data)
          setProfileInfo({
            first_name: res.data.first_name,
            email: res.data.email,
            author_name: res.data.profile.author_name,
            bio: res.data.profile.bio,
          });
          setApiHit(true);
        }
      })
      .catch(err => console.log('errr', err));
  }, []);

  const handleSubmit = e => {
    var formData = {};
    formData.api_url = `v1/admin/settings/profile`;
    formData.first_name = e.first_name;
    formData.email = e.email;
    formData.author_name = e.author_name;
    formData.bio = e.bio;

    dispatch(axiosDataUpdate(formData)).then(res => {
      console.log('res', res);

      if (res && res.success) {
        console.log(res.msg);
        //console.log('res',res.data);
      }
    });
  };

  return (
    <Cards
      title={
        <div className="setting-card-title">
          <Heading as="h4" className="profile-head">
            Edit Profile
          </Heading>
          <span>Set Up Your Personal Information</span>
        </div>
      }
    >
      <Row justify="center">
        {/* {console.log("profile:", profileinfo)} */}
        <Col xxl={12} xl={20} sm={24} xs={24}>
          {apiHit && (
            <BasicFormWrapper>
              <Form name="multi-form" onFinish={handleSubmit} layout="vertical">
                <Form.Item
                  name="first_name"
                  initialValue={profileinfo.first_name}
                  rules={[
                    {
                      required: true,
                      message: 'Required!',
                    },
                  ]}
                  label="Name"
                >
                  <Input placeholder="Name" />
                </Form.Item>
                <Form.Item
                  name="email"
                  rules={[
                    {
                      required: true,
                      message: 'Required!',
                    },
                  ]}
                  initialValue={profileinfo.email}
                  label="Email"
                >
                  <Input placeholder="Email" />
                </Form.Item>
                <Form.Item
                  name="author_name"
                  rules={[
                    {
                      required: true,
                      message: 'Required!',
                    },
                  ]}
                  initialValue={profileinfo.author_name}
                  label="Author Name"
                >
                  <Input placeholder="Author Name" />
                </Form.Item>
                <Form.Item
                  name="bio"
                  rules={[
                    {
                      required: true,
                      message: 'Required!',
                    },
                  ]}
                  initialValue={profileinfo.bio}
                  label="Author Bio"
                >
                  <Input.TextArea rows={3} placeholder="Author Bio" />
                </Form.Item>
                <div className="setting-form-actions">
                  <Form.Item>
                    <Button size="default" htmlType="submit" type="primary">
                      Save Changes
                    </Button>
                  </Form.Item>
                </div>
              </Form>
            </BasicFormWrapper>
          )}
        </Col>
      </Row>
    </Cards>
  );
};

export default Profile;
