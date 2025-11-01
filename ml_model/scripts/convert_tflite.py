# ===============================================
# Smart Security: Convert .h5 -> .tflite
# ===============================================
import tensorflow as tf
import numpy as np
import os

# Load your trained model
model_path = "models/human_animal_classifier.h5"
model = tf.keras.models.load_model(model_path)

# Create a folder for converted models
os.makedirs("models", exist_ok=True)

# =====================================================
# Step 1: Float32 (standard) TFLite conversion
# =====================================================
converter = tf.lite.TFLiteConverter.from_keras_model(model)
tflite_model = converter.convert()
open("models/human_animal_classifier.tflite", "wb").write(tflite_model)
print("✅ Saved models/human_animal_classifier.tflite (float model)")

# =====================================================
# Step 2: INT8 quantized conversion (smaller + faster)
# =====================================================
def representative_data_gen():
    # Use a few random training images as calibration samples
    import cv2, os, random
    base_dir = "dataset/train/human"
    files = random.sample(os.listdir(base_dir), min(50, len(os.listdir(base_dir))))
    for file in files:
        img = cv2.imread(os.path.join(base_dir, file))
        if img is None: continue
        img = cv2.resize(img, (224, 224))
        img = np.expand_dims(img.astype(np.float32) / 255.0, axis=0)
        yield [img]

converter.optimizations = [tf.lite.Optimize.DEFAULT]
converter.representative_dataset = representative_data_gen
converter.target_spec.supported_ops = [tf.lite.OpsSet.TFLITE_BUILTINS_INT8]
converter.inference_input_type = tf.uint8
converter.inference_output_type = tf.uint8

tflite_quant = converter.convert()
open("models/human_animal_classifier_quant.tflite", "wb").write(tflite_quant)
print("✅ Saved models/human_animal_classifier_quant.tflite (quantized)")
