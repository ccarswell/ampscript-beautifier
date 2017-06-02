start
  = Text+

Text
  = AMPscriptStart / 
  InlineAMPscriptStart /
  InlineAMPscriptEnd /
  Linebreak / 
  Spaces30 / 
  Spaces29 / 
  Spaces28 / 
  Spaces27 / 
  Spaces26 / 
  Spaces25 / 
  Spaces24 / 
  Spaces23 / 
  Spaces22 / 
  Spaces21 / 
  Spaces20 / 
  Spaces19 / 
  Spaces18 / 
  Spaces17 / 
  Spaces16 / 
  Spaces15 / 
  Spaces14 / 
  Spaces13 / 
  Spaces13 / 
  Spaces12 / 
  Spaces11 / 
  Spaces10 / 
  Spaces9 / 
  Spaces8 / 
  Spaces7 / 
  Spaces6 / 
  Spaces5 / 
  Spaces4 / 
  Spaces3 / 
  Spaces2 / 
  Indent / 
  Function / 
  Quotes / 
  Code / 
  AMPscriptEnd /
  SquareBrackets
  

AMPscriptStart
  = startscript: '%%[' ws*  {return '%%['}
  
AMPscriptEnd
  = endscript: ws* ']%%'  {return ']%%'}

Function 
	= text: [()] ws* {return text} 
    
SquareBrackets 
	= text: [\[\]] ws* {return text} 
    
InlineAMPscript
	= text: [%] ws* {return text}
    
InlineAMPscriptStart   
	= text: '%%=' ws* {return text}
    
InlineAMPscriptEnd
	= text: '=%%' ws* {return text}
    
Code
  = text: [-A-Za-z0-9_@=,/*!.<>:?;']+ ws* {return text.join("")}
  
Quotes
  = text: ws* '"' ws* {return '"'}
  
Linebreak = text: [\n] {return '@@LINEBREAK'}

Indent = text: [\t] ws* {return '@@INDENT'}

Spaces2 = text: '  ' {return '@@INDENT'}

Spaces3 = text: '   ' {return '@@INDENT'}

Spaces4 = text: '    ' {return '@@INDENT'}

Spaces5 = text: '     ' {return '@@INDENT'}

Spaces6 = text: '      ' {return '@@INDENT'}

Spaces7 = text: '       ' {return '@@INDENT'}

Spaces8 = text: '        ' {return '@@INDENT'}

Spaces9 = text: '         ' {return '@@INDENT'}

Spaces10 = text: '         ' {return '@@INDENT'}

Spaces11 = text: '          ' {return '@@INDENT'}

Spaces12 = text: '           ' {return '@@INDENT'}

Spaces13 = text: '            ' {return '@@INDENT'}

Spaces14 = text: '             ' {return '@@INDENT'}

Spaces15 = text: '              ' {return '@@INDENT'}

Spaces16 = text: '               ' {return '@@INDENT'}

Spaces17 = text: '                ' {return '@@INDENT'}

Spaces18 = text: '                 ' {return '@@INDENT'}

Spaces19 = text: '                  ' {return '@@INDENT'}

Spaces20 = text: '                   ' {return '@@INDENT'}

Spaces21 = text: '                    ' {return '@@INDENT'}

Spaces22 = text: '                     ' {return '@@INDENT'}

Spaces23 = text: '                      ' {return '@@INDENT'}

Spaces24 = text: '                       ' {return '@@INDENT'}

Spaces25 = text: '                        ' {return '@@INDENT'}

Spaces26 = text: '                         ' {return '@@INDENT'}

Spaces27 = text: '                          ' {return '@@INDENT'}

Spaces28 = text: '                           ' {return '@@INDENT'}

Spaces29 = text: '                            ' {return '@@INDENT'}

Spaces30 = text: '                             ' {return '@@INDENT'}
 
ws "whitespace"
= [ \r ]
