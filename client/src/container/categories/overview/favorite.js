import React,{useEffect,useState} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { SortableContainer, SortableElement, sortableHandle } from 'react-sortable-hoc';
import arrayMove from 'array-move';
import FeatherIcon from 'feather-icons-react';
import { Row, Col } from 'antd';
import { NoteCardWrap } from '../style';
import NoteCard from '../../../components/note/CardForCategories';
import { Cards } from '../../../components/cards/frame/cards-frame';
import { noteDragData } from '../../../redux/note/actionCreator';
import { axiosDataRead } from '../../../redux/crud/axios/actionCreator';

const DragHandle = sortableHandle(() => <FeatherIcon icon="move" size={16} />);

const SortableItem = SortableElement(({ value }) => (
  <Col xxl={8} xl={12} lg={12} sm={12} xs={24} key={value.key}>
    <NoteCard Dragger={DragHandle} data={value} />
  </Col>
));

const SortableList = SortableContainer(({ items }) => {
  return (
    <Row gutter={24}>
      {items
        .filter(item => item.pin_to_sidebar)
        .map((value, index) => (
          <SortableItem key={`item-${value._id}`} index={index} value={value} />
        ))}
    </Row>
  );
});

const Favorite = () => {
  const dispatch = useDispatch();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    var getData = {};
    getData.api_url = 'v1/admin/get_categories_subcategories';
    dispatch(axiosDataRead(getData)).then(res => {
      if (res && res.success) {
        //console.log(res);
        setCategories(res.data);
      }
    });
  }, []);

  const onSortEnd = ({ oldIndex, newIndex }) => {
    dispatch(
      noteDragData(
        arrayMove(
          [...categories.filter(item => item.pin_to_sidebar), ...categories.filter(item => !item.pin_to_sidebar)],
          oldIndex,
          newIndex,
        ),
      ),
    );
  };

  return (
    <Cards title="Favorite">
      <NoteCardWrap>
        <SortableList useDragHandle axis="xy" items={categories} onSortEnd={onSortEnd} />
      </NoteCardWrap>
    </Cards>
  );
};

export default Favorite;
