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
- Standardizes indenting by removing excessive whitespace
- Stanardized strings formatting


## Todo
- Standardized function formatting
- Improved error reporting (currently just errors to Brackets Console)

## Bugs
- Doesn't play well with other HTML just yet, use separately without HTML included

## Resources
- Parser generated using https://pegjs.org/
