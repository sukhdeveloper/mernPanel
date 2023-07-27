import React,{useEffect,useState} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { NoteCardWrap } from '../style';
import { Cards } from '../../../components/cards/frame/cards-frame';
import Table from './table';
import { axiosDataRead } from '../../../redux/crud/axios/actionCreator';



const Personal = ({match}) => {
  //console.log(match);
  var id = match.params.id;
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    var getData = {};
    getData.api_url = `v1/admin/get_categories_subcategories?category_id=${id}`;
    dispatch(axiosDataRead(getData)).then(res => {
      if (res && res.success) {
        //console.log(res);
        var updatedData = [];
        for(var i=0;i<res.data.length;i++){
          updatedData.push({
            key:res.data[i]._id,
            _id:res.data[i]._id,
            publication_status : (res.data[i].publication_status ? 'Published' : 'Draft'),
            title : res.data[i].title,
            description : res.data[i].description,
            category_title : res.data[i].category_id.title,
            category_id : res.data[i].category_id._id,
            banners : res.data[i].banners
          })
        }
        setCategories(updatedData);
      }
    });
  }, [id]);
  const dispatch = useDispatch();

  return (
    <Cards title="Subcategories List">
      <NoteCardWrap>
        <Table data={categories} />
        {/* <SortableList useDragHandle axis="xy" items={data} onSortEnd={onSortEnd} /> */}
      </NoteCardWrap>
    </Cards>
  );
};

export default Personal;
