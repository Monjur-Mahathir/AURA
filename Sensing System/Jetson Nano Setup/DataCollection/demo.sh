#!/bin/sh

konsole --noclose -e ./csi_collect.sh & PIDIOS=$!
python3 ../WiFi-Model/testing_lstm.py & PIDMIX=$!
wait $PIDIOS
wait $PIDMIX
