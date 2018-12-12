import csv
import itertools

names = set()

with open('../data/world-country-names.tsv', newline='') as namecsv:
    with open('../data/WDIData1.csv', 'wb') as newfile:
        with open('../data/WDIData.csv', newline='') as datacsv:

            reader1 = csv.reader(namecsv, delimiter='\t')
            reader2 = csv.reader(datacsv, delimiter=',')

            header = csv.DictWriter(newfile, next(reader2)) 
            header.writeheader()

            next(reader1)    # Skip the header.
            for cols in reader1:
                names.add(cols[1])

            filtered = filter(lambda x: x[0] in names, reader2)
            
            csv.writer(newfile, delimiter=',').writerows(filtered)
