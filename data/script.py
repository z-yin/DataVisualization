import csv, json
from geojson import Feature, FeatureCollection, Point

features = []
with open('crime2014.csv', newline='') as csvfile:
	reader = csv.reader(csvfile, delimiter=',')
	next(reader)
	for cols in reader:
	    latitude, longitude = map(float, cols[25:27])
	    features.append(
	        Feature(
	            geometry = Point((latitude, longitude)),
	        )
	    )

collection = FeatureCollection(features) 
with open("chicago.geojson", "w") as f:
	f.write('%s' % collection)