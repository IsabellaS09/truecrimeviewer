'''
Fetches the first 50,000 violations from the MOCO violation dataset.
'''
import urllib, simplejson as json
url = "http://data.montgomerycountymd.gov/resource/ms8i-8ux3.json?$limit=50000"
response = urllib.urlopen(url)
print "fetching data..."
data = json.loads(response.read())
'''
This maps violation properties to a weight which is uses to determine
if a violation is 'interesting'. This is completely subjective.
'''
weight_map = {
    "alcohol": 2,
    "belts": 1,
    "fatal": 4,
    "personal_injury": 2,
    "property_damage": 1,
    "work_zone": 3,
    "hazmat": 5  
}
interesting_violations = [];
print "finding interesting violations..."
for d in data:
    if (
        sum(
            [
            (weight_map["alcohol"] if d["alcohol"] == "Yes" else 0),
            (weight_map["belts"] if d["belts"] == "Yes" else 0),
            (weight_map["fatal"] if d["fatal"] == "Yes" else 0),
            (weight_map["personal_injury"] if d["personal_injury"] == "Yes" else 0),
            (weight_map["property_damage"] if d["property_damage"] == "Yes" else 0),
            (weight_map["work_zone"] if d["work_zone"] == "Yes" else 0),
            (weight_map["hazmat"] if d["hazmat"] == "Yes" else 0),
            ]
            ) > 2
        
        ):
        interesting_violations.append(d)

print len(interesting_violations)
with open('../data/interesting_violations.json', 'w') as outfile:
    json.dump(interesting_violations, outfile, indent=4)
    
print "done"