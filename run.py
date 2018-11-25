from flask import Flask
from flask import request
from flask import jsonify, make_response
import json
import pandas as pd
app = Flask(__name__)

data_2016 = pd.read_csv('./data/data_tibo.csv',index_col='customer',encoding='utf8')



@app.route("/", methods=['GET'])
def get_list():

	#offset = int(request.args.get('offset'))
	#number = int(request.args.get('number'))
	
	count_class_0, count_class_1 = data_2016.true_value.value_counts()

	# Divide by class
	df_class_0 = data_2016[data_2016['true_value'] == 'non suspicious']
	df_class_1 = data_2016[data_2016['true_value'] == 'suspicious']

	df_class_0_under = df_class_0.sample(count_class_1)
	df_test_under = pd.concat([df_class_0_under, df_class_1], axis=0)
	
	offset = 0
	number = 100
	print(df_test_under.head())
	df_test_under = df_test_under.sample(frac=1)
	data = df_test_under[offset:][:number]
	

	json_resp = []

	for i, row in data.iterrows():
		json_resp.append({'customer': i, 'turnover': row['turnover'],'inactive_days_average': row['inactive_days_average'],'channel_risk': row['channel_risk'], 'age': row['age'],'true_value': row['true_value'], 'probability': row['probability']})
	
	ret = make_response(json.dumps(json_resp))

	ret.status_code = 200
	ret.headers['Access-Control-Allow-Origin'] = '*'
	print(ret)
	return ret

if __name__ == "__main__":
	app.run(debug=True)
