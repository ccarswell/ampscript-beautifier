define(function (require) {
	'use strict';
	var PREFIX = 'carswell.ampscriptify';
	var COMMAND_ID = PREFIX + '.ampscriptify';
	var COMMAND_PARSE_ID = PREFIX + '.parse';
	var COMMAND_PARSE_ID_DEBUG = PREFIX + '.parsedebug';
	var debugMenu = false;

	/* beautify preserve:start */
	var AppInit            = brackets.getModule('utils/AppInit');
    var CommandManager     = brackets.getModule('command/CommandManager');
    var Editor             = brackets.getModule('editor/Editor').Editor;
    var EditorManager      = brackets.getModule('editor/EditorManager');
    var Menus              = brackets.getModule('command/Menus');
    var DocumentManager    = brackets.getModule('document/DocumentManager');
	/* beautify preserve:end */
	
	//NOTE: Loading the PegJS Parser as a module
	var pegParserJS = require('thirdparty/parser')
	
	function startCommandNormal() {
		ampscriptify(false)
	}

	function startCommandDebug() {
		ampscriptify(true)
	}

	//NOTE: Retrieving Text
	function ampscriptify(debug) {

		function convertArrToJSON(arr) {
			var JSONObj = []
			for (var i = 0; i < arr.length; i++) {
				var obj = {}
				obj["Id"] = i
				obj["Text"] = arr[i]
				obj["Indent"] = 0
				obj["LineBreak"] = 0
				obj["String"] = false
				obj["StringStart"] = false
				obj["StringEnd"] = false
				JSONObj.push(obj)
			}
			return (JSONObj)
		}

		var editor = EditorManager.getCurrentFullEditor();
		var unformattedText
		var toParse
		
		if (editor.hasSelection()) {
			unformattedText = editor.getSelectedText();
			var range = editor.getSelection();
			toParse = unformattedText
		} else {
			unformattedText = DocumentManager.getCurrentDocument();
			toParse = unformattedText.getText();
		}

		var parsed = pegParserJS.parse(toParse); //NOTE: Running the module .parse method and passing through the unformatted text
		var formattedText = parsed.parse; //NOTE: Parsed into array items
		var json = convertArrToJSON(formattedText)
		var newformat = reformatter(json, debug)

		//NOTE: Updating the window with the formatted text
		var editor = EditorManager.getCurrentFullEditor();

		if (newformat !== toParse) {
			if (range) {
				batchUpdate(newformat, range)
			} else {
				batchUpdate(newformat, editor.hasSelection());
			}
		}
	}

	function reformatter(json, debug) {

		//NOTE: Determines whether we are parsing a string and assigned it a property of ["String"] = true if so
		function stringProperty(json) {

			for (var i = 0; i < json.length; i++) {
				if (json[i]["Text"] === "\"") {

					if (json[i + 1]["Text"] === "\"") { //NOTE: double quotes right after each other like ""

						json[i]["String"] = true
						json[i + 1]["String"] = true
						json[i]["StringStart"] = true
						json[i + 1]["StringEnd"] = true						
						

					} else if (json[i + 1]["Text"] !== "\"" && json[i]["String"] !== true) {

						//NOTE: Slice array to only get from here until the end
						var arraySlice = json.slice(i + 1)

						//NOTE: Now that we have a smaller array, lets search through it
						function findEnd(arrayItem) {
							return (arrayItem["Text"] === "\"")
						}
						//NOTE: Finding the index of where the string stops
						var endIndex = arraySlice.findIndex(findEnd)

						var startString = i;
						var endString = i + 1 + endIndex;
						var deltaString = endString - startString + 1

						//NOTE: Assigning properties for parsing later
						json[i]["StringStart"] = true
						json[endString]["StringEnd"] = true

						while (deltaString !== 0) {

							json[i - 1 + deltaString]["String"] = true //from " until " 
							deltaString--;
						}
					}
				}
			}
			return (json)
		}

		//NOTE: Changes the indent property of each json object but doesn't apply the formatting yet
		function dabber(json) {

			var nestLevel = 0;
			var commentStartIndex;
			var commentEndIndex;

			for (var i = 0; i < json.length; i++) {

				//NOTE: Ignoring comments
				if (json[i]["Text"] === "/*") {
					commentStartIndex = i
					commentEndIndex = 0 //NOTE: Once the start has been found, restart the commentEndIndex
				} else if (json[i]["Text"] === "*/") {
					commentEndIndex = i
					commentStartIndex = 0 //NOTE: Once the end has been found, restart the commentStartIndex
				} else if (commentStartIndex < i && commentEndIndex === 0) {
					//NOTE: Don't format the comment text
				} else {
					//NOTE: Perform the rest of the formatting
					var item = json[i]["Text"].toLowerCase();

					if (item === "then" && json[i]["String"] === false) {
						nestLevel++; //NOTE: Permanently go up a level
					}

					//NOTE: Increase nestLevel if function ( and linebreak is found
					if (json[i]["Text"] === "(" && json[i + 1]["Text"] === "@@LINEBREAK" && json[i]["String"] === false) {
						nestLevel++; //NOTE: Permanently go up a level
						var inFunction = true
					}

					if (nestLevel > 0) {

						if (json[i]["Text"] === "@@LINEBREAK") {

							//NOTE: Stripping indents recursively
							if (json[i + 1]["Text"] === "@@INDENT") {

								//NOTE: Slice array to only get from here until the end
								var arraySlice = json.slice(i + 1)

								//NOTE: Now that we have a smaller array, lets search through it to find the end
								function findEnd(arrayItem) {
									return (arrayItem["Text"] !== "@@INDENT")
								}

								//NOTE: Finding the index of where the indentation stops
								var endIndex = arraySlice.findIndex(findEnd)

								var startIndent = i + 1;
								var endIndent = i + 1 + endIndex;
								var deltaIndent = endIndent - startIndent

								while (deltaIndent >= 1) {

									json.splice(i + deltaIndent, 1)
									deltaIndent--;
								}
							}

							json[i + 1]["Indent"] = nestLevel //NOTE: Next lines are set to current nestLevel

						}

						//NOTE: End of function
						if (json[i]["Text"] === ")" && inFunction === true) {
							json[i]["Indent"] = nestLevel - 1 //NOTE: Closing ")" has same indent as original opening "("
							nestLevel--; //NOTE: Permanently go down a level
							inFunction = false

						}

						if (item === "else" || item === "elseif" || item === "endif") {
							json[i]["Indent"] = nestLevel - 1 //NOTE: Temporarily go back one
							if (item === "endif" || item === "elseif") {
								nestLevel--; //NOTE: Permanently go back one
							}
						}
					}
				}
			}

			return (json)
		}

		//NOTE: Ignores comments and runs the rest of the formatting
		function ignoreComments(json) {

			function lineBreaker(arrayItem) {

				if (arrayItem === "@@LINEBREAK") {
					arrayItem = "\n"
				}
				return (arrayItem)
			}

			function indenter(arrayItem) {

				if (arrayItem === "@@INDENT") {
					arrayItem = "\t"
				}
				return (arrayItem)
			}

			//NOTE: Function formatting
			function upperCaser(arrayItem) {

				var arrayItemLower = arrayItem.toLowerCase()
				
				var controlsArray = ["for", "do", "downto", "to", "if", "else", "elseif", "endif", "then", "next", "and", "or"]

				for (var x = 0; x < controlsArray.length; x++) {
					if (arrayItemLower === controlsArray[x].toLowerCase()) {
						return (arrayItemLower.toUpperCase())
					}
				}

				var functionArray = ["Add", "AddMscrmListMember", "AddObjectArrayItem", "AttachFile", "AttributeValue", "AuthenticatedEmployeeID", "AuthenticatedEmployeeNotificationAddress", "AuthenticatedEmployeeUserName", "AuthenticatedEnterpriseID", "AuthenticatedMemberID", "AuthenticatedMemberName", "BarCodeURL", "Base64Decode", "Base64Encode", "BeginImpressionRegion", "BuildOptionList", "BuildRowSetFromString", "BuildRowSetFromXML", "Char", "ClaimRow", "ClaimRowValue", "Concat", "ContentArea", "ContentAreaByName", "CreateMscrmRecord", "CreateObject", "CreateSalesforceObject", "DateAdd", "DateDiff", "DateParse", "DatePart", "DecryptSymmetric", "DeleteData", "DeleteDE", "DescribeMscrmEntities", "DescribeMscrmEntityAttributes", "DirectTwitterMessage", "Divide", "Domain", "Empty", "EncryptSymmetric", "EndImpressionRegion", "ExecuteFilter", "ExecuteFilterOrderedRows", "Field", "Format", "GetPortfolioItem", "GetPublishedSocialContent", "GetSocialPublishURL", "GetSocialPublishURLByName", "GUID", "HTTPGet", "HTTPRequestHeader", "IIf", "Image", "IndexOf", "InsertData", "InsertDE", "InvokeCreate", "InvokeDelete", "InvokeExecute", "InvokePerform", "InvokeRetrieve", "InvokeUpdate", "IsEmailAddress", "IsNull", "IsNullDefault", "IsPhoneNumber", "Length", "LiveContentMicrositeURL", "LocalDateToSystemDate", "LongSFID", "Lookup", "LookupOrderedRows", "LookupOrderedRowsCS", "LookupRows", "LookupRowsCS", "Lowercase", "MD5", "Mod", "Multiply", "Now", "Output", "OutputLine", "ProperCase", "QueryParameter", "RaiseError", "Random", "Redirect", "RedirectTo", "RegExMatch", "Replace", "ReplaceList", "RequestParameter", "RetrieveMscrmRecords", "RetrieveMscrmRecordsFetchXML", "RetrieveSalesforceJobSources", "RetrieveSalesforceObjects", "Row", "RowCount", "Set", "SetObjectProperty", "SetSmsConversationNextKeyword", "SetStateMscrmRecord", "SHA256", "SHA512", "StringToDate", "StringToHex", "Substring", "Subtract", "SystemDateToLocalDate", "TransformXML", "TreatAsContent", "TreatAsContentArea", "Trim", "UpdateData", "UpdateDE", "UpdateMscrmRecords", "UpdateSingleSalesforceObject", "UpdateTwitterStatus", "UpdateTwitterStatusByJob", "Uppercase", "UpsertContacts", "UpsertData", "UpsertDE", "UpsertMscrmRecord", "URLEncode", "V", "WAT", "WATP", "WrapLongURL"]

				for (var y = 0; y < functionArray.length; y++) {
					if (arrayItemLower === functionArray[y].toLowerCase()) {
						return (arrayItemLower.toUpperCase())
					}
				}

				return (arrayItem)
			}

			function variableFormatter(arrayItem) {
				if (arrayItem["Text"].toLowerCase() === "set" && arrayItem["Indent"] === 0) {
					arrayItem["LineBreak"] = 0 //FUTURE: Potentially add new line before variable is set

					return (arrayItem["LineBreak"])

				} else {
					//NOTE: do nothing
					return (arrayItem["LineBreak"])
				}
			}

			function scriptBlockFormat(arrayItem, nextItem, previousItem) {

				if (arrayItem["Text"] === "%%[" && nextItem["Text"] != "@@LINEBREAK") { //NOTE: Don't add a new line if one is already coming
					arrayItem["LineBreak"] = 1 //NOTE: Adds new line after start of script tag
					return (arrayItem["LineBreak"])

				} else if (arrayItem["Text"] === "]%%" && previousItem["Text"] != "\n") { //NOTE: Don't add a new line if there was just a newline
					arrayItem["LineBreak"] = -1 //NOTE: Adds new line before end of script tag
					return (arrayItem)["LineBreak"]
				} else {
					//NOTE: Do nothing
					return (arrayItem["LineBreak"])
				}
			}

			function ifStatementFormatter(arrayItem, nextItem, previousItem) {
				if ((arrayItem["Text"].toLowerCase() === "if" || arrayItem["Text"].toLowerCase() === "elseif" || arrayItem["Text"].toLowerCase() === "else") && arrayItem["Text"] != "\n" && previousItem["Text"] != "\n" && previousItem["Text"] != "\t") {
					arrayItem["LineBreak"] = -1 //NOTE: Add single new line before IF statements
					return (arrayItem["LineBreak"])
				} else if (arrayItem["Text"].toLowerCase() === "endif" && arrayItem["Text"] != "\n" && previousItem["Text"] != "\n" && previousItem["Text"] != "\t") {
//					arrayItem["LineBreak"] = 0 //FUTURE: Potentially add single new line before ENDIF statements
					return (arrayItem["LineBreak"])
				} else if ((arrayItem["Text"].toLowerCase() === "endif" || arrayItem["Text"].toLowerCase() === "then") && arrayItem["Text"] != "\n" && nextItem["Text"] != "@@LINEBREAK") {
//					arrayItem["LineBreak"] = 0 //FUTURE: Potentially add new line after ENDIF statements
					return (arrayItem["LineBreak"])
				} else {
					return (arrayItem["LineBreak"])
				}
			}

			var commentStartIndex
			var commentEndIndex

			for (var i = 0; i < json.length; i++) {
				//NOTE: Process start comment tags
				if (json[i]["Text"] === "/*") {
					commentStartIndex = i
					json[i]["LineBreak"] = 0 //NOTE: Newline before comments starts
					commentEndIndex = 0 //NOTE: Once the start has been found, restart the commentEndIndex

				//NOTE: Process end comment tags
				} else if (json[i]["Text"] === "*/") {
					json[i]["LineBreak"] = 0 //NOTE: Newline after comments ends
					commentEndIndex = i
					commentStartIndex = 0 //NOTE: Once the end has been found, restart the commentStartIndex

				//NOTE: Continue setting each item as a comment as long as the commentEndIndex isn't found yet
				} else if (commentStartIndex < i && commentEndIndex === 0) {

					//NOTE: Don't format the comment text

				} else {

					//NOTE: Apply formatting to the text if not in comments or isn't a string
					if (json[i]["String"] === false) { 
						json[i]["Text"] = (upperCaser(json[i]["Text"]))
						json[i]["Text"] = (lineBreaker(json[i]["Text"]))
						json[i]["Text"] = (indenter(json[i]["Text"]))
						json[i]["LineBreak"] = variableFormatter(json[i])
						json[i]["LineBreak"] = scriptBlockFormat(json[i], json[i + 1], json[i - 1])
						json[i]["LineBreak"] = ifStatementFormatter(json[i], json[i + 1], json[i - 1])
					}
				}
			}
			return (json)
		}

		//NOTE: Final formatting adjustments
		function outputFormatting(json) {

			for (i = 0; i < json.length; i++) {
				
				//NOTE: Indenting
				//NOTE: Apply 1 indent before this item
				if (json[i]["Indent"] > 0) {
					
					var spliceObj = {}
					spliceObj["Id"] = "Indent"
					spliceObj["Text"] = "\t".repeat(json[i]["Indent"])
					
					json.splice(i, 0, spliceObj)
					
					i++ //NOTE: Skips to next item to avoid reprocessing current item
				}

				//NOTE: Line Breaking
				//NOTE: Apply 1 line break after this item
				if (json[i]["LineBreak"] === 1) {

					var spliceObj = {}
					spliceObj["Id"] = "Linebreak"
					spliceObj["Text"] = "\n"

					json.splice(i + 1, 0, spliceObj) //NOTE: +1 to add the line break after the current item
					
					i++ 

				//NOTE: Apply 1 line break before this item
				} else if (json[i]["LineBreak"] === -1) {

					var spliceObj = {}
					spliceObj["Id"] = "Linebreak"
					spliceObj["Text"] = "\n"

					json.splice(i, 0, spliceObj)
					
					i++ 

				//NOTE: Apply 2 line breaks before this item
				} else if (json[i]["LineBreak"] === -2) {

					var spliceObj = {}
					spliceObj["Id"] = "Double Linebreak"
					spliceObj["Text"] = "\n\n"

					json.splice(i, 0, spliceObj)
					
					i++ 
				}
			}
			return (json)
		}

		//NOTE: Spaces out the final output (used instead of .join(' ')).
		function outputSpacer(json) {

			for (var i = 0; i < json.length; i++) {

				var debugVal = json[i]["Text"];
				var debugString = json[i]["String"];

				//NOTE: No spaces after these
				if (json[i]["String"] === false && json[i + 1]) {
					if (json[i]["Text"] != " " && //NOTE: Not a recently spliced space
						json[i]["Text"].includes("\t") === false &&
						json[i]["Text"] != "%%[" &&
						json[i]["Text"] != "]%%" &&
						json[i]["Text"].includes("\n") === false &&
						json[i + 1]["Text"] != "\n" &&
						json[i + 1]["Text"] != "(" &&
						json[i]["Text"] != "(" &&
						json[i + 1]["Text"] != ")"
					) {
						json.splice(i + 1, 0, {
							Text: " ",
							String: false
						})
					}
				}

				if (json[i]["String"] === true) {

					if (json[i]["StringStart"] === true && json[i - 1]["Id"] != "BeforeStringStart") {

						//FUTURE: Additional formatting for before strings if required
						//						json.splice(i, 0, {
						//							Id: "BeforeStringStart",
						//							Text: " ",
						//							String: true
						//						})

					//NOTE: After string parsing
					} else if (json[i]["StringEnd"] === true &&
						json[i + 1]["Text"] != ")" && //NOTE: Dont add a space after if its the end of a function) 
						json[i + 1]["Text"] != "," && //NOTE: Dont add a space if the next item is a comma
						json[i + 1]["Text"] != "\"" //NOTE: Dont add a space if the next item is a comma
					) {

						json.splice(i + 1, 0, {
								Id: "AfterStringEnd",
								Text: " ",
								String: true
							})
					//NOTE: Parsing string contents
					} else if (
						json[i]["Id"] != "StringWhiteSpace" && //NOTE: Needed to stop an infinite loop
						json[i + 1]["StringEnd"] != true && //NOTE: If next item is the end of the string, dont add a space
						json[i - 1]["Id"] != "BeforeStringStart" && //NOTE: Dont add an initial space after the quote
						json[i]["Id"] != "AfterStringEnd" && //NOTE: Dont add a space after the end of the string
						json[i + 1]["Text"] != ")" && //NOTE: Dont add a space after if its the end of a function
						json[i + 1]["Text"] != "," //NOTE: Dont add a space if the next item is a comma						
					) {
						//NOTE: Add a space after
						json.splice(i + 1, 0, {
							Id: "StringWhiteSpace",
							Text: " ",
							String: true
						})
					}
				}
			}

			//NOTE: Return in an array
			var outputResultArr = [];
			for (var i = 0; i < json.length; i++) {
				outputResultArr.push(json[i]["Text"])
			}

			return (outputResultArr)
		}

		//NOTE: Running Things
		var result = outputFormatting(ignoreComments(dabber(stringProperty(json))))

		if (debug === true) {
			//DEBUGGING: Use this version to see the array results.  Must select all characters in the window first before running.
			var outputResultArr = [];
			for (var i = 0; i < result.length; i++) {
				outputResultArr.push(result[i]["Text"])
			}
			console.log(outputResultArr)
			return (outputResultArr)
		} else {
			//NOTE: Putting the array back together again, else it appears on separate lines.
			var spacedOut = outputSpacer(result)
			return (spacedOut.join(''))
		}
	}

	function batchUpdate(formattedText, isSelection) {
		var editor = EditorManager.getCurrentFullEditor();
		var cursorPos = editor.getCursorPos();
		var scrollPos = editor.getScrollPos();
		var doc = DocumentManager.getCurrentDocument();
		var selection = editor.getSelection();
		doc.batchOperation(function () {
			if (isSelection) {
				doc.replaceRange(formattedText, selection.start, selection.end);
			} else {
				doc.setText(formattedText);
			}
			editor.setCursorPos(cursorPos);
			editor.setScrollPos(scrollPos.x, scrollPos.y);
		});
	}

	AppInit.appReady(function () {
		var editMenu = Menus.getMenu(Menus.AppMenuBar.EDIT_MENU);
		editMenu.addMenuDivider();
		CommandManager.register("AMPscript Beautifier", COMMAND_PARSE_ID, startCommandNormal);
		editMenu.addMenuItem(COMMAND_PARSE_ID, "Ctrl-Shift-A");

		if (debugMenu === true) {
			CommandManager.register("AMPscript Beautifier Debug", COMMAND_PARSE_ID_DEBUG, startCommandDebug);
			editMenu.addMenuItem(COMMAND_PARSE_ID_DEBUG, "Ctrl-Shift-X");
		}
	});
});
