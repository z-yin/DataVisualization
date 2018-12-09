import csv, json

sum_of_crime_type = {}
with open('../data/crime2014.csv', newline='') as csvfile:
    reader = csv.reader(csvfile, delimiter=',')
    next(reader)
    for cols in reader:
        crime_type = cols[16]
        if crime_type in sum_of_crime_type:
            sum_of_crime_type[crime_type] = sum_of_crime_type[crime_type] + 1
        else:
            sum_of_crime_type[crime_type] = 1

print("Dict size: " + str(len(sum_of_crime_type)))

jsonfile = json.dumps(sum_of_crime_type)
with open("../data/sum_of_crime_type.json", "w") as f:
    f.write(jsonfile)
