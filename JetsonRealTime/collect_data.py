import time
import os
import sys
import requests

LENGTH = 4008

def router_collect(filename):
    os.system("sshpass -p EI21! ssh EI@192.168.50.1 /jffs/recv_packets/nexutil -I eth6 -s526 -i -l4 -v1")
    os.system(f"sshpass -p EI21! ssh EI@192.168.50.1 /jffs/recv_packets/tcpdump -c {LENGTH} -i eth6 -nn -s 0 dst port 5500 -vv -w- > {filename}")

def countdown(t):
    while t:
        mins, secs = divmod(t, 60)
        timer = '{:02d}:{:02d}'.format(mins, secs)
        print(timer, end="\r")
        time.sleep(1)
        t -= 1


def main():
    root_dir = "Data/"
    classes = ["empty", # 0
               "walking", #1
               "running", #2
               "jumping", #3
               "sitting_down", #4 
               "standing_up", #5
               "arm", #6
               "falling"] #7
    
    activity_dir = root_dir + classes[0] + "/"
    repeat = 5
    c_t = 1
    countdown(10)

    if not os.path.isdir(activity_dir):
        os.mkdir(activity_dir)
    
    last_index = 0    
    for fname in os.listdir(activity_dir):
        fid = int(str(fname).split('.pcap')[0])
        if fid > last_index:
            last_index = fid
    last_index += 1

    
    total = 0
    
    while total <= repeat:
        out_file = activity_dir + str(last_index) + ".pcap"
    
        countdown(c_t)
        
        router_collect(out_file)
        
        total += 1
        last_index += 1

    return 0

if __name__=="__main__":
    ret = main()
    if ret == -1:
        print("Failed")
