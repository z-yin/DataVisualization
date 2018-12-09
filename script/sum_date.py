import csv, json

sum_of_dates = {}
with open('../data/crime2014.csv', newline='') as csvfile:
    reader = csv.reader(csvfile, delimiter=',')
    next(reader)
    for cols in reader:
        date = cols[2]
        if date in sum_of_dates:
            sum_of_dates[date] = sum_of_dates[date] + 1
        else:
            sum_of_dates[date] = 0

print("Dict size: " + str(len(sum_of_dates)))

jsonfile = json.dumps(sum_of_dates)
with open("../data/sum_of_dates.json", "w") as f:
    f.write(jsonfile)
