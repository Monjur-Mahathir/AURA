import sys, json, re, datetime

last_heart_rate = re.split(',', sys.argv[1])[0]
baseline_low = re.split(',', sys.argv[2])[0]
baseline_high = re.split(',', sys.argv[3])[0]



good_heart_rate = True
if float(last_heart_rate) > float(baseline_high) or float(last_heart_rate) < float(baseline_low):
    good_heart_rate = False
print(good_heart_rate)
