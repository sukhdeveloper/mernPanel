import React, { useState, useEffect, useLayoutEffect } from 'react';
import { Row, Col, Table } from 'antd';
import { NavLink, Link } from 'react-router-dom';
import FeatherIcon from 'feather-icons-react';
import { Scrollbars } from 'react-custom-scrollbars';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import * as am5 from '@amcharts/amcharts5';
import * as am5hierarchy from '@amcharts/amcharts5/hierarchy';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';

const ProfessionWiseTrends = () => {
const dispatch = useDispatch();

  useLayoutEffect(() => {
    // Create root and main container
    let root = am5.Root.new('chartdiv');

    root.setThemes([am5themes_Animated.new(root)]);

    let container = root.container.children.push(
      am5.Container.new(root, {
        width: am5.percent(100),
        height: am5.percent(100),
        layout: root.verticalLayout,
      }),
    );
    let series = container.children.push(
      am5hierarchy.ForceDirected.new(root, {
        minRadius: 16,
        maxRadius: am5.percent(15),
        valueField: 'value',
        categoryField: 'name',
        idField: 'name',
        childDataField: 'children',
        linkWithField: 'link',
        nodePadding: 6,
        manyBodyStrength: -1,
        linkWithStrength: 0.5,
      }),
    );

    series.outerCircles.template.setAll({
      fillOpacity: 0.7,
      strokeWidth: 1,
      strokeOpacity: 1,
      color: 'white',
    });

    series.outerCircles.template.states.create('hover', {
      fillOpacity: 0.5,
      strokeOpacity: 0,
      strokeDasharray: 0,
    });

    series.nodes.template.setAll({
      draggable: true,
    });

    series.nodes.template.setAll({
      toggleKey: 'none',
      cursorOverStyle: 'default',
    });

    series.links.template.setAll({
      strokeWidth: 2,
      strokeOpacity: 0.5,
      fill: am5.color(0xfffcfc),
    });

    series.data.setAll([
      {
        name: 'mern2 pr Trends',
      
        children: [
          {
            name: 'Music',
            children: [
              {
                name: 'Live Music',
                value: 20,
              },
              {
                name: 'News',
                value: 10,
              },
              {
                name: 'Media',
                value: 20,
              },
              {
                name: 'DIY',
                value: 10,
              },
              {
                name: 'Artists',
                value: 10,
              },
              {
                name: 'Digital',
                value: 20,
              },
              {
                name: 'Ventures',
                value: 20,
              },
            ],
          },
          {
            name: 'Lifestyle',
            children: [
              {
                name: 'Health',
                value: 10,
              },
              {
                name: 'Food',
                value: 15,
              },
              {
                name: 'Kids',
                value: 20,
              },
              {
                name: 'Play',
                value: 25,
              },
              {
                name: 'Luxury',
                value: 20,
              },
              {
                name: 'Hotels',
                value: 15,
              },
              {
                name: 'Life',
                value: 21,
              },
              {
                name: 'Sports',
                value: 20,
              },
              {
                name: 'Travel',
                value: 35,
              },
              {
                name: 'Fashion',
                value: 12,
              },
            ],
          },
          {
            name: 'Technology',
            children: [
              {
                name: 'Computers',
                value: 40,
              },
              {
                name: 'Gadgets',
                value: 20,
              },
              {
                name: 'Mobile',
                value: 15,
              },
              {
                name: 'Media',
                value: 20,
              },
              {
                name: 'FineArts',
                value: 20,
              },
              {
                name: 'Robots',
                value: 10,
              },
              {
                name: 'Science',
                value: 20,
              },
              {
                name: 'Games',
                value: 30,
              },
            ],
          },
          {
            name: 'Commercials',
            children: [
              {
                name: 'Ads',
                value: 10,
              },
              {
                name: 'Billboards',
                value: 20,
              },
              {
                name: 'Biz',
                value: 15,
              },
              {
                name: 'Books',
                value: 20,
              },
              {
                name: 'Retail',
                value: 20,
              },
              {
                name: 'Interactive',
                value: 30,
              },
              {
                name: 'Branding',
                value: 15,
              },
              {
                name: 'Media',
                value: 15,
              },
            ],
          },
          {
            name: 'Sustainability',
            children: [
              {
                name: 'Sustainable',
                value: 30,
              },
              {
                name: 'Charity',
                value: 10,
              },
              {
                name: 'Activism',
                value: 15,
              },
              {
                name: 'Products',
                value: 30,
              },
              {
                name: 'Religious',
                value: 20,
              },
              {
                name: 'Social',
                value: 10,
              },
            ],
          },
          {
            name: 'Pop-mern2',
            children: [
              {
                name: 'Humor',
                value: 40,
              },
              {
                name: 'Internet',
                value: 20,
              },
              {
                name: 'Leaders',
                value: 15,
              },
              {
                name: 'Media',
                value: 30,
              },
              {
                name: 'Political',
                value: 20,
              },
              {
                name: 'Viral',
                value: 10,
              },
              {
                name: 'Design',
                value: 35,
              },
              {
                name: 'Podcasts',
                value: 35,
              },
              {
                name: 'Graffiti',
                value: 30,
              },
            ],
          },
        ],
      },
    ]);
    // series.set("selectedDataItem", series.dataItems[0]);

    series.labels.template.setAll({
      fontSize: 16,
      fill: am5.color(0xfffcfc),
      text: '{category}',
    });

    // Add breadcrumbs
    container.children.unshift(
      am5hierarchy.BreadcrumbBar.new(root, {
        series: series,
      }),
    );
    return () => {
      root.dispose();
    };
  }, []);

  return (
    <>
      <div id="chartdiv" style={{ width: '100%', height: '500px' }}></div>
    </>
  );
};

export default ProfessionWiseTrends;
