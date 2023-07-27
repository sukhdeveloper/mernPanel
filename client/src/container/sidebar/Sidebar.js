import React, { useEffect, useState, Fragment } from 'react';
import { Main, SidebarFormWrapper } from '../styled';
import { Row, Col, Button, Form, Input, Modal, Radio, InputNumber, Select, Checkbox, Collapse, Upload, Table } from 'antd';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Cards } from '../../components/cards/frame/cards-frame';
import { axiosDataSubmit, axiosDataRead, storeFileName, axiosDataUpdate, axiosDataDelete } from '../../redux/crud/axios/actionCreator';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import FeatherIcon from 'feather-icons-react';
import UploadImage from '../categories/UploadImage';
import { UploadOutlined } from '@ant-design/icons';
import EditSidebar from './EditSidebar'
import S3 from 'react-aws-s3';

const { Panel } = Collapse;



const Sidebar = () => {
  const dispatch = useDispatch();
  const [trendCategories, setTrendCategories] = useState([]);
  const [uploadlargeImage, setlargeImage] = useState(null);
  const [uploadsmallImage, setsmallImage] = useState(null);
  const [titleimage, setTitleImage] = useState(['']);
  const [selectedCategoriesId, setSelectedCategoriesId] = useState('');
  const [userSubmitableSec , setUserSubmitableSec] = useState([])
  const [adsListing , setAdsListing] = useState([])
  const [totalPageCount, setTotalPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentTab, setCurrentTab] = useState(1);
  const [deleteCategoryId , setDeleteCategoryId] = useState("")
  const [totalCountOflisting ,setTotalCountOfListing] = useState(null)
  const [passId , setPassId] = useState("")
  const [formData, setFormData] = useState({
    large_banner:"",
    small_banner:"",
    large_banner_url:"",
    small_banner_url:""
  });
  const {
    large_banner,
    small_banner,
    large_banner_url,
    small_banner_url
  } = formData;

    //////////////////////////////////////////////
   ///////////Start confimation model ///////////
  //////////////////////////////////////////////
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible , setIsEditModalVisible] = useState(false)

  const showModalConfirm = () => {
    setIsModalVisible(true);
  };
  const showEditModalConfirm = (categoryIdDetail) => {
    setPassId(categoryIdDetail)
    setIsEditModalVisible(true);
  };

  

   ////////////////////////////////////////////////////////
  //////Get the categories //////////////////////////////
  //////////////////////////////////////////////////
  const getallCategoriesList = (page) => {
    // console.log("api HIT" ,page)
    var getListing = {}
    getListing.api_url = `v1/admin/sidebar_ads/${page}`
    dispatch(axiosDataRead(getListing)).then(res => {
      if (res && res.success) {
        var originData = [];
        for (let i = 0; i < res.data.listing.length; i++) {
          console.log(res.data[i]);
          originData.push({
            key: i.toString(),
            ...res.data.listing[i],
          });
        }
        setAdsListing(originData);
        setTotalCountOfListing(res.data.totalCount)
        setPageNo(page+1)
      }
    }).catch(err => console.log("errr", err));

  }

  const onPageChange = page => {
    console.log("current page no" , page)
    var getData = {};
    getData.api_url = `v1/admin/sidebar_ads/${page}`
    dispatch(axiosDataRead(getData)).then(res => {
      if (res && res.success) {
        // console.log("Current listing page no wise" , page , res.data.listing);
        var originData = [];
        for (let i = 0; i < res.data.listing.length; i++) {
          console.log(res.data[i]);
          originData.push({
            key: i.toString(),
            ...res.data.listing[i],
          });
        }
        setAdsListing(originData);
        setTotalPageCount(res.data.totalCount);
        setCurrentPage(page);
      }
    });
  };
  /////////////////////////////////End category listing/////////////////////

  const handleOkConfirm = () => {
    // /delete_sidebar_ads/:
    var data = {}
    data.api_url = `v1/admin/delete_sidebar_ads/${deleteCategoryId}`
    dispatch(axiosDataDelete(data)).then(res => {
      if (res && res.success) {
        console.log("Delete success ")
        getallCategoriesList(1)
        setIsModalVisible(false);
      }
    }).catch(err => console.log("errr", err));

    // console.log("Handle the confirmation " ,deleteCategoryId)
  };

  const handleEditConfirm = () => {
    console.log("Edit page is working" , deleteCategoryId) 
  }

  const handleCancelConfirm = () => {
    setIsModalVisible(false);
  };
  const handleEditCancelConfirm  = () => {
    setIsEditModalVisible(false);
  }

  //End confirmation model 

  const columns = [
    {
      title: 'Category Name',
      dataIndex: 'categories_id',
      key: 'categories_id',
      render: text => (
        <div className="sidebar_table_info">
          <p>{text.title}</p>
        </div>
      ),
    },
    {
      title: 'Actions',
      dataIndex: 'categories_id',
      key: 'categories_id',
      render: (category , key) => (
        <span className="action_for_sidebar_list">
          <FeatherIcon icon="edit" onClick={() =>  {
            showEditModalConfirm(category._id)
          }} />

          <FeatherIcon icon="trash-2" onClick={ () =>{
             showModalConfirm()
             handleOkConfirm()
             setDeleteCategoryId(category._id)
          }} />
        </span>
      ),
    },
  ];


  /////////////////////////////////////
  //////Manage the main model ///////////
  ////////////////////////////////////
  const [state, setState] = useState({
    visible: false,
    modalType: 'primary',
    checked: [],
    responsive: 0,
    collapsed: false,
  });
  const { responsive, collapsed } = state;

  const showModal = () => {
    setState({
      ...state,
      visible: true,
    });
  };

  const onCancel = () => {
    setState({
      ...state,
      visible: false,
    });
  };
////////////////////////////////////////////////////
  ///////////////////End the main model/////////////
  /////////////////////////////////////////////////////


  const handleChangeTextHead = (i, e) => {
    let newFormValue = [...titleimage];
    newFormValue[i] = e;
  };

  ///////////////////////////////////////////
  /////////////Manage the banner images////////
  /////////////////////////////////////////////
  let uploadedFileName = file => {
    if (file.status == 'done') {
      // console.log(file.url , "this is large file url ")
      setlargeImage(file.url);
    } else if (file.status == 'removed') {
      setlargeImage(null);
    }
  };

  let uploadedsmallFileName = file => {
    if (file.status == 'done') {
      // console.log(file.url , "this is small file url ")
      setsmallImage(file.url);
    } else if (file.status == 'removed') {
      setsmallImage(null);
    }
  };

  /////////////////End the manage the banner images ////////////////


/////////////////////////////////////////////////////
/////////////////////////Handle submit form ////////////
/////////////////////////////////////////////////////
  const handleOk = e => {
      formData.category_id = selectedCategoriesId
      formData.large_banner = uploadlargeImage
      formData.small_banner = uploadsmallImage
      formData.section = userSubmitableSec
      console.log("Form data is there" , formData )
      formData.api_url = 'v1/admin/sidebar_ads';
      dispatch(axiosDataUpdate(formData)).then(res => {
        if (res && res.success) {
          console.log("api submit res" , res);
          setState({
            ...state,
            visible: false,
          });
        }
      }).catch(err => console.log("errr", err));
    return 

    onCancel();
  };

  const handleCancel = () => {
    onCancel();
  };

  ////////////////////////End submit form //////////////////

  useEffect(() => {
    var getData = {};
    getData.api_url = 'v1/admin/get_categories_subcategories';
    dispatch(axiosDataRead(getData)).then(res => {
      if (res && res.success) {
        // console.log(res);
        setTrendCategories(res.data);
      }
    }).catch(err => console.log("errr", err));
    //for the added ads listing
    getallCategoriesList(1)
  }, []);

  
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const onSelectChange = newSelectedRowKeys => {
    console.log('selectedRowKeys changed: ', selectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const onSidebarAccorChange = key => {
    console.log(key);
  };


  const getCategoriesList = (e) => {
      // e  -- value 
      setSelectedCategoriesId(e)
  };

    //////////////////////////
   //for the input fields///
  ////////////////////////
  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleUserSection = (e = null  , index = null , miniIndex = null , content_type = null ) => {
    // console.log("Check the index" , e.target.value , index , miniIndex, content_type)
    if(miniIndex == null){
      var currentInput = {
        section_title: e.target.value ? e.target.value : "",
      }
      if(userSubmitableSec[index]){
        userSubmitableSec[index].section_title = e.target.value 
        setUserSubmitableSec([...userSubmitableSec])
      }else{
        setUserSubmitableSec(userSubmitableSec.concat(currentInput));
      }
    }

    if(miniIndex !== null){
      var lastIndex = e.target.name.lastIndexOf("_");
      var keyName = e.target.name.substring(0, lastIndex);
      var currentSecMiniInput = {
          section_link : [{
            [keyName]: e.target.value,
          }]
      }

      var SectionData = {
        [keyName]: e.target.value,
      }
      // console.log(lastIndex , keyName , currentSecMiniInput , SectionData , "DONE**********DONE")

      // console.log("userSection  ++++===>>>>>" , userSubmitableSec) 
      if(userSubmitableSec.length == 0){
        // console.log("ONE CONDITION @1")
        setUserSubmitableSec(userSubmitableSec.concat(currentSecMiniInput));
        return 
      }
      if(!userSubmitableSec[index]){
        // console.log("THRID CONDITION @3")
        setUserSubmitableSec(userSubmitableSec.concat(currentSecMiniInput));
        return
      }

      if(userSubmitableSec &&  userSubmitableSec[index] && userSubmitableSec[index]?.section_link && userSubmitableSec[index]?.section_link[miniIndex]){
        // console.log("SECOND CONDITION @2")
        var changeData = userSubmitableSec[index].section_link[miniIndex]
          changeData[keyName] = e.target.value 
          setUserSubmitableSec([...userSubmitableSec])
          return true
      }

      
      if(userSubmitableSec &&  userSubmitableSec[index] && !userSubmitableSec[index]?.section_link){
        // console.log("SECOND CONDITION @5")
          userSubmitableSec[index].section_link = currentSecMiniInput.section_link
          return true
      }

      if(userSubmitableSec[index].section_link){
        // console.log("FOURTH CONDITION @4")
        userSubmitableSec[index].section_link.push(SectionData)
        return true
      }
      // return alert("No condition is running " , userSubmitableSec)
      
      
      // if(userSubmitableSec.length == 0){
      //   setUserSubmitableSec(userSubmitableSec.concat(currentSecMiniInput));
      // }else if(userSubmitableSec && userSubmitableSec[index][section_link][miniIndex]){
        //   // console.log("working second condition")
        //   var changeData = userSubmitableSec[parseInt(index)][section_link][miniIndex]
        //   console.log("check the change data ===>>" ,changeData , "keyname is ====>>>" , keyName)
        //   changeData[keyName] = e.target.value 
        //   setUserSubmitableSec([...userSubmitableSec])
        // }else if(!userSubmitableSec[parseInt(index)]){
      //   // console.log("working 3 condition")
      //   setUserSubmitableSec(userSubmitableSec.concat(currentSecMiniInput));
      //   // console.log("Updated Section Data" ,userSubmitableSec)
      // }else{
      //   // console.log("working 4 condition")
      //   userSubmitableSec[parseInt(index)][section_link].push(SectionData)
      //   // console.log("Updated last Section Data" ,userSubmitableSec)
      // }
      
    }
  }


  const imageTouse = (img , indextwo , index , content_type) => {
    const file = img.file.originFileObj;
    const newFileName =
      img.file.originFileObj.uid +
      img.file.originFileObj.name
        .toString()
        .split(' ')
        .join('-')
        .toLowerCase();
    const config = {
      bucketName: 'themern2prbucket',
      region: 'ap-south-1',
      accessKeyId: 'AKIAR5PG7QJWFTFEC2PH',
      secretAccessKey: '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',
    };

    const ReactS3Client = new S3(config);

    ReactS3Client.uploadFile(file, newFileName).then(data => {
      if (data.status === 204) {
        var sendObj = {
            target:{
                name : `image_to_use_${index}`, 
                value:data.location
            }
        }

        handleUserSection(sendObj , indextwo, index, content_type)
        // console.log("Mini Image link from s3 buket" , data.location)
      }
    }).catch(err => console.log("mini image error" , err));
  }
  

  const [imagelistinfo, setImageListInfo] = useState(['']);
    let handleChangeListImage = (i, e) => {
    let newFormValue = [...imagelistinfo];
    console.log(e.target.name , e.target.value , " Title value ")
    newFormValue[i] = e;
    setImageListInfo(newFormValue);
  };

  
    const [sectioninfo, setSectionInfo] = useState(
    [
      {
        sec : 1,
        miniSection : [
          {
            sec : 1,
            link_img : true
          }
        ]
      }
    ]);
  
    const addInMinioInput = (indextwo , index) => {
      setSectionInfo([...sectioninfo])
      sectioninfo[indextwo].miniSection.push({sec : sectioninfo[indextwo].miniSection[index].sec+1 , link_img : true})
      setSectionInfo([...sectioninfo])
    }

    const removeInMinioInput = (indextwo , index) => {
      setSectionInfo([...sectioninfo])
      sectioninfo[indextwo].miniSection.splice(index ,1 )
      setSectionInfo([...sectioninfo])
    }

    const updateMiniInputStatus = (indextwo , index  , contentType) => {
      if(contentType == 1){
        setSectionInfo([...sectioninfo])
        sectioninfo[indextwo].miniSection[index].link_img = false
        setSectionInfo([...sectioninfo])
      }else{
        setSectionInfo([...sectioninfo])
        sectioninfo[indextwo].miniSection[index].link_img = true
        setSectionInfo([...sectioninfo])
      }
    }
  
    const removeSetion = (index) => {
      // console.log(index , "index is")
      setUserSubmitableSec(userSubmitableSec.filter((s,  sindex) => index !== sindex))
      // console.log(userSubmitableSec , "this" )
      sectioninfo.splice(index ,1 )
      setSectionInfo([...sectioninfo])
    }

  return ( 
    <>
    {/* {console.log("Check listing in state" , adsListing)} */}
      <PageHeader ghost title="Add Sidebar" />
      {/* {console.log("Section  Details" , sectioninfo)} */}
      <Main>
        <Row gutter={25}>
          <Col xs={24} sm={24}>
            <SidebarFormWrapper>
              <Cards headless>
                <div className="text-right">
                  <Button className="mdl-sidebar" onClick={showModal} size="medium" type="primary">
                    Add New Sidebar <FeatherIcon icon="plus" size={18} />
                  </Button>
                </div>
                <div className="sidebar-table">
                  <Table 
                  className="mt-20" 
                  rowSelection={rowSelection} 
                  dataSource={adsListing}
                  columns={columns} 
                  pagination={{
                    defaultPageSize: 10,
                    //current:1,
                    total: totalCountOflisting,
                    onChange: e => {
                      e && onPageChange(e);
                    },
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                  }}
                  />
                </div>
              </Cards>
            </SidebarFormWrapper>

            <Modal
              width={1000}
              type={state.modalType}
              title="Add Sidebar"
              visible={state.visible}
              footer={null}
              onCancel={handleCancel}
            >
              <div className="sidebar-modal">
                <SidebarFormWrapper>
                  <Form className="sidebar-items-form" name="sidebarProject" onFinish={handleOk} layout="vertical">
                    <Row className="mt-20">
                      <Col sm={24} xs={24} md={24} lg={24}>
                        <Select
                          size="medium"
                          // mode="multiple"
                          placeholder="Categories"
                          name="categories"
                          onChange={(e) => getCategoriesList(e)}
                          className="sDash_fullwidth-select shrt-size"
                        >
                          {trendCategories.length > 0 &&
                            trendCategories.map((data, index) => (
                              <Option value={data._id}>
                                {data.title}
                              </Option>
                            ))}
                        </Select>
                      </Col>
                    </Row>

                    <Row className="mt-20" gutter={12}>
                      <Col sm={24} xs={24} md={12} lg={12} xxl={12}>
                        <Form.Item rules={[{ required: true, message: 'Required!' }]} label="Banner Large Image">
                          <UploadImage uploadedFileName={uploadedFileName} limitOfImageUpload={1}/>
                          <p className="fontweight600">Please use Image size 370px x 938px.</p>
                        </Form.Item>
                        <Form.Item
                          name="urlforlargebanner"
                          label="URL"
                          rules={[{ required: true }, { type: 'url', warningOnly: true }, { type: 'string', min: 6 }]}
                        >
                          <Input  name="large_banner_url" onChange={onChange} required placeholder="Url for large banner" />
                        </Form.Item>
                      </Col>
                      <Col sm={24} xs={24} md={12} lg={12} xxl={12}>
                        <Form.Item rules={[{ required: true, message: 'Required!' }]} label="Banner Small Image">
                          <UploadImage  uploadedFileName={uploadedsmallFileName} limitOfImageUpload={1}/>
                          <p className="fontweight600">Please use Image size 370px x 184px.</p>
                        </Form.Item>
                        <Form.Item
                          name="urlforsmallbanner"
                          label="URL"
                          rules={[{ required: true }, { type: 'url', warningOnly: true }, { type: 'string', min: 6 }]}
                        >
                          <Input name="small_banner_url" onChange={onChange} required placeholder="Url for small banner" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row>
                      <Col sm={24} xs={24} md={24} lg={24} xxl={24}>
                        <div className="sectionaccor-info">
                          {sectioninfo.length > 0 &&
                            sectioninfo.map((repeataccor, indextwo) => (
                              <Fragment key={indextwo}>
                                <div className="full_width_accor_section">
                                  <Collapse accordion>
                                    <Panel header="Section" key={indextwo} id={`Section_${indextwo}`}>
                                      {/* <p>test One</p> */}
                                      <div clasName="accor-info">
                                        <Row>
                                          <Col sm={24} xs={24} md={24} lg={24} xxl={24}>
                                            <Form.Item
                                              size="small"
                                              label="Section Title"
                                              rules={[
                                                {
                                                  required: true,
                                                },
                                              ]}
                                            >
                                              <Input name={`section_title_${indextwo}`} value={userSubmitableSec[indextwo]?.section_title} onChange={(e) => handleUserSection(e , indextwo)}/>
                                            </Form.Item>
                                          </Col>
                                        </Row>
                                        {sectioninfo.length > 0 &&
                                          sectioninfo[indextwo].miniSection.map((titleData, index) => (
                                            <Fragment key={index}>
                                              <div className="addimage-listdesign">
                                                <div className="image-sect">
                                                  {titleData.link_img == true && 
                                                  <Form.Item
                                                    name="iconimage"
                                                    size="medium"
                                                    label="Image to use"
                                                    rules={[
                                                      {
                                                        required: true,
                                                      },
                                                    ]}
                                                  >
                                                     <Upload maxCount={1} onChange={(e) => imageTouse(e , indextwo , index , 1)}  className="image-side-button">
                                                      <Button icon={<UploadOutlined />}>Upload</Button>
                                                    </Upload>
                                                  </Form.Item>
                                                  }
                                                </div>
                                                <div className="imagetext-sect">
                                                  <label className="custom-labels">Title</label>
                                                  <input
                                                    type="text"
                                                    id={`title_${index}`}
                                                    placeholder={`Title ${index + 1}`}
                                                    className="ant-input"
                                                    name={`section_title_${index}`}
                                                    onChange={e => handleUserSection(e , indextwo, index , null)}
                                                  />
                                                </div>
                                                <div className="imageurl-sect">
                                                  <label className="custom-labels">Url</label>
                                                  <input
                                                    type="url"
                                                    id={`url_${index}`}
                                                    placeholder={`Url No ${index + 1}`}
                                                    className="ant-input"
                                                    name={`url_${index}`}
                                                    onChange={e => handleUserSection(e , indextwo, index  , null)}
                                                    required
                                                  />
                                                </div>
                                                <div className="imageurl-sect">
                                                <label className="custom-labels">Select Type</label>
                                                      <Select
                                                        size="medium" placeholder="Select Type" name={`content_type_${index}`}
                                                        onChange={
                                                          e => {
                                                            handleUserSection({target:{name : `content_type_${index}`, value:e}} , indextwo, index, e)
                                                            updateMiniInputStatus(indextwo , index , e)
                                                            }
                                                        }
                                                        className="sDash_fullwidth-select shrt-size">
                                                        <Option seleced value="0">
                                                          Link
                                                        </Option>
                                                        <Option value="1">
                                                          Button
                                                        </Option>
                                                      </Select>
                                                </div>
                                                {index == 0 ? (
                                                  <>
                                                    <div className="btttn">
                                                      <label className="custom-labels" style={{ opacity: 0 }}>
                                                        B
                                                      </label>
                                                      <Button
                                                        className="btn-signin add_trend_plus-btn"
                                                        style={{ height: '100%' }}
                                                        type="primary"
                                                        size="large"
                                                        onClick={() =>
                                                          addInMinioInput(indextwo , index)
                                                        }
                                                        >
                                                        +
                                                      </Button>
                                                    </div>
                                                  </>
                                                ) : (
                                                  <>
                                                    <div className="btttn">
                                                      <label className="custom-labels" style={{ opacity: 0 }}>
                                                        B
                                                      </label>
                                                      <Button
                                                        className="btn-signin add_trend_cross-btn"
                                                        type="danger"
                                                        size="large"
                                                        style={{ height: '100%' }}
                                                        onClick={() =>
                                                          removeInMinioInput(indextwo , index)
                                                        }
                                                      >
                                                        x
                                                      </Button>
                                                    </div>
                                                  </>
                                                )}
                                              </div>
                                            </Fragment>
                                          ))}
                                      </div>
                                    </Panel>
                                  </Collapse>

                                  {indextwo == 0 ? (
                                    <>
                                      <div className="btttn">
                                        <Button
                                          className="btn-signin add_trend_plus-btn"
                                          style={{ height: '100%' }}
                                          type="primary"
                                          size="large"
                                          onClick={() => setSectionInfo(prevState => [...prevState, {
                                            sec : sectioninfo.length + 1,
                                            miniSection : [
                                              {
                                                sec : 1,
                                                link_img : true
                                              }
                                            ]
                                          }])}
                                        >
                                          +
                                        </Button>
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <div className="btttn">
                                        <Button
                                          className="btn-signin add_trend_cross-btn"
                                          type="danger"
                                          size="large"
                                          style={{ height: '100%' }}
                                          onClick={() =>
                                            removeSetion(indextwo)
                                          }
                                        >
                                          x
                                        </Button>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </Fragment>
                            ))}
                        </div>
                      </Col>
                    </Row>

                    <Button htmlType="submit" size="default" type="primary" key="submit">
                      Add
                    </Button>
                  </Form>
                </SidebarFormWrapper>
              </div>
            </Modal>  

              {/* for the cancle modal  */}
              <Modal  title="Confirmation" visible={isModalVisible} onOk={handleOkConfirm} onCancel={handleCancelConfirm}>
              <p>Are readly want to delete ?</p>
              </Modal>
              
              {/* EditDetails confimation */}
              <Modal width={1000} footer={null} title="Edit Detail" visible={isEditModalVisible} onOk={handleEditConfirm} onCancel={handleEditCancelConfirm}>
                  <EditSidebar categoryId={passId}  />
              </Modal>
          </Col>
        </Row>
      </Main>
    </>
  );
};

export default Sidebar;
