import React, { useEffect, useState, Fragment } from 'react';
import { Row, Col, Button, Form, Input,Table, InputNumber, Select, Checkbox, AutoComplete, Modal } from 'antd';
import { Main, EnquiriesFormWrapper } from '../styled';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Cards } from '../../components/cards/frame/cards-frame';
import MailComposer from '../email/overview/MailComposer';

const getRandomInt = (max, min = 0) => Math.floor(Math.random() * (max - min + 1)) + min;

const searchResult = (query) =>
  new Array(getRandomInt(5))
    .join('.')
    .split('.')
    .map((_, idx) => {
      const category = `${query}${idx}`;
      return {
        value: category,
        label: (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span>
              Found {query} on{' '}
              <a
                href={`https://s.taobao.com/search?q=${query}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {category}
              </a>
            </span>
            <span>{getRandomInt(200, 100)} results</span>
          </div>
        ),
      };
    });


const Enquiries = () => {
  const [resultoptions, setResultOptions] = useState([]);

  const handleSearch = value => {
    setResultOptions(value ? searchResult(value) : []);
  };

  const onSelect = value => {
    console.log('onSelect', value);
  };
  
  const [isReplyModalVisible, setIsReplyModalVisible] = useState(false);

  const showReplyModal = () => {
    setIsReplyModalVisible(true);
  };

  const handleReplyOk = () => {
    setIsReplyModalVisible(false);
  };

  const handleReplyCancel = () => {
    setIsReplyModalVisible(false);
  };

  const enquirycolumns = [
    {
      title: 'S.No',
      dataIndex: 'sno',
      sorter: {
        compare: (a, b) => a.sno - b.sno,
        multiple: 7,
      },
    },
    {
      title: 'Name',
      dataIndex: 'name',
      sorter: {
        compare: (a, b) => a.name - b.name,
        multiple: 6,
      },
    },
    {
      title: 'Email',
      dataIndex: 'email',
      sorter: {
        compare: (a, b) => a.email - b.email,
        multiple: 5,
      },
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      sorter: {
        compare: (a, b) => a.phone - b.phone,
        multiple: 4,
      },
    },
    {
      title: 'Address',
      dataIndex: 'address',
      sorter: {
        compare: (a, b) => a.address - b.address,
        multiple: 3,
      },
    },
    {
      title: 'Enquiry Date',
      dataIndex: 'enquirydate',
      sorter: {
        compare: (a, b) => a.enquirydate - b.enquirydate,
        multiple: 2,
      },
    },
    {
      title: 'Message',
      dataIndex: 'message',
      sorter: {
        compare: (a, b) => a.message - b.message,
        multiple: 1,
      },
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      render: () => <><Button onClick={showReplyModal}>Reply</Button>
      <Modal className="reply-modall" width={800} title="Reply" visible={isReplyModalVisible} onOk={handleReplyOk} onCancel={handleReplyCancel}>
         <MailComposer />
         {/* <p>Testing</p> */}
      </Modal>
      </>
    },
  ];
  const enquirydata = [
    {
      key: '1',
      sno: '1',
      name: 'John Brown',
      email: 98,
      phone: 60,
      address: 70,
      enquirydate: '29 aug 2022',
      message: 'Message',
    },
    {
      key: '2',
      sno: '2',
      name: 'Jim Green',
      email: 98,
      phone: 66,
      address: 89,
      enquirydate: '21 aug 2022',
      message: 'Message',
    },
    {
      key: '3',
      sno: '3',
      name: 'Joe Black',
      email: 98,
      phone: 90,
      address: 70,
      enquirydate: '22 aug 2022',
      message: 'Message',
    },
    {
      key: '4',
      sno: '4',
      name: 'Jim Red',
      email: 88,
      phone: 99,
      address: 89,
      enquirydate: '23 aug 2022',
      message: 'Message',
    },
    {
      key: '5',
      sno: '5',
      name: 'Jane Eyre',
      email: 88,
      phone: 99,
      address: 89,
      enquirydate: '26 aug 2022',
      message: 'Message',
    },
  ];
  
  const onEnquiryChange = (pagination, filters, sorter, extra) => {
    console.log('params', pagination, filters, sorter, extra);
  };



  return (
    <>
      <PageHeader ghost title="Enquiries" />
      <Main>
        <Row gutter={25}>
          <Col xs={24} sm={24}>
            <EnquiriesFormWrapper className="mb-25">
              <Cards title="All Enquiries Details">
                <Row>
                  <Col sm={24} xs={24} lg={18} md={18} xxl={18}>
                    <div className="enquiries-top-options">
                      <Button type="primary" size="middle">
                        Copy
                      </Button>
                      <Button type="primary" size="middle">
                        Excel
                      </Button>
                      <Button type="primary" size="middle">
                        CSV
                      </Button>
                      <Button type="primary" size="middle">
                        PDF
                      </Button>
                      <Button type="primary" size="middle">
                        Print
                      </Button>
                    </div>
                  </Col>
                  <Col sm={24} xs={24} lg={6} md={6} xxl={6}>
                    <AutoComplete
                      // dropdownMatchSelectWidth={252}
                      // style={{
                      //   width: 300,
                      // }}
                      options={[resultoptions]}
                      onSelect={onSelect}
                      onSearch={handleSearch}
                    >
                      <Input.Search size="small" placeholder="Input here" enterButton />
                    </AutoComplete>
                  </Col>
                </Row>
                <Row className="mt-20">
                  <Col xs={24} sm={24} md={24} lg={24} xxl={24}>
                      <Table className="enquiry_table_info" columns={enquirycolumns} dataSource={enquirydata} onChange={onEnquiryChange} />
                  </Col>
                </Row>
              </Cards>
            </EnquiriesFormWrapper>
          </Col>
        </Row>
      </Main>
    </>
  );
};

export default Enquiries;
