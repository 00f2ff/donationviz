import json
import urllib
import urllib2
import re
import string
import csv
import ast

# Find Senator data (Note: this will return 3 missing and 5 extra. Just refer to stateSenators.json)
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
	except UnicodeDecodeError: # ***************** FIX THIS METHOD TO CONVERT UNICODE INTO PROPER DICT; IT BREAKS THINGS LATER
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

# Find Senator data (there are 102 for some reason) and return as dictionary
def findSenatorsAsDict():
	senators = {}
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
				senators[row[0]] = candidate
	return senators


def writeOrganizationDataToFile():
	senators = findSenatorsAsDict()
	organizations = {}
	with open("data/senContribAll.json", "r") as f:
		data = json.loads(f.read())["senContrib"]
		for record in data:
			cid = record.keys()[0]
			# for some reason this analyzes record.keys()[1] as well
			if cid != "response":
				for donation in record[cid]:
					# check if unicode

					# if not isinstance(donation, dict): # (this may create problems in JSON decoding on JS end)
					# 	# turn into dict (this is so bad)
					# 	donation = dict(donation)
						# donation = ast.literal_eval(str(donation))
					# base case
					if donation["organization"] not in organizations.keys():
						organizations[donation["organization"]] = {"donations":[], "states":{}}
					# add donations to this senator
					senatorWithDonation = senators[cid].copy()
					senatorWithDonation["pac"] = donation["pac"]
					senatorWithDonation["indivs"] = donation["indivs"]
					senatorWithDonation["total"] = donation["totals"]
					organizations[donation["organization"]]["donations"].append(senatorWithDonation)
					# add donations to state
					if senatorWithDonation["state"] not in organizations[donation["organization"]]["states"]:
						organizations[donation["organization"]]["states"][senatorWithDonation["state"]] = {"pac":0,"indivs":0,"total":0}
					organizations[donation["organization"]]["states"][senatorWithDonation["state"]]["pac"] += int(donation["pac"])
					organizations[donation["organization"]]["states"][senatorWithDonation["state"]]["indivs"] += int(donation["indivs"])
					organizations[donation["organization"]]["states"][senatorWithDonation["state"]]["total"] += int(donation["totals"])
		with open("data/organizations.json", "w") as orgf:
			orgs = {"organizations": organizations}
			orgs = str(json.dumps(orgs, indent=2))
			orgf.write(orgs)


def findOrgNames():
	with open("data/organizations.json", "r") as f:
		data = json.loads(f.read())["organizations"]
		with open("data/orgNames.json", "w") as orgf:
			orgs = {"organizations": data.keys()}
			orgs = str(json.dumps(orgs, indent=2))
			orgf.write(orgs)


# findOrgNames()

# writeOrganizationDataToFile()
# writeStateSenatorsToFile()
# writeSenContribsToSingleFile()
# writeSenContribsToIDFiles()

