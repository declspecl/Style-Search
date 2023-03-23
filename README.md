# Style Search

Style Search is an obsidian plugin that allows you to apply custom CSS styling based on regular expression search patterns. After configuring your desired CSS, you can see all of the regex matches with the styling you specified in the reading view!

# How to use
In the settings tab, you can add a regular expression in a text box labeled "RegExp Search Pattern". This will add the pattern to a list of regular expression patterns. Once you click add, you can map custom CSS to each individual regex pattern.

# Important Notes
- This plugin unfortunately does not mesh well with lists. If a match is found in a list, the list's formatting will be removed. If no match is found, your list won't be changed, though.
- Each styled group is placed in a  `div` tag, with each group of text, being non-matches and matches, being placed in more `span` tags. This is important to note if you are using CSS properties that require a certain display value.
- After changing the highlighting settings, you will need to reload all currently open files to see the effects.
