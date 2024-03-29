from __future__ import print_function

import json
import os.path
import re
import sys
from datetime import datetime

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

"""
Setup requirements:

requirements.txt is updated, pip install -r requirements.txt will install all the necessary dependencies.

for more details:
- https://developers.google.com/sheets/api/quickstart/python
- pip install --upgrade google-api-python-client google-auth-httplib2 google-auth-oauthlib
"""


# If modifying these scopes, delete the file token.json.
SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']

# The ID and range of the spreadsheet.
SPREADSHEET_ID = '17lLWwb86CpCJPHx_tkHDp97TVpaamm3rmVLvenuWebw'
RANGE_NAME = 'Permanent Plaques (INPUT)!A2:H'
IS_PERMANENT = True


def parseLocation(locations):
  # Examples 'GF / DTT'
  # ' GF, DTT'
  # ' GF DTT'
  result = re.split('[,/ ]+', locations)

  def notEmpty(s):
    return s.strip() != '' 

  return list(filter(notEmpty, result))


def fetch_row(row, idx):
  return row[idx] if idx < len(row) else ''


def dumpJSONFiles(files):
  """Load existing JSON files and combine."""
  result = []
  cnt = 0
  # Manually output the commas instead of constructing a large array to dump in order to scale.
  for file in files:
    try:
      with open(file, mode='r') as f:
        data = json.load(f)
        for d in data:
          if cnt > 0:
            print(',')
          print(json.dumps(d), end='')
          cnt += 1
    except:
      pass
  return cnt


def main(args):
    """Shows basic usage of the Sheets API.
    Prints values from a sample spreadsheet.
    """
    print('[', end='')
    numEntries = 0
    if args:
        numEntries = dumpJSONFiles(args)
      
    creds = None
    # The file token.json stores the user's access and refresh tokens, and is
    # created automatically when the authorization flow completes for the first
    # time.
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        # Save the credentials for the next run
        with open('token.json', 'w') as token:
            token.write(creds.to_json())

    try:
        service = build('sheets', 'v4', credentials=creds)

        # Call the Sheets API
        sheet = service.spreadsheets()
        result = sheet.values().get(spreadsheetId=SPREADSHEET_ID,
                                    range=RANGE_NAME).execute()
        values = result.get('values', [])

        if not values:
            print('No data found.')
            return

        header = values[0]
        num_cols = len(header)
        num_rows = len(values)
        keys = { k: v for k,v in zip(header, range(num_cols)) }

        # Need to export to this format:
        id_col = keys['Plaque ID']
        beneficiary_col = keys['Beneficiary']
        sponsor_col = keys['Sponsor']
        plaque_col = keys['PlaqueTypeKey']
        request_col = keys['Request Date']
        expiry_col = keys['Expiration Date']
        location_col = keys['Temple Location']
        media_col = keys['Media Url']
        # eventname_col = keys['Event Name']

        # Need to export in the format below:
        for row in values[1:]:
           index = fetch_row(row, id_col)
           beneText = fetch_row(row, beneficiary_col)
           sponsorText = fetch_row(row, sponsor_col)
           plaqueType = fetch_row(row, plaque_col).lower()
           plaqueLocation = fetch_row(row, location_col)
           requestDate = fetch_row(row, request_col)

           reqDate=datetime.strptime(requestDate, "%m/%d/%Y")
           # requests after 8/24/2023 are on the digital plaque request form.
           if reqDate>datetime(2023, 8, 24):
             continue


           # We are only fetching from the permanent tab.
           # In the event this is temporary, we need to 
           expiryDate = 'Permanent' if IS_PERMANENT else fetch_row(row, expiry_col)
           mediaUrl = fetch_row(row, media_col)
           # eventName = fetch_row(row, eventname_col)

           if plaqueType == '' or index == '':
             continue

           if sponsorText == beneText:
             sponsorText = ''

           entry = {
             'id': index,
             'beneficiary': beneText,
             'sponsor': sponsorText,
             'type': plaqueType,
             'locations': parseLocation(plaqueLocation),
             'requestDate': requestDate,
             'expiryDate': expiryDate,
             'eventName': '',  # Permanent plaques are empty
             'searchable': True,
             'mediaUrl': mediaUrl
           } 

           if numEntries > 0:
             print(',')

           print(json.dumps(entry), end='')
           numEntries += 1

    except HttpError as err:
        #print(err)
        pass
    print(']')


if __name__ == '__main__':
    main(sys.argv[1:])

