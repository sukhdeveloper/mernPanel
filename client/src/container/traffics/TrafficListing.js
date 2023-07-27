import React, { useEffect, useState, Fragment } from 'react';
import { Row, Col, Button, Form, Input, Radio, InputNumber, Select, Checkbox, Table, Tag, Space } from 'antd';
import { Main, TrafficTableWrapper } from '../styled';
import { PageHeader } from '../../components/page-headers/page-headers';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { axiosDataRead } from '../../redux/crud/axios/actionCreator';
import { Cards } from '../../components/cards/frame/cards-frame';


const columns = [
{
  title: 'No',
  dataIndex: 'key',
  key: 'no',
  render: (key,no) => <p>{parseInt(key)+1}</p>,
},
{
title: 'Profile',
dataIndex: 'image',
key: 'image',
render: (image) =>  
<div className="traffic-listing">
{image != "" ? 
  <img src={image} />
  :
  <img src="../../../coachsaab.png" />
}


</div>
},
{
title: 'Name',
dataIndex: 'username',
key: 'username',
render: (username) => <p>{username}</p>,
},
{
title: 'Email',
dataIndex: 'email',
key: 'email',
//   render: () => <p>test@gmail.com</p>,
},
// {
// title: 'Phone',
// dataIndex: 'phone',
// key: 'phone',
//   render: (phone) => <p>{phone}</p>,
// },
{
title: 'Age',
dataIndex: 'age',
key: 'age',
  render: (age) => <p>{age}</p>
},
{
title: 'Gender',
dataIndex: 'gender',
key: 'gender',
  render: (gender) => <p>{gender}</p>
},
];
// const data = [
// {
// key: '1',
// No: '1.',
// profile: '',
// name: 'John Brown',
// email: 'John@gmail.com',
// phone: '+9193999988880',
// age: 32,
// gender: 'Man',
// },
// {
// key: '2',
// No: '2.',
// profile: '',
// name: 'Jim Green',
// email: 'Jim@gmail.com',
// phone: '+919399499999',
// age: 35,
// gender: 'Woman',
// },
// {
// key: '3',
// No: '3.',
// profile: '',
// name: 'Joe Black',
// email: 'Joe@gmail.com',
// phone: '+919399000099',
// age: 28,
// gender: 'Woman',
// },
// {
// key: '4',
// No: '4.',
// profile: '',
// name: 'Jane Eyre',
// email: 'Jane@gmail.com',
// phone: '+9198293829380',
// age: 22,
// gender: 'Man',
// },
// {
// key: '5',
// No: '5.',
// profile: '',
// name: 'Jenny',
// email: 'Jenny@gmail.com',
// phone: '+919827878788',
// age: 24,
// gender: 'Man',
// },
// {
// key: '6',
// No: '6.',
// profile: '',
// name: 'Stuart Little',
// email: 'stuart@gmail.com',
// phone: '+919855524424',
// age: 29,
// gender: 'Woman',
// },
// {
// key: '7',
// No: '7.',
// profile: '',
// name: 'Tom Cruise',
// email: 'tom@gmail.com',
// phone: '+919800024424',
// age: 29,
// gender: 'Man',
// },
// {
// key: '8',
// No: '8.',
// profile: '',
// name: 'Nancy',
// email: 'nancy@gmail.com',
// phone: '+9198000994424',
// age: 23,
// gender: 'Woman',
// },
// {
// key: '9',
// No: '9.',
// profile: '',
// name: 'Mercy',
// email: 'mercy@gmail.com',
// phone: '+919090909424',
// age: 29,
// gender: 'Man',
// },
// {
// key: '10',
// No: '10.',
// profile: '',
// name: 'Jasmine',
// email: 'Jasmine@gmail.com',
// phone: '+919290955040',
// age: 25,
// gender: 'Woman',
// },
// ];

const TrafficListing = () => {
  const [data , setData] = useState([])
  const [totalPageCount,setTotalPageCount] = useState(0);
  const [currentPage,setCurrentPage] =  useState(1);

  const dispatch = useDispatch();
  const history = useHistory();

  const userListingData = () => {
    var getData = {};
    getData.api_url = `v1/admin/users_listing/${currentPage}`;
    dispatch(axiosDataRead(getData)).then(res => {
      if (res && res.success) {
        //console.log(res);
        var originData = [];
        for (let i = 0; i < res.data.userList.length; i++) {
          // console.log(i);
          originData.push({
            key: i.toString(),
            ...res.data.userList[i],
          });
        }
        setTotalPageCount(res.data.totalCount);
        setData(originData);
      }
    }).catch(err => console.log("errr" , err));
  }



  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      setState({ ...state, selectedRowKeys, selectedRows });
    },
    getCheckboxProps: record => ({
      disabled: record.name === 'Disabled User', // Column configuration not to be checked
      name: record.name,
    }),
  };

  useEffect(() => {
    userListingData()
  }, [currentPage]);

  return (
    <>
      <PageHeader
        ghost
        title="Traffics Listing"
      />

      <Main>
        <Row gutter={25}>
          <Col xs={24} sm={24}>

            <TrafficTableWrapper className="mb-25">
            <Cards headless className="traffics-table-data">
            <div className="sDash_export-file-table table-bordered table-responsive">
                  <Table
                    // rowSelection={rowSelection}
                    dataSource={data}
                    columns={columns}
                    pagination={{
                      defaultPageSize:10,
                      //current:1,
                      total: totalPageCount,
                      onChange: e => {e && setCurrentPage(e)},
                      showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                    }}
                  />
                </div>
                </Cards>
            </TrafficTableWrapper>
          </Col>
        </Row>
      </Main>
    </>
  );
};

export default TrafficListing
