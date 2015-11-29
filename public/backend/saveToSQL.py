import MySQLdb as mdb
import sys, json, csv

# For config, refer to beginning of this post: http://zetcode.com/db/mysqlpython/

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

def insertSenators():
	# host, username, password, db
	con = mdb.connect('localhost', 'testuser', 'test', 'testdb');
	# automatically provides error handling
	with con: 
		cur = con.cursor()
		# drop old table in case this is called to refresh db
		cur.execute("DROP TABLE IF EXISTS Senators") # if terminal throws an error, comment out this line, run it again, then uncomment and run again
		# create senators table
		cur.execute("CREATE TABLE Senators(id INT PRIMARY KEY AUTO_INCREMENT, \
		             cid VARCHAR(20), name VARCHAR(100), party VARCHAR(20), \
		             state VARCHAR(20), class VARCHAR(20), fec_id VARCHAR(20))")
		# loop through senators
		senators = findSenatorData()
		for s in senators:
			# insert into database
			query = "INSERT INTO Senators(cid, name, party, state, class, fec_id) \
				     VALUES(%s, %s, %s, %s, %s, %s)"
			args = (s["cid"], s["name"], s["party"], s["state"], s["class"], s["fec_id"])
			cur.execute(query, args)

def findOrganizationData():
	with open("data/orgNames.json", "r") as f:
		return json.loads(f.read())["organizations"]

def insertOrganizations():
	# host, username, password, db
	con = mdb.connect('localhost', 'testuser', 'test', 'testdb');
	# automatically provides error handling
	with con: 
		cur = con.cursor()
		# drop old table in case this is called to refresh db
		cur.execute("DROP TABLE IF EXISTS Organizations") # if terminal throws an error, comment out this line, run it again, then uncomment and run again
		# create organizations table
		cur.execute("CREATE TABLE Organizations(id INT PRIMARY KEY AUTO_INCREMENT, \
		             name VARCHAR(100), industry_id VARCHAR(100))") # decide if I want this to be a varchar or int
		# loop through organizations
		organizations = findOrganizationData()
		for o in organizations:
			# escape any apostrophes
			o = o.replace("'","''")
			# insert into database
			query = "INSERT INTO Organizations(name) VALUES(%s)"
			args = [o] # syntax for single value
			cur.execute(query, args)

# def findDonationData():
# 	contribs = []
# 	cids = findSenatorCIDs()
# 	for cid in cids:
# 		with open("data/senatorContributions/{0}.json".format(cid), "r") as f:
# 			contribs += json.loads(f.read())["records"]
# 	print contribs[0]
# 	return contribs
	
# findDonationData()

def insertDonations():
	# host, username, password, db
	con = mdb.connect('localhost', 'testuser', 'test', 'testdb');
	# automatically provides error handling
	with con: 
		cur = con.cursor()
		# drop old table in case this is called to refresh db
		cur.execute("DROP TABLE IF EXISTS Donations") # if terminal throws an error, comment out this line, run it again, then uncomment and run again
		# create donations table
		cur.execute("CREATE TABLE Donations(id INT PRIMARY KEY AUTO_INCREMENT, \
					total INT, pac INT, individual INT, senator_id INT, organization_id INT)") # cycle is all 2016
		# loop through cids, ignoring response dicts
		# senatorDonationArray = findDonationData()
		# for s in senatorDonationArray:
		cids = findSenatorCIDs()
		for cid in cids:
			# find senator_id
			cur.execute("SELECT id FROM Senators WHERE cid = %s", (cid,)) # use , to turn into tuple
			db_senator = cur.fetchone()
			# continue if this senator doesn't exist in database (may not because is invalid)
			if db_senator != None:
				senator_id = db_senator[0]
				# get this senator's donation data
				with open("data/senatorContributions/{0}.json".format(cid), "r") as f:
					donations = json.loads(f.read())["records"]
				# loop through all donations
				for donation in donations:
					# escape any apostrophes
					organization = donation["organization"]
					organization = organization.replace("'","''")
					# print organization
					# find organization_id
					cur.execute("SELECT id FROM Organizations WHERE name = %s", (organization,))
					db_organization = cur.fetchone()
					print db_organization[0]
					# check whether this organization is in database yet (may not be due to data mismatch)
					if db_organization is None:
						# add to database
						query = "INSERT INTO Organizations(name) VALUES(%s)"
						args = [organization] # syntax for single value
						cur.execute(query, args)
						# find id (probably not best way to get it)
						cur.execute("SELECT id FROM Organizations WHERE name = %s", (organization,))
						organization_id = cur.fetchone()[0]
						# never goes here
					else:
						organization_id = db_organization[0]
					# insert into database
					query = "INSERT INTO Donations(total, pac, individual, senator_id, organization_id) \
						 	 VALUES(%s, %s, %s, %s, %s)" # not a real format string (so don't use %d)
					args = (int(donation["totals"]), int(donation["pac"]), int(donation["indivs"]), int(senator_id), int(organization_id))
					cur.execute(query, args)

def updateOrgNames():
	# host, username, password, db
	con = mdb.connect('localhost', 'testuser', 'test', 'testdb');
	# automatically provides error handling
	with con: 
		cur = con.cursor(mdb.cursors.DictCursor) # use DictCursor to clarify results
		cur.execute("SELECT name FROM Organizations")
		organizations = cur.fetchall()
		with open("data/orgNames.json", "w") as f:
			data = {"organizations":[]}
			for o in organizations:
				data["organizations"].append(o["name"].replace("''","'")) # reverse replacement for legibility
			data = str(json.dumps(data, indent=2))
			f.write(data)


# This takes a while, but will drop and reload all tables
# If this halts because it can't recognize a table name, find the drop line for the method and comment / uncomment
# and rerun until it works. Previously run tables don't need to be reloaded
def createDatabase():
	insertSenators()
	# insertOrganizations() # org names aren't updated yet
	insertDonations()
	updateOrgNames() # this doesn't populate the database, but it does populate the orgNames.json file properly

createDatabase()