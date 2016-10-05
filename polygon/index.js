"use strict";

var app = {
    initialize: function() {
        var polygon,
            map;

        // Add useful missing method - credit to http://stackoverflow.com/a/13772082/5338708
        google.maps.Polygon.prototype.getBoundingBox = function() {
            var bounds = new google.maps.LatLngBounds();

            this.getPath().forEach(function(element,index) {
                bounds.extend(element)
            });

            return bounds;
        };

        // Add center calculation method
        google.maps.Polygon.prototype.getApproximateCenter = function() {
            var polygonBounds = this.getBoundingBox(),
                centerPoint = polygonBounds.getCenter(),
                northWest,
                boundsHeight = 0,
                boundsWidth = 0,
                n = 1,
                heightIncr = 0,
                widthIncr = 0,
                maxSearchSteps = 10,
                testPos;

            if (google.maps.geometry.poly.containsLocation(centerPoint, this)) {
                // Nothing to do Centroid is in polygon use it as is
                return centerPoint;
            } else {
                northWest = new google.maps.LatLng(polygonBounds.getNorthEast().lat(), polygonBounds.getSouthWest().lng());
                console.log(northWest);

                // Work out how tall the bounds are and what our search increment will be
                boundsHeight = google.maps.geometry.spherical.computeDistanceBetween(northWest, polygonBounds.getSouthWest());
                heightIncr = boundsHeight / maxSearchSteps;

                // Work out how wide the bounds are and what our search increment will be
                boundsWidth = google.maps.geometry.spherical.computeDistanceBetween(northWest, polygonBounds.getNorthEast());
                widthIncr = boundsWidth / maxSearchSteps;

                // Expand out from Centroid and find a point within polygon at 0, 90, 180, 270 degrees
                for (; n <= maxSearchSteps; n++) {
                    // Test point North of Centroid
                    testPos = google.maps.geometry.spherical.computeOffset(centerPoint, (heightIncr * n), 0);

                    if (google.maps.geometry.poly.containsLocation(testPos, this)) {
                        return(testPos);
                    }

                    // Test point East of Centroid
                    testPos = google.maps.geometry.spherical.computeOffset(centerPoint, (widthIncr * n), 90);

                    if (google.maps.geometry.poly.containsLocation(testPos, this)) {
                        return(testPos);
                    }

                    // Test point South of Centroid
                    testPos = google.maps.geometry.spherical.computeOffset(centerPoint, (heightIncr * n), 180);

                    if (google.maps.geometry.poly.containsLocation(testPos, this)) {
                        return(testPos);
                    }

                    // Test point West of Centroid
                    testPos = google.maps.geometry.spherical.computeOffset(centerPoint, (widthIncr * n), 270);

                    if (google.maps.geometry.poly.containsLocation(testPos, this)) {
                        return(testPos);
                    }
                }
            }
        };

        // Set up map around Chicago 
        map = new google.maps.Map(document.getElementById('map'), {
            center: { lat: 41.83771, lng: -87.85090 },
            zoom: 11
        });

        // Draw sample polygons
        polygon = new google.maps.Polygon({
            paths: [
                { lat: 41.78500, lng: -87.75133 },
                { lat: 41.77681, lng: -87.87836 },
                { lat: 41.80138, lng: -87.92780 },
                { lat: 41.77988, lng: -87.95527 },
                { lat: 41.83208, lng: -87.95801 },
                { lat: 41.83208, lng: -87.94154 },
                { lat: 41.81673, lng: -87.88866 },
                { lat: 41.81417, lng: -87.78773 },
                { lat: 41.87607, lng: -87.77056 },
                { lat: 41.78500, lng: -87.75133 }
            ],
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#FF0000',
            fillOpacity: 0.35
        });

        // Put sample polygons on the map
        polygon.setMap(map);

        // Put a marker at approximated polygon centers
        new google.maps.Marker({
            position: polygon.getApproximateCenter(),
            map: map
        });
    }
}

window.onload = function() {
    app.initialize();
}