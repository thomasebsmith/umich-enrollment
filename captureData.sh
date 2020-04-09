#!/bin/sh

term=""
term_id=""
filename="$(date -u '+%Y-%m-%dT%H:%M:%SZ').json"

if [ -f data.tar.gz ]; then
  tar -xzf data.tar.gz
fi

progress=0
total_number="$(wc -l < term | xargs)"
total_number="$(($total_number - 1))" # Since the first line is the term ID
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

one_class=""

while IFS= read -r class; do
  if [ "$term" = "" ]; then
    term="$class"
    term_id="$(echo "$term" | cut -d'_' -f3)"
  else
    one_class="$class"
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

update_progress
printf '\n'

# Prompt user to check that this at least sort of worked
echo 'Example file:'
cat "./data/$term/$one_class/$filename"
read -p "Continue? [n]" choice
case "$choice" in
  y|Y ) echo "Continuing...";;
  *   ) echo "Exiting. Note that cleanup may be required."; exit 1;;
esac

rm -f captureData_temp.json

tar -czf data.tar.gz data/
rm -rf data
