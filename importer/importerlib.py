import json
import os.path
import sys

from collections import defaultdict
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from jotform import JotformAPIClient
from urllib.parse import urlparse, parse_qs


# If modifying these scopes, delete the file token.json.
SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

# The ID and range of the spreadsheet.
PERMANENT_SPREADSHEET_ID = '17lLWwb86CpCJPHx_tkHDp97TVpaamm3rmVLvenuWebw'
PERMANENT_RANGE_NAME = 'Permanent Plaques (INPUT)!A2:H'

PLAQUETV_JOTFORM_SPREADSHEET_ID = '17lLWwb86CpCJPHx_tkHDp97TVpaamm3rmVLvenuWebw'
PLAQUETV_JOTFORM_METADATA_RANGE_NAME = 'Jotform Imported Plaques (INPUT)!A1:A1'
PLAQUETV_JOTFORM_ENTRIES_RANGE_NAME = 'Jotform Imported Plaques (INPUT)!A4:I'
PLAQUETV_JOTFORM_RANGE_NAME = 'Jotform Imported Plaques (INPUT TO TV)!A3:I'

JOTFORM_SPREADSHEET_ID = '15fgq6Q2kSwekUIy7OND4bF6BQtQ2_GBXWCE1cpN25Qk'
JOTFORM_RANGE_NAME = 'Plaque Request (1)!A:AJ'

DHARMA_ASSEMBLY_SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/13fogJNvoC-jL3d41KQXenVCwZOXUfnhfbDfw1Vn9uKE/edit?gid=0#gid=0'

# Contains set of plaque ids
_g_plaque_ids = set()


def parse_location(locations):
    # Examples 'GF / DTT'
    # ' GF, DTT'
    # ' GF DTT'

    result = []
    location_str = locations.lower().strip()

    if "wmt" in location_str:
        result.append("WMT")
    if "dtt" in location_str:
        result.append("DTT")
    if "gf" in location_str:
        result.append("GF")
    if "none" in location_str:
        result.append("NONE")

    return result


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


def fetch_sheet_by_url(gsheet_url, creds=None):
    # Parse the URL to extract spreadsheetId and gid
    parsed_url = urlparse(gsheet_url)
    query_params = parse_qs(parsed_url.query)

    # Extract spreadsheetId
    spreadsheet_id = None
    if 'key' in query_params:
        spreadsheet_id = query_params['key'][0]
    elif 'spreadsheets/d/' in parsed_url.path:
        spreadsheet_id = parsed_url.path.split('/')[3]

    # Extract gid
    gid = 0
    if 'gid' in query_params:
        gid = query_params['gid'][0]

    if spreadsheet_id is None:
        raise ValueError('Unable to extract spreadsheetId from URL.')

    if creds is None:
        creds = fetch_credentials()

    service = build('sheets', 'v4', credentials=creds)

    # Call the Sheets API
    sheet_name = None
    spreadsheet = service.spreadsheets().get(spreadsheetId=spreadsheet_id).execute()
    for sheet in spreadsheet.get('sheets', []):
        if sheet['properties']['sheetId'] == int(gid):
            sheet_name = sheet['properties']['title']
            break

    if sheet_name is None:
        raise ValueError(f'No sheet found with gid {gid} in the spreadsheet.')

    # Fetch all data from the specified sheet
    sheet_range = f'{sheet_name}!A1:ZZ'  # Adjust the range as needed
    result = service.spreadsheets().values().get(
        spreadsheetId=spreadsheet_id, range=sheet_range
    ).execute()

    return result.get('values', [])


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
        entries.append({k: row[idx] if idx < len(row) else "" for k, idx in colmap.items()})
    return entries


def get_plaquetv_permanent_entries(creds=None):
    values = fetch_sheet(PERMANENT_SPREADSHEET_ID, PERMANENT_RANGE_NAME, creds=creds)
    if not values:
        return []
    return parse_plaquetv_entries(values)


def get_current_dharma_assembly_plaques(creds=None):
    values = fetch_sheet_by_url(DHARMA_ASSEMBLY_SPREADSHEET_URL, creds=creds)
    rows = get_entries_as_maps(values)
    entries = []
    for row in rows:
        enabled = row['Checkbox']
        event = row['Event']
        start_date = row['Start Date']
        end_date = row['End Date']
        location = row['Temple']
        url = row['URL']

        if enabled == 'TRUE' and url and start_date and end_date:
            plaques = get_dharma_assembly_plaques(url, start_date, end_date, event, location=location, creds=creds)
            entries.extend(plaques)
        elif enabled:
            print("Skipping row due to missing inputs.", file=sys.stderr)
            continue

    return entries



def get_dharma_assembly_plaques(gsheet_url, start_date, end_date, event_name, location="", creds=None):
    data = fetch_sheet_by_url(gsheet_url, creds=creds)
    if not data:
        return []

    header = data[0]
    rows = get_entries_as_maps(data)
    entries = []

    # New style: Sponsor, Plaque, Beneficiary, Branch, Note, Time Submitted
    if 'Sponsor' in header and 'Plaque' in header and 'Beneficiary' in header:
        for row in rows:
            entry = parse_new_dharma_assembly_plaque(row, start_date, end_date, event_name=event_name, location=location)
            if entry:
                entries.append(entry)
    else:
        for row in rows:
            for idx in range(2):
                entry = parse_dharma_assembly_plaque(row, idx, start_date, end_date, event_name=event_name, location=location)
                if entry:
                    entries.append(entry)

    return entries


def parse_plaquetv_entries(data):
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
        expiry_date = get_column(row, expiry_col)
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
    'wmmb': 'wmmb',
    'past creditors': 'rebirth',
    '- past creditors': 'rebirth',
    '- ancestors': 'rebirth',
    'rebirth': 'rebirth',
    'w-rebirth': 'wrebirth',
    'ayw': 'ayw',
    'as you wish': 'ayw',
    'w-as you wish': 'wayw',
    '49day': '49day',
    '49 days': '49day',
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
    return parse_plaque_type(entry[key].lower().strip()) if key in entry else ''


def parse_plaque_type(plaque_type):
    value = plaque_type.lower().strip()
    return JOTFORM_PLAQUETYPE_MAP.get(value, value)


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
    value = entry[key]
    return correct_beneficiary(bene_text, value)


def correct_beneficiary(beneficiary, plaque_description):
    desc = plaque_description.lower().strip()

    # Don't override the beneficiary if entered
    if beneficiary.strip() == "":
        # If beneficiary empty, then correct it based on type.
        if 'past creditors' in desc:
            return 'Past Creditors'
        elif 'ancestors' in desc:
            return 'Ancestors'

    return beneficiary


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
    return correct_sponsor(sponsor_text, bene_text, entry[key], entry['More options'])


def correct_sponsor(sponsor, beneficiary, plaque_desc, options=''):
    value = plaque_desc.lower().strip()

    if 'past creditors' in value or 'ancestors' in value:
        return sponsor

    if sponsor == beneficiary or 'Hide Sponsor on display' in options:
        return ''

    return sponsor


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

    if value == 'pre-arranged 49-days' or value == '49 days':
        return 'Permanent'

    return term_text


def parse_jotform_entry_more_options(entry):
    return entry['More options']


def parse_jotform_entry_locations(entry):
    return parse_location(entry['Which BLI temple'])


def parse_jotform_entry_request_date_obj(entry):
    start_date = entry['Starting Date']
    submission_time = entry['Submission Date']

    try:
        return datetime.strptime(start_date, '%m-%d-%Y')
    except ValueError:
        submission_date = submission_time.split(' ')[0]
        return datetime.fromisoformat(submission_date)


def parse_jotform_entry_request_date(entry):
    return datetime_to_str(parse_jotform_entry_request_date_obj(entry))


def datetime_to_str(datetime_obj):
    return datetime_obj.strftime("%m/%d/%Y")


def make_id_unique(id):
    current_id = id
    global _g_plaque_ids
    while current_id in _g_plaque_ids:
        current_id += 1

    _g_plaque_ids.add(current_id)
    return str(current_id)


def get_plaque_id(request_date, term=""):
    # basic ID decide a pool of ID, e.g. 2023080000 means a pool from 202308000 to 202308999.
    # each plaque gets an actual ID, that is the smallest value still available in the pool
    basic_id = request_date.year * 1_000_000 + request_date.month * 10_000
    if term.lower() == "permanent":
        basic_id = request_date.year * 100_000 + request_date.month * 1_000

    return make_id_unique(basic_id)


def parse_jotform_id(entry, index):
    request_date = parse_jotform_entry_request_date_obj(entry)
    term = parse_jotform_entry_term(entry, index)
    return get_plaque_id(request_date, term=term)


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
        return datetime_to_str(expiration)


def parse_jotform_plaque(entry, index):
    locations = parse_jotform_entry_locations(entry)
    plaque_type = parse_jotform_entry_plaque_type(entry, index)

    if plaque_type == '' or plaque_type is None:
        return None

    # if "More options" contains "Do Not Display" skip entry
    options = parse_jotform_entry_more_options(entry).lower()
    if 'do not display' in options:
        print(f'DEBUG: Plaque entry skipped due to "do not display" option.', file=sys.stderr)
        return None 

    beneficiary = parse_jotform_entry_beneficiary(entry, index)
    sponsor = parse_jotform_entry_sponsor(entry, index)
    if beneficiary == '' and sponsor == '':
        if '2023' not in entry['Submission Date']:
            print(f'WARNING: Missing beneficiary/sponsor for index={index}', file=sys.stderr)
            dump_plaque(entry)
        return None

    term = parse_jotform_entry_term(entry, index)
    if term == '':
        if '2023' not in entry['Submission Date']:
            print(f'WARNING: Missing term for index={index}', file=sys.stderr)
            dump_plaque(entry)
        return None

    submission_date = entry['Submission Date']
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
         'mediaUrl': '',
         'submission_date': submission_date
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


def get_jotform_api(token_file):
    with open(token_file) as f:
        d = json.load(f)
        return JotformAPIClient(d['apikey'])


def get_jotform_form(token_file):
    with open(token_file) as f:
        d = json.load(f)
        return d['form']


def get_jotform_submissions():
    token_file = "jotform-token.json"
    form_id = get_jotform_form(token_file)
    jotform_api = get_jotform_api(token_file)

    offset = 0
    k_limit = 50
    submissions = None

    while submissions is None or len(submissions) >= k_limit:
        submissions = jotform_api.get_form_submissions(form_id, offset=offset, limit=k_limit)
        if len(submissions) == 0:
            return
        offset += len(submissions)
        yield submissions


def get_plaquetv_jotform_entries(creds=None):
    values = fetch_sheet(PLAQUETV_JOTFORM_SPREADSHEET_ID, PLAQUETV_JOTFORM_RANGE_NAME, creds=creds)
    if not values:
        return []
    return parse_plaquetv_entries(values)


def get_plaquetv_jotform_last_update(creds=None):
    values = fetch_sheet(
        PLAQUETV_JOTFORM_SPREADSHEET_ID,
        PLAQUETV_JOTFORM_METADATA_RANGE_NAME, creds=creds)
    return values[0][0].split('=')[-1]


def set_plaquetv_jotform_last_update(date_str, creds=None):
    if creds is None:
        creds = fetch_credentials()

    service = build('sheets', 'v4', credentials=creds)

    # Call the Sheets API
    sheet = service.spreadsheets()
    values = [[f'last={date_str}']]
    body = {"values": values}

    sheet_id = PLAQUETV_JOTFORM_SPREADSHEET_ID
    range_name = PLAQUETV_JOTFORM_METADATA_RANGE_NAME
    (sheet.values()
          .update(spreadsheetId=sheet_id,
                  range=range_name,
                  valueInputOption='USER_ENTERED',
                  body=body)
          .execute())


def append_plaquetv_jotform_entry(entries, creds=None):
    def _entry_as_ordered_data(entry):
        cpy = entry.copy()
        cpy['locations'] = ','.join(cpy['locations'])
        return list(map(lambda k: cpy[k], [
         'sponsor',
         'beneficiary',
         'requestDate',
         'expiryDate',
         'type',
         'id',
         'locations',
         'mediaUrl',
         'submission_date']))

    values = list(map(_entry_as_ordered_data, entries))
    if creds is None:
        creds = fetch_credentials()

    service = build('sheets', 'v4', credentials=creds)

    # Call the Sheets API
    sheet = service.spreadsheets()
    body = {"values": values}

    sheet_id = PLAQUETV_JOTFORM_SPREADSHEET_ID
    range_name = PLAQUETV_JOTFORM_ENTRIES_RANGE_NAME
    (sheet.values()
     .append(spreadsheetId=sheet_id,
             range=range_name,
             valueInputOption='USER_ENTERED',
             body=body)
     .execute())


def parse_new_dharma_assembly_plaque(entry, start_date, end_date, event_name="", location=""):
    locations = parse_location(location if location else entry['Branch'])
    plaque_type = parse_plaque_type(entry['Plaque'])

    sponsor = correct_sponsor(
        entry['Sponsor'],
        entry['Beneficiary'],
        entry['Plaque']
    )

    beneficiary = correct_beneficiary(
        entry['Beneficiary'],
        entry['Plaque']
    )

    start_datetime_obj = datetime.strptime(start_date, '%m/%d/%Y')
    end_datetime_obj = datetime.strptime(end_date, '%m/%d/%Y')

    submission_date = entry['Time Submitted']
    plaque_id = get_plaque_id(start_datetime_obj)

    if plaque_type == '' or plaque_type is None:
        return None

    if beneficiary == '' and sponsor == '':
        print(f'WARNING: Missing DA beneficiary/sponsor for new format plaque', file=sys.stderr)
        dump_plaque(entry)
        return None

    return {
        'id': plaque_id,
        'beneficiary': beneficiary,
        'sponsor': sponsor,
        'type': plaque_type,
        'locations': locations,
        'requestDate': datetime_to_str(start_datetime_obj),
        'expiryDate': datetime_to_str(end_datetime_obj),
        'eventName': event_name,
        'searchable': True,
        'mediaUrl': '',
        'submission_date': submission_date
    }


def parse_dharma_assembly_plaque(entry, index, start_date, end_date, event_name="", location=""):
    num = index + 1
    locations = parse_location(location if location else entry['Branch (Temple Name)'])
    plaque_type = parse_plaque_type(entry[f'Plaque #{num}'])

    sponsor = correct_sponsor(
        entry[f'Sponsor #{num}'],
        entry[f'Beneficiary #{num}'],
        entry[f'Plaque #{num}']
    )

    beneficiary = correct_beneficiary(
        entry[f'Beneficiary #{num}'],
        entry[f'Plaque #{num}']
    )

    start_datetime_obj = datetime.strptime(start_date, '%m/%d/%Y')
    end_datetime_obj = datetime.strptime(end_date, '%m/%d/%Y')

    submission_date = entry[f'Create Date']
    plaque_id = get_plaque_id(start_datetime_obj)

    if plaque_type == '' or plaque_type is None:
        return None

    if beneficiary == '' and sponsor == '':
        print(f'WARNING: Missing DA beneficiary/sponsor for index={index}', file=sys.stderr)
        dump_plaque(entry)
        return None

    return {
        'id': plaque_id,
        'beneficiary': beneficiary,
        'sponsor': sponsor,
        'type': plaque_type,
        'locations': locations,
        'requestDate': datetime_to_str(start_datetime_obj),
        'expiryDate': datetime_to_str(end_datetime_obj),
        'eventName': event_name,  # Permanent plaques are empty
        'searchable': True,
        'mediaUrl': '',
        'submission_date': submission_date
    }
