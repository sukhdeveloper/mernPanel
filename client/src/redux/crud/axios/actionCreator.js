import { notification } from 'antd';
import actions from './actions';
import { DataService } from '../../../config/dataService/dataService';

const addNotificationSuccess = msg => {
  notification.success({
    message: msg,
  });
};

const addNotificationError = err => {
  notification.error({
    message: err,
  });
};

const deleteNotificationSuccess = () => {
  notification.success({
    message: 'Your Record has been Deleted',
  });
};

const deleteNotificationError = err => {
  notification.error({
    message: err,
  });
};

const updateNotificationSuccess = (msg) => {
  notification.success({
    message: (msg ? msg : 'Your Record has been updated'),
  });
};

const updateNotificationError = err => {
  notification.error({
    message: err,
  });
};

const {
  axiosAddBegin,
  axiosSendFileName,
  axiosAddSuccess,
  axiosAddErr,

  axiosReadBegin,
  axiosReadSuccess,
  axiosReadErr,

  axiosUpdateBegin,
  axiosUpdateSuccess,
  axiosUpdateErr,

  axiosDeleteBegin,
  axiosDeleteSuccess,
  axiosDeleteErr,

  axiosSingleDataBegin,
  axiosSingleDataSuccess,
  axiosSingleDataErr,

  axiosUploadBegin,
  axiosUploadSuccess,
  axiosUploadErr,
} = actions;

const axiosDataSubmit = data => {
  return async dispatch => {
    try {
      await dispatch(axiosAddBegin());
      //console.log(data.api_url);
      const response = await DataService.post(data.api_url, data);
      if (response.data.success) {
        await dispatch(axiosAddSuccess(response.data.data));
        await addNotificationSuccess(response.data.msg);
        return response.data;
      }
    } catch (err) {
      var errors = err.response.data.errors;
      await dispatch(axiosAddErr(errors[0].msg));
      await addNotificationError(errors[0].msg);
      return err.response.data;
    }
  };
};

const storeFileName = data => {
  return async dispatch => {
    try {
      await dispatch(axiosSendFileName(data));
     
    } catch (err) {
      return false;
    }
  };
};

const axiosDataRead = data => {
  return async dispatch => {
    try {
      await dispatch(axiosReadBegin());
      const query = await DataService.get(data.api_url);
      await dispatch(axiosReadSuccess(query.data.data));
      return query.data;
    } catch (err) {
      await dispatch(axiosReadErr(err));
      return err.response.data;
    }
  };
};

const axiosCrudGetData = () => {
  return async dispatch => {
    try {
      await dispatch(axiosReadBegin());
      const query = await DataService.get('/view-all');
      await dispatch(axiosReadSuccess(query.data.data));
    } catch (err) {
      await dispatch(axiosReadErr(err));
    }
  };
};

const axiosDataSearch = searchItem => {
  return async dispatch => {
    try {
      await dispatch(axiosReadBegin());
      if (searchItem !== '') {
        const query = await DataService.get(`/search/${searchItem}`);
        await dispatch(axiosReadSuccess(query.data.data));
      } else {
        try {
          const query = await DataService.get('/view-all');
          await dispatch(axiosReadSuccess(query.data.data));
        } catch (err) {
          await dispatch(axiosReadErr(err));
        }
      }
    } catch (err) {
      await dispatch(axiosReadErr(err));
    }
  };
};

const axiosDataUpdate = data => {
  return async dispatch => {
    try {
      await dispatch(axiosUpdateBegin());
      const response = await DataService.put(data.api_url, data);
      if (response.data.success) {
        await dispatch(axiosUpdateSuccess());
        updateNotificationSuccess(response.data.msg);
        return response.data;
      }
    } catch (err) {
      var errors = err.response.data.errors;
      await dispatch(axiosUpdateErr(errors[0].msg));
      await updateNotificationError(errors[0].msg);
      return err.response.data;
    }
  };
};

const axiosDataDelete = data => {
  return async dispatch => {
    try {
      await dispatch(axiosDeleteBegin());
      const response = await DataService.delete(data.api_url);
      if (response.data.success) {
        await dispatch(axiosDeleteSuccess(response.data.msg));
        deleteNotificationSuccess(response.data.msg);
        return response.data;
      }
    } catch (err) {
      var errors = err.response.data.errors;
      await dispatch(axiosDeleteErr(errors[0].msg));
      deleteNotificationError(errors[0].msg);
      return response.data;
    }
  };
};

const axiosDataSingle = id => {
  return async dispatch => {
    try {
      await dispatch(axiosSingleDataBegin());
      const query = await DataService.get(`/view/${id}`);
      await dispatch(axiosSingleDataSuccess(query.data.data));
    } catch (err) {
      await dispatch(axiosSingleDataErr(err));
    }
  };
};

const axiosFileUploder = imageAsFile => {
  const data = new FormData();
  data.append('image', imageAsFile);

  return async dispatch => {
    try {
      await dispatch(axiosUploadBegin());
      const query = await DataService.post('/image-upload', data, { 'Content-Type': 'multipart/form-data' });
      dispatch(axiosUploadSuccess(`img/basics/${query.data}`));
    } catch (err) {
      await dispatch(axiosUploadErr(err));
    }
  };
};

const axiosFileClear = () => {
  return async dispatch => {
    try {
      await dispatch(axiosUploadBegin());
      dispatch(axiosUploadSuccess(null));
    } catch (err) {
      await dispatch(axiosUploadErr(err));
    }
  };
};

export {
  axiosDataRead,
  storeFileName,
  axiosDataSearch,
  axiosDataSubmit,
  axiosFileUploder,
  axiosDataDelete,
  axiosCrudGetData,
  axiosDataSingle,
  axiosDataUpdate,
  axiosFileClear,
};
