import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Row, Col } from 'antd';
import { SortableContainer, SortableElement, sortableHandle } from 'react-sortable-hoc';
import arrayMove from 'array-move';
import FeatherIcon from 'feather-icons-react';
import { NoteCardWrap } from '../style';
import NoteCard from '../../../components/note/CardForCategories';
import { Cards } from '../../../components/cards/frame/cards-frame';
import { noteDragData } from '../../../redux/note/actionCreator';

const DragHandle = sortableHandle(() => <FeatherIcon icon="move" size={16} />);

const SortableItem = SortableElement(({ value }) => (
  <Col xxl={8} xl={12} lg={12} sm={12} xs={24} key={value._id}>
    <NoteCard Dragger={DragHandle} data={value} />
  </Col>
));

const SortableList = SortableContainer(({ items }) => {
  return (
    <Row gutter={24}>
      {items.map((value, index) => (
        <SortableItem key={`item-${index}`} index={index} value={value} />
      ))}
    </Row>
  );
});

const All = ({data}) => {
  const dispatch = useDispatch();
  const onSortEnd = ({ oldIndex, newIndex }) => {
    dispatch(noteDragData(arrayMove(data, oldIndex, newIndex)));
  };

  return (
    <Cards title="Categories List">
      <NoteCardWrap>
        <SortableList useDragHandle axis="xy" items={data} onSortEnd={onSortEnd} />
      </NoteCardWrap>
    </Cards>
  );
};

export default All;
