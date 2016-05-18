# 1.2.2 (5/16/2016)
* Removed the Object/Array prototypes to prevent them from conflicting with other frameworks.
* Fixed a spacing issue that was caused by having the wrong font size.
* Added a check to prevent the SVG from being created multiple times.
* Minor optimizations, fixed a resizing bug, moved the default color array into the constructor to prevent it from being created every time 'data' was called, finished adding in the thresholds, and added transitions.
* Determine the direction of the tooltip based on the location and updated the CSS.
* Added bower.json and a README.

# 1.3.0 (5/16/2016)
* Pulled d3-tip into the source code to make modifications to add a way to determine the direction of the tip so that the tip doesn't go off the screen.
* Minified the CSS stylesheet.
* Added a way to configure the truncate cap in the configuration object.
* Removed d3-tip from the dependencies.
* Added AMD and CommonJS support.
