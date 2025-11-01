import tensorflow as tf
import numpy as np
import cv2

IMG_SIZE = (224,224)

# Load TFLite model
interpreter = tf.lite.Interpreter(model_path="models/human_animal_classifier_quant.tflite")
interpreter.allocate_tensors()

input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

# Load a test image
img = cv2.imread("test5.jpg")   # <-- use your own test image
img = cv2.resize(img, IMG_SIZE)
img = np.expand_dims(img / 255.0, axis=0).astype(np.float32)

# For INT8 models, rescale to uint8
if input_details[0]["dtype"] == np.uint8:
    input_scale, input_zero_point = input_details[0]["quantization"]
    img = img / input_scale + input_zero_point
    img = img.astype(np.uint8)

# Run inference
interpreter.set_tensor(input_details[0]["index"], img)
interpreter.invoke()
output_data = interpreter.get_tensor(output_details[0]["index"])

# Dequantize if necessary
if output_details[0]["dtype"] == np.uint8:
    scale, zero_point = output_details[0]["quantization"]
    output_data = scale * (output_data.astype(np.float32) - zero_point)

pred = float(output_data[0][0])
label = "Human" if pred >= 0.5 else "Animal"

print(f"Prediction: {label} ({pred:.2f})")
