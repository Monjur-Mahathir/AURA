import torch 
from torch.utils.data import Dataset, DataLoader
import os
import numpy as np

class CSIDataset(Dataset):
    def __init__(self, metadata):
        super().__init__()
        
        self.csiFiles, self.targets, self.starts, self.ends = self.load_dataset(metadata)
    
    def __len__(self):
        return self.csiFiles.shape[0]
    
    def __getitem__(self, index):
        csi = np.load(self.csiFiles[index], allow_pickle=True)
        csi = csi[:, : , :]
        csi_real = np.abs(csi) 
        csi = np.swapaxes(csi_real, 0, -1)
        
        csi = torch.from_numpy(csi)

        label = self.targets[index]
        target = torch.tensor(label)

        return csi, target

    def load_dataset(self, metadata):
        csiFiles = []
        targets = []
        starts = []
        ends = []
        with open(metadata, 'r') as f:
            lines = f.readlines()
            for line in lines:
                words = line.split(' ')

                file = str(words[0])
                target = int(words[3])
                start = int(words[1])
                end = int(words[2])

                csiFiles.append(file)
                targets.append(target)
                starts.append(start)
                ends.append(end)
        f.close()
        csiFiles = np.array(csiFiles)
        targets = np.array(targets)
        starts = np.array(starts)
        ends = np.array(ends)

        return csiFiles, targets, starts, ends
