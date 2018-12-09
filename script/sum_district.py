import csv, json

sum_of_districts = {}
with open('../data/crime2014.csv', newline='') as csvfile:
    reader = csv.reader(csvfile, delimiter=',')
    next(reader)
    for cols in reader:
        district = cols[5]
        if district in sum_of_districts:
            sum_of_districts[district] = sum_of_districts[district] + 1
        else:
            sum_of_districts[district] = 1

print("Dict size: " + str(len(sum_of_districts)))

jsonfile = json.dumps(sum_of_districts)
with open("../data/sum_of_district.json", "w") as f:
    f.write(jsonfile)
