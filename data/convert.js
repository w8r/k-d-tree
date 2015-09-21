var fs = require('fs');
var csv = require('csv');
var parse = csv.parse;
var transform = csv.transform;


var parser = parse({
  delimiter: '\t',
  relax: true
});

var count = 0;
var transformer = transform(function(record, callback) {
  var feature = {
    "type": "Feature",
    "properties": {
      "name": record[1],
      "id": record[0]
    },
    "geometry": {
      "type": "Point",
      "coordinates": [parseFloat(record[5]), parseFloat(record[4])]
    }
  };
  var str = JSON.stringify(feature);
  if (count > 0) str = ',\n' + str;
  callback(null, str);
  count++;
}, {
  parallel: 10
});


var reader = fs.createReadStream(__dirname + '/data.tsv');
var writer = fs.createWriteStream(__dirname + '/data.json');

writer.write('{"type": "FeatureCollection", "features": [');
writer.on('finish', function() {
  fs.appendFile(__dirname + '/data.json', ']}', function(err) {
    console.log('done', count);
  });
});

reader.pipe(parser)
  .pipe(transformer)
  .pipe(writer);
