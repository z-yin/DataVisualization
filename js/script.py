import csv, json
from geojson import Feature, FeatureCollection, Point

features = []
with open('chicago.csv', newline='') as csvfile:
	reader = csv.reader(csvfile, delimiter=',')
	for cols in reader:
		print()
	    latitude, longitude = map(float, cols[1:3])
	    features.append(
	        Feature(
	            geometry = Point((latitude, longitude)),
	        )
	    )

collection = FeatureCollection(features) 
with open("chicago.geojson", "w") as f:
	f.write('%s' % collection)