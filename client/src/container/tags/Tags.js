import React, { useState, useEffect } from 'react';
import { Row, Col, Input, Form, Table, Spin , Checkbox, Popconfirm, Typography } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import FeatherIcon from 'feather-icons-react';
import { Link } from 'react-router-dom';
import { sortableContainer, sortableElement, sortableHandle } from 'react-sortable-hoc';
import arrayMove from 'array-move';
import PropTypes from 'prop-types';
import { Span, TodoStyleWrapper } from './style';
import { Main, TableWrapper, BasicFormWrapper } from '../styled';
import { Modal } from '../../components/modals/antd-modals';
import { Button } from '../../components/buttons/buttons';
import { Cards } from '../../components/cards/frame/cards-frame';
import { PageHeader } from '../../components/page-headers/page-headers';
import { ToDoAddData, ToDoDeleteData, onStarUpdate } from '../../redux/todo/actionCreator';
import { Tag } from '../../components/tags/tags';
import { axiosDataSubmit, axiosDataRead, axiosDataUpdate } from '../../redux/crud/axios/actionCreator';

const DragHandle = sortableHandle(() => (
  <FeatherIcon size={16} style={{ cursor: 'pointer', color: '#999' }} icon="move" />
));

const TagsData = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [data, setData] = useState([]);
  const [inputTags, setInputTags] = useState([]);
  const [checkboxStatus,setCheckboxStatus] = useState(false);

  useEffect(() => {
    var getData = {};
    getData.api_url = 'v1/admin/get_tags';
    dispatch(axiosDataRead(getData)).then(res => {
      if (res && res.success) {
        //console.log(res);
        var originData = [];
        for (let i = 0; i < res.data.length; i++) {
          originData.push({
            key: i.toString(),
            ...res.data[i],
          });
        }
        setData(originData);
      }
    });
  }, [formSubmitted]);
  const EditableCell = ({ editing, dataIndex, title, inputType, record, index, children, ...restProps }) => {
    const inputNode = inputType === 'checkbox' ? <Checkbox defaultChecked={checkboxStatus} onChange={e => setCheckboxStatus(e.target.checked)} /> : <Input />;
    return (
      <td {...restProps}>
        {editing && inputType !== 'number' ? (
          <Form.Item
            name={dataIndex}
            style={{
              margin: 0,
            }}
            rules={[
              {
                required: true,
                message: `Please Input ${title}!`,
              },
            ]}
          >
            {inputNode}
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  };

  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState('');

  const isEditing = record => record.key === editingKey;

  const edit = record => {
    form.setFieldsValue({
      tag_name: '',
      search_count: '',
      tag_status: record.tag_status,
      ...record,
    });
    setEditingKey(record.key);
    setCheckboxStatus(record.tag_status);
  };

  const cancel = () => {
    setEditingKey('');
  };

  const save = async key => {
    try {
      const row = await form.validateFields();
      const newData = [...data];
      const index = newData.findIndex(item => key === item.key);

      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, { ...item, ...row });
        var updatedData = item;
        updatedData.tag_name = row.tag_name;
        updatedData.tag_status = checkboxStatus;
        updatedData.api_url = 'v1/admin/update_tag';
        //update_tag
        dispatch(axiosDataUpdate(updatedData)).then(res => {
          if (res && res.success) {
            setData(newData);
            setEditingKey('');
            setCheckboxStatus(false);
            setFormSubmitted(!formSubmitted);
          }
        });
      } else {
        newData.push(row);
        setData(newData);
        setEditingKey('');
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  const columns = [
    {
      title: 'Trend Tags',
      dataIndex: 'tag_name',
      editable: true,
      render: tags => (
        <span>
          <Tag color="geekblue">{tags.toUpperCase()}</Tag>
        </span>
      ),
    },
    {
      title: 'Search Count',
      dataIndex: 'search_count',
      width: '15%',
      //editable: true,
    },
    {
      title: 'Show Tag On Search',
      dataIndex: 'tag_status',
      width: '15%',
      editable: true,
      render: (tag_status, record) => (
        <span>
          <input type="checkbox" className={`checkbox_${record.key}`} defaultChecked={tag_status} />
        </span>
      ),
    },
    {
      title: 'Action',
      dataIndex: 'operation',
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Typography.Link
              onClick={() => save(record.key)}
              style={{
                marginRight: 8,
              }}
            >
              Save
            </Typography.Link>
            <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
              <a>Cancel</a>
            </Popconfirm>
          </span>
        ) : (
          <Typography.Link disabled={editingKey !== ''} onClick={() => edit(record)}>
            Edit
          </Typography.Link>
        );
      },
    },
  ];
  const mergedColumns = columns.map(col => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: record => ({
        record,
        inputType: col.dataIndex === 'search_count' ? 'number' : col.dataIndex === 'tag_status' ? 'checkbox' : 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });
  const todoData = useSelector(state => state.Todo.data);
  const dispatch = useDispatch();

  const [state, setState] = useState({
    inputData: '',
    selectedRowKeys: [],
    visible: false,
  });
  const { selectedRowKeys, inputData } = state;

  const onHandleDelete = key => {
    const data = todoData.filter(item => item.key !== key);
    dispatch(ToDoDeleteData(data));
  };

  const dataSource = [];

  if (todoData !== null) {
    todoData.map((item, index) => {
      return dataSource.push({
        key: index + 1,
        index,
        item: (
          <Span className={selectedRowKeys.includes(index) ? 'todo-title active' : 'todo-title inactive'}>
            {item.item}
          </Span>
        ),
        action: (
          <div className="todos-action">
            <DragHandle />
            <Link
              className={item.favorite ? 'star active' : 'star'}
              onClick={() => dispatch(onStarUpdate(todoData, item.key))}
              to="#"
            >
              <FeatherIcon icon="star" style={{ color: item.favorite ? 'gold' : '#888' }} size={16} />
            </Link>
            <Link onClick={() => onHandleDelete(item.key)} to="#">
              <FeatherIcon icon="trash-2" size={16} />
            </Link>
          </div>
        ),
      });
    });
  }
  const SortableItem = sortableElement(props => <tr {...props} />);

  const DraggableBodyRow = ({ className, style, ...restProps }) => {
    // function findIndex base on Table rowKey props and should always be a right array index
    const index = dataSource.findIndex(x => x.index === restProps['data-row-key']);
    return <SortableItem index={index} {...restProps} />;
  };

  DraggableBodyRow.propTypes = {
    className: PropTypes.string,
    style: PropTypes.object,
  };

  const onSubmitHandler = () => {
    if (inputTags.length > 0) {
      var formData = {};
      formData.api_url = 'v1/admin/add_tags';
      formData.tags = [];
      inputTags.forEach(tag =>
        formData.tags.push({
          tag_name: tag,
          tag_status: true,
          created_at: new Date(),
        }),
      );
      dispatch(axiosDataSubmit(formData)).then(res => {
        if (res && res.success) {
          setFormSubmitted(!formSubmitted);
          onCancel();
          setInputTags([]);

          //setInputFieldForTags(<></>);
          //location.reload();
        }
      });
    }
    // if (inputData !== '') {
    //   dispatch(
    //     ToDoAddData([
    //       ...todoData,
    //       {
    //         key: max + 1,
    //         item: inputData,
    //         time: new Date().getTime(),
    //         favorite: false,
    //       },
    //     ]),
    //   );
    //   setState({
    //     ...state,
    //     inputData: '',
    //     visible: false,
    //   });
    // } else {
    //   alert('Please Give a Task Title...');
    // }
  };

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

  const handleCancel = () => {
    onCancel();
  };

  return (
    <>
      <PageHeader
        ghost
        title="Trend Tags"
        buttons={[
          <div key="1" className="page-header-actions">
            <div className="new-todo-wrap">
              <Button onClick={showModal} className="btn-toDoAdd" transparented type="primary" size="large">
                + Add New
              </Button>
            </div>
          </div>,
        ]}
      />

      <Main>
        <Row gutter={30}>
          <Col md={24}>
            <Form form={form} component={false}>
              <Table
               className="tags_table"
                components={{
                  body: {
                    cell: EditableCell,
                  },
                }}
                bordered
                dataSource={data}
                columns={mergedColumns}
                rowClassName="editable-row"
                pagination={{
                  onChange: cancel,
                }}
              />
            </Form>
          </Col>
        </Row>
        {state.visible && (
          <Modal
            className="add_new_tag_popup"
            type={state.modalType}
            title="Add New Tag"
            visible={state.visible}
            footer={null}
            onCancel={handleCancel}
          >
            <div className="todo-modal">
              <BasicFormWrapper>
                <Form className="adTodo-form" name="todoAdd" form={form} onFinish={onSubmitHandler}>
                  {/* <Input value={inputData} onChange={onInputChange} placeholder="Input Item Name......." /> */}
                  <Tag animate data={[]} onChange={e => setInputTags(e)} />
                  <br />
                  <br />
                  {inputTags.length > 0 && (
                    <Button onClick={showModal} htmlType="submit" className="btn-adTodo" type="primary" size="large">
                      Add New
                    </Button>
                  )}
                </Form>
              </BasicFormWrapper>
            </div>
          </Modal>
        )}
      </Main>
    </>
  );
};

TagsData.propTypes = {
  // match: PropTypes.shape(PropTypes.object),
};
export default TagsData;
