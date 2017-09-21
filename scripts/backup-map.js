// Styles a map in night mode.
var map;
var curvature = 0.2	; // how curvy to make the arc
var curveMarker;

$(document).ready(function() {
$('#show-result').hide();
	createTable().then(insertData).then(function(){
		// bind origin
		getOrigin().then(function(data){
			$.each(data[0].Origin, function (k, obj){
				$("#origin").append($("<option/>").val(obj.Fil_Origin_Service_Area).text(obj.Fil_Origin_Service_Area));
			});
		});
		
		getDestination().then(function(data){
			$.each(data[0].Destination, function (k, obj){
				$("#destination").append($("<option/>").val(obj.Fil_Destination_Service_Area).text(obj.Fil_Destination_Service_Area));
			});
		});
		
		getNPC().then(function(data){
			$.each(data[0].NPC, function (k, obj){
				$("#npc").append($("<option/>").val(obj.Fil_Network_Product_Code).text(obj.Fil_Network_Product_Code));
			});
		});
	});
	
	$('#tabs .tab-links a').on('click', function(e) {
	
		var currentAttrValue = $(this).attr('href');
	
		if ($(this).parent().attr('id') == "hide-tab") {
		
			//Hide blackbox
			$('#blackbox-container').hide();
			
			//Show titlebar
			$('#titlebar').removeClass("hidden");
			
			//Show show-tab
			$('#show-tab').show();
			
		} else {
		
			$(this).parent('li').addClass('active').siblings().removeClass('active');
			
			// Change content
			$('#blackbox ' + currentAttrValue).show().siblings().hide();

		}

	});
	
	$('#show-tab').on('click', function(e) {
	
		//Show blackbox
		$('#blackbox-container').show();
			
		//Remove titlebar
		$('#titlebar').addClass("hidden");
		
		//Hide show-tab
		$('#show-tab').hide();
		
	});

	$('#submitBtn').on('click', function(e) {
		$('#show-result').hide();
		if($("#origin").val() == "Origin" || $("#destination").val()== "Destination" || $("#weekday").val() =="Day" || $("#cot").val() ==""|| $("#npc").val() =="npc"){
			alert("All fields are mandatory");
			return false;
		}
		
		// Get Shortest time 
 	getShortestTransitTime($("#origin").val(), $("#destination").val(), $("#weekday").val(), $("#cot").val(), $("#npc").val()).then(		function(shortestTransitResult){
 			getLatLong(shortestTransitResult[0].ShortestTransit.Disp_Drop_PIN_UNIQUE_AIRPORT).then(function(result){
			
				var locArr = result[0].Location;
				var lastPos = ""
 				for(var i = 0; i < locArr.length; i++){					
					// for pos1 
					var loc = locArr[i].LocLatLONG.split(",")
					var currPos = {Lat : loc[0], Lang: loc[1], Label: locArr[i].Location, Start: "No"};
					
					if(lastPos != ""){
						drawCurve(lastPos, currPos, map, "");
						//addRoute(lastPos, currPos);
					}
 					lastPos =  currPos;

				}
				
				var duration = ((shortestTransitResult[0].ShortestTransit.Duration/60).toFixed(2)).split(".");
				$('.flightDuration').html(" "+ duration[0] + "h " + duration[1] + "m");
				$('.STTRoute').html(shortestTransitResult[0].ShortestTransit.Disp_Route_UNIQUE_LEGS);
				var timeStart = shortestTransitResult[0].ShortestTransit.Fil_CUTOFF;
				var timeEnd = "";
				if(Number.isInteger(parseFloat(timeStart))){
					timeStart = "0" + timeStart + ":00";
				}
				else{
					timeStart.replace(".",":");
				}
				var todayTime  = timeStart.split(":");
				var today = new Date();
				var startDate = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate(), todayTime[0],todayTime[1]);
				startDate.setMinutes(shortestTransitResult[0].ShortestTransit.Duration);
				var timeEnd = startDate.toLocaleTimeString().split(":");
				
				$('.STTTimeStart').html(timeStart);
				$('.STTTimeEnd').html(timeEnd[0] +":"+ timeEnd[1]); // change here
				$('.STTStops').html(shortestTransitResult[0].ShortestTransit.Disp_No_of_stops_uniquelegslength + " Stops");

				var leg = shortestTransitResult[0].ShortestTransit.Disp_Route_UNIQUE_LEGS.split("|");
 				
				$('.startPoint').html(leg[0]);
				$('.endPoint').html(leg[leg.length-1]);

				
				$('#show-result').show();
				/*var pos1 = {Lat : 23.634501, Lang: -102.552783, Label: "A", Start: "Yes"};
				var pos2 = {Lat :17.987557,Lang:  -92.929147, Label: "B",  Start: "No"};
				var pos3 = {Lat :4.785535, Lang: -74.024396,  Label: "C",  Start: "No"};
				var pos4 = {Lat :8.647918, Lang: -82.203680,Label: "D",  Start: "No"};*/
				 
			 
			})
			
		});
	
	
	// Get Recent time 
 getRecentTransitTime($("#origin").val(), $("#destination").val(), $("#weekday").val(), $("#cot").val(), $("#npc").val()).then(		function(recentTransitResult){
 			getLatLong(recentTransitResult[0].RecentTransit.Disp_Drop_PIN_UNIQUE_AIRPORT).then(function(result){
			
				var locArr = result[0].Location;
				var lastPos = ""
 				for(var i = 0; i < locArr.length; i++){					
					// for pos1 
					var loc = locArr[i].LocLatLONG.split(",")
					var currPos = {Lat : loc[0], Lang: loc[1], Label: locArr[i].Location, Start: "No"};
					
					if(lastPos != ""){
						//drawCurve(lastPos, currPos, map, "Dashed");
					}
 					lastPos =  currPos;

				}
				
				var duration = ((recentTransitResult[0].RecentTransit.Duration/60).toFixed(2)).split(".");
				//$('.flightDuration').html(" "+ duration[0] + "h " + duration[1] + "m");
				//$('.STTRoute').html(recentTransitResult[0].RecentTransit.Disp_Route_UNIQUE_LEGS);
				var timeStart = recentTransitResult[0].RecentTransit.Fil_CUTOFF;
				var timeEnd = "";
				if(Number.isInteger(parseFloat(timeStart))){
					timeStart = "0" + timeStart + ":00";
				}
				else{
					timeStart.replace(".",":");
				}
				var todayTime  = timeStart.split(":");
				var today = new Date();
				var startDate = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate(), todayTime[0],todayTime[1]);
				startDate.setMinutes(recentTransitResult[0].RecentTransit.Duration);
				var timeEnd = startDate.toLocaleTimeString().split(":");
				
				$('.recentDepartStart').html(timeStart);
				$('.recentDepartEnd').html(timeEnd[0] +":"+ timeEnd[1]); // change here
				//$('.STTStops').html(recentTransitResult[0].RecentTransit.Disp_No_of_stops_uniquelegslength + " Stops");

				var leg = recentTransitResult[0].RecentTransit.Disp_Route_UNIQUE_LEGS.split("|");
 				
				//$('.startPoint').html(leg[0]);
				//$('.endPoint').html(leg[leg.length-1]);

				
				$('#show-result').show();
			})
			
		});
		
		// Get Frequent time 
	getFrequentTransitTime($("#origin").val(), $("#destination").val(), $("#weekday").val(), $("#cot").val(), $("#npc").val()).then(		function(frequentTransitResult){
 			getLatLong(frequentTransitResult[0].FrequentTransit.Disp_Drop_PIN_UNIQUE_AIRPORT).then(function(result){
			
				var locArr = result[0].Location;
				var lastPos = ""
 				for(var i = 0; i < locArr.length; i++){					
					// for pos1 
					var loc = locArr[i].LocLatLONG.split(",")
					var currPos = {Lat : loc[0], Lang: loc[1], Label: locArr[i].Location, Start: "No"};
					
					if(lastPos != ""){
						//drawCurve(lastPos, currPos, map);
					}
 					lastPos =  currPos;

				}
				
				var duration = ((frequentTransitResult[0].FrequentTransit.Duration/60).toFixed(2)).split(".");
				//$('.flightDuration').html(" "+ duration[0] + "h " + duration[1] + "m");
				//$('.STTRoute').html(frequentTransitResult[0].FrequentTransit.Disp_Route_UNIQUE_LEGS);
				var timeStart = frequentTransitResult[0].FrequentTransit.Fil_CUTOFF;
				var timeEnd = "";
				if(Number.isInteger(parseFloat(timeStart))){
					timeStart = "0" + timeStart + ":00";
				}
				else{
					timeStart.replace(".",":");
				}
				var todayTime  = timeStart.split(":");
				var today = new Date();
				var startDate = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate(), todayTime[0],todayTime[1]);
				startDate.setMinutes(frequentTransitResult[0].FrequentTransit.Duration);
				var timeEnd = startDate.toLocaleTimeString().split(":");
				
				$('.frequentDepartStart').html(timeStart);
				$('.frequentDepartEnd').html(timeEnd[0] +":"+ timeEnd[1]); // change here
				//$('.STTStops').html(frequentTransitResult[0].FrequentTransit.Disp_No_of_stops_uniquelegslength + " Stops");

				var leg = frequentTransitResult[0].FrequentTransit.Disp_Route_UNIQUE_LEGS.split("|");
 				
				//$('.startPoint').html(leg[0]);
				//$('.endPoint').html(leg[leg.length-1]);

				
				$('#show-result').show();
			})
			
		});
		
	});
});
function drawCurve(po1, po2, map, lineType) {

	var icons = {
				path: google.maps.SymbolPath.CIRCLE,
 				fillColor: 'orange',
				fillOpacity: 1,
				scale: 12,
				strokeColor: 'black',
				strokeWeight: 2
 			};
var Map = google.maps.Map,
        LatLng = google.maps.LatLng,
        LatLngBounds = google.maps.LatLngBounds,
        Marker = google.maps.Marker,
        Point = google.maps.Point;
		
	var P1 = new LatLng(po1.Lat, po1.Lang);
	var P2 = new LatLng(po2.Lat, po2.Lang);
	
	var markerP1 = new Marker({
			position: P1,
			label: po1.Label,
			draggable: false,
			icon: ((po1.Start == "Yes") ? icons : null),
			map: map
		});
		var markerP2 = new Marker({
			position: P2,
			label: po2.Label,
			draggable: false,
			map: map
		});
		
  var lineLength = google.maps.geometry.spherical.computeDistanceBetween(P1, P2);
  var lineHeading = google.maps.geometry.spherical.computeHeading(P1, P2);
  
  if (lineHeading < 0) {
    var lineHeading1 = lineHeading + 45;
    var lineHeading2 = lineHeading + 135;
  } else {
    var lineHeading1 = lineHeading + -45;
    var lineHeading2 = lineHeading + -135;
  }
  var pA = google.maps.geometry.spherical.computeOffset(P1, lineLength / 2.2, lineHeading1);
  var pB = google.maps.geometry.spherical.computeOffset(P2, lineLength / 2.2, lineHeading2);

  var curvedLine = new GmapsCubicBezier(P1, pA, pB, P2, 0.01, map, lineType);
}
function addRoute(po1, po2){
	var Map = google.maps.Map,
        LatLng = google.maps.LatLng,
        LatLngBounds = google.maps.LatLngBounds,
        Marker = google.maps.Marker,
        Point = google.maps.Point;
		
		var pos1 = new LatLng(po1.Lat, po1.Lang);
		var pos2 = new LatLng(po2.Lat, po2.Lang);
		
		var bounds = new LatLngBounds();
		bounds.extend(pos1);
		bounds.extend(pos2);
		
		map.fitBounds(bounds);
		
		var markerP1 = new Marker({
			position: pos1,
			label: "1",
			draggable: false,
			map: map
		});
		var markerP2 = new Marker({
			position: pos2,
			label: "2",
			draggable: false,
			map: map
		});
 var curveMarker;
	//updateCurveMarker();
	function updateCurveMarker() {
        var pos1 = markerP1.getPosition(), // latlng
            pos2 = markerP2.getPosition(),
            projection = map.getProjection(),
            p1 = projection.fromLatLngToPoint(pos1), // xy
            p2 = projection.fromLatLngToPoint(pos2);

        // Calculate the arc.
        // To simplify the math, these points 
        // are all relative to p1:
        var e = new Point(p2.x - p1.x, p2.y - p1.y), // endpoint (p2 relative to p1)
            m = new Point(e.x / 2, e.y / 2), // midpoint
            o = new Point(e.y, -e.x), // orthogonal
            c = new Point( // curve control point
                m.x + curvature * o.x,
                m.y + curvature * o.y);

        var pathDef = 'M 0,0 ' +
            'q ' + c.x + ',' + c.y + ' ' + e.x + ',' + e.y;

        var zoom = map.getZoom(),
            scale = 1 / (Math.pow(2, -zoom));

        var symbol = {
            path: pathDef,
            scale: scale,
            strokeWeight: 1,
            fillColor: 'none'
        };

        // Define a symbol using SVG path notation, with an opacity of 1.
        var lineSymbol = {
          path: 'M 0,-2 0,0.5',
          strokeOpacity: 1,
          strokeWeight: 2,
          scale: 4
        };

        // Create the polyline, passing the symbol in the 'icons' property.
        // Give the line an opacity of 0.
        // Repeat the symbol at intervals of 20 pixels to create the dashed effect.
        var line = new google.maps.Polyline({
          path: [pos1, pos2],
          strokeOpacity: 0,
          strokeColor: 'green',
          icons: [{
            icon: lineSymbol,
            offset: '0',
            repeat: '4%'
          }],
          map: map
        });
      
        if (!curveMarker) {
            curveMarker = new Marker({
                position: pos1,
                clickable: false,
                icon: symbol,
                zIndex: 0, // behind the other markers
                map: map
            });
        } else {
            curveMarker.setOptions({
                position: pos1,
                icon: symbol,
            });
        }
    }
	google.maps.event.addListener(map, 'projection_changed', updateCurveMarker);
    google.maps.event.addListener(map, 'zoom_changed', updateCurveMarker);

    google.maps.event.addListener(markerP1, 'position_changed', updateCurveMarker);
    google.maps.event.addListener(markerP2, 'position_changed', updateCurveMarker);

}

function initMap() {
	
		var center = {lat: 40.674, lng: -73.945} //bounds.getCenter(),
        map = new google.maps.Map(document.getElementById('map'), {
 		  center :  new google.maps.LatLng(0,0),
		  disableDefaultUI: true,
          zoom: 2,
          styles: [
                  {
                    "elementType": "geometry",
                    "stylers": [
                      {
                        "color": "#f5f5f5"
                      }
                    ]
                  },
                  {
                    "elementType": "labels.icon",
                    "stylers": [
                      {
                        "visibility": "off"
                      }
                    ]
                  },
                  {
                    "elementType": "labels.text.fill",
                    "stylers": [
                      {
                        "color": "#616161"
                      }
                    ]
                  },
                  {
                    "elementType": "labels.text.stroke",
                    "stylers": [
                      {
                        "color": "#f5f5f5"
                      }
                    ]
                  },
                  {
                    "featureType": "administrative.land_parcel",
                    "elementType": "labels.text.fill",
                    "stylers": [
                      {
                        "color": "#bdbdbd"
                      }
                    ]
                  },
                  {
                    "featureType": "landscape",
                    "elementType": "geometry.fill",
                    "stylers": [
                      {
                        "color": "#f5c947"
                      }
                    ]
                  },
                  {
                    "featureType": "poi",
                    "elementType": "geometry",
                    "stylers": [
                      {
                        "color": "#eeeeee"
                      }
                    ]
                  },
                  {
                    "featureType": "poi",
                    "elementType": "labels.text.fill",
                    "stylers": [
                      {
                        "color": "#757575"
                      }
                    ]
                  },
                  {
                    "featureType": "poi.park",
                    "elementType": "geometry",
                    "stylers": [
                      {
                        "color": "#e5e5e5"
                      }
                    ]
                  },
                  {
                    "featureType": "poi.park",
                    "elementType": "labels.text.fill",
                    "stylers": [
                      {
                        "color": "#9e9e9e"
                      }
                    ]
                  },
                  {
                    "featureType": "road",
                    "elementType": "geometry",
                    "stylers": [
                      {
                        "color": "#ffffff"
                      }
                    ]
                  },
                  {
                    "featureType": "road.arterial",
                    "elementType": "labels.text.fill",
                    "stylers": [
                      {
                        "color": "#757575"
                      }
                    ]
                  },
                  {
                    "featureType": "road.highway",
                    "elementType": "geometry",
                    "stylers": [
                      {
                        "color": "#dadada"
                      }
                    ]
                  },
                  {
                    "featureType": "road.highway",
                    "elementType": "labels.text.fill",
                    "stylers": [
                      {
                        "color": "#616161"
                      }
                    ]
                  },
                  {
                    "featureType": "road.local",
                    "elementType": "labels.text.fill",
                    "stylers": [
                      {
                        "color": "#9e9e9e"
                      }
                    ]
                  },
                  {
                    "featureType": "transit.line",
                    "elementType": "geometry",
                    "stylers": [
                      {
                        "color": "#e5e5e5"
                      }
                    ]
                  },
                  {
                    "featureType": "transit.station",
                    "elementType": "geometry",
                    "stylers": [
                      {
                        "color": "#eeeeee"
                      }
                    ]
                  },
                  {
                    "featureType": "water",
                    "elementType": "geometry",
                    "stylers": [
                      {
                        "color": "#c9c9c9"
                      }
                    ]
                  },
                  {
                    "featureType": "water",
                    "elementType": "geometry.fill",
                    "stylers": [
                      {
                        "color": "#fbeec7"
                      }
                    ]
                  },
                  {
                    "featureType": "water",
                    "elementType": "labels.text.fill",
                    "stylers": [
                      {
                        "color": "#9e9e9e"
                      }
                    ]
                  }
                ]
        });
		
		
	}

var GmapsCubicBezier = function (latlong1, latlong2, latlong3, latlong4, resolution, map) {
    var lat1 = latlong1.lat();
    var long1 = latlong1.lng();
    var lat2 = latlong2.lat();
    var long2 = latlong2.lng();
    var lat3 = latlong3.lat();
    var long3 = latlong3.lng();
    var lat4 = latlong4.lat();
    var long4 = latlong4.lng();

    var points = [];

    for (it = 0; it <= 1; it += resolution) {
        points.push(this.getBezier({
            x: lat1,
            y: long1
        }, {
            x: lat2,
            y: long2
        }, {
            x: lat3,
            y: long3
        }, {
            x: lat4,
            y: long4
        }, it));
    }
var path = [];
    for (var i = 0; i < points.length - 1; i++) {
        path.push(new google.maps.LatLng(points[i].x, points[i].y));
        path.push(new google.maps.LatLng(points[i + 1].x, points[i + 1].y, false));
                  }
                  
        var Line = new google.maps.Polyline({
            path: path,
            geodesic: true,
            strokeOpacity: 0.0,
                        icons: [{
                            icon: {
                                path: 'M 0,-1 0,1',
                                strokeOpacity: 1,
                                scale: 4
                            },
                            offset: '0',
                            repeat: '20px'
                        }],
             strokeColor: 'grey'
         });

        Line.setMap(map);

    return Line;
};


GmapsCubicBezier.prototype = {

    B1: function (t) {
        return t * t * t;
    },
    B2: function (t) {
        return 3 * t * t * (1 - t);
    },
    B3: function (t) {
        return 3 * t * (1 - t) * (1 - t);
    },
    B4: function (t) {
        return (1 - t) * (1 - t) * (1 - t);
    },
    getBezier: function (C1, C2, C3, C4, percent) {
        var pos = {};
        pos.x = C1.x * this.B1(percent) + C2.x * this.B2(percent) + C3.x * this.B3(percent) + C4.x * this.B4(percent);
        pos.y = C1.y * this.B1(percent) + C2.y * this.B2(percent) + C3.y * this.B3(percent) + C4.y * this.B4(percent);
        return pos;
    }
};