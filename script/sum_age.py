import csv, json

sum_of_age = {}
with open('../data/crime2014.csv', newline='') as csvfile:
    reader = csv.reader(csvfile, delimiter=',')
    next(reader)
    for cols in reader:
        if (cols[10] == ""):
            pass
        else:
            age = int(cols[10])
        if age in sum_of_age:
            sum_of_age[age] = sum_of_age[age] + 1
        else:
            sum_of_age[age] = 1

print("Dict size: " + str(len(sum_of_age)))

jsonfile = json.dumps(sum_of_age)
with open("../data/sum_of_age.json", "w") as f:
    f.write(jsonfile)
