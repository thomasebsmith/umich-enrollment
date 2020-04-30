# U-M Enrollment Statistics
This repository contains utilities to collect data about U-M enrollment
in some classes during a given term.

It also contains data about undergraduate EECS enrollment for Fall 2020.

## Viewing the Data
To view the collected data, visit
[this site](https://thomasebsmith.github.io/umich-enrollment/).
Note that the data was last updated on 4/27/20.

## Capturing Data
First, ensure that `term` contains the correct term and classes for which to
capture data. Then run
```sh
$ ./captureData.sh     # will require you to respond "y" to a prompt
$ ./condenseData.py
```

## `term` Format
The `term` file should be formatted as follows:
```
<term with ID>
<class to capture #1>
<class to capture #2>
...
```

For example, `<term with ID>` could be `f_20_2310`, and
`<class to capture #1>` could be `EECS183001`.

Note that both of these IDs can be found by searching for a class on the
course catalog and examining the resulting URL for the class.
