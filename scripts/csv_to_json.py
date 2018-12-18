import csv
import json
from collections import OrderedDict

entries = []
with open('../data/WDIData.csv', newline='') as csvfile:
    reader = csv.reader(csvfile, delimiter=',')
    with open('../data/WDIData.js', 'w') as jsonfile:
        fieldnames = tuple(next(reader))
        reader = csv.DictReader(csvfile, fieldnames)
        for row in reader:
            entry = OrderedDict()
            for field in fieldnames:
                entry[field] = row[field]
            entries.append(entry)
            
        output = list(entries)
        json.dump(output, jsonfile)
        jsonfile.write('\n')
