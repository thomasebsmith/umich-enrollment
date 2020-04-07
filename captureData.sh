#!/bin/sh

term=""
term_id=""
filename="$(date -u '+%Y-%m-%dT%H:%M:%SZ').json"

if [ -f data.tar.gz ]; then
  tar -xzf data.tar.gz
fi

progress=0
total_number="$(wc -l < term | xargs)"
term_cols="$(tput cols)"
avail_cols="$(($term_cols - 2))"

update_progress () {
  chars_to_fill="$(($progress * $avail_cols / $total_number))"
  printf '['
  i=0
  while [ "$i" -lt "$chars_to_fill" ]; do
    printf '='
    i="$(($i + 1))"
  done
  while [ "$i" -lt "$avail_cols" ]; do
    printf ' '
    i="$(($i + 1))"
  done
  printf ']\r'
  progress="$(($progress + 1))"
}

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
    update_progress
    sleep 0.5
  fi
done < term
rm -f captureData_temp.json

tar -czf data.tar.gz data/
rm -rf data

update_progress
printf '\n'
