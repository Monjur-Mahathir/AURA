import time
import os
import sys
import requests

LENGTH = 4008
REMOVE_DATA = False

total_capture = 4
capture_per = 4

def router_collect(filename):
    os.system("sshpass -p EI21! ssh EI@192.168.50.1 /jffs/recv_packets/nexutil -I eth6 -s526 -i -l4 -v1")
    os.system(f"sshpass -p EI21! ssh EI@192.168.50.1 /jffs/recv_packets/tcpdump -c {LENGTH} -i eth6 -nn -s 0 dst port 5500 -vv -w- > {filename}")
    

def main():
    sudoPassword = 'nano'
    lan_down = 'ifconfig eth0 down'
    lan_up = 'ifconfig eth0 up'
    root_dir = "Test_"
    
    for i in range(1, total_capture):
        data_dir = root_dir + str(i) + "/"
        if not os.path.isdir(data_dir):
            os.mkdir(data_dir)
        for j in range(1, capture_per):
            file_path = data_dir + str(j) + ".pcap"
            router_collect(file_path)
            if j >= (capture_per-1):
                minute_file = "minute_" + str(i) + ".txt"
                with open(minute_file, 'a') as f:
                    f.writelines("Done\n")
                f.close()  

        result_file = "results_" + str(i) + ".txt"
        while not os.path.exists(result_file):
            continue
        
        p = os.system('echo %s|sudo -S %s' % (sudoPassword, lan_down))
        time.sleep(1)
        """Saving results in server"""
        with open(result_file, 'r') as f:
            lines = f.readlines()
            for line in lines:
                words = line.split('\n')[0].split(' ')
                e = round(float(words[0]), 3)
                w = round(float(words[1]), 3)
                r = round(float(words[2]), 3)
                j = round(float(words[3]), 3)
                l = round(float(words[4]), 3)
                c = round(float(words[5]), 3)
                g = round(float(words[6]), 3)
                url = f"https://peoject-aura.herokuapp.com/setdata?id=debug1&E={e}&W={w}&R={r}&J={j}&L={l}&S={l}&C={c}&G={g}"
                #res = requests.get(url)
                print(url)
        f.close()
        p = os.system('echo %s|sudo -S %s' % (sudoPassword, lan_up))
        time.sleep(3)
        
    if REMOVE_DATA:
        for i in range(1, total_capture):
            data_dir = root_dir + str(i) + "/"
            result_file = "results_" + str(i) + ".txt"
            minute_file = "minute_" + str(i) + ".txt"
            os.system(f"rm -r {data_dir}")
            os.system(f"rm {result_file}")
            os.system(f"rm {minute_file}")

    return 0

if __name__=="__main__":
    ret = main()
    if ret == -1:
        print("Failed")
