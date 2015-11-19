from pymongo import MongoClient
import json
import csv
import urllib2

# client = MongoClient() # default host

# db = client.test
# collection = db.senators


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
				'first_name': row[1].split(',')[1],
				'last_name': row[1].split(',')[0],
				'party': row[2],
				'state': row[3][:2],
				'class': row[3][3], # class is because the elections are staggered
				'fec_id': row[4]
				}
				senators.append(candidate)
	return senators

#### Completed
def writeSenatorDataToDB():
	senators = findSenatorData()
	client = MongoClient() # default host
	db = client.test
	collection = db.senators
	# duplicate safety check
	if collection.find().count() == 100: return
	result = collection.insert_many(senators)
	print result.inserted_ids

# writeSenatorDataToDB()

# Writes records in each senator's JSON file to the database as part of their document
def readSenatorsInDB():
	cids = findSenatorCIDs()
	client = MongoClient()
	collection = client.test.senators

	for cid in cids:
		print cid
		# print collection.find_one({"cid": ["cid"]})
		with open("data/senatorContributions/{0}.json".format(cid), 'r') as j:
			records = json.loads(j.read())["records"]
			collection.update_one({"cid": cid}, { "$set": { "records": records } })

readSenatorsInDB() #*** issues: can't find file; loading wrong senators?

############### Organizations ###############

# Writes all organizations to mongo ### Completed
def readOrganizations():
	client = MongoClient() # default host
	db = client.test
	collection = db.organizations
	# duplicate safety check
	if collection.find().count() == 2870: return
	with open("data/organizations.json", 'r') as j:
		records = json.loads(j.read())["organizations"]
		for o in records.keys():
			collection.insert_one({'name': o, 'states': records[o]["states"], 'donations': records[o]["donations"]})

# readOrganizations()

# Copies donations into state BSON to make map tooltips easier to process
def copyDonations():
	client = MongoClient()
	db = client.test
	collection = db.organizations
	for org in collection.find():
		print org
		# break
		# copy donations into state
		for d in org["donations"]:
			stateData = org["states"][d["state"]]
			# print org["states"][state]
			if "donations" in stateData.keys():
				stateData["donations"].append(d)
			else:
				stateData["donations"] = [d]
		collection.update_one({"name": org["name"]}, { "$set": { "states": org["states"] } } )
		print org["states"]

# copyDonations()


