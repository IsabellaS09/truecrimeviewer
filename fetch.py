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
        '$limit': 10,
    }
    r = requests.get('https://data.montgomerycountymd.gov/resource/ms8i-8ux3.geojson', params=params)
    if r.status_code != 200:
        logger.error('Failed to get traffic violation data. Response: {0}'.format(r.text))
        return

    geodata = r.json()
    result = []
    for v in geodata['features']:
        # Location data or bust
        if v.get('geometry') is None:
            continue

        # Dialogue
        v['properties']['chat'] = get_chat()
        result.append(v)

    current_dir = os.path.dirname(os.path.abspath(__file__))
    with open(os.path.join(current_dir, 'data/violations.geojson'), 'w+') as f:
        json.dump(result, f, indent=4, separators=(',', ': '), sort_keys=True)


if __name__ == '__main__':
    get_violations()
