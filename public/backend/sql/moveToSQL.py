import MySQLdb as mdb
import sys, json, csv

def findSenatorCIDs():
	cids = []
	with open('../data/stateSenators.json', 'r') as j:
		stateData = json.loads(j.read())
		for k in stateData.keys():
			for sen in stateData[k]:
				cids.append(sen["cid"])
	return cids

def findSenatorData():
	cids = findSenatorCIDs()
	senators = []
	with open('../data/114th.csv', 'rU') as csvfile:
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
		cur.execute("DROP TABLE IF EXISTS Senators")
		# create senators table
		cur.execute("CREATE TABLE Senators(Id INT PRIMARY KEY AUTO_INCREMENT, \
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

