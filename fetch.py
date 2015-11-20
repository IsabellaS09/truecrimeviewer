import json
import logging
import os

import requests


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def get_chat():
    # TODO parse Shakespeare's plays
    # Change dialogue format at will, add arguments to this method as necessary
    return [
        {
            'character': 'E',
            'text': 'Speak; I am bound to hear.'
        },
        {
            'character': 'J',
            'text': 'So art thou to revenge, when thou shalt hear.'
        },
        {
            'character': 'T',
            'text': 'What?'
        },
    ]


def get_violations():
    params = {
        '$limit': 50000,
    }
    r = requests.get('https://data.montgomerycountymd.gov/resource/ms8i-8ux3.geojson', params=params)
    if r.status_code != 200:
        logger.error('Failed to get traffic violation data. Response: {0}'.format(r.text))
        return

    violation_map = {
        'alcohol': ["Yes"],
        'property_damage': ["Yes"],
        'work_zone': ["Yes"],
        'arrest_type': ["K - Aircraft Assist", "P - Mounted Patrol"],
        'vehicle_type': ["05 - Light Duty Truck", "06 - Heavy Duty Truck", "10 - Transit Bus"]
    }

    geodata = r.json()
    result = []
    for v in geodata['features']:
        d = v['properties']
        for key in violation_map:
            if d.get(key) in violation_map.get(key) and v.get('geometry') is not None:
                v['properties']['chat'] = get_chat()
                result.append(v)
                val = violation_map.get(key)
                val.remove(d.get(key))
                violation_map[key] = val

    logger.info('Number of matching results: ' + str(len(result)))
    logger.info('Unmatched violation attributes: ' + str(violation_map))

    current_dir = os.path.dirname(os.path.abspath(__file__))
    with open(os.path.join(current_dir, 'data/violations.geojson'), 'w+') as f:
        json.dump(result, f, indent=4, separators=(',', ': '), sort_keys=True)


if __name__ == '__main__':
    get_violations()
