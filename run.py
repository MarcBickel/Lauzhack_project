from flask import Flask
from flask import request
from flask import jsonify, make_response
import json
import pandas as pd
app = Flask(__name__)

data_2016 = pd.read_csv('./data/train.csv',index_col='customer',encoding='utf8')

@app.route("/", methods=['GET'])
def get_list():
	offset = int(request.args.get('offset'))
	number = int(request.args.get('number'))

	# print(data_2016.head())

	data = data_2016[offset:][:number]
	first = data_2016.head(1)

	json_resp = []

	for i, row in data.iterrows():
		json_resp.append({'customer': i, 'turnover': row['turnover']})

	ret = make_response(json.dumps({'customer': 9000000, 'probability': 0.85}))
	ret.status_code = 200
	ret.headers['Access-Control-Allow-Origin'] = '*'
	print(ret)
	return ret

if __name__ == "__main__":
	app.run(debug=True)
