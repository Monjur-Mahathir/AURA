import sys, json, re, datetime

steps = re.split(',', sys.argv[1])[0]
baseline_low = re.split(',', sys.argv[2])[0]

move_ok = True
#if int(steps) > 120 - int(baseline):
if int(steps) < int(baseline_low):
    move_ok = False
print(move_ok)
