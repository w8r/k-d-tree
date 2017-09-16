const quickhull = require("quick-hull-2d");
const color = require('to-color');

const KDTree = require('../dist/kdtree.js');
let latestCenter = [10.454150, 51.164181];
const map = global.map = new L.Map('map', {})
  .setView(latestCenter.slice().reverse(), 4);


L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
  attribution: '&copy; ' +
    '<a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

let data = require('./data');

let p1 = L.latLng(0, 0);
let p2 = L.latLng(0, 0);

function distance(a, b) {
  p1.lat = a[1];
  p1.lng = a[0];
  p2.lat = b[1];
  p2.lng = b[0];

  //console.log(a, b);

  //return L.latLng(a.slice().reverse()).distanceTo(b.slice(0, 2).reverse());
  return map.options.crs.distance(p1, p2);
}

console.log(data.features.length, 'items');
console.time('build k-d tree');
let tree = global.tree = new KDTree(data.features.map(function(f) {
  let c = f.geometry.coordinates.slice();
  c.feature = f;
  return c;
}), distance, [0, 1]);
console.timeEnd('build k-d tree');

let numMarkers = 20;
let markers = [];
let showHull = true;
let hull = L.polygon([], {
  fillOpacity: 0,
  weight: 2,
  opacity: 1,
  dashArray: [5, 10]
}).addTo(map);

function update() {
  let point = latestCenter;
  let nearest = tree.nearest(point, numMarkers);

  L.Util.requestAnimFrame(function() {
    for (var i = 0; i < numMarkers; i++) {
      if (!markers[i]) {
        markers[i] = L.circleMarker([0, 0], {
          radius: 5,
          weight: 2,
          color: '#ff0000',
          fillOpacity: 0.8
        }).addTo(map);
      }

      let nearestPoint = nearest[i][0];
      markers[i]
        .setLatLng(nearestPoint.slice().reverse())
        .setStyle({
          color: color(nearestPoint.feature.properties.city)
        });

      if (showHull) {
        L.Util.requestAnimFrame(function() {
          var hullpoints = quickhull(nearest.map(function(n) {
            return n[0].slice().reverse();
          }));
          hull.setLatLngs(hullpoints);
        });
      }
    }
  });
}

L.DomEvent.on(document.getElementById('num'), 'change keyup', function() {
  numMarkers = parseInt(this.value);
  update();
});

L.DomEvent.on(document.getElementById('hull'), 'change', function() {
  showHull = this.checked;
  if (showHull) {
    hull.addTo(map);
  } else {
    hull.removeFrom(map);
  }
  update();
});

map.on('mousemove', function(e) {
  latestCenter = [e.latlng.lng, e.latlng.lat];
  update();
});
