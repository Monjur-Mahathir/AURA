#!/bin/sh

i=1
while :
do
    if [ $i -eq 1 ]; then
    	 date_time=$(date +"%Y_%m_%d_%I_%M_%p")
         mkdir "Data/$date_time"
    fi
    sshpass -p EI21! ssh EI@192.168.50.1 /jffs/recv_packets/nexutil -I eth6 -s526 -i -l4 -v1
    timeout 180 sshpass -p EI21! ssh EI@192.168.50.1 /jffs/recv_packets/tcpdump -c 15000 -i eth6 -nn -s 0 dst port 5500 -vv -w- > Data/$date_time/$i.pcap
    
    if [ $? -eq 124 ]; then
    	echo "Command timed out. Requires restarting..." >>log
    	sshpass -p EI21! ssh EI@192.168.50.1 'reboot;exit'
    	sleep 120
    	i=0
    fi
    
    i=$(( $i + 1 ))
    if [ $i -ge 101 ]; then
        i=1
    fi
done
