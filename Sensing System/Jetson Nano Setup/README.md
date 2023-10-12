In the Jetson Nano, we need to install the necessary libraries for collecting camera data from Intel RealSense depth camera D435i.

Open a terminal and type the following:

    a. cd installLibrealsense
    b. chmod a+rx installLibrealsense.sh buildLibrealsense.sh
    c. ./installLibrealsense.sh
    d. ./buildLibrealsense.sh

Also, jetson nano may need some other libraries such as sshpass. Install them via "sudo apt" command.

After these initial steps, go to the DataCollection folder and execute the "collect_data" script if you want to collect data from both camera and WiFi. Otherwise only execute the "csi_collect.sh" script to start only the WiFI CSI data collection part.


Additional:
If we want to setup the Jetson nano in a way that whenever it boots, it starts the data collection procedure, then follow the following steps:

    1. Start the Jetson nano, login and go to the terminal.


    2. Create a new user named aura:
        sudo addgroup --system aura


    3.Make a new user named aura, add it to the aura group and disable login, password.
        sudo adduser --system --no-create-home --disabled-login    --disabled-password --ingroup aura aura


    4. Now, all the scripts for running the csi collection script is already in the “Jetson-Data-Collection” folder somewhere in the Jetson nano. We need to copy that folder and paste it into the /usr/local/bin directory. For the following command, my original folder was inside the /home/ei/Desktop directory:
    
        sudo cp -r /home/ei/Desktop/Jetson-Data-Collection /usr/local/bin/Jetson-Data-Collection 


    5. Now make the csi_collect.sh script executable:
        sudo chmod 755 csi_collect.sh


    6. Create a new systemd file:
        sudo touch /lib/systemd/system/aura.service


    7. Edit the systemd file using any text editor, such as vim
        sudo vim /lib/systemd/system/aura.service


    8. Now copy paste the following contents into the aura.service file:

        [Unit]
        After=network.target
        Description="Aura Service"
        [Service]
        ExecStart=/usr/local/bin/Jetson-Data-Collection/DataCollection/csi_collect.sh
        User=aura
        [Install]
        WantedBy=multi-user.target

    Once this is done, run the following commands:
        sudo systemctl daemon-reload
        sudo ssystemctl start aura



    9. To check that the script is running, run the following commands and see if there is any error message showing:
        sudo systemctl status aura


    10. If everything seems fine, enable the script : 
        sudo systemctl enable aura
