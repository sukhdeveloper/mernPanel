import React, { useState } from 'react';
import { Row, Col, Upload, message } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Main, ImportStyleWrap } from '../styled';
import { Button } from '../../components/buttons/buttons';
import Heading from '../../components/heading/heading';
import { CSVLink } from 'react-csv';

const { Dragger } = Upload;
const Import = () => {
  const [state, setState] = useState({
    file: null,
    list: null,
    submitValues: {},
  });

  const [rejectedList, setRejectedList] = useState([]);

  const fileUploadProps = {
    name: 'file',
    multiple: true,
    action: `${process.env.REACT_APP_API_ENDPOINT}v1/admin/upload_trends`,
    headers: {
      Authorization: localStorage.getItem('token'),
    },
    onChange(info) {
      const { status } = info.file;
      if (status !== 'uploading') {
        setState({ ...state, file: info.file, list: info.fileList });
      }
      if (status === 'done') {
        if (info.file.response.success) {
          message.success(`${info.file.name} file uploaded successfully.`);
        } else {
          message.error(`${info.file.name} file upload failed.`);
          var csvData = [
            [
              'title',
              'sub_heading',
              'summary',
              'reference_link',
              'featured_images',
              'categories',
              'subcategories',
              'tags_ids',
              'focus_tags_ids',
              'review_summary',
              'mern2_compass',
              'popularity',
              'inventiveness',
              'engagement',
              'human_centricity',
              'score',
              'gender',
              'age_group',
              'geography',
              'publication_status',
              'read_time',
              'meta_content',
            ],
          ];
          for (var i = 0; i < info.file.response.data.length; i++) {
            var data = info.file.response.data[i];
            csvData.push([
              data.title,
              data.sub_heading,
              data.summary,
              data.reference_link,
              data.featured_images,
              data.categories,
              data.subcategories,
              data.tags_ids,
              data.focus_tags_ids,
              data.review_summary,
              data.mern2_compass,
              data.popularity,
              data.inventiveness,
              data.engagement,
              data.human_centricity,
              data.score,
              data.gender,
              data.age_group,
              data.geography,
              data.publication_status,
              data.read_time,
              data.meta_content,
            ]);
          }
          setRejectedList(csvData);
        }
      } else if (status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    listType: 'picture',
    defaultFileList: [],
    showUploadList: {
      showRemoveIcon: true,
      removeIcon: <FeatherIcon icon="trash-2" onClick={e => console.log(e, 'custom removeIcon event')} />,
    },
  };
  return (
    <>
      <PageHeader
        title="Import Trends"
        buttons={[
          <div key="1" className="page-header-actions">
            <a href="https://themern2prbucket.s3.ap-south-1.amazonaws.com/trends.csv" download>
              <Button size="small" type="primary">
                Download Sample Sheet
              </Button>
            </a>
          </div>,
        ]}
      />
      <Main>
        <Row gutter={25}>
          <Col sm={24} xs={24}>
            <ImportStyleWrap>
              <div className="sDash_import-box">
                <Row gutter={15}>
                  {/* {rejectedList.length > 0 && (
                    <Col xs={24}>
                      <CSVLink filename={`rejected-trends.csv`} data={rejectedList}>
                        <Button className="btn-export" type="primary">
                          Export Rejected Trends List
                        </Button>
                      </CSVLink>
                    </Col>
                  )} */}
                  <Col xs={24}>
                    <div className="sDash_import-inner">
                      <Dragger {...fileUploadProps}>
                        <p className="ant-upload-drag-icon">
                          <FeatherIcon icon="upload" size={50} />
                        </p>
                        <Heading as="h4" className="ant-upload-text">
                          <span> Drop File</span>
                          <span className="ant-upload-hint">
                            or <span>Browse</span>
                          </span>
                        </Heading>
                      </Dragger>
                    </div>
                  </Col>
                </Row>
              </div>
            </ImportStyleWrap>
          </Col>
        </Row>
      </Main>
    </>
  );
};

export default Import;
