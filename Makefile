data/data.json: data/data.tsv
	node data/convert.js

data/cities.shp: data/data.json
	ogr2ogr -overwrite -f "ESRI Shapefile" -lco ENCODING=UTF-8 data/cities.shp data/data.json

data/europe.shp: data/europe.json
	ogr2ogr -f "ESRI Shapefile" -lco ENCODING=UTF-8 data/europe.shp data/europe.json

data/europe-merged.shp: data/europe.shp
	ogr2ogr -f "ESRI Shapefile" -lco ENCODING=UTF-8 data/europe-merged.shp data/europe.shp -dialect sqlite -sql "select ST_union(ST_buffer(Geometry,0.0)) from europe"

data/cities-europe.shp: data/cities.shp data/europe.shp
	ogr2ogr -lco ENCODING=UTF-8 -clipsrc data/europe.shp data/cities-europe.shp data/cities.shp

data/cities-europe.json: data/cities-europe.shp
	ogr2ogr -f "GeoJSON" -lco ENCODING=UTF-8 data/cities-europe.json data/cities-europe.shp

clean:
	rm data/*.shp data/*.prj data/*.cpg data/*.shx data/*.dbf

