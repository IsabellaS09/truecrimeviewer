import json
import logging
import os

import re
import requests


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def get_chat():
    # TODO parse Shakespeare's plays
    # Change dialogue format at will, add arguments to this method as necessary
    result = {}
    result['quotes'] = []

    p = re.compile("([A-Z][a-z]+|([A-Z]+ ?[A-Z]+?)|[A-Z]+)\. ([\w !'?,;\.]+[!?\.])")  
    line_count = 0
    prev_match = 0
    prev_line = ""


    current_dir = os.path.dirname(os.path.abspath(__file__))
    with open(os.path.join(current_dir, 'data/shakespeare.txt'), 'r+') as f:
        for line in f.readlines():
            line_count += 1
            match_group = p.search(line)
            if match_group:
                if prev_match != 0 and prev_match == line_count-1:
                    result['quotes'].append({
                        "first" : prev_line,
                        "second" : line
                    })
                prev_line = line 
                prev_match = line_count
            
    logger.info('Number of results: ' + str(len(result['quotes'])))
    with open(os.path.join(current_dir, 'data/quotes.json'), 'w+') as f:
        json.dump(result, f, indent=4, separators=(',', ': '), sort_keys=True)
    print result['quotes']
    return


def get_violations():
    '''
    This maps violation properties to a weight which is used to determine
    if a violation is 'interesting'. This is completely subjective.
    '''
    weight_map = {
        'alcohol': 1,
        'belts': 1,
        'property_damage': 1,
        'work_zone': 2,
        'hazmat': 2,
        'arrest_type': 2,
    }
    params = {
        '$limit': 50000,
    }
    r = requests.get('https://data.montgomerycountymd.gov/resource/ms8i-8ux3.geojson', params=params)
    if r.status_code != 200:
        logger.error('Failed to get traffic violation data. Response: {0}'.format(r.text))
        return

    geodata = r.json()
    result = []
    for v in geodata['features']:
        d = v['properties']
        if (
            sum(
                [
                (weight_map['alcohol'] if d['alcohol'] == 'Yes' else 0),
                (weight_map['belts'] if d['belts'] == 'Yes' else 0),
                (weight_map['property_damage'] if d['property_damage'] == 'Yes' else 0),
                (weight_map['work_zone'] if d['work_zone'] == 'Yes' else 0),
                (weight_map['hazmat'] if d['hazmat'] == 'Yes' else 0),
                (weight_map['arrest_type'] if d['arrest_type'] in ['K - Aircraft Assist', 'P - Mounted Patrol'] else 0)
                ]
                ) < 2
            
            ):
            continue
        # Location data or bust
        if v.get('geometry') is None:
            continue

        result.append(v)

    logger.info('Number of results: ' + str(len(result)))
    current_dir = os.path.dirname(os.path.abspath(__file__))
    with open(os.path.join(current_dir, 'data/violations.geojson'), 'w+') as f:
        json.dump(result, f, indent=4, separators=(',', ': '), sort_keys=True)


if __name__ == '__main__':
   # get_violations()
    get_chat()
