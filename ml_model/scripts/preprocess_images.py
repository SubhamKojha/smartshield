import cv2
import os
from tqdm import tqdm

base_dir = "dataset"
target_size = (224, 224)

for split in ["train", "val"]:
    split_dir = os.path.join(base_dir, split)
    for cls in os.listdir(split_dir):
        cls_dir = os.path.join(split_dir, cls)
        for img_file in tqdm(os.listdir(cls_dir), desc=f"{split}/{cls}"):
            path = os.path.join(cls_dir, img_file)
            img = cv2.imread(path)
            if img is None:
                print(f"Skipping unreadable: {path}")
                continue
            resized = cv2.resize(img, target_size)
            cv2.imwrite(path, resized)
