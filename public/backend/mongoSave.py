from pymongo import MongoClient
import json
import csv
import urllib2

# This is kind of convoluted, but since 114th.csv is incomplete:
# Query stateSenators.json for cid
# Find remainder of data in 114th.csv
def findSenatorCIDs():
	cids = []
	with open('data/stateSenators.json', 'r') as j:
		stateData = json.loads(j.read())
		for k in stateData.keys():
			for sen in stateData[k]:
				cids.append(sen["cid"])
	return cids

def findSenatorData():
	cids = findSenatorCIDs()
	senators = []
	with open('data/114th.csv', 'rU') as csvfile:
		reader = csv.reader(csvfile)
		for row in reader:
			if row[0] in cids:
				candidate = {
				'cid': row[0],
				'name': "%s %s" % (row[1].split(', ')[1], row[1].split(', ')[0]), # fixes leading space problem
				'party': row[2],
				'state': row[3][:2],
				'class': row[3][3], # class is because the elections are staggered
				'fec_id': row[4]
				}
				senators.append(candidate)
	return senators

# Writes records in each senator's JSON file to the database as part of their document
def readSenatorsInDB():
	cids = findSenatorCIDs()
	client = MongoClient()
	collection = client.test.senators
	for cid in cids:
		with open("data/senatorContributions/{0}.json".format(cid), 'r') as j:
			records = json.loads(j.read())["records"]
			# modify attributes of each record
			newRecords = []
			for record in records:
				newRecords.append({"pac": int(record["pac"]), "individual": int(record["indivs"]), "total": int(record["totals"]), "organization": record["organization"]})
			collection.update_one({"cid": cid}, { "$set": { "donations": newRecords } })

#### Completed
def writeSenatorDataToDB():
	senators = findSenatorData()
	client = MongoClient() # default host
	db = client.test
	db.drop_collection('senators')
	collection = db.senators
	# duplicate safety check
	# if collection.find().count() == 100: return
	result = collection.insert_many(senators)
	# update with donations
	readSenatorsInDB()

############### Organizations ###############

# Writes all organizations to mongo
def readOrganizations():
	client = MongoClient() # default host
	db = client.test
	db.drop_collection('organizations')
	collection = db.organizations
	# duplicate safety check
	if collection.find().count() == 2870: return
	with open("data/organizations.json", 'r') as j:
		records = json.loads(j.read())["organizations"]
		for o in records.keys():
			collection.insert_one({'name': o, 'states': records[o]["states"]})


# All of the industry stuff
def addIndustryDonationsToSenators():
	client = MongoClient()
	db = client.test
	collection = db.senators
	with open("data/senatorIndustryData.json","r") as g:
		# donation data for each senator (by cid)
		industry_donations = json.loads(g.read())
		for cid in industry_donations.iterkeys():
			new_donations = []
			for record in industry_donations[cid]:
				new_donations.append({"pac": int(record["pacs"]), "individual": int(record["indivs"]), "total": int(record["total"]), "industry_name": record["industry_name"], "industry_code": record["industry_code"]})
			collection.update_one({"cid": cid}, { "$set": { "industry_donations": new_donations } })

# This makes a starter JSON file
def addIndustriesToDB1(): 
	senators = findSenatorData()
	industries = {}
	# create skeleton
	with open("data/industry_names.json","r") as f:
		industry_names = json.loads(f.read())
	for iid in industry_names.iterkeys():
		# total, pac and individual are totals across all senators
		industries[iid] = {"industry_code": iid, "industry_name": industry_names[iid], "industry_donations": [], "states": {}, "total": 0, "pac": 0, "individual": 0}
	# get donations to senators
	with open("data/senatorIndustryData.json","r") as g:
		industry_donations = json.loads(g.read())
	for cid in industry_donations.iterkeys():
		for d in industry_donations[cid]:
			# append this donation to this industry
			# add senator info to d
			d["cid"] = cid
			industries[d["industry_code"]]["industry_donations"].append(d)
	with open("thing.json","w") as h:
		h.write(str(json.dumps({"industries": industries}, indent=2)))

# This moves donations over into states and updates some values
def addIndustriesToDB2():
	senators = findSenatorData()
	# preprocess senators into dict so I have O(1) lookup
	senators_dict = {}
	for s in senators:
		senators_dict[s["cid"]] = s
	client = MongoClient()
	db = client.test
	collection = db.industries
	with open("thing.json","r") as f:
		industries = json.loads(f.read())["industries"]
	for code in industries:
		for donation in industries[code]["industry_donations"]:
			senator = senators_dict[donation["cid"]]
			senator_donation = {"senator": senator, "pac": int(donation["pacs"]), "individual": int(donation["indivs"]), "total": int(donation["total"])}
			# check if senator added to states yet
			if senator["state"] not in industries[code]["states"].keys():
				industries[code]["states"][senator["state"]] = {"pac":0,"individual":0,"total":0,"donations":[]}
			# add senator to state
			industries[code]["states"][senator["state"]]["pac"] += int(donation["pacs"])
			industries[code]["states"][senator["state"]]["individual"] += int(donation["indivs"])
			industries[code]["states"][senator["state"]]["total"] += int(donation["total"])
			industries[code]["states"][senator["state"]]["donations"].append(senator_donation)
			# add to industry totals
			industries[code]["pac"] += int(donation["pacs"])
			industries[code]["individual"] += int(donation["indivs"])
			industries[code]["total"] += int(donation["total"])
		# remove industry_donation key from updated object
		industries[code].pop("industry_donations", None)
	with open("thing2.json","w") as g:
		industries = str(json.dumps(industries, indent=2))
		g.write(industries)

def addIndustriesToMongo():
	addIndustryDonationsToSenators()
	# addIndustriesToDB1()
	# addIndustriesToDB2() # files already created
	client = MongoClient() # default host
	db = client.test
	db.drop_collection('industries')
	collection = db.industries
	with open("thing2.json","r") as f:
		industries = json.loads(f.read())
		for code in industries.iterkeys():
			collection.insert_one(industries[code])

# This drops collections and recreates them from files -- later: move senatorContributions to non-app
def recreateDB():
	client = MongoClient()
	db = client.test
	# Organizations
	readOrganizations()
	# copyDonations() # could refactor, but this format isn't set in stone yet
	print "There are %d organizations" % (db.organizations.find().count())
	# Senators
	writeSenatorDataToDB()
	readSenatorsInDB()
	print "There are %d senators" % (db.senators.find().count())
	addIndustriesToMongo()

# recreateDB()