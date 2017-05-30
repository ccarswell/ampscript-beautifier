# ampscript-beautifier
Make AMPscript beautiful again!

This Brackets extension reformats existing AMPscript (from Salesforce.com Marketing Cloud/ExactTarget) for better readability.

# Installation
- Download Brackets here: http://brackets.io/
- Install Extension using this Git repository https://github.com/ccarswell/ampscript-beautifier/
- Run by pressing Ctrl+Shift+A or by going to Edit > AMPscript Beautifier

## Features

- Indents IF statements correctly (including nested IF statements)
- Uppercases all controls and functions (IF, THEN, DO, UPSERTDATA etc.)
- Standardized indenting by removing excessive whitespace (fixes bad user formatting)
- Standardized string formatting
- Standardized function formatting
- Formatting can be applied to either all code or selected code

## Todo

- Improved error reporting (currently just errors to Brackets Console)
- Integration with HTML

## Bugs
- Doesn't play well with other HTML just yet.  If errors are occuring (or nothing happens), please select AMPscript block code only.

## Resources
- Parser generated using https://pegjs.org/
