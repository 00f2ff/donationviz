from pymongo import MongoClient
import MySQLdb as mdb
import json
import csv
import sys

def replaceHelper(collection_name):
	# Connect to mongo
	client = MongoClient()
	db = client.test
	db.drop_collection(collection_name)
	collection = db[collection_name]
	# Connect to MySQL
	con = mdb.connect('localhost', 'testuser', 'test', 'testdb');
	with con: 
		cur = con.cursor(mdb.cursors.DictCursor) # use DictCursor to clarify results
		cur.execute("SELECT * FROM %s" % (collection_name))
		rows = cur.fetchall()
		for r in rows:
			r["sql_id"] = int(r["id"])
			del r["id"]
			# check for foreign keys
			if collection_name == 'donations':
				r["senator_id"] = int(r["senator_id"])
				r["organization_id"] = int(r["organization_id"])
				r["total"] = int(r["total"])
				r["pac"] = int(r["pac"])
				r["individual"] = int(r["individual"])
		collection.insert_many(rows)

# def addDonationsToDocument(collection, sql_id):

# This method adds donations and corresponding organizations to senators collection
def addDonationsToSenators():
	# Connect to mongo
	client = MongoClient()
	db = client.test
	collection = db.senators
	# Connect to MySQL
	con = mdb.connect('localhost', 'testuser', 'test', 'testdb');
	with con: 
		cur = con.cursor(mdb.cursors.DictCursor) # use DictCursor to clarify results
		for s in collection.find():
			cur.execute("SELECT * FROM Donations WHERE senator_id = %s" % (s["sql_id"]))
			rows = cur.fetchall()
			for r in rows:
				# format fields
				r["sql_id"] = int(r["id"])
				del r["id"]
				r["senator_id"] = int(r["senator_id"])
				r["organization_id"] = int(r["organization_id"])
				r["total"] = int(r["total"])
				r["pac"] = int(r["pac"])
				r["individual"] = int(r["individual"])
				# add connection to organization
				cur.execute("SELECT * FROM Organizations WHERE id = %s" % (r["organization_id"]))
				org = cur.fetchone()
				org["sql_id"] = int(org["id"])
				del org["id"]
				r["organization"] = org
			collection.update_one({"sql_id": s["sql_id"]}, { "$set": { "donations": rows } } )

# This method adds donations and corresponding senators to organizations collection
def addDonationsToOrganizations():
	# Connect to mongo
	client = MongoClient()
	db = client.test
	collection = db.organizations
	# Connect to MySQL
	con = mdb.connect('localhost', 'testuser', 'test', 'testdb');
	with con: 
		cur = con.cursor(mdb.cursors.DictCursor) # use DictCursor to clarify results
		for o in collection.find():
			print o
			
			cur.execute("SELECT * FROM Donations WHERE organization_id = %s" % (o["sql_id"]))
			rows = cur.fetchall()
			print rows
			# break
			for r in rows:
				# format fields
				r["sql_id"] = int(r["id"])
				del r["id"]
				r["senator_id"] = int(r["senator_id"])
				r["organization_id"] = int(r["organization_id"])
				r["total"] = int(r["total"])
				r["pac"] = int(r["pac"])
				r["individual"] = int(r["individual"])
				# add connection to senator
				cur.execute("SELECT * FROM Senators WHERE id = %s" % (r["senator_id"]))
				sen = cur.fetchone()
				sen["sql_id"] = int(sen["id"])
				del sen["id"]
				r["senator"] = sen
			collection.update_one({"sql_id": o["sql_id"]}, { "$set": { "donations": rows } } )

def reloadMongo():
	# replaceHelper('senators')
	# replaceHelper('organizations')
	# replaceHelper('donations')
	# addDonationsToSenators()
	addDonationsToOrganizations()

reloadMongo()