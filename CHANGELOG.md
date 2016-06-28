# 1.2.2 (5/16/2016)
* Removed the Object/Array prototypes to prevent them from conflicting with other frameworks.
* Fixed a spacing issue that was caused by having the wrong font size.
* Added a check to prevent the SVG from being created multiple times.
* Minor optimizations, fixed a resizing bug, moved the default color array into the constructor to prevent it from being created every time 'data' was called, finished adding in the thresholds, and added transitions.
* Determine the direction of the tooltip based on the location and updated the CSS.
* Added bower.json and a README.

# 1.3.0 (5/17/2016 - 5/19/2016)
* Pulled d3-tip into the source code to make modifications to add a way to determine the direction of the tip so that the tip doesn't go off the screen.
* Minified the CSS stylesheet.
* Added a way to configure the truncate cap in the configuration object.
* Removed d3-tip from the dependencies.
* Added AMD and CommonJS support.
* Fixed a bug that was causing the resize of the SVG to calculate the width and height incorrectly.
* Made *data* return the RelationshipGraph object to keep d3's chaining functionality working.
* Fixed a bug where if the value was a number, the threshold wouldn't work.
* Used JSCS to enforce styling.
* Added grunt tasks.
* Added a TravisCI yaml file for tests.
* Added CSSLint
* Began adding in unit tests.
* Updated algorithm for determining if the tooltip should be relocated.
* Added sorting to the thresholds if it is made up of numbers.

# 1.4.1 (5/19/2016 - 5/21/2016)
* Added additional tests and fixed the bugs that came with that.
* Updated d3 to 3.5.17
* Fixed a bug that made the sorting different each time.
* Finished the test suite.

# 1.4.2 (5/21/2016 - 5/26/2016)
* Updated dev dependencies.
* Reduced the complexity of the *data* method by splitting it up into separate private methods.
* Moved the all private methods into one area.
* Added the ability to not pass in thresholds and all the blocks be the same color.
* Right aligned the parent labels.

# 1.5.0 (5/26/2016 - 6/12/2016)
* Created a non-minified js file in dest using grunt-contrib-concat.
* Added a test to check the colors of the blocks to make sure they're correct.
* Made the comparison between the value and the threshold case insensitive, added type checking for the threshold comparisons, and made sure that the key appears in title case when the tooltip comes up.
* Fixed a bug where clicking `Random` twice (or more) on example page causes the demo to keep cycling.
* Moved the child nodes five pixels away from the parent labels to make the space larger.
* Optimized the code by using local variables instead of accessing object properties multiple times and made static functions instead of recreating them in loops.
* Fixed a bug where the number thresholds had to be exact instead of between two thresholds.
* Fixed a bug where only the first word in the tooltip key was capitalized instead of the key being in title case.
* Fixed the regex for numeric comparisons so that it would take negative numbers into account.
* Added additional tests.
* Fixed the way that the width of the parent labels was determined and added a cache.
* Optimized parent labels by storing the keys instead of generating it each time.
* Added a way to add a custom sort function.
* Added a way to set a custom string for the `value` key instead of having it always say 'value' on the tooltip.`
* Added support for private data by using the `_private_` key in the JSON data.

# 2.0.0 (6/12/2016-)
* Added a way to set the onclick function for a parent label.
* Cleaned up some of the code.
* Fixed an SVG width issue where if no data was supplied, the width and height were set to -15, which threw an exception.
* Fixed a bug where if the tooltip width and height got too big, the arrow wasn't pointing at the child node.
* Fixed a bug where the width of the SVG was being determined incorrectly.
* Added a way to not show the value on the tooltip by setting the `valueKeyName` to an empty string.
