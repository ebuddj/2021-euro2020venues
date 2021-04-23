import React, {Component} from 'react'
import style from './../styles/styles.less';

// https://underscorejs.org/
import _ from 'underscore';

// https://github.com/topojson/topojson
import * as topojson from 'topojson-client';

import * as d3 from 'd3';

import constants from './Constants.jsx';

let timer, svg, g, path, path_prefix;

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
      data:{},
      title:'Original EURO2020 Venues'
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
    
    svg = d3.select('.' + style.map_container).append('svg').attr('width', width).attr('height', height);
    path = d3.geoPath().projection(projection);
    g = svg.append('g');

    d3.json('./data/europe.topojson').then((topology) => {
      // Add European countries.
      g.selectAll(style.path).data(topojson.feature(topology, topology.objects.europe).features)
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
      g.append(style.path).datum({type:'Polygon',properties:{'NAME':'Kosovo'},coordinates:constants.kosovo})
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
        // .attr('xlink:href', path_prefix + '/img/stadium.png')
        .attr('xlink:href', path_prefix + 'img/stadium-icon-png-25.jpg')
        .attr('width', 50)
        .attr('height', 50)
        .style('opacity', (d, i) => {
          return (d.city === 'Sevilla' ? 0 : 1);
        })
        .attr('class', (d, i) => {
          return style.stadium + ' stadium_' + d.id;
        })
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
        .attr('class', (d, i) => {
          return style.text + ' stadium_' + d.id;
        })
        .style('font-size', (d, i) => {
          return '14px';
        })
        .style('opacity', (d, i) => {
          return (d.city === 'Sevilla' ? 0 : 1);
        })
        .attr('x', (d, i) => {
          return projection([d.lon, d.lat])[0];
        })
        .attr('y', (d, i) => {
          return (['Scotland','The Netherlands','Denmark'].includes(d.country)) ? projection([d.lon, d.lat])[1] - 27 : projection([d.lon, d.lat])[1] + 27;
        }).html((d, i) => {
          // return parseInt(d.capacity).toLocaleString();
          return d.city;
        });

    svg.append('svg:defs').append('svg:marker')
      .attr('id', 'triangle')
      .attr('refX', 6)
      .attr('refY', 6)
      .attr('markerWidth', 30)
      .attr('markerHeight', 30)
      .attr('markerUnits','userSpaceOnUse')
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M 0 0 12 6 0 12 3 6')
      .style('fill', 'black');

      [[
        projection([-6.2306456,53.3352318]),projection([26.5,59.972728])
      ],[
        projection([-6.2306456,53.3352318]),projection([9.2,55.6929944])
      ],[
        projection([-2.9468902,43.2613696]),projection([-5.006821,39.4171707])
      ]].forEach((data) => {
        svg.append('path')
        .attr('marker-end', 'url(#triangle)')
        .attr('d', 'M ' + data[0][0] + ',' + data[0][1] + ' ' + (data[1][0]) + ',' + (data[1][1]))
        .style('opacity', 0)
        .attr('class', style.edge)
        .attr('stroke', '#000')
        .attr("stroke-width", '1.5')
        .attr('fill', 'transparent');
      });

      timer = setTimeout(() => {
        this.changeAreaAttributes();
      }, 2000);
    });
  }
  changeAreaAttributes() {
    svg.selectAll('.stadium_8, .stadium_10')
      .style('opacity', 0.1);
    svg.selectAll('.stadium_12')
      .style('opacity', 1);

    svg.selectAll('.' + style.edge)
      .style('opacity', 0.6);
    
    this.setState((state, props) => ({
      title:'Final EURO2020 Venues'
    }));
  }
  componentWillUnMount() {
  }
  render() {
    return (
      <div className={style.plus}>
        <h3>{this.state.title}</h3>
        <div className={style.map_container}></div>
      </div>
    );
  }
}
export default App;