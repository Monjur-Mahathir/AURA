#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""Plot CSI(Linux 802.11n CSI Tool, nexmon_csi) in real time

Usage:
    1. python3 csirealtime.py
    2. python3 csiserver.py ../material/5300/dataset/sample_0x5_64_3000.dat 3000 500
"""

import socket
import threading

import csiread
import matplotlib.animation as animation
import matplotlib.pyplot as plt
import numpy as np

cache_len = 1000
cache_data1 = [np.nan] * cache_len
cache_data2 = [np.nan] * cache_len
cache_data3 = [np.nan] * cache_len

subcarrier_num = 256
cache_data4 = [np.nan] * subcarrier_num


mutex = threading.Lock()


class GetDataThread(threading.Thread):
    def __init__(self):
        super(GetDataThread, self).__init__()
        self.address_src = ('127.0.0.1', 10086)
        self.address_des = ('127.0.0.1', 10010)

        self.csidata = csiread.Nexmon(None, chip='4366c0', bw=80)

    def run(self):
        self.update_background()

    def update_background(self):
        # config
        global cache_data1, cache_data2, cache_data3, cache_data4, mutex
        count = 0

        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            s.bind(self.address_des)
            while True:
                data, address_src = s.recvfrom(4096)    # 65507
                msg_len = len(data)

                code = self.csidata.pmsg(data)

                if code == 0xf100:  # nexmon
                    mutex.acquire()
                    cache_data4 = np.fft.fftshift(self.csidata.csi[0])
                    #print(len(self.csidata.csi))
                    mutex.release()
                    count += 1

                if count % 100 == 0:
                    print('receive %d bytes [msgcnt=%u]' % (msg_len, count))


def realtime_plot_nexmon():
    fig, ax = plt.subplots()
    plt.title('csi-amplitude')
    plt.xlabel('subcarrier')
    plt.ylabel('amplitude')
    ax.set_ylim(0, 4000)
    ax.set_xlim(0, subcarrier_num)
    x = np.arange(0, subcarrier_num)

    line4,  = ax.plot(x, np.abs(cache_data4), linewidth=1.0, label='subcarrier_256')
    plt.legend()

    def init():
        line4.set_ydata([np.nan] * subcarrier_num)
        return line4,

    def animate(i):
        global cache_data4, mutex
        mutex.acquire()
        line4.set_ydata(np.abs(cache_data4))
        mutex.release()
        return line4,

    ani = animation.FuncAnimation(fig, animate, init_func=init, interval=1000/25, blit=True)
    plt.show()


def realtime_plot():
    task = GetDataThread()
    task.start()
    eval('realtime_plot_nexmon')()


if __name__ == '__main__':
    realtime_plot()
