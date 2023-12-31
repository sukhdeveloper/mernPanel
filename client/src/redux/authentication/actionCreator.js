import Cookies from 'js-cookie';
import actions from './actions';

const { loginBegin, loginSuccess, loginErr, logoutBegin, logoutSuccess, logoutErr } = actions;

const login = (data) => {
  return async dispatch => {
    try {
      dispatch(loginBegin());
      setTimeout(() => {
        Cookies.set('logedIn', true);
        localStorage.setItem('token',data.token);
        localStorage.setItem('userRole',data.userRole);
        return dispatch(loginSuccess(true));
      }, 1000);
    } catch (err) {
      dispatch(loginErr(err));
    }
  };
};

const logOut = () => {
  return async dispatch => {
    try {
      dispatch(logoutBegin());
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');

      Cookies.remove('logedIn');
      dispatch(logoutSuccess(null));
    } catch (err) {
      dispatch(logoutErr(err));
    }
  };
};

export { login, logOut };
