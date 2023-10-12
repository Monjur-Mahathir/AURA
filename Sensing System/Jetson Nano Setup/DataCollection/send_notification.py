
import sys
import bluetooth


sock = bluetooth.BluetoothSocket(bluetooth.L2CAP)

bt_addr = 'B8:27:EB:87:F5:BB'
port = 0x1001

print("Trying to connect to {} on PSM 0x{}...".format(bt_addr, port))

sock.connect((bt_addr, port))

print("Connected. Type something...")
while True:
    data = input("Send Message: ")
    if not data:
        break
    sock.send(data)

sock.close()
