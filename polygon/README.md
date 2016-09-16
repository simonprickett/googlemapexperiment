# Polygon Experiment

Experiments with placing a marker around the center of a polygon.

![demo](screenshot.png)

This needs more testing, but the process is roughly:

* Add a `getBoundingBox` method to `google.maps.Polygon.prototype` which returns a LatLngBounds object (rectangle) that entirely contains an arbitrarily complex polygon
* Get the center of that bounding box
* If the center of the bounding box is within the area of the polygon, put the marker there
* If the center of the bounding box is not within the area of the polygon then:
	* Work out the height of the bounding box
	* Look at points up and down from the center at 5% increments North and South of the center point
	* If either of those points is within the area of the polygon, place the marker there

This may not be foolproof but should get a point within the polygon that's good enough.  As this moves up and down the bounding box looking for points within the polygon at 5% height increments, it could miss a very thin slice of the polygon that crosses the center line and never find a point... could fix this by using 1% increments and a 50 loop count for higher search "resolution".
