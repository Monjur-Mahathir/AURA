import torch 
import torch.nn as nn
from torch.utils.data import DataLoader
import os
import numpy as np
from model import CSIHAR
from data import CSIDataset
import torch.optim as optim


bs = 1
device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
MODEL_PATH = "weights/test_134"
print(device)

if __name__ == "__main__":
    test_dataset = CSIDataset(metadata="test.txt")
    test_loader = DataLoader(
        test_dataset, batch_size=bs, shuffle=False
    )

    model = CSIHAR(in_channels=4, num_class=7)
    model.load_state_dict(torch.load(MODEL_PATH))
    model = model.to(device)
    model.eval()

    correct = 0
    total = 0
    
    with torch.no_grad():
        for data in test_loader:
            inputs, labels = data
            inputs = inputs.to(device, dtype=torch.float)
            labels = labels.to(device, dtype=torch.long)
            
            outputs = model(inputs)
            
            _, predicted = torch.max(outputs.data, 1)
            
            total += labels.size(0)
            correct += (predicted == labels).sum().item()

        acc = 100 * correct // total
        print(f'Accuracy of the network on the test data: {acc} %')
