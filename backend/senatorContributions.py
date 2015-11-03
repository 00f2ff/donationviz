import json
import urllib
import urllib2
import re
import string
import csv


# Find Senator data (there are 102 for some reason)
def findSenators():
	senators = []
	with open('data/114th.csv', 'rU') as csvfile:
		reader = csv.reader(csvfile)
		for row in reader:
			if row[4][0] == "S":
				candidate = {
				'cid': row[0],
				'first_name': row[1].split(',')[1],
				'last_name': row[1].split(',')[0],
				'party': row[2],
				'state': row[3][:2],
				'class': row[3][3], # class is because the elections are staggered
				'fec_id': row[4]
				}
				senators.append(candidate)
	return senators

# Writes a JSON file comprised of senator names and cids for each state
def writeStateSenatorsToFile():
	senators = findSenators()
	data = {}
	for i in xrange(len(senators)):
		s = senators[i]
		full_name = "%s %s (%s)" % (s["first_name"], s["last_name"], s["party"])
		senData = {"name":full_name, "cid":s["cid"], "state":s["state"]} # state is just there to check
		if s["state"] in data.keys():
			data[s["state"]].append(senData)
		else:
			data[s["state"]] = [senData]

	data = str(json.dumps(data, indent=2))
	with open("data/stateSenators.json","w") as f:
		f.write(data)

# Returns dictionary object of senator contributions 
def findSenatorContributions(cid):
	headers = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/534.30 (KHTML, like Gecko) Ubuntu/11.04 Chromium/12.0.742.112 Chrome/12.0.742.112 Safari/534.30"
	url = "http://www.opensecrets.org/db2dl/?q=MemContrib&cid=%s&cycle=2016&output=JSON&type=I" % (cid)
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

# Creates a 3.4 MB JSON file
def writeSenContribsToSingleFile():
	senators = findSenators()
	data = {"senContrib": []}
	for i in xrange(len(senators)):
		print i
		response = findSenatorContributions(senators[i]["cid"])
		# create better key (go by cid, since it's an easy way to go back through files)
		response[senators[i]["cid"]] = response.pop("records")
		data["senContrib"].append(response)
	data = str(json.dumps(data, indent=2))
	with open("data/senContribAll.json","w") as f:
		f.write(data)

# This is fairly similar to previous function, but will create 102 small JSON files
def writeSenContribsToIDFiles(): 
	senators = findSenators()
	for i in xrange(len(senators)):
		print i
		response = findSenatorContributions(senators[i]["cid"])
		data = str(json.dumps(response, indent=2))
		with open("data/senatorContributions/{0}.json".format(senators[i]["cid"]),"w") as f:
			f.write(data)

	print "~~~ fin ~~~"


# writeStateSenatorsToFile()
# writeSenContribsToSingleFile()
# writeSenContribsToIDFiles()

