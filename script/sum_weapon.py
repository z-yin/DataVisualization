import csv, json

sum_of_weapons = {}
with open('../data/crime2014.csv', newline='') as csvfile:
    reader = csv.reader(csvfile, delimiter=',')
    next(reader)
    for cols in reader:
        weapon = cols[16]
        if weapon in sum_of_weapons:
            sum_of_weapons[weapon] = sum_of_weapons[weapon] + 1
        else:
            sum_of_weapons[weapon] = 0

print("Dict size: " + str(len(sum_of_weapons)))

jsonfile = json.dumps(sum_of_weapons)
with open("../data/sum_of_weapon.json", "w") as f:
    f.write(jsonfile)
