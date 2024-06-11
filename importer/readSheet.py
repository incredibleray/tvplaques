from __future__ import print_function

import json
import sys

from googleapiclient.errors import HttpError
from importerlib import dump_json_files
from importerlib import fetch_credentials
from importerlib import get_plaquetv_permanent_entries
from importerlib import get_jotform_request_entries


"""
Setup requirements:

requirements.txt is updated, pip install -r requirements.txt will install all the necessary dependencies.

for more details:
- https://developers.google.com/sheets/api/quickstart/python
- pip install --upgrade google-api-python-client google-auth-httplib2 google-auth-oauthlib
"""


# If modifying these scopes, delete the file token.json.
SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']

IS_PERMANENT = True
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
    #for s in get_jotform_submissions():
    #    print(json.dumps(s, indent=4))
    #return
    print('[', end='')

    if args:
        dump_json_files(args)

    creds = fetch_credentials()

    entries = get_jotform_request_entries(creds=creds)
    dump_entries(entries)

    try:
        entries = get_plaquetv_permanent_entries(creds=creds)
        dump_entries(entries)
    except HttpError as err:
        pass

    print(']')


if __name__ == '__main__':
    main(sys.argv[1:])

