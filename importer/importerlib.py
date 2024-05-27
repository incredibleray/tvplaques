import json
import os.path
import re

from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from collections import defaultdict


# If modifying these scopes, delete the file token.json.
SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']

# The ID and range of the spreadsheet.
PERMANENT_SPREADSHEET_ID = '17lLWwb86CpCJPHx_tkHDp97TVpaamm3rmVLvenuWebw'
PERMANENT_RANGE_NAME = 'Permanent Plaques (INPUT)!A2:H'

JOTFORM_SPREADSHEET_ID = '15fgq6Q2kSwekUIy7OND4bF6BQtQ2_GBXWCE1cpN25Qk'
JOTFORM_RANGE_NAME = 'Plaque Request (1)!A:AJ'

# Contains set of plaque ids
_g_plaque_ids = set()



def parse_location(locations):
    # Examples 'GF / DTT'
    # ' GF, DTT'
    # ' GF DTT'
    result = re.split('[,/ ]+', locations)

    def not_empty(s):
        return s.strip() != ''

    return list(filter(not_empty, result))


def get_column(row, idx):
    return row[idx] if idx < len(row) else ''


def dump_json_file(file):
    first = True
    with open(file, mode='r') as f:
        for d in json.load(f):
            if not first:
                print(',')
            print(json.dumps(d), end='')
            first = False


def dump_json_files(files):
    """Load existing JSON files and combine."""
    cnt = 0
    # Manually output the commas instead of constructing a large array to dump in order to scale.
    for file in files:
        try:
            dump_json_file(file)
        except:
            pass
    return cnt


def fetch_credentials(token_file=None, secrets_file=None):
    if token_file is None:
        token_file = 'token.json'

    if secrets_file is None:
        secrets_file = 'credentials.json'

    creds = None

    if os.path.exists(token_file):
        creds = Credentials.from_authorized_user_file(token_file, SCOPES)

    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(secrets_file, SCOPES)
            creds = flow.run_local_server(port=0)
        # Save the credentials for the next run
        with open(token_file, 'w') as token:
            token.write(creds.to_json())

    return creds


def fetch_sheet(sheet_id, range_name, creds=None):
    if creds is None:
        creds = fetch_credentials()

    service = build('sheets', 'v4', credentials=creds)

    # Call the Sheets API
    sheet = service.spreadsheets()
    result = sheet.values().get(spreadsheetId=sheet_id, range=range_name).execute()
    return result.get('values', [])


def get_header_column_map(data):
    header = data[0]
    num_cols = len(header)
    return {k: v for k, v in zip(header, range(num_cols))}


def get_entries_as_maps(data):
    colmap = get_header_column_map(data)
    entries = []
    for row in data[1:]:
        entries.append({k: row[idx] for k, idx in colmap.items()})
    return entries


def get_plaquetv_permanent_entries(creds=None):
    values = fetch_sheet(PERMANENT_SPREADSHEET_ID, PERMANENT_RANGE_NAME, creds=creds)
    if not values:
        return []
    return parse_plaquetv_permanent_entries(values)


def parse_plaquetv_permanent_entries(data):
    cols = get_header_column_map(data)

    # Need to export to this format:
    id_col = cols['Plaque ID']
    beneficiary_col = cols['Beneficiary']
    sponsor_col = cols['Sponsor']
    plaque_col = cols['PlaqueTypeKey']
    request_col = cols['Request Date']
    expiry_col = cols['Expiration Date']
    location_col = cols['Temple Location']
    media_col = cols['Media Url']

    entries = []
    # Need to export in the format below:
    for row in data[1:]:
        index = get_column(row, id_col)
        bene_text = get_column(row, beneficiary_col)
        sponsor_text = get_column(row, sponsor_col)
        plaque_type = get_column(row, plaque_col).lower()
        plaque_location = get_column(row, location_col)
        request_date = get_column(row, request_col)

        # We are only fetching from the permanent tab.
        # In the event this is temporary, we need to
        # if IS_PERMANENT else get_column(row, expiry_col)
        expiry_date = 'Permanent'
        media_url = get_column(row, media_col)

        if plaque_type == '' or index == '':
            continue

        if sponsor_text == bene_text:
            sponsor_text = ''

        entries.append({
            'id': index,
            'beneficiary': bene_text,
            'sponsor': sponsor_text,
            'type': plaque_type,
            'locations': parse_location(plaque_location),
            'requestDate': request_date,
            'expiryDate': expiry_date,
            'eventName': '',  # Permanent plaques are empty
            'searchable': True,
            'mediaUrl': media_url
        })

    return entries


def get_jotform_request_entries(creds=None):
    values = fetch_sheet(JOTFORM_SPREADSHEET_ID, JOTFORM_RANGE_NAME, creds=creds)
    if not values:
        return []

    rows = get_entries_as_maps(values)
    plaques = []
    for row in rows:
        p = parse_jotform_plaques(row)
        plaques.extend(p)

    return plaques


JOTFORM_PLAQUETYPE_MAP = defaultdict(str, {
    'mmb': 'mmb',
    'w-mmb': 'wmmb',
    '- past creditors': 'rebirth',
    '- ancestors': 'rebirth',
    'rebirth': 'rebirth',
    'w-rebirth': 'wrebirth',
    'ayw': 'ayw',
    'as you wish': 'ayw',
    'w-as you wish': 'wayw',
    '49day': '49day',
    'pre-arranged 49-days': 'pre49',
})


JOTFORM_PLAQUETYPE_KEYS = [
    'Plaque Type',
    'Plaque Type 2',
    'Plaque Type 3',
    'Plaque Type 4',
    'Plaque Type 5',
]


def parse_jotform_entry_plaque_type(entry, plaque_index):
    key = JOTFORM_PLAQUETYPE_KEYS[plaque_index]
    value = entry[key].lower().strip()
    if key in entry:
        return JOTFORM_PLAQUETYPE_MAP[value]

    return ''


JOTFORM_BENEFICIARY_KEYS = [
    'Beneficiary Name',
    'Beneficiary Name 3',
    'Beneficiary Name 4',
    'Beneficiary Name 5',
    'Beneficiary Name 6',
]


def parse_jotform_entry_beneficiary(entry, plaque_index):
    bene_text = entry[JOTFORM_BENEFICIARY_KEYS[plaque_index]]
    key = JOTFORM_PLAQUETYPE_KEYS[plaque_index]
    value = entry[key].lower().strip()

    if value == '- past creditors':
        bene_text = 'Past Creditors'
    elif value == '- ancestors':
        bene_text = 'Ancestors'

    return bene_text


JOTFORM_SPONSOR_KEYS = [
    'Sponsor Name',
    'Sponsor Name 3',
    'Sponsor Name 4',
    'Sponsor Name 5',
    'Sponsor Name 6',
]


def parse_jotform_entry_sponsor(entry, plaque_index):
    sponsor_text = entry[JOTFORM_SPONSOR_KEYS[plaque_index]]
    bene_text = entry[JOTFORM_BENEFICIARY_KEYS[plaque_index]]
    key = JOTFORM_PLAQUETYPE_KEYS[plaque_index]
    value = entry[key].lower().strip()
    options = entry['More options']

    if value == '- past creditors' or value == '- ancestors':
        return bene_text

    if sponsor_text == bene_text or 'Hide Sponsor on display' in options:
        return ''

    return sponsor_text


JOTFORM_TERM_KEYS = [
    'Term',
    'Term 2',
    'Term 3',
    'Term 4',
    'Term 5',
]


def parse_jotform_entry_term(entry, plaque_index):
    term_text = entry[JOTFORM_TERM_KEYS[plaque_index]]
    key = JOTFORM_PLAQUETYPE_KEYS[plaque_index]
    value = entry[key].lower().strip()

    if value == 'pre-arranged 49-days':
        return 'Permanent'

    return term_text


def parse_jotform_entry_locations(entry):
    locations = []
    location_str = entry['Which BLI temple'].lower().strip()

    if "wmt" in location_str:
        locations.append("WMT")
    if "dtt" in location_str:
        locations.append("DTT")
    if "gf" in location_str:
        locations.append("GF")
    if len(locations) == 0:
        locations = ["WMT"]

    return locations


def parse_jotform_entry_request_date_obj(entry):
    start_date = entry['Starting Date']
    submission_time = entry['Submission Date']

    try:
        return datetime.strptime(start_date, '%m-%d-%Y')
    except ValueError:
        submission_date = submission_time.split(' ')[0]
        return datetime.fromisoformat(submission_date)


def parse_jotform_entry_request_date(entry):
    return parse_jotform_entry_request_date_obj(entry).strftime("%m/%d/%Y")


def make_id_unique(id):
    current_id = id
    global _g_plaque_ids
    while current_id in _g_plaque_ids:
        current_id += 1

    _g_plaque_ids.add(current_id)
    return str(current_id)


def parse_jotform_id(entry, index):
    request_date = parse_jotform_entry_request_date_obj(entry)
    term = parse_jotform_entry_term(entry, index)

    # basic ID decide a pool of ID, e.g. 2023080000 means a pool from 202308000 to 202308999.
    # each plaque gets an actual ID, that is the smallest value still available in the pool
    basic_id = request_date.year * 1_000_000 + request_date.month + 10_000
    if term.lower() == "permanent":
        basic_id = request_date.year * 100_000 + request_date.month + 1_000

    return make_id_unique(basic_id)


def get_relativedelta(term):
    lterm = term.lower()
    if lterm == 'one year':
        return relativedelta(years=1)
    elif lterm == 'one month':
        return relativedelta(months=1)
    elif lterm == "two months":
        return relativedelta(months=2)
    elif lterm == "three months":
        return relativedelta(months=3)
    elif lterm == "four months":
        return relativedelta(months=4)
    elif lterm == "five months":
        return relativedelta(months=5)
    elif lterm == "six months":
        return relativedelta(months=6)
    elif lterm == "seven months":
        return relativedelta(months=7)
    elif lterm == "eight months":
        return relativedelta(months=8)
    elif lterm == "nine months":
        return relativedelta(months=9)
    elif lterm == "ten months":
        return relativedelta(months=10)
    elif lterm == "eleven months":
        return relativedelta(months=11)
    elif lterm == "twelve months":
        return relativedelta(months=12)
    elif lterm == "monthly":
        return relativedelta(months=1)
    elif lterm == "one week":
        return relativedelta(weeks=1)
    elif lterm == "one day":
        return relativedelta(days=1)
    else:
        raise ValueError("Unsupported term value: " + term)


def parse_jotform_entry_expiry_date(entry, term):
    request_date = parse_jotform_entry_request_date_obj(entry)
    if term == 'Permanent':
        return 'Permanent'
    else:
        delta = get_relativedelta(term)
        expiration = request_date + delta + relativedelta(days=-1)
        return expiration.strftime("%m/%d/%Y")


def parse_jotform_plaque(entry, index):
    locations = parse_jotform_entry_locations(entry)
    plaque_type = parse_jotform_entry_plaque_type(entry, index)

    if plaque_type == '' or plaque_type is None:
        return None

    beneficiary = parse_jotform_entry_beneficiary(entry, index)
    sponsor = parse_jotform_entry_sponsor(entry, index)
    if beneficiary == '' and sponsor == '':
        if '2023' not in entry['Submission Date']:
            print(f'WARNING: Missing beneficiary/sponsor for index={index}')
            dump_plaque(entry)
        return None

    term = parse_jotform_entry_term(entry, index)
    if term == '':
        if '2023' not in entry['Submission Date']:
            print(f'WARNING: Missing term for index={index}')
            dump_plaque(entry)
        return None

    start_date = parse_jotform_entry_request_date(entry)
    expiration_date = parse_jotform_entry_expiry_date(entry, term)
    plaque_id = parse_jotform_id(entry, index)

    return {
         'id': plaque_id,
         'beneficiary': beneficiary,
         'sponsor': sponsor,
         'type': plaque_type,
         'locations': locations,
         'requestDate': start_date,
         'expiryDate': expiration_date,
         'eventName': '',  # Permanent plaques are empty
         'searchable': True,
         'mediaUrl': ''
    }


def parse_jotform_plaques(entry):
    plaques = []
    for i in range(len(JOTFORM_PLAQUETYPE_KEYS)):
        plaque = parse_jotform_plaque(entry, i)
        if plaque is not None:
            plaques.append(plaque)

    return plaques


def dump_plaque(entry):
    print('=============')
    for k in entry:
        print(f'   {k}: {entry[k]}')
