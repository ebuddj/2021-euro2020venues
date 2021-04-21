import React, {Component} from 'react'
import style from './../styles/styles.less';

// https://underscorejs.org/
import _ from 'underscore';

// https://github.com/topojson/topojson
import * as topojson from 'topojson-client';

import * as d3 from 'd3';

import constants from './Constants.jsx';

let timer, g, path, path_prefix;

if (location.href.match('localhost')) {
  path_prefix = './';
}
else {
  path_prefix = 'https://raw.githubusercontent.com/ebuddj/2021-euro2020venues/main/public/';
}

function getHashValue(key) {
  let matches = location.hash.match(new RegExp(key+'=([^&]*)'));
  return matches ? matches[1] : null;
}

const l = getHashValue('l') ? getHashValue('l') : 'en';
const area = getHashValue('area') ? getHashValue('area') : '';

const projection = d3.geoAzimuthalEquidistant().center([37,63]).scale(820);
const data_file_name = 'data - data.csv';

class App extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      data:{}
    }
  }
  componentDidMount() {
    d3.csv('./data/' + data_file_name).then((data) => {
      this.setState((state, props) => ({
        data:data
      }), this.drawMap);
    })
    .catch(function (error) {
    })
    .then(function () {
    });
  }
  drawMap() {
    let width = 800;
    let height = 800;
    
    let svg = d3.select('.' + style.map_container).append('svg').attr('width', width).attr('height', height);
    path = d3.geoPath().projection(projection);
    g = svg.append('g');

    let tooltip = d3.select('.' + style.map_container)
      .append('div')
      .attr('class', style.hidden + ' ' + style.tooltip);
    d3.json('./data/europe.topojson').then((topology) => {
      // Add European countries.
      g.selectAll('path').data(topojson.feature(topology, topology.objects.europe).features)
        .enter()
        .append('path')
        .attr('d', path)
        .attr('class', style.path)
        .style('stroke', (d, i) => {
          return '#ccc';
        })
        .attr('fill', (d, i) => {
          return '#f5f5f5';
        });
      // Add Kosovo.
      g.append('path').datum({type:'Polygon',properties:{'NAME':'Kosovo'},coordinates:constants.kosovo})
        .attr('d', path)
        .attr('class', style.kosovo)
        .style('stroke', (d, i) => {
          return '#ccc';
        })
        .attr('fill', (d, i) => {
          return '#f5f5f5';
        });

      svg.selectAll('image').data(this.state.data)
        .enter()
        .append('svg:image')
        // .attr('xlink:href', './media/img/stadium.png')
        .attr('xlink:href', path_prefix + 'media/img/stadium-icon-png-25.jpg')
        .attr('width', 50)
        .attr('height', 50)
        .attr('class', style.stadium)
        .attr('x', (d, i) => {
          return projection([d.lon, d.lat])[0] - 25;
        })
        .attr('y', (d, i) => {
          return projection([d.lon, d.lat])[1] - 25;
        });

      svg.selectAll('text').data(this.state.data)
        .enter()
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'central')
        .attr('class', style.text)
        .style('font-size', (d, i) => {
          return '14px';
        })
        .attr('x', (d, i) => {
          return projection([d.lon, d.lat])[0];
        })
        .attr('y', (d, i) => {
          return (d.country === 'Scotland') ? projection([d.lon, d.lat])[1] - 27 : projection([d.lon, d.lat])[1] + 27;
        }).html((d, i) => {
          return parseInt(d.capacity).toLocaleString()
        });

      // this.changeAreaAttributes();

    });
  }
  componentWillUnMount() {
  }
  render() {
    return (
      <div className={style.plus}>
        <div className={style.map_container}></div>
      </div>
    );
  }
}
export default App;