import os
import sys
import requests
import time


def main():
    sudoPassword = 'nano'
    lan_down = 'ifconfig eth0 down'
    lan_up = 'ifconfig eth0 up'
    
    p = os.system('echo %s|sudo -S %s' % (sudoPassword, lan_down))
    print("Down")
    time.sleep(5)
    p = os.system('echo %s|sudo -S %s' % (sudoPassword, lan_up)) 
    time.sleep(5)
    print("Up")

if __name__=="__main__":
    ret = main()
    if ret == -1:
        print("Failed")
