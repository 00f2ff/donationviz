import json
import urllib
import urllib2
import re
import string
import csv
import ast
import pull

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

# Writes a JSON file comprised of senator names and cids for each state
def writeStateSenatorsToFile():
	senators = findSenatorData()
	data = {}
	for senator in senators:
		senData = {"name":senator["name"], "cid":senator["cid"], "party": senator["party"], "state":senator["state"]} # state is just there to check
		if senator["state"] in data.keys():
			data[senator["state"]].append(senData)
		else:
			data[senator["state"]] = [senData]

	data = str(json.dumps(data, indent=2))
	with open("data/stateSenators.json","w") as f:
		f.write(data)

# Adds by-state information to organizations.json
# No longer references orgNames.json, as it somehow contains more organizations than are present in our 100 cid files
def writeOrganizations():
	senators = findSenatorData()
	organizations = {}
	for senator in senators:
		cid = senator["cid"]
		with open("data/senatorContributions/{0}.json".format(cid), "r") as f:
			donations = json.loads(f.read())["records"]
			for donation in donations:
				print donation
				donation_organization = donation["organization"]
				# base case
				if donation_organization not in organizations.keys():
					organizations[donation_organization] = {"states":{}}
				# change attributes of donation
				donation = {"senator": senator, "pac": int(donation["pac"]), "individual": int(donation["indivs"]), "total": int(donation["totals"])}
				# add donation to this organization
				# organizations[donation_organization]["donations"].append(donation)
				# modify preprocessed state data based on this donation
				if senator["state"] not in organizations[donation_organization]["states"]:
					organizations[donation_organization]["states"][senator["state"]] = {"pac":0,"individual":0,"total":0,"donations":[]}
				organizations[donation_organization]["states"][senator["state"]]["pac"] += donation["pac"]
				organizations[donation_organization]["states"][senator["state"]]["individual"] += donation["individual"]
				organizations[donation_organization]["states"][senator["state"]]["total"] += donation["total"]
				organizations[donation_organization]["states"][senator["state"]]["donations"].append(donation)
	with open("data/organizations.json", "w") as orgf:
		orgs = {"organizations": organizations}
		orgs = str(json.dumps(orgs, indent=2))
		orgf.write(orgs)

writeOrganizations()


# findOrgNames()

# writeOrganizationDataToFile()
# writeStateSenatorsToFile()
# writeSenContribsToSingleFile()
# writeSenContribsToIDFiles()

