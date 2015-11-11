from pymongo import MongoClient
import json
import csv
import urllib2

client = MongoClient() # default host

db = client.test
collection = db.senators


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
	result = collection.insert_many(senators)
	print result.inserted_ids

# writeSenatorDataToDB()

# writeSenContribsToIDFiles()

# Writes records in each senator's JSON file to the database as part of their document
def readSenatorsInDB():
	cids = findSenatorCIDs()
	client = MongoClient()
	collection = client.test.senators
	for cid in cids:
		# print collection.find_one({"cid": s["cid"]})
		with open("data/senatorContributions/{0}.json".format(cid), 'r') as j:
			records = json.loads(j.read())["records"]
			collection.update_one({"cid": cid}, { "$set": { "records": records } })
			# print collection.find_one({"cid": cid})
			# print records
		# break

# readSenatorsInDB()

