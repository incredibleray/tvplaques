#!/bin/bash
echo "Step 1: Sync data"
pushd plaqueGen > /dev/null
python3 readSheet.py > ../src/plaques.json
popd > /dev/null

echo "Step 2: Build optimized web package."
npm run build

echo "Step 3: Deploy build to website."
az storage azcopy blob upload -c "\$web" --account-name plaquetv -s "build/*" --recursive

echo "All done. Deployed to: "
echo "https://plaquetv.z5.web.core.windows.net/"

