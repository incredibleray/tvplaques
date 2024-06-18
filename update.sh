#!/bin/bash

echo "Step 1: Read new approved plaque requests"
/Users/dharmatreasury/py3venv/bin/python readPlaqueRequest.py

echo "Step 2: Generate and update plaques.json"
/Users/dharmatreasury/py3venv/bin/python genPlaquesManifest.py

echo "Last updated: $(date)"
