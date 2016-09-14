"use strict";

var app = {
    map: undefined,
    marker: undefined,
    rectangle: undefined,
    rectangleBounds: undefined,

    initialize: function() {
        app.map = new google.maps.Map(document.getElementById('map'), {
            center: { lat: 41.99081, lng: -87.9634719 },
            zoom: 8
        });

        app.rectangleBounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(41.02233540581116, -89.39368031718755),
            new google.maps.LatLng(41.8697309, -87.77302040000001)
        );

        app.rectangle = new google.maps.Rectangle({
            strokeColor: '#0000FF',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#0000FF',
            fillOpacity: 0.1,
            map: app.map,
            draggable: true,
            editable: true,
            bounds: app.rectangleBounds
        });

        app.rectangle.addListener('bounds_changed', app.rectangleChanged);
        app.rectangle.addListener('dragend', app.rectangleDragged);

        app.marker = new google.maps.Marker({
            position: app.rectangle.getBounds().getCenter(),
            map: app.map,
            draggable: true
        });

        app.marker.addListener('dragend', app.markerDragged);
    },

    markerDragged: function(event) {
        var currentRectangleBounds = undefined,
            rectangleCenter = undefined,
            distanceToNE = 0,
            distanceToSW = 0,
            bearingToNE = 0,
            bearingToSW = 0,
            newNE = undefined,
            newSW = undefined;

        // Are we still inside the rectangle?
        if (! app.rectangle.getBounds().contains(app.marker.getPosition())) {
            currentRectangleBounds = app.rectangle.getBounds();
            rectangleCenter = currentRectangleBounds.getCenter();

            // Get distance from rectangle center to NE, SW corners
            distanceToNE = google.maps.geometry.spherical.computeDistanceBetween(currentRectangleBounds.getNorthEast(), rectangleCenter);
            distanceToSW = google.maps.geometry.spherical.computeDistanceBetween(currentRectangleBounds.getSouthWest(), rectangleCenter);
            
            // Get heading from rectangle center to NE, SW corners
            bearingToNE = google.maps.geometry.spherical.computeHeading(rectangleCenter, currentRectangleBounds.getNorthEast());
            bearingToSW = google.maps.geometry.spherical.computeHeading(rectangleCenter, currentRectangleBounds.getSouthWest()); 

            // Get new NE corner
            newNE = google.maps.geometry.spherical.computeOffset(app.marker.getPosition(), distanceToNE, bearingToNE);
            newSW = google.maps.geometry.spherical.computeOffset(app.marker.getPosition(), distanceToSW, bearingToSW);
            
            // Move the rectangle to new location with the marker at center
            app.rectangle.setOptions({ bounds: new google.maps.LatLngBounds(newSW, newNE) });
        }
    },

    rectangleDragged: function(event) {
        if (! app.rectangle.getBounds().contains(app.marker.getPosition())) {
            app.marker.setPosition(app.rectangle.getBounds().getCenter());
        }

        app.rectangleBounds = app.rectangle.getBounds();
    },

    rectangleChanged: function(event) {
        // Did we get resized?
        var currentBounds = app.rectangle.getBounds(),
            priorBounds = app.rectangleBounds,
            currentNE = currentBounds.getNorthEast(),
            priorNE = priorBounds.getNorthEast(),
            currentSW = currentBounds.getSouthWest(),
            priorSW = priorBounds.getSouthWest(),
            
            neChanged = ! ((currentNE.lat() === priorNE.lat()) && (currentNE.lng() === priorNE.lng())),
            swChanged = ! ((currentSW.lat() === priorSW.lat()) && (currentSW.lng() === priorSW.lng())),
            nwChanged = ! ((currentNE.lat() === priorNE.lat()) && (currentSW.lng() === priorSW.lng())),
            seChanged = ! ((currentNE.lng() === priorNE.lng()) && (currentSW.lat() === priorSW.lat()));

        if (neChanged && swChanged && nwChanged && seChanged) {
            // Do nothing we are being dragged
        } else {
            // Resized, see if we still contain the marker
            app.rectangleBounds = app.rectangle.getBounds();

            if (! app.rectangle.getBounds().contains(app.marker.getPosition())) {
                // Marker was outside rectangle snap it to center
                app.marker.setPosition(app.rectangle.getBounds().getCenter());
            }
        }
    }
}

window.onload = function() {
    app.initialize();
}