import sys, json, re, datetime

water_val = re.split(',', sys.argv[1])[0]
food_val = re.split(',', sys.argv[2])[0]
baseline = re.split(',', sys.argv[3])

water_ok = True
if int(water_val) < int(baseline[0]) - 12:
    water_ok = False
print(water_ok)

food_ok = True
if int(food_val) <= int(baseline[1]) - 2:
    food_ok = False
print(food_ok)
