from __future__ import print_function
from datetime import datetime

import json
import sys

from googleapiclient.errors import HttpError
from importerlib import dump_json_files
from importerlib import fetch_credentials
from importerlib import get_plaquetv_permanent_entries
from importerlib import get_jotform_request_entries
from importerlib import get_jotform_submissions
from importerlib import get_plaquetv_jotform_last_update
from importerlib import set_plaquetv_jotform_last_update
from importerlib import append_plaquetv_jotform_entry


"""
Setup requirements:

requirements.txt is updated, pip install -r requirements.txt will install all the necessary dependencies.

for more details:
- https://developers.google.com/sheets/api/quickstart/python
- pip install --upgrade google-api-python-client google-auth-httplib2 google-auth-oauthlib
"""

def parse_date(datestr):
    return datetime.strptime(datestr, '%Y-%m-%d %H:%M:%S')


def main(args):
    """Shows basic usage of the Sheets API.
    Prints values from a sample spreadsheet.
    """
    creds = fetch_credentials()

    last_update = parse_date(get_plaquetv_jotform_last_update(creds=creds))
    entries = get_jotform_request_entries(creds=creds)
    entries = list(filter(lambda e: parse_date(e['submission_date']) > last_update, entries))
    if len(entries) == 0:
        print(f'Last imported: {last_update}.')
        print('No data to import.')
        return
    last_update = max(entries, key=lambda e: parse_date(e['submission_date']))['submission_date']
    append_plaquetv_jotform_entry(entries, creds=creds)
    set_plaquetv_jotform_last_update(last_update)


if __name__ == '__main__':
    main(sys.argv[1:])

