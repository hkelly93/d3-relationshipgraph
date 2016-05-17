# 5/16/2016
* Removed the Object/Array prototypes to prevent them from conflicting with other frameworks.
* Fixed a spacing issue that was caused by having the wrong font size.
* Added a check to prevent the SVG from being created multiple times.
* Minor optimizations, fixed a resizing bug, moved the default color array into the constructor to prevent it from being created every time 'data' was called, finished adding in the thresholds, and added transitions.
* Determine the direction of the tooltip based on the location and updated the CSS.