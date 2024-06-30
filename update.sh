#!/bin/bash

SCRIPTPATH=$(dirname $(realpath "$0"))
AZ_ACCOUNT="plaquetv"

# For testing:
#
# AZ_ACCOUNT="plaquetvalpha"

pushd "${SCRIPTPATH}"

echo "--- Fetching plaques..."
python3 importer/readSheet.py > plaques.json

echo "--- Syncing JOTFORM data"
python3 importer/syncSheet.py

echo "--- Copying plaque data to tv..."
az storage azcopy blob upload -c "\$web" --account-name ${AZ_ACCOUNT} -s plaques.json

popd
echo "--- Last updated: $(date)"
