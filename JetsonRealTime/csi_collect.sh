#!/bin/sh

sshpass -p EI21! ssh EI@192.168.50.1 /jffs/recv_packets/nexutil -I eth6 -s526 -i -l4 -v1
sshpass -p EI21! ssh EI@192.168.50.1 /jffs/recv_packets/tcpdump -c $2 -i eth6 -nn -s 0 dst port 5500 -vv -w- > $1
   
