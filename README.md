# ampscript-beautifier
Make AMPscript beautiful again!

This <a href="http://www.brackets.io">Brackets<a/> extension reformats <a href="https://help.marketingcloud.com/en/documentation/ampscript/">AMPscript</a> (from Salesforce.com Marketing Cloud/ExactTarget) for enhanced readability.

From this:

```html
%%[
/* 4th level nested IF statement */

if @sk == "" AND @Debug != "" then
if @Version == "PROD" then
set @sk="00390000028vpjeAAA"
if @Test1 == "Test1" then
set @Test1 == "PASS"
if @Test2 == "Test2" then
set @Test2 == "PASS"
endif
endif
set @email = "test@test.com"
set @Job_ID = "2336090"
set @List_ID = "43"
elseif @Version == "PROD" then
set @sk="003p000000Fnl4JAAR"
set @email = "test@test.com"
set @Job_ID = "2343525"
set @List_ID = "43"
endif
endif
]%%
```

To this:

```html
%%[
/* 4th level nested IF statement */

IF @sk == "" AND @Debug != "" THEN
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

# Features
- Indents IF statements correctly (including nested IF statements)
- Uppercases all controls and functions (IF, THEN, DO, UPSERTDATA etc.)
- Standardized indenting by removing excessive whitespace (fixes bad user formatting)
- Standardized string formatting
- Standardized function formatting
- Formatting can be applied to whole code or selected code only

# Installation

Download Brackets here: http://brackets.io/

You may download and install this extension in one of three ways. Using Extension Manager to find it through the extension registry you always find the latest stable release conveniently within Brackets.

You can also get the latest work-in-progress version by downloading or installing the extension directly from the repository. This allows you to try new features that might not have been tested properly yet.

## Install using Extension Manager (Recommended - Stable Release)
- Open the the Extension Manager from the File menu.
- Click the Available tab in upper left corner.
- Find *AMPscript Beautifier* in list of extensions (use the search field to filter the list).
- Click Install

## Install from URL
- Open the the Extension Manager from the File menu
- Click on Install from URL...
- Copy and paste following URL in the text field: https://github.com/ccarswell/ampscript-beautifier/
- Click Install

## Install from file system (latest version)
- Download this extension using the ZIP button and unzip it 
- Copy it in Brackets' /extensions/user folder by selecting Show Extension Folder in the Help menu
- Reload Brackets

# Running
- Run by pressing Ctrl+Shift+A or by going to Edit > AMPscript Beautifier

## Todo
- Improved error reporting (currently just errors to Brackets Console)
- Integration with HTML

## Bugs
- Doesn't play well with other HTML just yet.  If errors are occuring (or nothing happens), please select AMPscript block code only.
- Double check all CONCAT strings after running - whitespace is automatically trimmed within double quotes.

## Resources
- Parser generated using https://pegjs.org/
