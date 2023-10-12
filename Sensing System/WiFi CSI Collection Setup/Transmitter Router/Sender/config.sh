#!/bin/sh

BW=80

# equivalent to configcsiblablabla.sh
wl -i eth6 up
wl -i eth6 radio on
wl -i eth6 country US
wl -i eth6 chanspec 157/80
wl -i eth6 monitor 1
ifconfig eth6 up

# generate packet
NODEID=$(ifconfig br0 | grep inet | awk '{ print $2 }' | awk -F"." '{ print $4 }')
./setpackets $NODEID
dd if=/dev/zero bs=4 count=1 of=/tmp/4zeroes
cat /tmp/4zeroes packetnode1x1.dat > packetnode1x1BP.dat

CONFIG=$(./makecsiparams -e 1 -m ff:ff:00:12:34:56 -c 0xe29b -C 0x1 -N 0x1 -b 0x88)
LEN=34
./nexutil -I eth6 -s500 -b -l${LEN} -v${CONFIG} 

# equivalent to ./setdumpparameters 2 0
wl -i eth6 shmem 0x172a 2
wl -i eth6 shmem 0x172c 0

# set txcore
wl -i eth6 txcore -s 1 -c 1 -o 1 -k 1

# equivalent to setrxcore.sh
./nexutil -Ieth6 -s528 -i -v15 -l 2

# now reset channel
# wl -i eth6 chanspec 157/$BW

# equivalent to restarthfc.sh
wl -i eth6 shmem 0x1776 0x9000

# pace frames every 4ms
wl -i eth6 shmem 0x177e $1

