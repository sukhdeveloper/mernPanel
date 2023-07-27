import React from 'react';
import { Upload, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import S3 from 'react-aws-s3';

function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      previewVisible: false,
      previewImage: '',
      previewTitle: '',
      fileList: (props.defaultImages && props.defaultImages.length>0 ? props.defaultImages : []),
      featureImagesIdsArray: (props.featureImagesIdsArray && props.featureImagesIdsArray.length>0 ? props.featureImagesIdsArray : []),

      // fileList: [
      //   {
      //     uid: '-1',
      //     name: 'image.png',
      //     status: 'done',
      //     url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
      //   },
      //   {
      //     uid: '-2',
      //     name: 'image.png',
      //     status: 'done',
      //     url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
      //   },
      //   {
      //     uid: '-3',
      //     name: 'image.png',
      //     status: 'done',
      //     url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
      //   },
      //   {
      //     uid: '-4',
      //     name: 'image.png',
      //     status: 'done',
      //     url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
      //   },
      //   {
      //     uid: '-xxx',
      //     percent: 50,
      //     name: 'image.png',
      //     status: 'uploading',
      //     url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
      //   },
      //   {
      //     uid: '-5',
      //     name: 'image.png',
      //     status: 'error',
      //   },
      // ],
    };
  }

  handleCancel = () => this.setState({ previewVisible: false });
  // removeImage = async file => {
  //   console.log(file);
  // }
  handlePreview = async file => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }

    this.setState({
      previewImage: file.url || file.preview,
      previewVisible: true,
      previewTitle: file.name || file.url.substring(file.url.lastIndexOf('/') + 1),
    });
  };

  handleChange = ({ fileList }) => {
    console.log(fileList);
    this.setState({ fileList });
  };

  render() {
    const { previewVisible, previewImage, fileList, previewTitle } = this.state;
    const uploadButton = (
      <div>
        <PlusOutlined />
        <div style={{ marginTop: 8 }}>Upload</div>
      </div>
    );
    return (
      <>
        <Upload
          action={`${process.env.REACT_APP_API_ENDPOINT}v1/admin/upload_image`}
          listType="picture-card"
          fileList={fileList}
          onPreview={this.handlePreview}
          onChange={e => {
            console.log(e)
            const completeData = e;
            const file = completeData.file.originFileObj;
            const newFileName =
              completeData.file.originFileObj.uid +
              completeData.file.originFileObj.name
                .toString()
                .split(' ')
                .join('-')
                .toLowerCase();
            var index = this.state.featureImagesIdsArray.indexOf(newFileName);
            if (completeData.file.status == 'done') {
              if (index == -1) {
                this.setState({ featureImagesIdsArray: [...this.state.featureImagesIdsArray, newFileName] });
                const config = {
                  bucketName: 'themern2prbucket',
                  region: 'ap-south-1',
                  accessKeyId: 'AKIAR5PG7QJWFTFEC2PH',
                  secretAccessKey: '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',
                };

                const ReactS3Client = new S3(config);

                ReactS3Client.uploadFile(file, newFileName).then(data => {
                  if (data.status === 204) {
                    this.props.uploadedFileName({
                      url: data.location,
                      id: completeData.file.originFileObj.uid,
                      status: completeData.file.status,
                    });
                    this.handleChange(completeData);
                    return true;
                  } else {
                    return false;
                  }
                });
              }
            } else if (completeData.file.status == 'removed') {
              this.setState({ featureImagesIdsArray: this.state.featureImagesIdsArray.filter((s, sindex) => index !== sindex) });
            }
          }}
        >
          {fileList.length >= 8 ? null : uploadButton}
        </Upload>
        <Modal visible={previewVisible} title={previewTitle} footer={null} onCancel={this.handleCancel}>
          <img alt="example" style={{ width: '100%' }} src={previewImage} />
        </Modal>
      </>
    );
  }
}

export default App;
