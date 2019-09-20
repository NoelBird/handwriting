from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin
from urllib import parse

from keras.layers import Dense, Conv2D, MaxPool2D
from keras.models import Sequential, model_from_json
from keras.callbacks import ModelCheckpoint
import numpy as np

import os


import warnings
warnings.simplefilter(action='ignore', category=FutureWarning)

import sys
import tensorflow as tf
import keras
from keras.models import Sequential
from keras.layers import Dense, Dropout, Flatten
from keras.layers.convolutional import Conv2D, MaxPooling2D
import numpy as np

baseDir = os.path.dirname(os.path.abspath(__file__))
jsonPath = os.path.join(baseDir, 'model.json')
h5Path = os.path.join(baseDir, 'model.h5')

def saveModel(model):
    global jsonPath
    global h5Path
    
    # 모델 저장
    model_json = model.to_json()
    with open(jsonPath, "w") as json_file : 
        json_file.write(model_json)
    # 웨이트 저장
    model.save_weights(h5Path)
    
    print("Saved model to disk")
    return True

def loadModel():
    global h5Path
    global jsonPath
    
    try:
        with open(jsonPath, "r") as jsonFile:
            jsonData = jsonFile.read()
            loadedModel = model_from_json(jsonData)
            loadedModel.load_weights(h5Path)
        
        print("Loaded model from disk")
        loadedModel.compile(loss='categorical_crossentropy', optimizer='adam', metrics=['accuracy'])
        print("Loaded model compiled")

        return loadedModel
    except Exception as e:
        print(e)
        return None

model = loadModel()
if not model:
    np.random.seed(7)

    img_rows = 28
    img_cols = 28

    (x_train, y_train), (x_test, y_test) = keras.datasets.mnist.load_data()

    input_shape = (img_rows, img_cols, 1)
    x_train = x_train.reshape(x_train.shape[0], img_rows, img_cols, 1)
    x_test = x_test.reshape(x_test.shape[0], img_rows, img_cols, 1)

    x_train = x_train.astype('float32') / 255.
    x_test = x_test.astype('float32') / 255.

    print('x_train shape:', x_train.shape)
    print(x_train.shape[0], 'train samples')
    print(x_test.shape[0], 'test samples')

    batch_size = 128
    num_classes = 10
    epochs = 12

    y_train = keras.utils.to_categorical(y_train, num_classes)
    y_test = keras.utils.to_categorical(y_test, num_classes)

    model = Sequential()
    model.add(Conv2D(32, kernel_size=(3, 3),
                    activation='relu',
                    input_shape=input_shape))
    model.add(Conv2D(64, (3, 3), activation='relu'))
    model.add(MaxPooling2D(pool_size=(2, 2)))
    model.add(Dropout(0.25))
    model.add(Flatten())
    model.add(Dense(128, activation='relu'))
    model.add(Dropout(0.5))
    model.add(Dense(num_classes, activation='softmax'))
    model.summary()

    model.compile(loss='categorical_crossentropy', optimizer='adam', metrics=['accuracy'])
    hist = model.fit(x_train, y_train,
                    batch_size=batch_size,
                    epochs=epochs,
                    verbose=1, 
                    validation_data=(x_test, y_test))
    saveModel(model)

graph = tf.get_default_graph()

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

@app.route('/api/predict', methods=['get'])
@cross_origin()
def hello_world():
    global model
    global graph
    with graph.as_default():
        px = request.args.get('px')
        if not px:
            return jsonify({'status':False})
        l = parse.unquote(px).split(' ')
        l = list(map(lambda x: int(x, 16)/15, l))
        
        img_rows = 28
        img_cols = 28
        l = np.array(l)
        d = l.reshape(1, img_rows, img_cols, 1)

        lab = model.predict_classes(d)
        print(lab)
        # lab = model._make_predict_function(d)
        return jsonify({'status':True, 'label':int(lab[0])})

if __name__ == '__main__':
    app.run(port=3002)