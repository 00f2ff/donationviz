import json
import urllib
import urllib2
import re
import string
import csv
import ast
import pull

# Returns dictionary object of senator contributions 
def findIndustryContributions(cid):
	headers = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/534.30 (KHTML, like Gecko) Ubuntu/11.04 Chromium/12.0.742.112 Chrome/12.0.742.112 Safari/534.30"
	url = "http://www.opensecrets.org/db2dl/?q=MemIndustry&cid=%s&cycle=2016&output=JSON&type=I" % (cid)
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


# This is fairly similar to previous function, but will create 102 small JSON files
def writeSenContribsToIDFiles(): 
	# senators = findSenators()
	senators = ["N00007836"]
	# for i in xrange(len(senators)):
	for i in xrange(1):
		print i
		response = findIndustryContributions(senators[i])
		data = str(json.dumps(response, indent=2))
		with open("data/senatorIndustry/{0}.json".format("industry %s" % (senators[i])),"w") as f:
			f.write(data)

	print "~~~ fin ~~~"

writeSenContribsToIDFiles()

