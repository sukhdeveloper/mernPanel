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
import S3 from 'react-aws-s3';
const { Panel } = Collapse;



const EditSidebar = (props) => {
    // console.log("Edit page Category id " , props.categoryId)
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
    const [singleAdsData , setSingleAdsData] = useState({})
    const [totalCountOflisting ,setTotalCountOfListing] = useState(null)
    const [formData, setFormData] = useState({
      large_banner     :"",
      small_banner     :"",
      large_banner_url :"",
      small_banner_url :"",
    });
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
    
    const {
      large_banner,
      small_banner,
      large_banner_url,
      small_banner_url
    } = formData;

    /////////////////////////////////////////////////////
/////////////////////////Handle submit form ////////////
/////////////////////////////////////////////////////
const handleOk = e => {
    formData.category_id = selectedCategoriesId
    formData.large_banner = uploadlargeImage
      formData.small_banner = uploadsmallImage
    formData.section = userSubmitableSec
    // return console.log("Submit form data In edit page" , formData )
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


//Handle section data
const handleUserSection = (e = null  , index = null , miniIndex = null , content_type = null ) => {
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
        const keyName = e.target.name.substring(0, lastIndex);
        var currentSecMiniInput = {
            section_link : [{
              [keyName]: e.target.value,
              // content_type : content_type
            }]
          }
        var SectionData = {
          [keyName]: e.target.value,
          // content_type : content_type
        }
        // console.log("userSection -...>>>>>" ,  userSubmitableSec) 
        if(userSubmitableSec.length == 0){
          setUserSubmitableSec(userSubmitableSec.concat(currentSecMiniInput));
        }else if(userSubmitableSec[index]?.section_link[miniIndex]){
          // console.log("working second condition")
          var changeData = userSubmitableSec[index].section_link[miniIndex]
          changeData.[keyName] = e.target.value 
          setUserSubmitableSec([...userSubmitableSec])
        }else if(!userSubmitableSec[index]){
          // console.log("working 3 condition")
          setUserSubmitableSec(userSubmitableSec.concat(currentSecMiniInput));
          console.log("Updated Section Data" ,userSubmitableSec)
        }else{
          // console.log("working 4 condition")
          userSubmitableSec[index].section_link.push(SectionData)
          console.log("Updated last Section Data" ,userSubmitableSec)
        }
      }

  }


const uploadMiniImage = file => {
    if (file.status == 'done') {
        // setlargeImage(file.url);
        console.log(file.url)
    } else if (file.status == 'removed') {
        setlargeImage(null);
    }
}



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
const getCategoriesList = (e) => {
    // e  -- value 
    // console.log("Sected value in edit page " , e)
    setSelectedCategoriesId(e)
};
const getDetailbyId = props.categoryId
const oneSidebarAds = (getDetailbyId) => {
    var getListing = {}
    getListing.api_url = `v1/admin/one_sidebar_ads/${getDetailbyId}`
    dispatch(axiosDataRead(getListing)).then(res => {
      if (res && res.success) {
    // console.log("sinle ads data" , res.data)
    setSingleAdsData(res.data)
    //setting up the sections and minisection count
    const defaultMainSection = []
    const miniSection = []
      for (let i = 0; i < res.data.section.length; i++) {
        defaultMainSection.push({
            sec : i+1,
            miniSection : []
          })

          for (let j = 0; j < res.data.section[i].section_link.length; j++) {
            defaultMainSection[i].miniSection.push({sec : j+1 , link_img : res.data.section[i].section_link[j].content_type})                       
          }
      }
      console.log("print the mini box" , defaultMainSection)
        setSectionInfo(defaultMainSection)
        //mange the basic data 
        setFormData({
            large_banner:res.data.large_banner,
            small_banner:res.data.small_banner,
            large_banner_url:res.data.large_banner_url,
            small_banner_url:res.data.small_banner_url
        })
        setSelectedCategoriesId(res.data.categories_id)
        setUserSubmitableSec(res.data.section)
      }
    }).catch(err => console.log("errr", err));

    


}

useEffect(() => {
    var getData = {};
    getData.api_url = 'v1/admin/get_categories_subcategories';
    dispatch(axiosDataRead(getData)).then(res => {
    if (res && res.success) {
        // console.log(res);
        setTrendCategories(res.data);
    }
    }).catch(err => console.log("errr", err));
    
    //single ads listing
    oneSidebarAds(getDetailbyId)
}, [getDetailbyId]);


const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });


  
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
  

  const addInMinioInput = (indextwo , index) => {
    setSectionInfo([...sectioninfo])
    sectioninfo[indextwo].miniSection.push({sec : sectioninfo[indextwo].miniSection[index].sec+1 , link_img : 0})
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
      sectioninfo[indextwo].miniSection[index].link_img = 1
      setSectionInfo([...sectioninfo])
    }else{
      setSectionInfo([...sectioninfo])
      sectioninfo[indextwo].miniSection[index].link_img = 0
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
        {console.log("default form data" , sectioninfo)}
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
                          value={selectedCategoriesId}
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
                          <UploadImage uploadedFileName={uploadedFileName} limitOfImageUpload={1} />
                          <p className="fontweight600">Please use Image size 370px x 938px.</p>
                        </Form.Item>
                        <Form.Item
                          label="URL"
                          rules={[{ required: true }, { type: 'url', warningOnly: true }, { type: 'string', min: 6 }]}
                        >
                          <Input  name="large_banner_url"  onChange={onChange} required placeholder="Url for large banner" value={formData.large_banner_url}/>
                        </Form.Item>
                      </Col>
                      <Col sm={24} xs={24} md={12} lg={12} xxl={12}>
                        <Form.Item rules={[{ required: true, message: 'Required!' }]} label="Banner Small Image">
                          <UploadImage uploadedFileName={uploadedsmallFileName} limitOfImageUpload={1}/>
                          <p className="fontweight600">Please use Image size 370px x 184px.</p>
                        </Form.Item>
                        <Form.Item
                          label="URL"
                          rules={[{ required: true }, { type: 'url', warningOnly: true }, { type: 'string', min: 6 }]}
                        >
                          <Input name="small_banner_url" onChange={onChange} required placeholder="Url for small banner" value={formData.small_banner_url} />
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
                                                  {titleData.link_img == 0 && 
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
                                                    <Upload  maxCount={1} onChange={(e) => imageTouse(e , indextwo , index , 1)}  className="image-side-button"  >
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
                                                    value={userSubmitableSec[indextwo]?.section_link[index]?.section_title ? userSubmitableSec[indextwo]?.section_link[index]?.section_title : ""}
                                                    onChange={e => handleUserSection(e , indextwo, index , 0)}
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
                                                    value={userSubmitableSec[indextwo]?.section_link[index]?.url ? userSubmitableSec[indextwo]?.section_link[index].url : ""}
                                                    onChange={e => handleUserSection(e , indextwo, index  , 0)}
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
                                                        defaultValue={userSubmitableSec[indextwo]?.section_link[index]?.content_type ? userSubmitableSec[indextwo]?.section_link[index]?.content_type : ""}
                                                        className="sDash_fullwidth-select shrt-size">
                                                        <Option value={0}>
                                                          Link
                                                        </Option>
                                                        <Option value={1}>
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
                                                link_img :   0
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
                      Edit
                    </Button>
                  </Form>
                </SidebarFormWrapper>
              </div>
        </>
     )
}

export default EditSidebar;