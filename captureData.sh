#!/bin/sh

term=""
term_id=""
filename="$(date -u '+%Y-%m-%dT%H:%M:%SZ').json"

while IFS= read -r class; do
  if [ "$term" = "" ]; then
    term="$class"
    term_id="$(echo "$term" | cut -d'_' -f3)"
  else
    sed "s/\\\$\\\$TERMID\\\$\\\$/$term_id/g" template.json > \
      captureData_temp.json
    sed -i '' "s/\\\$\\\$TERMARRAY\\\$\\\$/$term/g" captureData_temp.json
    sed -i '' "s/\\\$\\\$CLASS\\\$\\\$/$class/g" captureData_temp.json
    mkdir -p "./data/$term/$class/"
    python3 ./scraper/__main__.py captureData_temp.json > \
      "./data/$term/$class/$filename"
    sleep 0.5
  fi
done < term
rm -f captureData_temp.json
