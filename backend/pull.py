from crpapi import CRP, CRPApiError
from keys import Keys 

keys = Keys()
CRP.apikey = keys.apikey
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
# The FEC claims 151 people are running, but OpenSecrets only has data on 84, so those are the ones we'll show
def findSenators():
	candidates = []
	with open('candidate_ids.csv', 'rU') as csvfile:
		reader = csv.reader(csvfile)
		for row in reader:
			if row[4][0] == "S":
				candidate = {
				'cid': row[0],
				'name': row[1],
				'party': row[2],
				'state': row[3][:2],
				'class': row[3][3], # class is because the elections are staggered
				'fec_id': row[4]
				}
				candidates.append(candidate)
	return candidates

def callAPI(method, cid):
	# url = 
	url = "http://www.opensecrets.org/api/?method=%s&cid=%s&cycle=2016&output=json&apikey=%s" % (method, cid, apikey)
	req = urllib2.Request(url, headers={'User-Agent' : "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/534.30 (KHTML, like Gecko) Ubuntu/11.04 Chromium/12.0.742.112 Chrome/12.0.742.112 Safari/534.30"}) 
	con = urllib2.urlopen(req)
	response = json.loads(con.read())['response']
	return response

def findCandidateContributions():
	candidates = findSenators()
	candContribData = {'candContribData':[]}
	# callAPI('candContrib',candidates[0]['cid'])
	for i in xrange(2):
		print candidates[i]['cid']
		response = callAPI('candContrib',candidates[i]['cid'])
		candContribData['candContribData'].append(response)

	candContribData = str(json.dumps(candContribData, indent=2))
	# write to JSON
	with open("candContrib.json","w") as f:
		f.write(candContribData)

	# # finalData = 

# findCandidateContributions()

def stuff():
	url = "http://www.opensecrets.org/db2dl/?q=MemContrib&cid=N00003389&cycle=2016&output=JSON&type=I"
	req = urllib2.Request(url, headers={'User-Agent' : "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/534.30 (KHTML, like Gecko) Ubuntu/11.04 Chromium/12.0.742.112 Chrome/12.0.742.112 Safari/534.30"}) 
	con = urllib2.urlopen(req)
	response = json.loads(con.read())
	print response

stuff()


