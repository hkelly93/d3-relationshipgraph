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
