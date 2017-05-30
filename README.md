# ampscript-beautifier
Make AMPscript beautiful again!

This Brackets extension reformats existing AMPscript (from Salesforce.com Marketing Cloud/ExactTarget) for better readability.

From this:

```html
%%[
/* 4th level nested IF statement */

IF @sk == "" AND @Debug != "" THEN
IF @Version == "PROD" THEN
SET @sk="00390000028vpjeAAA"
IF @Test1 == "Test1" THEN
SET @Test1 == "PASS"
IF @Test2 == "Test2" THEN
SET @Test2 == "PASS"
ENDIF
ENDIF
SET @email = "test@test.com"
SET @Job_ID = "2336090"
SET @List_ID = "43"
ELSEIF @Version == "PROD" THEN
SET @sk="003p000000Fnl4JAAR"
SET @email = "test@test.com"
SET @Job_ID = "2343525"
SET @List_ID = "43"
ENDIF
ENDIF
]%%
```

To this:

```html
%%[
/* 4th level nested IF statement */

IF @sk == " " AND @Debug != " " THEN
	IF @Version == "PROD" THEN
		SET @sk= "00390000028vpjeAAA" 
		IF @Test1 == "Test1" THEN
			SET @Test1 == "PASS" 
			IF @Test2 == "Test2" THEN
				SET @Test2 == "PASS" 
			ENDIF
		ENDIF
		SET @email = "test@test.com" 
		SET @Job_ID = "2336090" 
		SET @List_ID = "43" 
	ELSEIF @Version == "PROD" THEN
		SET @sk= "003p000000Fnl4JAAR" 
		SET @email = "test@test.com" 
		SET @Job_ID = "2343525" 
		SET @List_ID = "43" 
	ENDIF
ENDIF
]%%
```


# Installation

Download Brackets here: http://brackets.io/

You may download and install this extension in one of three ways. Using Extension Manager to find it through the extension registry you always find the latest stable release conveniently within Brackets.

You can also get the latest work-in-progress version by downloading or installing the extension directly from the repository. This allows you to try new features that might not have been tested properly yet.

## Install using Extension Manager
- Open the the Extension Manager from the File menu.
- Click the Available tab in upper left corner.
- Find *AMPscript Beautifier* in list of extensions (use the search field to filter the list).
- Click Install
- Install from URL

## Open the the Extension Manager from the File menu.
- Click on Install from URL...
- Copy and paste following URL in the text field: https://github.com/ccarswell/ampscript-beautifier/
- Click Install
- Install from file system

## Download this extension using the ZIP button and unzip it.
- Copy it in Brackets' /extensions/user folder by selecting Show Extension Folder in the Help menu
- Reload Brackets

## Run
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
