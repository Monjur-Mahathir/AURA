# Introduction
This folder contains the documentation regarding how to prepare the ASUS RT-AC86U routers for WiFi CSI data collection. Two routers are needed for this purpose-

    1. Transmitter Router
    2. Receiver Router

Both router requires some common steps for preparation. The steps are described as follows:

Step 1:
    Connect the router with any Linux machine with an ethernet connection. Turn on the router. In some case, you will be automatically redirected to the home page of the router. In any case, we can go to the internet browser and browse to the following address:
        http://router.asus.com

    This will show the web GUI for the ASUS router.

Step 2:
    Follow the steps of setting up the router with proper router login id and password, which will be needed lalter. After the initial steps of setting up SSID, router login id, passwords etc, we can see the router web interface.

Step 3:
    First, we need to update the firmware of the router. 
    Go to "Advanced > Administration > Firmware Upgrade > Manual firmware upload", then upload the RT-AC86U_386.2_4_cferom_ubi.w file. 
    it may take some minutes to finish the firmware update.

Step 4:
    Next we need to set some permissions to ssh into the router and enable custom scripts. For this step, follow the following procedure:
        1. Go to "Advanced > Administration > System"
        2. From "Persistent JFFS2 partition > Enable user scripts", turn it to yes
        3. Turn "Enable SSH login" to "yes" and also set the "auto logout" time to "0", which essentially disables auto logout.
        4. Set auto logout to "0" (disable)

    After these procedures, reboot the router.

Step 5:
    Now after rebooting, we don't need to go to the web interface any more. Open a terminal and ssh into the router. For all the following steps, we assume the router login id to be "EI" and router's IP address to be "192.168.50.1". Usually the ip address won;t change but the login id is set during step 2.
    In terminal, copy some folders and files into the router:
        a. <If the router is intended to be the Receiver Router>:
                1. cd Receiver Router
                2. scp -r recv_packets EI@192.168.50.1:/jffs/recv_packets
                3. scp services-start EI@192.168.50.1:/jffs/scripts/services-start

            <If the router is intended to be the Transmitter Router>:
                1. cd Transmitter Router
                2. scp -r send_packets EI@192.168.50.1:/jffs/send_packets
                3. scp services-start EI@192.168.50.1:/jffs/scripts/services-start

        b. ssh EI@192.168.50.1
            <Enter login password when prompted. We should be inside the ASUS router at this point>
        c. <If the router is intended to be the Receiver Router>:
                1. cd /jffs/recv_packets
                2. chmod a+rx cmdserver config.sh makecsiparams nexutil nexutilng nexutil-orig reload.sh setpackets starttxrx80fastng.sh tcpdump transmit4ever80fastng.sh
                3. cd /jffs/scripts/
                4. chmod a+rx services-start
            <If the router is intended to be the Transmitter Router>:
                1. cd /jffs/send_packets
                2. chmod a+rx cmdserver config.sh makecsiparams nexutil nexutilng nexutil-orig reload.sh setpackets starttxrx80fastng.sh tcpdump rawperf transmit4ever80fastng.sh
                3. cd /jffs/scripts/
                4. chmod a+rx services-start

        c. Exit from the ssh by typing "exit"
        d. Reboot the router.