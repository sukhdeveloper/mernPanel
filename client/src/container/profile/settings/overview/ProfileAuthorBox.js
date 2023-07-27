import React from 'react';
import { Upload, Spin } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { Link, NavLink, useRouteMatch } from 'react-router-dom';
import propTypes from 'prop-types';
import { ProfileAuthorBox } from './style';
import Heading from '../../../../components/heading/heading';
import { Cards } from '../../../../components/cards/frame/cards-frame';

import { axiosDataRead, axiosDataUpdate } from '../../../../redux/crud/axios/actionCreator';
import { useDispatch } from 'react-redux';
import S3 from 'react-aws-s3';

const AuthorBox = () => {
  const dispatch = useDispatch();
  const { path } = useRouteMatch();
  const [profileImage, setProfileImage] = React.useState('');
  const [apiHit, setApiHit] = React.useState(false);
  const userRole = localStorage.getItem('userRole');

  React.useEffect(() => {
    var getData = {};
    getData.api_url = 'v1/admin/update_profile_image';
    dispatch(axiosDataRead(getData))
      .then(res => {
        if (res && res.success) {
          // console.log("insie" , res.data)
          setProfileImage(res.data.profile_image);
          setApiHit(true);
        }
      })
      .catch(err => console.log('errr', err));
  }, []);
  return (
    <ProfileAuthorBox>
      <Cards headless>
        <div className="author-info">
          <figure>
            {!apiHit ? (
              <Spin tip="Loading..."></Spin>
            ) : (
              <img src={profileImage == '' ? require('../../../../static/img/users/1.png') : profileImage} alt="" />
            )}

            <Upload
              action={`${process.env.REACT_APP_API_ENDPOINT}v1/admin/upload_image`}
              onChange={e => {
                console.log(e);
                setApiHit(false);
                const completeData = e;
                const file = completeData.file.originFileObj;
                const newFileName =
                  completeData.file.originFileObj.uid +
                  completeData.file.originFileObj.name
                    .toString()
                    .split(' ')
                    .join('-')
                    .toLowerCase();
                // var index = this.state.featureImagesIdsArray.indexOf(newFileName);
                if (completeData.file.status == 'done') {
                  //if (index == -1) {
                  const config = {
                    bucketName: 'themern2prbucket',
                    region: 'ap-south-1',
                    accessKeyId: 'AKIAR5PG7QJWFTFEC2PH',
                    secretAccessKey: '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',
                  };

                  const ReactS3Client = new S3(config);

                  ReactS3Client.uploadFile(file, newFileName).then(data => {
                    if (data.status === 204) {
                      var getData = {};
                      getData.api_url = 'v1/admin/update_profile_image';
                      getData.profile_image = data.location;
                      dispatch(axiosDataUpdate(getData)).then(res => {
                        console.log('res', res);

                        if (res && res.success) {
                          setProfileImage(data.location);
                          setApiHit(true);

                          console.log(res.msg);
                          //console.log('res',res.data);
                        }
                      });
                      //completeData.file.url = data.location;

                      // this.props.uploadedFileName({
                      //   url: data.location,
                      //   id: completeData.file.originFileObj.uid,
                      //   status: completeData.file.status,
                      // });
                      //return true;
                    }
                    //  else {
                    //   return false;
                    // }
                  });
                  // }
                } else if (completeData.file.status == 'removed') {
                  setProfileImage('');

                  // this.props.uploadedFileName({
                  //   url: completeData.file.url,
                  //   id: completeData.file.originFileObj.uid,
                  //   status: completeData.file.status,
                  // });
                }
                // console.log(this.state.featureImagesIdsArray);
                // this.handleChange(completeData);
              }}
            >
              <Link to="#">
                <FeatherIcon icon="camera" size={16} />
              </Link>
            </Upload>
          </figure>
          {/* <figcaption>
            <div className="info">
              <Heading as="h4">Duran Clayton</Heading>
              <p>UI/UX Designer</p>
            </div>
          </figcaption> */}
        </div>
        <nav className="settings-menmulist">
          <ul>
            <li>
              <NavLink to={`${path}/profile`}>
                <FeatherIcon icon="user" size={14} />
                Edit Profile
              </NavLink>
            </li>
            {userRole == 0 && (
              <li>
                <NavLink to={`${path}/account`}>
                  <FeatherIcon icon="settings" size={14} />
                  Portal Settings
                </NavLink>
              </li>
            )}
            <li>
              <NavLink to={`${path}/password`}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="feather feather-key"
                >
                  <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                </svg>
                Change Password
              </NavLink>
            </li>
            {userRole == 0 && (
              <li>
                <NavLink to={`${path}/social`}>
                  <FeatherIcon icon="users" size={14} />
                  Social Profile
                </NavLink>
              </li>
            )}
            {/* <li>
              <NavLink to={`${path}/notification`}>
                <FeatherIcon icon="bell" size={14} />
                Notification
              </NavLink>
            </li> */}
          </ul>
        </nav>
      </Cards>
    </ProfileAuthorBox>
  );
};

AuthorBox.propTypes = {
  match: propTypes.object,
};

export default AuthorBox;
