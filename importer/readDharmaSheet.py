from __future__ import print_function

import json
import sys

from googleapiclient.errors import HttpError
from .importerlib import fetch_credentials
from .importerlib import get_dharma_assembly_plaques
from datetime import datetime


"""
Setup requirements:

requirements.txt is updated, pip install -r requirements.txt will install all the necessary dependencies.

for more details:
- https://developers.google.com/sheets/api/quickstart/python
- pip install --upgrade google-api-python-client google-auth-httplib2 google-auth-oauthlib
"""


# If modifying these scopes, delete the file token.json.
SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']

g_entry_count = 0


def dump_entries(entries):
    global g_entry_count
    for entry in entries:
        if g_entry_count > 0:
            print(",")
        print(json.dumps(entry), end='')
        g_entry_count += 1


def main(args):
    """Shows basic usage of the Sheets API.
    Prints values from a sample spreadsheet.
    """
    print('[', end='')

    creds = fetch_credentials()

    # Fetch dharma assembly plaques
    try:
        url = 'https://docs.google.com/spreadsheets/d/10VRePBtEuvu7l_nyuGNhuiikXPVB5AabG36nltimJB0/edit?pli=1&gid=0#gid=0'
        today = datetime.today().strftime('%m/%d/%Y')
        entries = get_dharma_assembly_plaques(url, today, today, 'Dharma Assembly', creds=creds)
        dump_entries(entries)
    except HttpError as err:
        pass

    print(']')


if __name__ == '__main__':
    main(sys.argv[1:])
