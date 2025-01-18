from licensePlateDetection.pipeline.training_pipeline import TrainPipeline
import sys
import time
import os
from licensePlateDetection.pipeline.training_pipeline import TrainPipeline
from licensePlateDetection.utils.main_utils import decodeImage, encodeImageIntoBase64
from flask import Flask, request, jsonify, render_template, Response
from flask_cors import CORS, cross_origin
from licensePlateDetection.constant.application import APP_HOST, APP_PORT
from licensePlateDetection.Database.anpr_database import ANPD_DB
from licensePlateDetection.Api.Api import Api_req
from licensePlateDetection.Ocr.Ocr import ocr_detection
import shutil
import re
import io,base64
import json
from bson import json_util
import requests
import google.generativeai as genai
import numpy as np
from PIL import Image, ImageEnhance
import torch
import cv2
app = Flask(__name__)
CORS(app)


class ClientApp:
    def __init__(self):
        self.filename = "inputImage.jpg"

# training model 
@app.route("/train")
def trainRoute():
    obj = TrainPipeline()
    obj.run_pipeline()
    return "Training Successfull!!"

# using image
@app.route("/predict", methods=['POST', 'GET'])
@cross_origin()
def predictRoute():
    try:
        data = request.get_json()
        image = data.get("image")
        # image = request.json['image']

        decodeImage(image, clApp.filename)

        os.system("cd yolov5/ && python detect.py --weights best.pt --img 416 --conf 0.5 --source ../data/inputImage.jpg --save-txt --save-conf")
         # Assuming YOLOv5 saves the result image and bounding box coordinates
        result_image_path = "yolov5/runs/detect/exp/inputImage.jpg"

        bbox_path = "yolov5/runs/detect/exp/labels/inputImage.txt"

        # Load the image
        image = Image.open(result_image_path)

        # Read the bounding box coordinates
        with open(bbox_path, 'r') as f:
            lines = f.readlines()

        # os.remove("yolov5/runs/detect/exp/inputImage1.jpg")
        for line in lines:
            # Assuming YOLOv5 format: class x_center y_center width height (normalized values)
            parts = line.split()
            x_center, y_center, width, height = map(float, parts[1:5])

            # Convert from normalized coordinates to pixel values
            img_width, img_height = image.size
            x_center = x_center * img_width
            y_center = y_center * img_height
            width = width * img_width
            height = height * img_height

            # Calculate the bounding box coordinates
            x1 = int(x_center - width / 2)
            y1 = int(y_center - height / 2)
            x2 = int(x_center + width / 2)
            y2 = int(y_center + height / 2)

            # Crop the image using the bounding box coordinates
            cropped_image = image.crop((x1, y1, x2, y2))
            cropped_image = cropped_image.resize((720, 360))

            enhancer = ImageEnhance.Sharpness(cropped_image)
            cropped_image = enhancer.enhance(2.0)

            enhancer = ImageEnhance.Contrast(cropped_image)
            cropped_image = enhancer.enhance(1.5)
            # Save the cropped image (you can customize the save path)
            cropped_image_path = f"yolov5/runs/detect/exp/crop.jpg"
            cropped_image.save(cropped_image_path)

        # OCR part
        print("extracting text")
        text = ocr_detection().extracting_text(cropped_image)
        
        # Dealing with crop image
        opencodedbase64 = encodeImageIntoBase64(
            "yolov5/runs/detect/exp/crop.jpg")
        result = {"image": opencodedbase64.decode('utf-8')}
        # os.remove("yolov5/runs")
        shutil.rmtree("yolov5/runs")

        #  fetching data from api And Database

        dbS = ANPD_DB("ANPD","anpr_data")
        vechile_data  = dbS.get_vehicle_by_registration_number(text)

        if vechile_data:
            print(f"{text} number plate exist in database")
            reg_data = json.loads(json_util.dumps(vechile_data))
            response = {
            "processed_image": result,
            "reg_data":reg_data
            }
            print("data is dispalyed please check")
            return jsonify(response)

        else:
            print("fetching data by api as it is not present in database")

            res_data = Api_req().fetchApi(text)
        # Data Inserted to Database
            with open('data.json', 'w') as json_file:
                json.dump(res_data,json_file,indent=4)
            
        
        
            dbS.insert_data("data.json")
            os.remove("data.json")
            a = dbS.get_vehicle_by_registration_number(text)
            reg_data = json.loads(json_util.dumps(a))
        

            print("connected")
            # print(text)
            
            print(reg_data)
            response = {
                "processed_image": result,
                "reg_data":reg_data
            }

            return jsonify(response)
    except ValueError as val:
        print(val)
        return Response("Value not found inside  json data")
    except KeyError:
        return Response("Key value error incorrect key passed")
    except Exception as e:
        shutil.rmtree("yolov5/runs")
        print(e)
        result = "Invalid input"

   


# Using text
@app.route("/text", methods=['POST'])
@cross_origin()
def predictText():
    try:

        # CHECK IN DATABASE IS GIVEN PLATE EXSIST IF YES THEN WE RETURN DETAIL DIRECTLY FROM DATA BASE 
        # ELSE FIRST WE GET DATA AND THEN STORE IN DATABASE THEN GET IT
        data = request.get_json()
        license_plate = data.get("text")

        dbS = ANPD_DB("ANPD","anpr_data")
        vechile_data  = dbS.get_vehicle_by_registration_number(license_plate)
        if vechile_data:
            print(vechile_data)
            reg_data = json.loads(json_util.dumps(vechile_data))
            response = {
                "reg_data":reg_data
            }
            return jsonify(response)

        else:
            print("fetching from api")

            res_data = Api_req().fetchApi(license_plate)
            with open('data.json', 'w') as json_file:
                json.dump(res_data,json_file,indent=4)
            
            dbS.insert_data("data.json")
            os.remove("data.json")
            vechile_data  = dbS.get_vehicle_by_registration_number(license_plate)
            reg_data = json.loads(json_util.dumps(vechile_data))
            response = {
                "reg_data":reg_data
            }
            print(response)
            return jsonify(response)


    except ValueError as val:
        print(val)
        return Response("Value not found inside  json data")

@app.route('/video_feed')
@cross_origin()
def video_feed():
    cap = cv2.VideoCapture(0)
    crop_cascade = cv2.CascadeClassifier('model/haarcascade_russian_plate_number.xml')
    plate_captured = False
    stable_start_time = None
    if not os.path.exists('plates'):
        os.makedirs('plates')

    def generate():
        nonlocal plate_captured, stable_start_time
        try:
            while True:
                ret, frame = cap.read()
                if not ret:
                    break

                gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                crops = crop_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

                if len(crops) > 0 and not plate_captured:
                    (x, y, w, h) = crops[0]
                    cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)

                    if stable_start_time is None:
                        stable_start_time = time.time()
                    elif time.time() - stable_start_time >= 5:
                        crop_img = frame[y:y + h, x:x + w]
                        crop_path = os.path.join("plates", "detected_plate.jpg")
                        cv2.imwrite(crop_path, crop_img)

                        plate_captured = True

                        # Process the cropped image
                        cropped_image = Image.open(crop_path).resize((720, 360))
                        cropped_image = ImageEnhance.Sharpness(cropped_image).enhance(2.0)
                        cropped_image = ImageEnhance.Contrast(cropped_image).enhance(1.5)

                        print("Extracting text")
                        text = ocr_detection().extracting_text(cropped_image)
                        print(text)

                        license_plate = text
                        dbS = ANPD_DB("ANPD", "anpr_data")
                        print("Getting data")
                        vechile_data = dbS.get_vehicle_by_registration_number(license_plate)
                        print(vechile_data)

                        if vechile_data:
                            reg_data = json.loads(json_util.dumps(vechile_data))
                        else:
                            print("Fetching from API")
                            res_data = Api_req().fetchApi(license_plate)
                            with open('data.json', 'w') as json_file:
                                json.dump(res_data, json_file, indent=4)
                            dbS.insert_data("data.json")
                            os.remove("data.json")
                            vechile_data = dbS.get_vehicle_by_registration_number(license_plate)
                            reg_data = json.loads(json_util.dumps(vechile_data))

                        response = {
                            "type": "detection",
                            "processed_image": encodeImageIntoBase64(crop_path).decode('utf-8'),
                            "reg_data": reg_data
                        }

                        yield f"data: {json.dumps(response)}\n\n"

                        plate_captured = False
                        stable_start_time = None
                        if os.path.exists(crop_path):
                            os.remove(crop_path)

                _, buffer = cv2.imencode('.jpg', frame)
                frame_base64 = base64.b64encode(buffer).decode('utf-8')
                yield f"data: {{\"type\": \"video\", \"image\": \"{frame_base64}\"}}\n\n"
                time.sleep(0.1)  # Control streaming speed
        except GeneratorExit:
            print("Stream closed.")
        except Exception as e:
            print(f"Error: {e}")
        finally:
            cap.release()

    return Response(generate(), mimetype='text/event-stream')

     
if __name__ == "__main__":
    clApp = ClientApp()
    app.run(host=APP_HOST, port=8000)