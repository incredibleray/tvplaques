import unittest
from datetime import datetime
from unittest.mock import patch, MagicMock

from importer.importerlib import (
    parse_location,
    parse_plaque_type,
    correct_beneficiary,
    correct_sponsor,
    get_relativedelta,
    parse_jotform_entry_expiry_date,
    parse_jotform_entry_request_date_obj,
    datetime_to_str,
    get_plaque_id,
    dump_json_file,
    dump_json_files,
    fetch_credentials,
    fetch_sheet,
    fetch_sheet_by_url,
    get_header_column_map,
    get_entries_as_maps,
    get_plaquetv_permanent_entries,
    get_current_dharma_assembly_plaques,
    get_dharma_assembly_plaques,
    get_jotform_request_entries,
    parse_jotform_plaques,
    get_jotform_submissions,
    get_plaquetv_jotform_entries,
    get_plaquetv_jotform_last_update,
    set_plaquetv_jotform_last_update,
    append_plaquetv_jotform_entry,
    dump_plaque,
    parse_jotform_entry_term,
    get_column,
    parse_jotform_plaque
)

class TestImporterlib(unittest.TestCase):

    def test_parse_location(self):
        self.assertEqual(parse_location('GF / DTT'), ['DTT', 'GF'])
        self.assertEqual(parse_location(' GF, DTT'), ['DTT', 'GF'])
        self.assertEqual(parse_location(' GF DTT'), ['DTT', 'GF'])
        self.assertEqual(parse_location('WMT'), ['WMT'])
        self.assertEqual(parse_location('none'), ['NONE'])
        self.assertEqual(parse_location(''), [])

    def test_parse_plaque_type(self):
        self.assertEqual(parse_plaque_type('mmb'), 'mmb')
        self.assertEqual(parse_plaque_type('w-mmb'), 'wmmb')
        self.assertEqual(parse_plaque_type('past creditors'), 'rebirth')
        self.assertEqual(parse_plaque_type('rebirth'), 'rebirth')
        self.assertEqual(parse_plaque_type('w-rebirth'), 'wrebirth')
        self.assertEqual(parse_plaque_type('ayw'), 'ayw')
        self.assertEqual(parse_plaque_type('as you wish'), 'ayw')
        self.assertEqual(parse_plaque_type('w-as you wish'), 'wayw')
        self.assertEqual(parse_plaque_type('49day'), '49day')
        self.assertEqual(parse_plaque_type('49 days'), '49day')
        self.assertEqual(parse_plaque_type('pre-arranged 49-days'), 'pre49')
        self.assertEqual(parse_plaque_type(''), '')
        self.assertEqual(parse_plaque_type('unknown'), '')

    def test_correct_beneficiary(self):
        self.assertEqual(correct_beneficiary('', 'past creditors'), 'Past Creditors')
        self.assertEqual(correct_beneficiary('', 'ancestors'), 'Ancestors')
        self.assertEqual(correct_beneficiary('John Doe', 'past creditors'), 'John Doe')
        self.assertEqual(correct_beneficiary('Jane Doe', 'ancestors'), 'Jane Doe')
        self.assertEqual(correct_beneficiary('', ''), '')

    def test_correct_sponsor(self):
        self.assertEqual(correct_sponsor('Sponsor', 'Beneficiary', 'some plaque'), 'Sponsor')
        self.assertEqual(correct_sponsor('Sponsor', 'Sponsor', 'some plaque'), '')
        self.assertEqual(correct_sponsor('Sponsor', 'Beneficiary', 'past creditors'), 'Sponsor')
        self.assertEqual(correct_sponsor('Sponsor', 'Beneficiary', 'ancestors'), 'Sponsor')
        self.assertEqual(correct_sponsor('Sponsor', 'Beneficiary', 'some plaque', 'Hide Sponsor on display'), '')

    def test_get_relativedelta(self):
        from dateutil.relativedelta import relativedelta
        self.assertEqual(get_relativedelta('one year'), relativedelta(years=1))
        self.assertEqual(get_relativedelta('one month'), relativedelta(months=1))
        self.assertEqual(get_relativedelta('two months'), relativedelta(months=2))
        self.assertEqual(get_relativedelta('three months'), relativedelta(months=3))
        self.assertEqual(get_relativedelta('four months'), relativedelta(months=4))
        self.assertEqual(get_relativedelta('five months'), relativedelta(months=5))
        self.assertEqual(get_relativedelta('six months'), relativedelta(months=6))
        self.assertEqual(get_relativedelta('seven months'), relativedelta(months=7))
        self.assertEqual(get_relativedelta('eight months'), relativedelta(months=8))
        self.assertEqual(get_relativedelta('nine months'), relativedelta(months=9))
        self.assertEqual(get_relativedelta('ten months'), relativedelta(months=10))
        self.assertEqual(get_relativedelta('eleven months'), relativedelta(months=11))
        self.assertEqual(get_relativedelta('twelve months'), relativedelta(months=12))
        self.assertEqual(get_relativedelta('monthly'), relativedelta(months=1))
        self.assertEqual(get_relativedelta('one week'), relativedelta(weeks=1))
        self.assertEqual(get_relativedelta('one day'), relativedelta(days=1))
        with self.assertRaises(ValueError):
            get_relativedelta('unsupported')

    @patch('importer.importerlib.parse_jotform_entry_request_date_obj')
    def test_parse_jotform_entry_expiry_date(self, mock_request_date):
        mock_request_date.return_value = datetime(2023, 1, 1)
        self.assertEqual(parse_jotform_entry_expiry_date({}, 'Permanent'), 'Permanent')
        self.assertEqual(parse_jotform_entry_expiry_date({}, 'one year'), '12/31/2023')
        self.assertEqual(parse_jotform_entry_expiry_date({}, 'one month'), '01/31/2023')
        self.assertEqual(parse_jotform_entry_expiry_date({}, 'one week'), '01/07/2023')
        self.assertEqual(parse_jotform_entry_expiry_date({}, 'one day'), '01/01/2023')

    def test_datetime_to_str(self):
        self.assertEqual(datetime_to_str(datetime(2023, 1, 15)), '01/15/2023')

    def test_get_plaque_id(self):
        # Resetting the global plaque IDs set for consistent testing
        from importer import importerlib
        importerlib._g_plaque_ids = set()
        
        request_date = datetime(2023, 8, 15)
        self.assertEqual(get_plaque_id(request_date, "permanent"), "202308000")
        self.assertEqual(get_plaque_id(request_date, "permanent"), "202308001")
        self.assertEqual(get_plaque_id(request_date, "one year"), "2023080000")
        self.assertEqual(get_plaque_id(request_date, "one year"), "2023080001")

    def test_parse_jotform_entry_request_date_obj(self):
        entry = {
            'Starting Date': '01-15-2023',
            'Submission Date': '2023-01-14 10:00:00'
        }
        self.assertEqual(parse_jotform_entry_request_date_obj(entry), datetime(2023, 1, 15))

        entry = {
            'Starting Date': '',
            'Submission Date': '2023-01-14 10:00:00'
        }
        self.assertEqual(parse_jotform_entry_request_date_obj(entry), datetime(2023, 1, 14))


if __name__ == '__main__':
    unittest.main()


class TestJsonDump(unittest.TestCase):

    @patch('builtins.open', new_callable=unittest.mock.mock_open, read_data='[{"key": "value1"}]')
    @patch('builtins.print')
    def test_dump_json_file(self, mock_print, mock_open):
        dump_json_file('dummy.json')
        mock_print.assert_any_call('{"key": "value1"}', end='')

    @patch('builtins.open', new_callable=unittest.mock.mock_open, read_data='[{"key": "value1"}, {"key": "value2"}]')
    @patch('builtins.print')
    def test_dump_json_file_multiple(self, mock_print, mock_open):
        dump_json_file('dummy.json')
        self.assertEqual(mock_print.call_count, 3)
        mock_print.assert_any_call(',')

    @patch('importer.importerlib.dump_json_file')
    def test_dump_json_files(self, mock_dump_json_file):
        dump_json_files(['file1.json', 'file2.json'])
        self.assertEqual(mock_dump_json_file.call_count, 2)

    @patch('importer.importerlib.dump_json_file', side_effect=Exception('test error'))
    def test_dump_json_files_with_error(self, mock_dump_json_file):
        # This test ensures that the except block is covered.
        dump_json_files(['file1.json'])
        self.assertEqual(mock_dump_json_file.call_count, 1)


@patch('importer.importerlib.Credentials')
@patch('importer.importerlib.InstalledAppFlow')
@patch('os.path.exists')
class TestFetchCredentials(unittest.TestCase):

    def test_fetch_credentials_token_exists(self, mock_exists, mock_flow, mock_creds):
        mock_exists.return_value = True
        mock_creds.from_authorized_user_file.return_value = MagicMock(valid=True)
        
        creds = fetch_credentials()
        
        self.assertTrue(creds.valid)

    def test_fetch_credentials_refresh_token(self, mock_exists, mock_flow, mock_creds):
        mock_exists.return_value = True
        creds_mock = MagicMock(
            valid=False, expired=True, refresh_token=True
        )
        creds_mock.to_json.return_value = '{"token": "refreshed"}'
        mock_creds.from_authorized_user_file.return_value = creds_mock
        
        with patch('builtins.open', new_callable=unittest.mock.mock_open) as mock_open:
            creds = fetch_credentials()
            self.assertTrue(creds.refresh.called)
            mock_open().write.assert_called_with('{"token": "refreshed"}')


    @patch('builtins.open', new_callable=unittest.mock.mock_open)
    def test_fetch_credentials_new_token(self, mock_open, mock_exists, mock_flow, mock_creds):
        mock_exists.return_value = False
        new_creds = MagicMock()
        new_creds.to_json.return_value = '{"token": "new"}'
        mock_flow.from_client_secrets_file.return_value.run_local_server.return_value = new_creds
        
        fetch_credentials()
        
        mock_open().write.assert_called_with('{"token": "new"}')


@patch('importer.importerlib.fetch_credentials')
@patch('importer.importerlib.build')
class TestFetchSheet(unittest.TestCase):

    def test_fetch_sheet(self, mock_build, mock_fetch_creds):
        mock_service = MagicMock()
        mock_build.return_value = mock_service
        mock_service.spreadsheets().values().get().execute.return_value = {
            'values': [['a', 'b'], ['c', 'd']]
        }
        
        values = fetch_sheet('sheet_id', 'range_name')
        
        self.assertEqual(values, [['a', 'b'], ['c', 'd']])

    def test_fetch_sheet_by_url(self, mock_build, mock_fetch_creds):
        mock_service = MagicMock()
        mock_build.return_value = mock_service
        mock_service.spreadsheets().get().execute.return_value = {
            'sheets': [{'properties': {'sheetId': 0, 'title': 'Sheet1'}}]
        }
        mock_service.spreadsheets().values().get().execute.return_value = {
            'values': [['a', 'b'], ['c', 'd']]
        }
        
        url = 'https://docs.google.com/spreadsheets/d/123/edit?gid=0'
        values = fetch_sheet_by_url(url)
        
        self.assertEqual(values, [['a', 'b'], ['c', 'd']])


class TestDataProcessing(unittest.TestCase):

    def test_get_header_column_map(self):
        data = [['col1', 'col2'], ['a', 'b']]
        col_map = get_header_column_map(data)
        self.assertEqual(col_map, {'col1': 0, 'col2': 1})

    def test_get_entries_as_maps(self):
        data = [['col1', 'col2'], ['a', 'b'], ['c', 'd']]
        entries = get_entries_as_maps(data)
        self.assertEqual(entries, [{'col1': 'a', 'col2': 'b'}, {'col1': 'c', 'col2': 'd'}])

    def test_parse_jotform_plaques_no_plaque_type(self):
        entry = {
            'Plaque Type': '',
            'Beneficiary Name': 'Beneficiary',
            'Sponsor Name': 'Sponsor',
            'Term': 'one year',
            'Submission Date': '2023-01-01 10:00:00',
            'Starting Date': '01-01-2023',
            'Which BLI temple': 'GF',
            'More options': ''
        }
        self.assertEqual(parse_jotform_plaques(entry), [])


@patch('importer.importerlib.fetch_sheet')
class TestGetPlaqueTVPermanentEntries(unittest.TestCase):

    def test_get_plaquetv_permanent_entries(self, mock_fetch_sheet):
        mock_fetch_sheet.return_value = [
            ['Plaque ID', 'Beneficiary', 'Sponsor', 'PlaqueTypeKey', 'Request Date', 'Expiration Date', 'Temple Location', 'Media Url'],
            ['1', 'Beneficiary1', 'Sponsor1', 'mmb', '01/01/2023', '01/01/2024', 'GF', '']
        ]
        
        entries = get_plaquetv_permanent_entries()
        
        self.assertEqual(len(entries), 1)
        self.assertEqual(entries[0]['id'], '1')
        self.assertEqual(entries[0]['beneficiary'], 'Beneficiary1')
        self.assertEqual(entries[0]['sponsor'], 'Sponsor1')
        self.assertEqual(entries[0]['type'], 'mmb')
        self.assertEqual(entries[0]['locations'], ['GF'])

    def test_get_plaquetv_permanent_entries_sponsor_equals_beneficiary(self, mock_fetch_sheet):
        mock_fetch_sheet.return_value = [
            ['Plaque ID', 'Beneficiary', 'Sponsor', 'PlaqueTypeKey', 'Request Date', 'Expiration Date', 'Temple Location', 'Media Url'],
            ['1', 'Beneficiary1', 'Beneficiary1', 'mmb', '01/01/2023', '01/01/2024', 'GF', '']
        ]
        
        entries = get_plaquetv_permanent_entries()
        
        self.assertEqual(len(entries), 1)
        self.assertEqual(entries[0]['sponsor'], '')

    def test_get_plaquetv_permanent_entries_empty_plaque_type(self, mock_fetch_sheet):
        mock_fetch_sheet.return_value = [
            ['Plaque ID', 'Beneficiary', 'Sponsor', 'PlaqueTypeKey', 'Request Date', 'Expiration Date', 'Temple Location', 'Media Url'],
            ['1', 'Beneficiary1', 'Sponsor1', '', '01/01/2023', '01/01/2024', 'GF', '']
        ]
        
        entries = get_plaquetv_permanent_entries()
        
        self.assertEqual(len(entries), 0)

    def test_get_plaquetv_permanent_entries_empty_index(self, mock_fetch_sheet):
        mock_fetch_sheet.return_value = [
            ['Plaque ID', 'Beneficiary', 'Sponsor', 'PlaqueTypeKey', 'Request Date', 'Expiration Date', 'Temple Location', 'Media Url'],
            ['', 'Beneficiary1', 'Sponsor1', 'mmb', '01/01/2023', '01/01/2024', 'GF', '']
        ]
        
        entries = get_plaquetv_permanent_entries()
        
        self.assertEqual(len(entries), 0)



@patch('importer.importerlib.fetch_sheet_by_url')
class TestGetDharmaAssemblyPlaques(unittest.TestCase):

    def test_get_dharma_assembly_plaques(self, mock_fetch_sheet_by_url):
        mock_fetch_sheet_by_url.return_value = [
            ['Branch (Temple Name)', 'Plaque #1', 'Sponsor #1', 'Beneficiary #1', 'Plaque #2', 'Sponsor #2', 'Beneficiary #2', 'Create Date'],
            ['GF', 'mmb', 'Sponsor1', 'Beneficiary1', 'w-mmb', 'Sponsor2', 'Beneficiary2', '01/01/2023']
        ]
        
        plaques = get_dharma_assembly_plaques('url', '01/01/2023', '01/31/2023', 'event', location='GF')
        
        self.assertEqual(len(plaques), 2)
        self.assertEqual(plaques[0]['type'], 'mmb')
        self.assertEqual(plaques[1]['type'], 'wmmb')

    def test_get_dharma_assembly_plaques_no_data(self, mock_fetch_sheet_by_url):
        mock_fetch_sheet_by_url.return_value = []
        plaques = get_dharma_assembly_plaques('url', '01/01/2023', '01/31/2023', 'event', location='GF')
        self.assertEqual(len(plaques), 0)

    def test_parse_dharma_assembly_plaque_sponsor_equals_beneficiary(self, mock_fetch_sheet_by_url):
        mock_fetch_sheet_by_url.return_value = [
            ['Branch (Temple Name)', 'Plaque #1', 'Sponsor #1', 'Beneficiary #1', 'Plaque #2', 'Sponsor #2', 'Beneficiary #2', 'Create Date'],
            ['GF', 'mmb', 'Sponsor1', 'Sponsor1', 'w-mmb', 'Sponsor2', 'Beneficiary2', '01/01/2023']
        ]
        
        plaques = get_dharma_assembly_plaques('url', '01/01/2023', '01/31/2023', 'event', location='GF')
        
        self.assertEqual(len(plaques), 2)
        self.assertEqual(plaques[0]['sponsor'], '')

    def test_parse_dharma_assembly_plaque(self, mock_fetch_sheet_by_url):
        mock_fetch_sheet_by_url.return_value = [
            ['Branch (Temple Name)', 'Plaque #1', 'Sponsor #1', 'Beneficiary #1', 'Plaque #2', 'Sponsor #2', 'Beneficiary #2', 'Create Date'],
            ['GF', 'mmb', 'Sponsor1', 'Beneficiary1', 'w-mmb', 'Sponsor2', 'Beneficiary2', '01/01/2023']
        ]
        
        plaques = get_dharma_assembly_plaques('url', '01/01/2023', '01/31/2023', 'event', location='GF')
        
        self.assertEqual(len(plaques), 2)
        self.assertEqual(plaques[0]['type'], 'mmb')
        self.assertEqual(plaques[0]['sponsor'], 'Sponsor1')
        self.assertEqual(plaques[0]['beneficiary'], 'Beneficiary1')
        self.assertEqual(plaques[0]['locations'], ['GF'])
        self.assertEqual(plaques[0]['requestDate'], '01/01/2023')
        self.assertEqual(plaques[0]['expiryDate'], '01/31/2023')
        self.assertEqual(plaques[0]['eventName'], 'event')

    @patch('importer.importerlib.get_dharma_assembly_plaques')
    def test_get_current_dharma_assembly_plaques(self, mock_get_dharma_assembly_plaques, mock_fetch_sheet_by_url):
        mock_fetch_sheet_by_url.return_value = [
            ['Checkbox', 'Event', 'Start Date', 'End Date', 'Temple', 'URL'],
            ['TRUE', 'Event1', '01/01/2023', '01/31/2023', 'GF', 'url1'],
            ['FALSE', 'Event2', '02/01/2023', '02/28/2023', 'DTT', 'url2']
        ]
        mock_get_dharma_assembly_plaques.return_value = [{'id': 1}]
        
        plaques = get_current_dharma_assembly_plaques()
        
        self.assertEqual(len(plaques), 1)
        mock_get_dharma_assembly_plaques.assert_called_once_with(
            'url1', '01/01/2023', '01/31/2023', 'Event1', location='GF', creds=None
        )


@patch('importer.importerlib.fetch_sheet')
class TestGetJotformRequestEntries(unittest.TestCase):

    def test_get_jotform_request_entries(self, mock_fetch_sheet):
        mock_fetch_sheet.return_value = [
            ['Submission Date', 'Plaque Type', 'Beneficiary Name', 'Sponsor Name', 'Term', 'Starting Date', 'More options', 'Which BLI temple'],
            ['2023-01-01 10:00:00', 'mmb', 'Beneficiary1', 'Sponsor1', 'one year', '01-01-2023', '', 'GF']
        ]
        
        entries = get_jotform_request_entries()
        
        self.assertEqual(len(entries), 1)
        self.assertEqual(entries[0]['type'], 'mmb')


@patch('importer.importerlib.get_jotform_api')
@patch('importer.importerlib.get_jotform_form')
class TestGetJotformSubmissions(unittest.TestCase):

    def test_get_jotform_submissions(self, mock_get_form, mock_get_api):
        mock_api = MagicMock()
        mock_get_api.return_value = mock_api
        mock_api.get_form_submissions.side_effect = [[{'id': 1}], []]
        
        submissions = list(get_jotform_submissions())
        
        self.assertEqual(len(submissions), 1)
        self.assertEqual(submissions[0][0]['id'], 1)

    def test_get_jotform_submissions_empty(self, mock_get_form, mock_get_api):
        mock_api = MagicMock()
        mock_get_api.return_value = mock_api
        mock_api.get_form_submissions.return_value = []
        
        submissions = list(get_jotform_submissions())
        
        self.assertEqual(len(submissions), 0)


@patch('importer.importerlib.fetch_credentials')
@patch('importer.importerlib.fetch_sheet')
class TestPlaqueTVJotform(unittest.TestCase):

    def test_get_plaquetv_jotform_entries(self, mock_fetch_sheet, mock_fetch_creds):
        mock_fetch_sheet.return_value = [
            ['Plaque ID', 'Beneficiary', 'Sponsor', 'PlaqueTypeKey', 'Request Date', 'Expiration Date', 'Temple Location', 'Media Url'],
            ['1', 'Beneficiary1', 'Sponsor1', 'mmb', '01/01/2023', '01/01/2024', 'GF', '']
        ]
        
        entries = get_plaquetv_jotform_entries()
        
        self.assertEqual(len(entries), 1)
        self.assertEqual(entries[0]['id'], '1')

    def test_get_plaquetv_jotform_last_update(self, mock_fetch_sheet, mock_fetch_creds):
        mock_fetch_sheet.return_value = [['last=2023-01-01 00:00:00']]
        
        last_update = get_plaquetv_jotform_last_update()
        
        self.assertEqual(last_update, '2023-01-01 00:00:00')

    @patch('importer.importerlib.build')
    def test_set_plaquetv_jotform_last_update(self, mock_build, mock_fetch_sheet, mock_fetch_creds):
        mock_service = MagicMock()
        mock_build.return_value = mock_service
        
        set_plaquetv_jotform_last_update('2023-01-02 00:00:00')
        
        mock_service.spreadsheets().values().update.assert_called_once()

    @patch('importer.importerlib.build')
    def test_append_plaquetv_jotform_entry(self, mock_build, mock_fetch_sheet, mock_fetch_creds):
        mock_service = MagicMock()
        mock_build.return_value = mock_service
        
        entries = [{'locations': ['GF'], 'sponsor': 'Sponsor', 'beneficiary': 'Beneficiary', 'requestDate': '01/01/2023', 'expiryDate': '01/01/2024', 'type': 'mmb', 'id': '1', 'mediaUrl': '', 'submission_date': '2023-01-01 00:00:00'}]
        append_plaquetv_jotform_entry(entries)
        
        mock_service.spreadsheets().values().append.assert_called_once()


class TestErrorCases(unittest.TestCase):

    def test_fetch_sheet_by_url_no_spreadsheet_id(self):
        with self.assertRaises(ValueError):
            fetch_sheet_by_url('https://docs.google.com/spreadsheets/d//edit?gid=0')

    def test_fetch_sheet_by_url_no_gid(self):
        with self.assertRaises(ValueError):
            fetch_sheet_by_url('https://docs.google.com/spreadsheets/d/123/edit')

    @patch('importer.importerlib.fetch_credentials')
    @patch('importer.importerlib.build')
    def test_fetch_sheet_by_url_path_based_id(self, mock_build, mock_fetch_creds):
        mock_service = MagicMock()
        mock_build.return_value = mock_service
        mock_service.spreadsheets().get().execute.return_value = {
            'sheets': [{'properties': {'sheetId': 0, 'title': 'Sheet1'}}]
        }
        mock_service.spreadsheets().values().get().execute.return_value = {
            'values': [['a', 'b'], ['c', 'd']]
        }
        
        url = 'https://docs.google.com/spreadsheets/d/12345/edit?gid=0'
        values = fetch_sheet_by_url(url)
        
        self.assertEqual(values, [['a', 'b'], ['c', 'd']])

    @patch('importer.importerlib.fetch_credentials')
    @patch('importer.importerlib.build')
    def test_fetch_sheet_by_url_no_sheet_found(self, mock_build, mock_fetch_creds):
        mock_service = MagicMock()
        mock_build.return_value = mock_service
        mock_service.spreadsheets().get().execute.return_value = {
            'sheets': [{'properties': {'sheetId': 1, 'title': 'Sheet1'}}]
        }
        
        url = 'https://docs.google.com/spreadsheets/d/123/edit?gid=0'
        with self.assertRaises(ValueError):
            fetch_sheet_by_url(url)

    @patch('importer.importerlib.build')
    def test_fetch_sheet_by_url_no_sheet_name(self, mock_build):
        mock_service = MagicMock()
        mock_build.return_value = mock_service
        mock_service.spreadsheets().get().execute.return_value = {
            'sheets': [{'properties': {'sheetId': 1, 'title': 'Sheet1'}}]
        }
        
        url = 'https://docs.google.com/spreadsheets/d/123/edit?gid=0'
        with self.assertRaises(ValueError):
            fetch_sheet_by_url(url)

    def test_dump_plaque(self):
        entry = {'key': 'value'}
        with patch('builtins.print') as mock_print:
            dump_plaque(entry)
            mock_print.assert_any_call('   key: value')

    def test_parse_jotform_entry_term(self):
        entry = {'Term': 'one year', 'Plaque Type': 'mmb'}
        self.assertEqual(parse_jotform_entry_term(entry, 0), 'one year')
        entry = {'Term': '', 'Plaque Type': '49 days'}
        self.assertEqual(parse_jotform_entry_term(entry, 0), 'Permanent')

    def test_get_column(self):
        row = ['a', 'b']
        self.assertEqual(get_column(row, 0), 'a')
        self.assertEqual(get_column(row, 2), '')

    def test_parse_jotform_plaque_do_not_display(self):
        entry = {
            'More options': 'Do Not Display',
            'Plaque Type': 'mmb',
            'Beneficiary Name': 'Beneficiary',
            'Sponsor Name': 'Sponsor',
            'Term': 'one year',
            'Submission Date': '2023-01-01 10:00:00',
            'Starting Date': '01-01-2023',
            'Which BLI temple': 'GF'
        }
        self.assertIsNone(parse_jotform_plaque(entry, 0))

    @patch('importer.importerlib.fetch_credentials')
    def test_fetch_sheet_by_url_with_key(self, mock_fetch_creds):
        with patch('importer.importerlib.build') as mock_build:
            mock_service = MagicMock()
            mock_build.return_value = mock_service
            mock_service.spreadsheets().get().execute.return_value = {
                'sheets': [{'properties': {'sheetId': 0, 'title': 'Sheet1'}}]
            }
            mock_service.spreadsheets().values().get().execute.return_value = {
                'values': [['a', 'b'], ['c', 'd']]
            }
            
            url = 'https://docs.google.com/spreadsheets/d/123/edit?key=456'
            values = fetch_sheet_by_url(url)
            
            self.assertEqual(values, [['a', 'b'], ['c', 'd']])


class TestMissingLines(unittest.TestCase):

    @patch('importer.importerlib.fetch_sheet')
    def test_get_plaquetv_permanent_entries_no_values(self, mock_fetch_sheet):
        mock_fetch_sheet.return_value = []
        entries = get_plaquetv_permanent_entries()
        self.assertEqual(entries, [])

    @patch('importer.importerlib.fetch_sheet')
    def test_get_jotform_request_entries_no_values(self, mock_fetch_sheet):
        mock_fetch_sheet.return_value = []
        entries = get_jotform_request_entries()
        self.assertEqual(entries, [])

    @patch('importer.importerlib.fetch_sheet')
    def test_get_plaquetv_jotform_entries_no_values(self, mock_fetch_sheet):
        mock_fetch_sheet.return_value = []
        entries = get_plaquetv_jotform_entries()
        self.assertEqual(entries, [])

    @patch('importer.importerlib.get_dharma_assembly_plaques')
    @patch('importer.importerlib.fetch_sheet_by_url')
    def test_get_current_dharma_assembly_plaques_enabled_missing_inputs(self, mock_fetch_sheet_by_url, mock_get_dharma_assembly_plaques):
        mock_fetch_sheet_by_url.return_value = [
            ['Checkbox', 'Event', 'Start Date', 'End Date', 'Temple', 'URL'],
            ['TRUE', 'Event1', '', '', 'GF', '']
        ]
        
        plaques = get_current_dharma_assembly_plaques()
        
        self.assertEqual(len(plaques), 0)
        mock_get_dharma_assembly_plaques.assert_not_called()

    def test_parse_jotform_plaque_missing_beneficiary_and_sponsor_with_date(self):
        entry = {
            'More options': '',
            'Plaque Type': 'mmb',
            'Beneficiary Name': '',
            'Sponsor Name': '',
            'Term': 'one year',
            'Submission Date': '2024-01-01 10:00:00',
            'Starting Date': '01-01-2024',
            'Which BLI temple': 'GF'
        }
        self.assertIsNone(parse_jotform_plaque(entry, 0))

    def test_parse_jotform_plaque_missing_term_with_date(self):
        entry = {
            'More options': '',
            'Plaque Type': 'mmb',
            'Beneficiary Name': 'Beneficiary',
            'Sponsor Name': 'Sponsor',
            'Term': '',
            'Submission Date': '2024-01-01 10:00:00',
            'Starting Date': '01-01-2024',
            'Which BLI temple': 'GF'
        }
        self.assertIsNone(parse_jotform_plaque(entry, 0))

    def test_parse_dharma_assembly_plaque_empty_plaque_type(self):
        from importer.importerlib import parse_dharma_assembly_plaque
        entry = {
            'Branch (Temple Name)': 'GF',
            'Plaque #1': '',
            'Sponsor #1': 'Sponsor',
            'Beneficiary #1': 'Beneficiary',
            'Create Date': '01/01/2023'
        }
        self.assertIsNone(parse_dharma_assembly_plaque(entry, 0, '01/01/2023', '01/31/2023'))

    def test_parse_dharma_assembly_plaque_missing_beneficiary_and_sponsor(self):
        from importer.importerlib import parse_dharma_assembly_plaque
        entry = {
            'Branch (Temple Name)': 'GF',
            'Plaque #1': 'mmb',
            'Sponsor #1': '',
            'Beneficiary #1': '',
            'Create Date': '01/01/2023'
        }
        self.assertIsNone(parse_dharma_assembly_plaque(entry, 0, '01/01/2023', '01/31/2023'))

    def test_parse_jotform_plaque_missing_beneficiary_and_sponsor(self):
        entry = {
            'More options': '',
            'Plaque Type': 'mmb',
            'Beneficiary Name': '',
            'Sponsor Name': '',
            'Term': 'one year',
            'Submission Date': '2023-01-01 10:00:00',
            'Starting Date': '01-01-2023',
            'Which BLI temple': 'GF'
        }
        self.assertIsNone(parse_jotform_plaque(entry, 0))

    def test_parse_jotform_plaque_missing_term(self):
        entry = {
            'More options': '',
            'Plaque Type': 'mmb',
            'Beneficiary Name': 'Beneficiary',
            'Sponsor Name': 'Sponsor',
            'Term': '',
            'Submission Date': '2023-01-01 10:00:00',
            'Starting Date': '01-01-2023',
            'Which BLI temple': 'GF'
        }
        self.assertIsNone(parse_jotform_plaque(entry, 0))

    def test_parse_jotform_plaque_content(self):
        entry = {
            'Plaque Type': 'mmb',
            'Beneficiary Name': 'Beneficiary',
            'Sponsor Name': 'Sponsor',
            'Term': 'one year',
            'Submission Date': '2023-01-01 10:00:00',
            'Starting Date': '01-01-2023',
            'Which BLI temple': 'GF',
            'More options': ''
        }
        plaque = parse_jotform_plaque(entry, 0)
        self.assertEqual(plaque['beneficiary'], 'Beneficiary')
        self.assertEqual(plaque['sponsor'], 'Sponsor')
        self.assertEqual(plaque['type'], 'mmb')
        self.assertEqual(plaque['locations'], ['GF'])
        self.assertEqual(plaque['requestDate'], '01/01/2023')
        self.assertEqual(plaque['expiryDate'], '12/31/2023')
