# U-M Enrollment Statistics
This repository contains utilities to collect data about U-M enrollment
in some classes during a given term.

It also contains data about undergraduate EECS enrollment for Fall 2020.

## Viewing the Data
To view the collected data, visit
[this site](https://thomasebsmith.github.io/umich-enrollment/).
Note that the data was last updated on 4/15/20.

## Capturing Data
First, ensure that `term` contains the correct term and classes for which to
capture data. Then run
```sh
$ ./captureData.sh     # will require you to respond "y" to a prompt
$ ./condenseData.py
```
