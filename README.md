# AURA
This repository contains all the codes and documentation necessary to develop the AURA(Connecting Audio and Radio Sensing Systems to Improve Care at Home) system.

Real Time Data Collection and Classification:

Step 1 (Downloading Codes):
  - Download the folder "JetsonRealTime"
  - Move it to the Jetson Nano Computer in any location.

Step 2 (Installing libraries)
  - We need to install pyTorch libraries for running the classification codes. These are the steps:
    - Open a terminal and run the following:
       - dpkg-query --show nvidia-l4t-core 
         This should give result something like "nvidia-l4t-core 32.7.1-20220219090432"
  - Now take a note of this l4t-core version number and check the correspnding jetpack version number from this website: "https://www.stereolabs.com/blog/nvidia-jetson-l4t-and-jetpack-support". For example, the L4T 32.7.1 corresponds to Jetpack 4.6.1
  - Now, go to this website: "https://developer.download.nvidia.com/compute/redist/jp/" and select the folder named after the Jetpack version. For our example case, we will select the v461 folder
  - Aftet that, we will select the "PyTorch" folder and inside it we will find the pytorch wheel file. Right click this link and select "Copy Link". For our Jetpack version 4.6.1, the link is: "https://developer.download.nvidia.com/compute/redist/jp/v461/pytorch/torch-1.11.0a0+17540c5+nv22.01-cp36-cp36m-linux_aarch64.whl"
  - Now open a terminal and run the following lines of commands:
    - export TORCH_INSTALL=(https://developer.download.nvidia.com/compute/redist/jp/v461/pytorch/torch-1.11.0a0+17540c5+nv22.01-cp36-cp36m-linux_aarch64.whl)
    - python3 -m pip install --upgrade pip
    - python3 -m pip install aiohttp numpy scipy
    - export "LD_LIBRARY_PATH=/usr/lib/llvm-8/lib:$LD_LIBRARY_PATH"
    - python3 -m pip install --upgrade protobuf
    - python3 -m pip install --no-cache $TORCH_INSTALL
  
 - Now we should have successfully installed PyTorch in Jetson Nano.

 - Next, we need to install some additional libraries. Open a terminal and execute the followings:
   - sudo apt install pcapfix
   - sudo apt install 
   - pip3 install csiread
   - pip3 install requests

Step 3 (Executing the codes):
- Go to the "JetsonRealTime" directory and open 2 terminals inside it.
- In one of the terminal, run the following: "python3 run_model.py"
- Wait for a couple of seconds until you see "Model Loaded" and then two floating point numbers. Do not try to do anything in the jetson nano until you see "Model Loaded" followed by these 2 numbers.
- Then in the other terminal, run this command "python3 realtime.py"

Additional Information:
- In line 128 of run_model.py, the model path is saved in a variable. We may need to change this if we have a better version of the model.
- In line 15, 16 of run_model.py and line 9, 10 of realtime.py, we have two variables called "total_capture" and "capture_per". After each "capture_per" number of WiFi CSI files, the code will send the classification results to the server. After the "total_capture" number of files, the whole system will restart. We can change these values as we want. Note that, each file contains data of around 4 seconds.
- We need an additional WiFi dongle for downloading the libraries and the codes.
- In line 54 of realtime.py, we can change the "id=debug1" portion of the url to include any id that we want our data to store. But I suggest to use debug1 first for checking whether everything is working or not.


