#!/bin/bash
echo "Step 1: Sync data"
# pushd plaqueGen > /dev/null
python3 importer/readSheet.py > public/plaques.json
# popd > /dev/null

echo "Step 2: Build optimized web package."
npm run build

echo "Step 3: Deploy build to website."
az storage azcopy blob upload -c "\$web" --account-name plaquetv -s "build/*" --recursive
#az storage azcopy blob upload -c "\$web" --account-name plaquetvalpha -s "build/*" --recursive

echo "All done. Deployed to: "
echo "https://plaquetv.z5.web.core.windows.net/"

