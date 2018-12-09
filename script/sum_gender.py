import csv, json

sum_of_gender = {}
with open('../data/crime2014.csv', newline='') as csvfile:
    reader = csv.reader(csvfile, delimiter=',')
    next(reader)
    for cols in reader:
        gender = cols[11]
        if gender in sum_of_gender:
            sum_of_gender[gender] = sum_of_gender[gender] + 1
        else:
            sum_of_gender[gender] = 0

print("Dict size: " + str(len(sum_of_gender)))

jsonfile = json.dumps(sum_of_gender)
with open("../data/sum_of_gender.json", "w") as f:
    f.write(jsonfile)
