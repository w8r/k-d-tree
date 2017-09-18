# K-d tree ([demo](https://w8r.github.io/k-d-tree/example/))

Iterative k-d tree.

![demo](https://cloud.githubusercontent.com/assets/26884/10002492/b7484c2e-60a7-11e5-94cf-95cbaba9ad2b.gif)

```js
var KDTree = require('k-d-tree');
var geoJSON = {
    "type": "FeatureCollection",
    "features": [{
    "geometry": {
      "type": "Point",
      "coordinates": [-176.633, 51.883]
    },
    "type": "Feature",
    "properties": {
      "wikipedia": "Adak,_Alaska",
      "city": "Adak"
    },
    "id": "Adak"
  }, {
    "geometry": {
      "type": "Point",
      "coordinates": [-175.2, -21.133]
    },
    "type": "Feature",
    "properties": {
      "wikipedia": "Nuku%CA%BBalofa",
      "city": "Nuku%CA%BBalofa"
    },
    "id": "Nuku%CA%BBalofa"
  }, 
  ...
  {
    "geometry": {
      "type": "Point",
      "coordinates": [-171.833, -13.833]
    },
    "type": "Feature",
    "properties": {
      "wikipedia": "Apia",
      "city": "Apia"
    },
    "id": "Apia"
  }]
}

function distance(a, b){
    return map.options.crs.distance(L.latLng(a), L.latLng(b));
}

var tree = new KDTree(geoJSON.features.map(function(f) {
    var ref = f.geometry.coordinates.slice().reverse();
    f.feature = f;
    return f;
}), distance, [0, 1]);
```

based on [kd-tree-javascript](https://github.com/ubilabs/kd-tree-javascript) by @aemkei

2015


