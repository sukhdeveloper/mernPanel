import React, { useState, useEffect } from 'react';
import { Avatar } from 'antd';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import FeatherIcon from 'feather-icons-react';
import { InfoWraper, NavAuth, UserDropDwon } from './auth-info-style';
import Message from './message';
import Notification from './notification';
import Settings from './settings';
import Support from './support';
import { Popover } from '../../popup/popup';
import { Dropdown } from '../../dropdown/dropdown';
import { logOut } from '../../../redux/authentication/actionCreator';
import Heading from '../../heading/heading';
import {axiosDataRead } from '../../../redux/crud/axios/actionCreator'
const AuthInfo = () => {
  const dispatch = useDispatch();
  const { dataUpdated } = useSelector(state => {
    return {
      dataUpdated: state.AxiosCrud.dataUpdated,
    };
  });
  const [state, setState] = useState({
    flag: 'english',
  });
  const { flag } = state;

  const SignOut = e => {
    e.preventDefault();
    dispatch(logOut());
  };
  const [profileImage, setProfileImage] = useState(
    'https://cdn0.iconfinder.com/data/icons/user-pictures/100/matureman1-512.png',
  );
  useEffect(() => {
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
  }, [dataUpdated]);
  const userContent = (
    <UserDropDwon>
      <div className="user-dropdwon">
        <ul className="user-dropdwon__links">
          {/* <li>
            <Link to="#">
              <FeatherIcon icon="user" /> Profile
            </Link>
          </li> */}
          <li>
            <Link to="/admin/settings">
              <FeatherIcon icon="settings" /> Settings
            </Link>
          </li>
        </ul>
        <Link className="user-dropdwon__bottomAction" onClick={SignOut} to="#">
          <FeatherIcon icon="log-out" /> Sign Out
        </Link>
      </div>
    </UserDropDwon>
  );

  const onFlagChangeHandle = value => {
    setState({
      ...state,
      flag: value,
    });
  };

  const country = (
    <NavAuth>
      <Link onClick={() => onFlagChangeHandle('english')} to="#">
        <img src={require('../../../static/img/flag/english.png')} alt="" />
        <span>English</span>
      </Link>
      <Link onClick={() => onFlagChangeHandle('germany')} to="#">
        <img src={require('../../../static/img/flag/germany.png')} alt="" />
        <span>Germany</span>
      </Link>
      <Link onClick={() => onFlagChangeHandle('spain')} to="#">
        <img src={require('../../../static/img/flag/spain.png')} alt="" />
        <span>Spain</span>
      </Link>
      <Link onClick={() => onFlagChangeHandle('turky')} to="#">
        <img src={require('../../../static/img/flag/turky.png')} alt="" />
        <span>Turky</span>
      </Link>
    </NavAuth>
  );

  return (
    <InfoWraper>
      {/* <Message />
      <Notification />

      <Settings />
      <Support />
      <div className="nav-author">
        <Dropdown placement="bottomRight" content={country} trigger="click">
          <Link to="#" className="head-example">
            <img src={require(`../../../static/img/flag/${flag}.png`)} alt="" />
          </Link>
        </Dropdown>
      </div> */}

      <div className="nav-author">
        <Popover placement="bottomRight" content={userContent} action="click">
          <Link to="#" className="head-example">
            <Avatar src={profileImage} />
          </Link>
        </Popover>
      </div>
    </InfoWraper>
  );
};

export default AuthInfo;
