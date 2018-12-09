import csv
import json
from geojson import Feature, FeatureCollection, Point

features = []
with open('../data/crime2014.csv', newline='') as csvfile:
    reader = csv.reader(csvfile, delimiter=',')
    next(reader)
    for cols in reader:
        longitude, latitude = map(float, cols[25:27])
        features.append(
            Feature(
                geometry=Point((latitude, longitude)),
                properties={
                    "Victim Age": cols[10],
                    "Victim Sex": cols[11],
                    "Area ID": cols[4],
                    "Area Name": cols[5],
                    "Date Occurred": cols[2]
                }
            )
        )

collection = FeatureCollection(features)
with open("../data/crime2014.geojson", "w") as f:
    f.write('%s' % collection)
