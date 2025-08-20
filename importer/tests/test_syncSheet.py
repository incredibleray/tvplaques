import unittest
from unittest.mock import patch, MagicMock
from datetime import datetime

from importer import syncSheet

class TestSyncSheet(unittest.TestCase):

    def test_parse_date(self):
        self.assertEqual(syncSheet.parse_date('2023-01-01 00:00:00'), datetime(2023, 1, 1))

    @patch('importer.syncSheet.fetch_credentials')
    @patch('importer.syncSheet.get_plaquetv_jotform_last_update')
    @patch('importer.syncSheet.get_jotform_request_entries')
    @patch('importer.syncSheet.append_plaquetv_jotform_entry')
    @patch('importer.syncSheet.set_plaquetv_jotform_last_update')
    def test_main_with_new_entries(self, mock_set_last_update, mock_append_entry, mock_get_entries, mock_get_last_update, mock_fetch_creds):
        # Mock the credentials
        mock_fetch_creds.return_value = 'dummy_credentials'
        
        # Mock the last update date
        mock_get_last_update.return_value = '2023-01-01 00:00:00'
        
        # Mock the Jotform entries
        mock_get_entries.return_value = [
            {'submission_date': '2023-01-02 00:00:00', 'id': 1},
            {'submission_date': '2023-01-03 00:00:00', 'id': 2},
        ]
        
        syncSheet.main([])
        
        # Check that the new entries are appended
        mock_append_entry.assert_called_once()
        # Check that the last update date is set to the latest entry
        mock_set_last_update.assert_called_with('2023-01-03 00:00:00')

    @patch('importer.syncSheet.fetch_credentials')
    @patch('importer.syncSheet.get_plaquetv_jotform_last_update')
    @patch('importer.syncSheet.get_jotform_request_entries')
    @patch('importer.syncSheet.append_plaquetv_jotform_entry')
    @patch('importer.syncSheet.set_plaquetv_jotform_last_update')
    def test_main_with_no_new_entries(self, mock_set_last_update, mock_append_entry, mock_get_entries, mock_get_last_update, mock_fetch_creds):
        # Mock the credentials
        mock_fetch_creds.return_value = 'dummy_credentials'
        
        # Mock the last update date
        mock_get_last_update.return_value = '2023-01-04 00:00:00'
        
        # Mock the Jotform entries
        mock_get_entries.return_value = [
            {'submission_date': '2023-01-02 00:00:00', 'id': 1},
            {'submission_date': '2023-01-03 00:00:00', 'id': 2},
        ]
        
        syncSheet.main([])
        
        # Check that no entries are appended
        mock_append_entry.assert_not_called()
        # Check that the last update date is not changed
        mock_set_last_update.assert_not_called()

if __name__ == '__main__':
    unittest.main()
