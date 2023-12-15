import time
import torch
import torch.nn as nn
import numpy as np
import csiread
import sys
import os

import logging

n_core = 4
n_ss = 1
n_tot = n_ss * n_core

total_capture = 4
capture_per = 4

device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
print(device)

class CSIHAR(nn.Module):
    def __init__(self, in_channels, num_class):
        super(CSIHAR, self).__init__()
        self.in_channels = in_channels
        self.num_class = num_class

        self.norm = nn.LayerNorm(normalized_shape=[self.in_channels, 1000, 242])

        self.first_cnn_block = nn.Sequential(
            nn.Conv2d(in_channels=in_channels, out_channels=16, kernel_size=(3, 3)),
            nn.BatchNorm2d(16),
            nn.MaxPool2d(kernel_size=(3, 2)),
            nn.ReLU()
        )

        self.second_cnn_block = nn.Sequential(
            nn.Conv2d(in_channels=16, out_channels=16, kernel_size=(3, 3)),
            nn.BatchNorm2d(16),
            nn.MaxPool2d(kernel_size=(3, 2)),
            nn.ReLU()
        )

        self.third_cnn_block = nn.Sequential(
            nn.Conv2d(in_channels=16, out_channels=16, kernel_size=(3, 3)),
            nn.BatchNorm2d(16),
            nn.MaxPool2d(kernel_size=(3, 2)),
            nn.ReLU()
        )
        
        self.lstm = nn.LSTM(input_size=448, hidden_size=128, num_layers=3, batch_first=True, bidirectional=True)

        self.fc = nn.Linear(in_features=256, out_features=num_class)
        self.softmax = nn.Softmax(dim=-1)

    def forward(self, x):
        out = self.norm(x)
        out = self.first_cnn_block(out)
        out = self.second_cnn_block(out)
        out = self.third_cnn_block(out)
        
        out = out.permute(0, 2, 1, 3)
        out = out.reshape([out.shape[0], out.shape[1], out.shape[2] * out.shape[3]])
        
        out, _ = self.lstm(out)
        out = out[:, -1, :]

        out = self.fc(out)
        out = self.softmax(out)
        return out


def process_data(filename):
    try:
        csidata = csiread.Nexmon(filename, chip='4366c0', bw=80)
        csidata.read()
    except:
        print("Corrupted pcap")
        return None
    
    csi_buff = []
    for i in range(csidata.csi.shape[0]):
        csi_buff.append(csidata.csi[i])
    csi_buff = np.array(csi_buff, dtype=np.complex_)    	
	    
    st = 0
    while not (csidata.core[st] == 0 and csidata.spatial[st] == 0):
        st += 1
    end = csidata.csi.shape[0] - 1
    while not (csidata.core[end] == 4 and csidata.spatial[end] == 1):
        end -= 1
    csi_buff = csi_buff[st:end+1, :]
    csi_buff = csi_buff[:1000*n_tot, :]

    csi_buff = np.fft.fftshift(csi_buff, axes=1)
    delete_idxs = np.argwhere(np.sum(csi_buff, axis=1) == 0)[:, 0]
    csi_buff = np.delete(csi_buff, delete_idxs, axis=0)
    delete_idxs = np.asarray([0, 1, 2, 3, 4, 5, 127, 128, 129, 251, 252, 253, 254, 255], dtype=int)

    start = 0
    end = int(np.floor(csi_buff.shape[0]/n_tot))
    signal_complete = np.zeros((csi_buff.shape[1] - delete_idxs.shape[0], end-start, n_tot), dtype=complex)

    for stream in range(0, n_tot):
        signal_stream = csi_buff[stream:end*n_tot + 1:n_tot, :]
        signal_stream = signal_stream[start:end, :] #Just checking

        signal_stream[:, 64:] = - signal_stream[:, 64:] # ???
        
        signal_stream = np.delete(signal_stream, delete_idxs, axis=1) # Deleting extra axes
        mean_signal = np.mean(np.abs(signal_stream), axis=1, keepdims=True)
        H_m = signal_stream/mean_signal
        
        signal_complete[:, :, stream] = H_m.T
    
    csi_mag = np.abs(signal_complete)
    #csi_phase = np.angle(signal_complete)
    #csi = np.concatenate([csi_mag, csi_phase], axis=-1)
    csi = np.swapaxes(csi_mag, 0, -1)
    csi = csi[np.newaxis, :, :, :]
    csi = np.array(csi, dtype=np.float32)

    return csi

if __name__ == "__main__":

    channels = 4
    num_classes = 7
    MODEL_PATH = "test_134"
    activity_cls_to_idx = {"empty": 0, "walking": 1, "running": 2, "jumping": 3, "standing_sitting": 4, "arm":5, "falling": 6}
    activity_cls = ["empty", "walking", "running", "jumping", "standing_sitting", "arm", "falling"]

    logging.basicConfig(filename='model_status.log', level=logging.DEBUG, format="%(asctime)-8s %(levelname)-8s %(message)s")
    logging.disable(logging.DEBUG)
    logger=logging.getLogger()
    logger.info("")
    sys.stderr.write=logger.error

    
    model = CSIHAR(in_channels=channels, num_class=num_classes)
    model.load_state_dict(torch.load(MODEL_PATH))
    model = model.to(device)
    model.eval()
    print("Model Loaded")

    example_input = torch.zeros(1, 4, 1000, 242)
    example_input = example_input.to(device)

    t0 = time.time()
    out = model(example_input)
    t1 = time.time()
    print(t1 - t0)
    t0 = time.time()
    out = model(example_input)
    t1 = time.time()
    print(t1 - t0)
    
    logger.info("Ready...")

    root_dir = "Test_"
    for i in range(1, total_capture):
        data_dir = root_dir + str(i) + "/"
        
        empty = [] #E
        walking = [] #W
        running = [] #R
        jumping = [] #J
        standing_sitting = [] #LS
        arm = [] #C 
        falling = [] #G
        
        for j in range(1, capture_per):
            file_path = data_dir + str(j) + ".pcap"
            if j < (capture_per-1):
                next_path = data_dir + str(j+1) + ".pcap"
                while not (os.path.exists(next_path)):
                    time.sleep(1)
                    continue
            else:
                minute_file = "minute_" + str(i) + ".txt"
                while not (os.path.exists(minute_file)):
                    time.sleep(1)
                    continue
            
            csi = process_data(file_path)
            if csi is None:
                os.system(f"pcapfix -d -o {file_path}")
                csi = process_data(file_path)
                if csi is None:
                    continue
            if csi.shape[2] != 1000:
                extra = 1000 - csi.shape[2]
                pad = np.zeros((1, 4, extra, 242), dtype=np.float32)
                csi = np.concatenate((csi, pad), axis=2)
                print("Padded")
            csi = torch.from_numpy(csi).to(device)
            y = model(csi)
            #print(csi.shape, y.data)
            
            empty.append(y.data[0][0].item())
            walking.append(y.data[0][1].item())
            running.append(y.data[0][2].item())
            jumping.append(y.data[0][3].item())
            standing_sitting.append(y.data[0][4].item())
            arm.append(y.data[0][5].item())
            falling.append(y.data[0][6].item())
        
            _, predicted = torch.max(y.data, 1)
            activity = activity_cls[int(predicted)]
            print(activity)   
              
        out_file = "results_" + str(i) + ".txt"
        with open(out_file, 'a') as f:
            for k in range(len(empty)):
                string = str(empty[k]) + " " + str(walking[k]) + " " + str(running[k]) + " " + str(jumping[k]) + " " + str(standing_sitting[k]) + " " + str(arm[k]) + " " + str(falling[k]) + "\n"
                f.writelines(string)
        f.close()     
    
