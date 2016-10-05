"use strict";

var app = {
    map: undefined,
    marker: undefined,
    polygon: undefined,

    initialize: function() {
        var centerPoint = undefined,
            polygonBounds = undefined,
            markerPos = undefined,
            northWest = undefined,
            boundsHeight = 0,
            boundsWidth = 0,
            n = 1,
            heightIncr = 0,
            widthIncr = 0,
            maxSearchSteps = 10,
            testPosNorth = undefined,
            testPosSouth = undefined,
            testPosEast = undefined,
            testPosWest = undefined;

        // Set up map  
        app.map = new google.maps.Map(document.getElementById('map'), {
            center: { lat: 41.83771, lng: -87.85090 },
            zoom: 11
        });

        // Draw a sample polygon
        app.polygon = new google.maps.Polygon({
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

        app.polygon.setMap(app.map);


        google.maps.Polygon.prototype.getBoundingBox=function(){
            var bounds = new google.maps.LatLngBounds();
            this.getPath().forEach(function(element,index){bounds.extend(element)});
            return bounds;
        };

        polygonBounds = app.polygon.getBoundingBox();
        centerPoint = polygonBounds.getCenter(); 

        if (google.maps.geometry.poly.containsLocation(centerPoint, app.polygon)) {
            // Nothing to do center is in polygon use it as is
            markerPos = centerPoint;
        } else {
            console.log('Bounding box center was outside polygon, finding point...');
            northWest = new google.maps.LatLng(polygonBounds.getNorthEast().lat(), polygonBounds.getSouthWest().lng());
            console.log(northWest);

            // Work out how tall the bounds are and what our search increment will be
            boundsHeight = google.maps.geometry.spherical.computeDistanceBetween(northWest, polygonBounds.getSouthWest());
            heightIncr = boundsHeight / maxSearchSteps;

            // Work out how wide the bounds are and what our search increment will be
            boundsWidth = google.maps.geometry.spherical.computeDistanceBetween(northWest, polygonBounds.getNorthEast());
            widthIncr = boundsWidth / maxSearchSteps;


            // Look up towards the top
            for (n = 1; n <= maxSearchSteps; n++) {
                console.log('Finding point... iteration ' + n);

                // Test point North of Centroid
                testPosNorth = google.maps.geometry.spherical.computeOffset(centerPoint, (heightIncr * n), 0);

                if (google.maps.geometry.poly.containsLocation(testPosNorth, app.polygon)) {
                    // That will do
                    markerPos = testPosNorth;
                    console.log('Using a Northern point.');
                    break;
                }

                // Test point East of Centroid
                testPosEast = google.maps.geometry.spherical.computeOffset(centerPoint, (widthIncr * n), 90);

                if (google.maps.geometry.poly.containsLocation(testPosEast, app.polygon)) {
                    // That will do
                    markerPos = testPosEast;
                    console.log('Using an Eastern point.');
                    break;
                }

                // Test point South of Centroid
                testPosSouth = google.maps.geometry.spherical.computeOffset(centerPoint, (heightIncr * n), 180);

                if (google.maps.geometry.poly.containsLocation(testPosSouth, app.polygon)) {
                    // That will do
                    markerPos = testPosSouth;
                    console.log('Using a Southern point.');
                    break;
                }

                // Test point West of Centroid
                testPosWest = google.maps.geometry.spherical.computeOffset(centerPoint, (widthIncr * n), 270);

                if (google.maps.geometry.poly.containsLocation(testPosWest, app.polygon)) {
                    // That will do
                    markerPos = testPosWest;
                    console.log('Using a Western point.');
                    break;
                }
            }            
        }

        app.marker = new google.maps.Marker({
            position: markerPos,
            map: app.map
        });
    }
}

window.onload = function() {
    app.initialize();
}