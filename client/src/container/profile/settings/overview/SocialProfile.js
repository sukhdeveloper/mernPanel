import React, { useEffect, useState } from 'react';
import { Row, Col, Form, Input } from 'antd';
import FontAwesome from 'react-fontawesome';
import { SocialProfileForm } from './style';
import { Cards } from '../../../../components/cards/frame/cards-frame';
import { Button } from '../../../../components/buttons/buttons';
import Heading from '../../../../components/heading/heading';
import { BasicFormWrapper } from '../../../styled';
import { axiosDataRead, axiosDataUpdate } from '../../../../redux/crud/axios/actionCreator';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

const SocialProfile = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  const [socialinfo, setSocialInfo] = useState({
    facebook: '',
    twitter: '',
    dribble: '',
    instagram: '',
    medium: '',
    github: '',
  });
  const [apiHit, setApiHit] = useState(false);

  useEffect(() => {
    var getData = {};
    getData.api_url = 'v1/admin/settings/social';
    dispatch(axiosDataRead(getData))
      .then(res => {
        if (res && res.success) {
          console.log(res.data);
          setSocialInfo({
            facebook: res.data.profile.facebook,
            twitter: res.data.profile.twitter,
            dribble: res.data.profile.dribble,
            instagram: res.data.profile.instagram,
            medium: res.data.profile.medium,
            github: res.data.profile.github,
          });
          setApiHit(true);
        }
      })
      .catch(err => console.log('errr', err));
  }, []);

  const handleSubmit = e => {
    var formData = {};
    formData.api_url = `v1/admin/settings/social`;
    formData.facebook = e.facebook;
    formData.twitter = e.twitter;
    formData.dribble = e.dribble;
    formData.instagram = e.instagram;
    formData.medium = e.medium;
    formData.github = e.github;

    dispatch(axiosDataUpdate(formData)).then(res => {
      //console.log('res', res);

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
          <Heading as="h4" className="profile-head">Social Profiles</Heading>
          <span>Add elsewhere links to your profile </span>
        </div>
      }
    >
      <SocialProfileForm>
        <Row justify="center">
          {/* {console.log('social:', socialinfo)} */}
          <Col xxl={12} xl={20} sm={24} xs={24}>
            {apiHit && (
              <BasicFormWrapper>
                <Form name="social" onFinish={handleSubmit} layout="vertical">
                  <Form.Item
                    name="facebook"
                    initialValue={socialinfo.facebook}
                    rules={[{ required: true , message: 'Required!' }, { type: 'url', warningOnly: true }]}
                    label="Facebook"
                  >
                    <Input
                      className="facebook"
                      prefix={
                        <FontAwesome
                          className="super-crazy-colors"
                          size="2x"
                          style={{ textShadow: '0 1px 0 rgba(0, 0, 0, 0.1)' }}
                          name="facebook"
                        />
                      }
                      placeholder="URL"
                    />
                  </Form.Item>
                  <Form.Item
                    name="twitter"
                    label="Twitter"
                    initialValue={socialinfo.twitter}
                    rules={[{ required: true , message: 'Required!' }, { type: 'url', warningOnly: true }]}
                  >
                    <Input
                      className="twitter"
                      prefix={
                        <FontAwesome
                          className="super-crazy-colors"
                          size="2x"
                          style={{ textShadow: '0 1px 0 rgba(0, 0, 0, 0.1)' }}
                          name="twitter"
                        />
                      }
                      placeholder="@username"
                    />
                  </Form.Item>
                  <Form.Item
                    name="dribble"
                    label="Dribble"
                    initialValue={socialinfo.dribble}
                    rules={[{ required: true , message: 'Required!' }, { type: 'url', warningOnly: true }]}
                  >
                    <Input
                      className="dribbble"
                      prefix={
                        <FontAwesome
                          className="super-crazy-colors"
                          size="2x"
                          style={{ textShadow: '0 1px 0 rgba(0, 0, 0, 0.1)' }}
                          name="dribbble"
                        />
                      }
                      placeholder="URL"
                    />
                  </Form.Item>
                  <Form.Item
                    name="instagram"
                    label="Instagram"
                    initialValue={socialinfo.instagram}
                    rules={[{ required: true, message: 'Required!' }, { type: 'url', warningOnly: true }]}
                  >
                    <Input
                      className="instagram"
                      prefix={
                        <FontAwesome
                          className="super-crazy-colors"
                          size="2x"
                          style={{ textShadow: '0 1px 0 rgba(0, 0, 0, 0.1)' }}
                          name="instagram"
                        />
                      }
                      placeholder="URL"
                    />
                  </Form.Item>
                  <Form.Item
                    name="github"
                    label="GitHub"
                    initialValue={socialinfo.github}
                    rules={[{ required: true , message: 'Required!' }, { type: 'url', warningOnly: true }]}
                  >
                    <Input
                      className="github"
                      prefix={
                        <FontAwesome
                          className="super-crazy-colors"
                          size="2x"
                          style={{ textShadow: '0 1px 0 rgba(0, 0, 0, 0.1)' }}
                          name="github"
                        />
                      }
                      placeholder="Username"
                    />
                  </Form.Item>
                  <Form.Item
                    name="medium"
                    label="Medium"
                    initialValue={socialinfo.medium}
                    rules={[{ required: true , message: 'Required!'}, { type: 'url', warningOnly: true }]}
                  >
                    <Input
                      className="medium"
                      prefix={
                        <FontAwesome
                          className="super-crazy-colors"
                          size="2x"
                          style={{ textShadow: '0 1px 0 rgba(0, 0, 0, 0.1)' }}
                          name="medium"
                        />
                      }
                      placeholder="Url"
                    />
                  </Form.Item>
                  <div className="setting-form-actions">
                    {/* <Row gutter={12}>
                      <Col> */}
                      <Form.Item>
                      <Button size="default" htmlType="submit" type="primary">
                        Update Social Profile
                      </Button>
                    </Form.Item>
                      {/* </Col>
                      <Col>
                      <Form.Item>
                      <Button size="default" type="light">
                        Cancel
                      </Button>
                    </Form.Item>
                      </Col>
                    </Row> */}
                  </div>
                </Form>
              </BasicFormWrapper>
            )}
          </Col>
        </Row>
      </SocialProfileForm>
    </Cards>
  );
};

export default SocialProfile;
