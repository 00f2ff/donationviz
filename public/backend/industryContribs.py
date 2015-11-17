from pymongo import MongoClient
import json
import csv
import urllib2
import time

def findSenatorCIDs():
	cids = []
	with open('data/stateSenators.json', 'r') as j:
		stateData = json.loads(j.read())
		for k in stateData.keys():
			for sen in stateData[k]:
				cids.append(sen["cid"])
	return cids

def findIndustryContributions(cid):
	headers = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/534.30 (KHTML, like Gecko) Ubuntu/11.04 Chromium/12.0.742.112 Chrome/12.0.742.112 Safari/534.30"
	url = "https://www.opensecrets.org/db2dl/?q=MemIndustry&cid=%s&cycle=2016&output=JSON&type=I" % (cid)

	try:
		req = urllib2.Request(url, headers={'User-Agent' : headers}) 
		con = urllib2.urlopen(req)
		# convert into dictionary
		response = json.loads(con.read())
	except UnicodeDecodeError:
		opener = urllib2.build_opener()
		opener.addheaders = [('User-agent', headers)]
		con = opener.open(url)
		# convert into dictionary
		response = json.loads(unicode(con.read(), "ISO-8859-1"))
	return response

def writeIndContribsToIDFiles(): 
	senators = findSenatorCIDs()
	for i in xrange(len(senators)):
		print i
		response = findIndustryContributions(senators[i])
		data = str(json.dumps(response, indent=2))
		with open("data/industryContributions/{0}.json".format(senators[i]),"w") as f:
			f.write(data)
		time.sleep(1)

	print "~~~ fin ~~~"

writeIndContribsToIDFiles() # haven't tried to run yet