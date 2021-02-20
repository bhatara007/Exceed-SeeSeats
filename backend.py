
from flask import Flask, request
from flask_cors import CORS, cross_origin
from flask_pymongo import PyMongo
from dotenv import load_dotenv
import os

load_dotenv()
app = Flask(__name__)
cross = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'
app.config['MONGO_URI'] = os.getenv('MONGO_URI')
mongo = PyMongo(app)

myCollection = mongo.db.test

# data sent to frontend
# {
#     "store_id": 1,
#     "name": "sushi",
#     "table": [{"table_id": 1,"status": true, "number_of_seats": 1},
#                 {"table_id": 2,"status": true, "number_of_seats": 2},
#                 {"table_id": 3,"status":true, "number_of_seats": 4}],
#     "category": "jpn",
#     "lowest_price": 30,
#     "highest_price": 400,
#     "description": "hiw kao",
#     "floor": "4"
#
# }
#
# data from hardware
# {
#     "store_id": 1,
#     "table_id": 1,
#     "status": true
# }


@app.route('/create', methods=['POST'])
@cross_origin()
def create_store():
    data = request.json
    created = {
        "store_id": data["store_id"],
        "name": data["name"],
        "table": data["table"],
        "category": data["category"],
        "lowest_price": data["lowest_price"],
        "highest_price": data["highest_price"],
        "description": data["description"],
        "floor": data["floor"]
    }
    myCollection.insert_one(created)
    return {"result": "success"}


@app.route('/update', methods=['POST'])
@cross_origin()
def update_table():
    data = request.json
    filt = {"store_id": data["store_id"]}
    store_data = myCollection.find(filt)
    tables = []
    for ele in store_data:
        try:
            tables = ele["table"]
            for t in tables:
                if t["table_id"] == data["table_id"]:
                    if data["status"] == 0:
                        t["status"] = False
                    elif data["status"] == 1:
                        t["status"] = True
                    table_update = {"$set":{"table": tables}}
                    myCollection.update_one(filt, table_update)
        except:
            pass
    return {"result": "updated"}


@app.route('/frontend', methods=['GET'])
@cross_origin()
def send_store_id():
    re = request.args
    filt = {}
    for i,(key, val) in enumerate(re.items()):
        if key != "floor" and val.isnumeric():
            filt[key] = int(val)
        else:
            filt[key] = val
    data = myCollection.find(filt)
    output = []
    for ele in data:
        try:
            datas = {
                "store_id": ele["store_id"],
                "name": ele["name"],
                # list of tables
                "table": ele["table"],
                "category": ele["category"],
                "lowest_price": ele["lowest_price"],
                "highest_price": ele["highest_price"],
                "description": ele["description"],
                "floor": ele["floor"]
            }
            output.append(datas)
        except:
            pass
    return {"result": output}


@app.route('/hardware', methods=['GET'])
@cross_origin()
def info():
    filt = {"store_id": int(request.args.get("store_id"))}
    data = myCollection.find(filt)
    output = []
    for ele in data:
        # datas ={"table": ele["table"]}
        output.append(ele["table"])
    return {"result": output}


if __name__ == '__main__':
    app.run(host='158.108.182.7', port='3001', debug=True)
