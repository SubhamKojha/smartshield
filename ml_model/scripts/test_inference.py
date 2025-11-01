import tensorflow as tf
import cv2, numpy as np

model = tf.keras.models.load_model("models/human_animal_classifier.h5")
IMG_SIZE = (224,224)

img = cv2.imread("test4.jpg")  # replace with your image file path
img_resized = cv2.resize(img, IMG_SIZE)
img_array = np.expand_dims(img_resized / 255.0, axis=0)

pred = model.predict(img_array)[0][0]
label = "Human" if pred >= 0.5 else "Animal"
print(f"Prediction: {label} ({pred:.2f})")
