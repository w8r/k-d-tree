# K-d tree ([demo](https://w8r.github.io/k-d-tree/example/))

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


