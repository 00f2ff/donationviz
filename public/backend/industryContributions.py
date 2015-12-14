from keys import Keys 
import httplib

keys = Keys()
#CRP.apikey = keys.apikey
apikey = keys.apikey
# Remove the ones I don't need
import argparse
import json
import pprint
import sys
import urllib
import urllib2
import re
import string
import csv
import os
#import pull

#call api function
def callAPI(method, cid):
	# url = 
	url = "http://www.opensecrets.org/api/?method=%s&cid=%s&cycle=2016&output=json&apikey=%s" % (method, cid, apikey)
	req = urllib2.Request(url, headers={'User-Agent' : "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/534.30 (KHTML, like Gecko) Ubuntu/11.04 Chromium/12.0.742.112 Chrome/12.0.742.112 Safari/534.30"}) 
	con = urllib2.urlopen(req)
	response = json.loads(con.read())['response']
	return response

#function to go get/parse top industry contributors for a given senator
def getIndustryInfo(cid):
	industryOutput = []
	#get data from API 
	response = callAPI("candIndustry", cid)

	#parse data
	industries = response['industries']['industry']
	for i in range(len(industries)):
		data = industries[i]['@attributes']
		ind = {
				'industry_code': data['industry_code'],
				'industry_name': data['industry_name'],
				'pacs': data['pacs'],
				'indivs' : data['indivs'],
				'total': data['total']
				}
		industryOutput.append(ind)


	return industryOutput

def writeIndustrydata():

# handle 503 errors, try except, if 503 return {}
#

	filepath = os.path.realpath('data/stateSenators.json')
#	-- Open stateSenators json file (file does not open now for some reason)
	with open(filepath, 'r') as data_file:    
	    data = json.load(data_file)
	
	# #test request
	# print callAPI("candContrib", "N00007360")


	returnData = {}
	#parse through stateSenators.json to get candidate IDs
	for key in data:
		sen1id = data[key][0]['cid']
		sen2id = data[key][1]['cid']

	 	sen1info = getIndustryInfo(sen1id)
		sen2info = getIndustryInfo(sen2id)

		returnData[sen1id] = sen1info
		returnData[sen2id] = sen2info

	#print returnData
	#-- Write info to industryContrib file
	writeData = str(json.dumps(returnData, indent=2))
	with open("data/senatorIndustryData.json","w") as f:
		f.write(writeData)

	return

writeIndustrydata()
