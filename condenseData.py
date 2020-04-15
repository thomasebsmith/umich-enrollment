#!/usr/bin/env python3

import json
import os
import re
import subprocess
import sys

def gather_data(directory):
  data = {}
  files = os.listdir(directory)
  for json_file_name in files:
    if not json_file_name.endswith(".json"):
      continue
    timestamp = json_file_name[:-len(".json")]
    json_file = open(os.path.join(directory, json_file_name), "r")
    data[timestamp] = json.load(json_file)
  return data

if len(sys.argv) != 2:
  print("Usage: " + sys.argv[0] + " <term>")
  sys.exit(1)

subprocess.run(["tar", "-xzf", "data.tar.gz"])

term = re.sub(r"[^a-z0-9_]", "", sys.argv[1])
directory = os.path.join("./data/", term)
class_dirs = os.scandir(directory)
output_data = {}
for class_dir in class_dirs:
  if class_dir.is_dir():
    output_data[class_dir.name] = gather_data(class_dir.path)

output_file = os.path.join("./docs/data/", term + ".json")
output_file = open(output_file, "w")
json.dump(output_data, output_file)

subprocess.run(["rm", "-rf", "data"])
