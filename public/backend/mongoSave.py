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

recreateDB()

