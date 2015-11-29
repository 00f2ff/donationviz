import csv
import json

#write data to json file 
#key will be industry code, value will be set of state codes
#
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

def findIndustryNames():
	with open("data/industry_names.json", "r") as f:
		names = json.loads(f.read())
	return names

def writeIndustriesToFile():
	with open("data/senatorIndustryData.json", "r") as f:
		#get senators as dict
		names = findIndustryNames()
		senators = findSenatorsAsDict()
		industries = {}
		data = json.loads(f.read())
		for cid in data:
			info = data[cid]
			for i in xrange(len(info)):
				indCode = info[i]["industry_code"]
				#Base case for industries
				if indCode not in industries.keys():
					industries[indCode] = {"name": names[indCode], "states":{}}
				#Base case for states within industry dictionaries
				if cid in senators :	
					if senators[cid]["state"] not in industries[indCode]["states"]:
						industries[indCode]["states"][senators[cid]["state"]] = {"pac":0,"indivs":0,"total":0}

					industries[indCode]["states"][senators[cid]["state"]]["pac"] += int(info[i]["pacs"])
					industries[indCode]["states"][senators[cid]["state"]]["indivs"] += int(info[i]["indivs"])
					industries[indCode]["states"][senators[cid]["state"]]["total"] += int(info[i]["total"])


	#write to new file
	with open("data/industries.json", "w") as indf:
		inds = {"industries": industries}
		inds = str(json.dumps(inds, indent=2))
		indf.write(inds)

#findIndustryNames()
writeIndustriesToFile()

