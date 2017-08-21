#!/bin/bash

# don't deploy without env variables
if [[ -z "${CLOUDANT_URL}" ]]; then
  echo "Environment variable CLOUDANT_URL is required"
  exit 1
fi

# deploy to OpenWhisk
wsk package update blockchain --param url "$CLOUDANT_URL"
wsk action update blockchain/bitcoin bitcoin.js

# run every minute
wsk trigger create every-minute --feed /whisk.system/alarms/alarm --param cron "* * * * *"
wsk rule update every-minute-rule every-minute blockchain/bitcoin
wsk rule enable every-minute-rule
