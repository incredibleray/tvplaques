import unittest
from unittest.mock import patch, MagicMock
import json
import io
import sys

from googleapiclient.errors import HttpError
from importer import readSheet

@patch('importer.readSheet.dump_json_files')
@patch('importer.readSheet.get_current_dharma_assembly_plaques')
@patch('importer.readSheet.get_plaquetv_permanent_entries')
@patch('importer.readSheet.get_plaquetv_jotform_entries')
@patch('importer.readSheet.fetch_credentials')
class TestReadSheet(unittest.TestCase):

    def setUp(self):
        readSheet.g_entry_count = 0
        self.captured_output = io.StringIO()
        sys.stdout = self.captured_output

    def tearDown(self):
        sys.stdout = sys.__stdout__

    def _get_json_output(self):
        output = self.captured_output.getvalue()
        # The output is a series of JSON objects, separated by commas, and wrapped in brackets.
        # To parse it, we need to ensure it's a valid JSON array.
        if output.strip() == '[]':
            return []
        return json.loads(output)

    def test_main(self, mock_fetch_creds, mock_get_jotform, mock_get_permanent, mock_get_dharma, mock_dump_json_files):
        mock_fetch_creds.return_value = 'dummy_credentials'
        mock_get_jotform.return_value = [{'id': 1, 'source': 'jotform'}]
        mock_get_permanent.return_value = [{'id': 2, 'source': 'permanent'}]
        mock_get_dharma.return_value = [{'id': 3, 'source': 'dharma'}]
        
        readSheet.main([])
        
        data = self._get_json_output()
        
        self.assertIn({'id': 1, 'source': 'jotform'}, data)
        self.assertIn({'id': 2, 'source': 'permanent'}, data)
        self.assertIn({'id': 3, 'source': 'dharma'}, data)
        
        mock_get_jotform.assert_called_with(creds='dummy_credentials')
        mock_get_permanent.assert_called_with(creds='dummy_credentials')
        mock_get_dharma.assert_called_with(creds='dummy_credentials')
        mock_dump_json_files.assert_not_called()

    def test_main_with_args(self, mock_fetch_creds, mock_get_jotform, mock_get_permanent, mock_get_dharma, mock_dump_json_files):
        mock_get_jotform.return_value = []
        mock_get_permanent.return_value = []
        mock_get_dharma.return_value = []
        
        readSheet.main(['file1.json', 'file2.json'])
        
        mock_dump_json_files.assert_called_with(['file1.json', 'file2.json'])

    def test_main_permanent_http_error(self, mock_fetch_creds, mock_get_jotform, mock_get_permanent, mock_get_dharma, mock_dump_json_files):
        mock_get_jotform.return_value = [{'id': 1, 'source': 'jotform'}]
        mock_get_permanent.side_effect = HttpError(MagicMock(status=500), b'error content')
        mock_get_dharma.return_value = [{'id': 3, 'source': 'dharma'}]
        
        readSheet.main([])
        
        data = self._get_json_output()
        
        self.assertIn({'id': 1, 'source': 'jotform'}, data)
        self.assertNotIn({'id': 2, 'source': 'permanent'}, data)
        self.assertIn({'id': 3, 'source': 'dharma'}, data)

    def test_main_dharma_http_error(self, mock_fetch_creds, mock_get_jotform, mock_get_permanent, mock_get_dharma, mock_dump_json_files):
        mock_get_jotform.return_value = [{'id': 1, 'source': 'jotform'}]
        mock_get_permanent.return_value = [{'id': 2, 'source': 'permanent'}]
        mock_get_dharma.side_effect = HttpError(MagicMock(status=500), b'error content')
        
        readSheet.main([])
        
        data = self._get_json_output()
        
        self.assertIn({'id': 1, 'source': 'jotform'}, data)
        self.assertIn({'id': 2, 'source': 'permanent'}, data)
        self.assertNotIn({'id': 3, 'source': 'dharma'}, data)

if __name__ == '__main__':
    unittest.main()
