#!/bin/sh

i=0
while [ $i -le 100 ]
do
    if [ $i -eq 0 ]; then
    	 date_time=$(date +"%Y_%m_%d_%I_%M_%p")
         mkdir "Data/$date_time"
    fi
    sshpass -p EI221! ssh EI2@192.168.50.1 /jffs/recv_packets/nexutil -I eth6 -s526 -i -l4 -v1
    sshpass -p EI221! ssh EI2@192.168.50.1 /jffs/recv_packets/tcpdump -c 15000 -i eth6 -nn -s 0 dst port 5500 -vv -w- > Data/$date_time/$i.pcap
    
    i=$(( $i + 1 ))
    if [ $i -ge 100 ]; then
        i=0
        sshpass -p EI221! ssh EI2@192.168.50.1 'reboot;exit'
        sleep 60
    fi
done
