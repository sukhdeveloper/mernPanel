import React, { useState, useLayoutEffect } from 'react';
import FeatherIcon from 'feather-icons-react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Card } from './style';
import { Cards } from '../cards/frame/cards-frame';
import { axiosDataUpdate } from '../../redux/crud/axios/actionCreator';
import EditPopupForCategorySubcategory from './EditPopupForCategorySubcategory';
const NoteCard = ({ data, Dragger }) => {
  const dispatch = useDispatch();
  const [state, setState] = useState({
    visible: false,
    modalType: 'primary',
    checked: [],
    responsive: 0,
    collapsed: false,
  });
  useLayoutEffect(() => {
    function updateSize() {
      const width = window.innerWidth;
      setState({ responsive: width });
    }
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  const { title, key, description, pin_to_sidebar, label, category_id, _id } = data;
  const [latestPinStatus, setLatestPinStatus] = useState(pin_to_sidebar);

  const randomLabel = ['personal', 'work', 'important', 'social'];

  const random = Math.floor(Math.random() * randomLabel.length);
  return (
    <>
      <Card className={label ? label : randomLabel[random]}>
        <Cards headless>
          <h4>
            <span>
              {title}
              <span className={`status-bullet ${label}`} />
            </span>
            <Dragger />
          </h4>
          <p className="categories_description_in_admin">{description}</p>
          <div className="actions">
            <span>
              <Link
                className={latestPinStatus ? 'star active' : 'star'}
                onClick={() =>
                  dispatch(
                    axiosDataUpdate({
                      ...data,
                      api_url: `v1/admin/update_category_subcategory`,
                      pin_to_sidebar: latestPinStatus ? false : true,
                    }),
                  ).then(res => {
                    if (res && res.success) {
                      setLatestPinStatus(latestPinStatus ? false : true);
                    }
                  })
                }
                to="#"
              >
                <FeatherIcon icon="star" size={16} />
              </Link>
              {/* <Link onClick={() => onHandleDelete()} to="#">
              <FeatherIcon icon="trash-2" size={16} />
            </Link> */}
            </span>
            <EditPopupForCategorySubcategory data={data} />
          </div>
        </Cards>
      </Card>
    </>
  );
};

NoteCard.propTypes = {
  data: PropTypes.object,
};
export default NoteCard;
