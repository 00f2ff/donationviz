#from crpapi import CRP, CRPApiError
from keys import Keys 
import httplib

keys = Keys()
#CRP.apikey = keys.apikey
apikey = keys.apikey
# Remove the ones I don't need
import argparse
import json
import pprint
import sys
import urllib
import urllib2
import re
import string
import csv

# this is copied from some JS manipulation I did on https://www.opensecrets.org/politicians/summary_all.php:
# a = $('td a').splice(0,105)
# for (i = 0; i < a.length; i++) { b += a[i].href.split('&')[0].split('=')[1]; }
# b = a.join(',')
# // For whatever reason, 105 senators show up. I'm not sure what the deal is here
# I needed to split it here because of the way JS console prints arrays
# Below, however, I'm preprocessing it into a dictionary so I can identify other information from my 114th.csv file
# senatorIdString = "N00009888,N00030980,N00004367,N00006236,N00030608,N00031685,N00005195,N00035267,N00013873,N00024866,N00006692,N00003535,N00002221,N00007836,N00009771,N00001955,N00012508,N00027503,N00030245,N00003845,N00003328,N00000491,N00031820,N00027441,N00024852,N00033363,N00006267,N00033085,N00033054,N00026586,N00004981,N00006249,N00035483,N00007364,N00033443,N00009573,N00029016,N00030780,N00027658,N00009975,N00001758,N00009869,N00029835,N00033782,N00027522,N00028139,N00031688,N00005582,N00002593,N00032546,N00033177,N00034580,N00012539,N00027500,N00031129,N00009918,N00031696,N00032838,N00000270,N00006424,N00027694,N00003389,N00000699,N00029303,N00001945,N00005282,N00026050,N00027566,N00007876,N00009926,N00001692,N00030836,N00035516,N00029277,N00029168,N00035000,N00003682,N00007635,N00000362,N00009922,N00029441,N00005285,N00035187,N00030612,N00000528,N00035544,N00028138,N00001093,N00031782,N00003062,N00024790,N00009920,N00004118,N00035774,N00027605,N00004572,N00035492,N00001489,N00006561,N00009659,N00002097,N00033492,N00027533,N00003280,N00007724"
# cids = senatorIdString.split(',')
# cidDict = {}
# for i in xrange(len(cids)):
# 	if cids[i] in cidDict:
# 		print cids[i]
# 	else:
# 		cidDict[cids[i]] = True
# print cidDict
# All above info is just repetitive, I wrote code before that can do the same thing assuming similar CSV formatting



def callAPI(method, cid):
	# url = 
	url = "http://www.opensecrets.org/api/?method=%s&cid=%s&cycle=2016&output=json&apikey=%s" % (method, cid, apikey)
	req = urllib2.Request(url, headers={'User-Agent' : "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/534.30 (KHTML, like Gecko) Ubuntu/11.04 Chromium/12.0.742.112 Chrome/12.0.742.112 Safari/534.30"}) 
	con = urllib2.urlopen(req)
	response = json.loads(con.read())['response']
	return response


def findCandidateContributions():
	candidates = findSenators()
	candContribData = {'candContribData':[]}
	# callAPI('candContrib',candidates[0]['cid'])
	for i in xrange(2):
		print candidates[i]['cid']
		response = callAPI('candContrib',candidates[i]['cid'])
		candContribData['candContribData'].append(response)

	candContribData = str(json.dumps(candContribData, indent=2))
	# write to JSON
	with open("candContrib.json","w") as f:
		f.write(candContribData)

	# # finalData = 

# findCandidateContributions()

def stuff():
	url = "http://www.opensecrets.org/db2dl/?q=MemContrib&cid=N00003389&cycle=2016&output=JSON&type=I"
	req = urllib2.Request(url, headers={'User-Agent' : "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/534.30 (KHTML, like Gecko) Ubuntu/11.04 Chromium/12.0.742.112 Chrome/12.0.742.112 Safari/534.30"}) 
	con = urllib2.urlopen(req)
	response = json.loads(con.read())
	print response

#stuff()



