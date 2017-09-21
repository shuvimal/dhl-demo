// Styles a map in night mode.
var map;
var curvature = 0.2	; // how curvy to make the arc
var isResult = false;
var infowindow = null;
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
		getCOT().then(function(data){
			$.each(data[0].COT, function (k, obj){
				$("#cot").append($("<option/>").val(obj.Fil_CUTOFF).text(obj.Fil_CUTOFF));
			});
		});
	});
 $('#show-popup').hide();	
 $("#norecord").hide();

	$('#tabs .tab-links a').on('click', function(e) {
	
		var currentAttrValue = $(this).attr('href');
	
		if ($(this).parent().attr('id') == "hide-tab") {
		
			//Hide blackbox
			$('#blackbox-container').hide();
			
			//Show titlebar
			$('#titlebar').removeClass("hidden");
			
			//Show show-tab
			$('#show-tab').show();
			if($('#show-result').is(":visible") && $("#shortestPath").is(":visible")){
				$('#show-popup').show();
			}
			else{
				$('#show-popup').hide();
		  
			}
			$('#show-result').hide();
			
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
		$('#show-popup').hide();
		
		if(!isResult){
			$('#show-result').hide();
		}
		else
			$('#show-result').show();
		
	});

	$('#submitBtn').on('click', function(e) {
		
		 // to reinit map 
		$("#norecord").show();	
		$("#shortestPath").hide();
		$("#frequentPath").hide();
		$("#recentPath").hide();
		$("#routePath1").hide();
		$("#routePath2").hide();
		
		
		if($("#origin").val() == "Origin" || $("#destination").val()== "Destination" || $("#weekday").val() =="Day" || $("#cot").val() =="cot"|| $("#npc").val() =="npc"){
			isResult = false;

			alert("All fields are mandatory");
			return false;
		}
		$('#show-result').show();
		initMap();
		// Get Shortest time 
		getShortestTransitTime($("#origin").val(), $("#destination").val(), $("#weekday").val(), $("#cot").val(), $("#npc").val()).then(function(shortestTransitResult){
			if(shortestTransitResult[0].ShortestTransit == undefined || shortestTransitResult[0].ShortestTransit.length == 0){
				//alert("No Record Found");
				$("#shortestPath").hide();
 
				return false;
			}
			else{
				$("#norecord").hide();
				$("#shortestPath").show();

			}
			isResult = true;

 			getLatLong(shortestTransitResult[0].ShortestTransit.Disp_Drop_PIN_UNIQUE_AIRPORT).then(function(result){
			
				var locArr = result[0].Location;
				var lastPos = "", currPos ={};
 				for(var i = 0; i < locArr.length; i++){					
					// for pos1 
					var loc = locArr[i].LocLatLONG.split(",")
					if(i==0)
						currPos = {Lat : loc[0], Lang: loc[1], Label: locArr[i].Location, Start: "No"};
					else
						currPos = {Lat : loc[0], Lang: loc[1], Label: locArr[i].Location, Start: "No"};
					if(lastPos != ""){
						//drawCurve(lastPos, currPos, map, "");
						 
						addRoute(lastPos, currPos, "1", "#f5a623");
					}
 					lastPos =  currPos;

				}
				
				var duration = ((shortestTransitResult[0].ShortestTransit.Duration/60).toFixed(2)).split(".");
				$('.flightDuration').html(" "+ duration[0] + "h " + Math.ceil(duration[1] * 60/100) + "m");
				$('.STTRoute').html(shortestTransitResult[0].ShortestTransit.Disp_Route_UNIQUE_LEGS);
				var timeStart = shortestTransitResult[0].ShortestTransit.Fil_CUTOFF;
				var timeEnd = "";
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
			if(recentTransitResult[0].RecentTransit == undefined || recentTransitResult[0].RecentTransit.length == 0){
				 $("#recentPath").hide();
  				 return false;

			}
			else{
				$("#norecord").hide();

				$("#recentPath").show();
			}
			isResult = true;
			// This is hack to see other route for demo
			/*if($("#origin").val() == "HKG" && $("#destination").val()== "ORD" && $("#weekday").val() =="Friday" && $("#cot").val() =="3" && $("#npc").val() =="P"){
				recentTransitResult[0].RecentTransit.Disp_Drop_PIN_UNIQUE_AIRPORT= "HKG|LAX|SFO|NUQ|CVG|ORD";

			}*/
 			getLatLong(recentTransitResult[0].RecentTransit.Disp_Drop_PIN_UNIQUE_AIRPORT).then(function(result){
			
				var locArr = result[0].Location;
				var lastPos = ""
 				for(var i = 0; i < locArr.length; i++){					
					// for pos1 
					var loc = locArr[i].LocLatLONG.split(",")
					var currPos = {Lat : loc[0], Lang: loc[1], Label: locArr[i].Location, Start: "No"};
					
					if(lastPos != ""){
						//drawCurve(lastPos, currPos, map, "Dashed");
						addRoute(lastPos, currPos, "1", "#8b572a");
					}
 					lastPos =  currPos;

				}
				
				var dated = recentTransitResult[0].RecentTransit.Value_Date_Count_Duration
				$('.recentFlightDated').html(dated);
				
				var duration = ((recentTransitResult[0].RecentTransit.Duration/60).toFixed(2)).split(".");
				$('.recentFlightDuration').html(" "+ duration[0] + "h " + Math.ceil(duration[1] * 60/100) + "m");
				$('.recentSTTRoute').html(recentTransitResult[0].RecentTransit.Disp_Route_UNIQUE_LEGS);
				var timeStart = recentTransitResult[0].RecentTransit.Fil_CUTOFF;
				var timeEnd = "";
				 
				
				var todayTime  = timeStart.split(":");
				 
				
				var today = new Date();
				var startDate = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate(), todayTime[0],todayTime[1]);
				startDate.setMinutes(recentTransitResult[0].RecentTransit.Duration);
				var timeEnd = startDate.toLocaleTimeString().split(":");
				
				$('.recentSTTTimeStart').html(timeStart);
				$('.recentSTTTimeEnd').html(timeEnd[0] +":"+ timeEnd[1]); // change here
				$('.recentSTTStops').html(recentTransitResult[0].RecentTransit.Disp_No_of_stops_uniquelegslength + " Stops");

				var leg = recentTransitResult[0].RecentTransit.Disp_Route_UNIQUE_LEGS.split("|");
 				
				$('.recentStartPoint').html(leg[0]);
				$('.recentEndPoint').html(leg[leg.length-1]);

				
				$('#show-result').show();
			})
			
		});
		
		// Get Frequent time 
	getFrequentTransitTime($("#origin").val(), $("#destination").val(), $("#weekday").val(), $("#cot").val(), $("#npc").val()).then(		function(frequentTransitResult){
	
			if(frequentTransitResult[0].FrequentTransit == undefined || frequentTransitResult[0].FrequentTransit.length == 0){
				 $("#frequentPath").hide();
  				 return false;

			}
			else{
				 $("#norecord").hide();

				 $("#frequentPath").show();
			}
			isResult = true;
			// This is hack to see other route for demo
			/*if($("#origin").val() == "HKG" && $("#destination").val()== "ORD" && $("#weekday").val() =="Friday" && $("#cot").val() =="3" && $("#npc").val() =="P"){
				frequentTransitResult[0].FrequentTransit.Disp_Drop_PIN_UNIQUE_AIRPORT = "BRU|AMS|LEJ|LTN|LHR|JNB";
			}*/
 			getLatLong(frequentTransitResult[0].FrequentTransit.Disp_Drop_PIN_UNIQUE_AIRPORT).then(function(result){
			
				var locArr = result[0].Location;
				var lastPos = ""
 				for(var i = 0; i < locArr.length; i++){					
					// for pos1 
					var loc = locArr[i].LocLatLONG.split(",")
					var currPos = {Lat : loc[0], Lang: loc[1], Label: locArr[i].Location, Start: "No"};
					
					if(lastPos != ""){
						//drawCurve(lastPos, currPos, map);
						addRoute(lastPos, currPos, "1", "#ff3b30");
					}
 					lastPos =  currPos;

				}
				var count = frequentTransitResult[0].FrequentTransit.Value_Date_Count_Duration;
				$('.frequentCount').html(count);
				
				var duration = ((frequentTransitResult[0].FrequentTransit.Duration/60).toFixed(2)).split(".");
				$('.frequentFlightDuration').html(" "+ duration[0] + "h " + Math.ceil(duration[1] * 60/100) + "m");
				$('.frequentSTTRoute').html(frequentTransitResult[0].FrequentTransit.Disp_Route_UNIQUE_LEGS);
				var timeStart = frequentTransitResult[0].FrequentTransit.Fil_CUTOFF;
				var timeEnd = "";
				 
				var todayTime  = timeStart.split(":");
				
				 
				
				var today = new Date();
				var startDate = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate(), todayTime[0],todayTime[1]);
				startDate.setMinutes(frequentTransitResult[0].FrequentTransit.Duration);
				var timeEnd = startDate.toLocaleTimeString().split(":");
				
				$('.frequentSTTTimeStart').html(timeStart);
				$('.frequentSTTTimeEnd').html(timeEnd[0] +":"+ timeEnd[1]); // change here
				$('.frequentSTTStops').html(frequentTransitResult[0].FrequentTransit.Disp_No_of_stops_uniquelegslength + " Stops");

				var leg = frequentTransitResult[0].FrequentTransit.Disp_Route_UNIQUE_LEGS.split("|");
 				
				$('.frequentStartPoint').html(leg[0]);
				$('.frequentEndPoint').html(leg[leg.length-1]);

				
				$('#show-result').show();
			})
			
		});
		
			// Get current route 1 
 getCurrentTransitTime($("#origin").val(), $("#destination").val(), $("#weekday").val(), $("#cot").val(), $("#npc").val()).then(		function(currentTransitResult){
			if(currentTransitResult[0].CurrentTransit == undefined || currentTransitResult[0].CurrentTransit.length == 0){
				 $("#routePath1").hide();
  				 
				 return false;

			}
			else{
				 $("#norecord").hide();
				 $("#routePath1").show();
			}
			isResult = true;
			// This is hack to see other route for demo
			/*if($("#origin").val() == "HKG" && $("#destination").val()== "ORD" && $("#weekday").val() =="Friday" && $("#cot").val() =="3" && $("#npc").val() =="P"){
				currentTransitResult[0].CurrentTransit.Disp_Drop_PIN_UNIQUE_AIRPORT= "HKG|LAX|SFO|NUQ|CVG|ORD";

			}*/
 			getLatLong(currentTransitResult[0].CurrentTransit.Disp_Drop_PIN_UNIQUE_AIRPORT).then(function(result){
			
				var locArr = result[0].Location;
				var lastPos = ""
 				for(var i = 0; i < locArr.length; i++){					
					// for pos1 
					var loc = locArr[i].LocLatLONG.split(",")
					var currPos = {Lat : loc[0], Lang: loc[1], Label: locArr[i].Location, Start: "No"};
					
					if(lastPos != ""){
						//drawCurve(lastPos, currPos, map, "Dashed");
						addRoute(lastPos, currPos,"1", "#0079fe");
					}
 					lastPos =  currPos;

				}
				
				var duration = ((currentTransitResult[0].CurrentTransit.Duration/60).toFixed(2)).split(".");
				$('.currentFlightDuration').html(" "+ duration[0] + "h " + Math.ceil(duration[1] * 60/100)+ "m");
				$('.currentSTTRoute').html(currentTransitResult[0].CurrentTransit.Disp_Route_UNIQUE_LEGS);
				var timeStart = currentTransitResult[0].CurrentTransit.Fil_CUTOFF;
				var timeEnd = "";
				 
				
				var todayTime  = timeStart.split(":");
				 
				
				var today = new Date();
				var startDate = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate(), todayTime[0],todayTime[1]);
				startDate.setMinutes(currentTransitResult[0].CurrentTransit.Duration);
				var timeEnd = startDate.toLocaleTimeString().split(":");
				
				$('.currentSTTTimeStart').html(timeStart);
				$('.currentSTTTimeEnd').html(timeEnd[0] +":"+ timeEnd[1]); // change here
				$('.currentSTTStops').html(currentTransitResult[0].CurrentTransit.Disp_No_of_stops_uniquelegslength + " Stops");

				var leg = currentTransitResult[0].CurrentTransit.Disp_Route_UNIQUE_LEGS.split("|");
 				
				$('.currentStartPoint').html(leg[0]);
				$('.currentEndPoint').html(leg[leg.length-1]);

				
				$('#show-result').show();
			})
			
		});
		
			// Get current route 2
 getCurrentTransitTimeRoute2($("#origin").val(), $("#destination").val(), $("#weekday").val(), $("#cot").val(), $("#npc").val()).then(		function(currentTransitRoute2Result){
			if(currentTransitRoute2Result[0].CurrentTransitRoute2 == undefined || currentTransitRoute2Result[0].CurrentTransitRoute2.length == 0){
				 $("#routePath2").hide();
  				 
				 return false;

			}
			else{
				 $("#norecord").hide();
				 $("#routePath2").show();
			}
			isResult = true;
			// This is hack to see other route for demo
			/*if($("#origin").val() == "HKG" && $("#destination").val()== "ORD" && $("#weekday").val() =="Friday" && $("#cot").val() =="3" && $("#npc").val() =="P"){
				currentTransitRoute2Result[0].CurrentTransitRoute2.Disp_Drop_PIN_UNIQUE_AIRPORT= "HKG|LAX|SFO|NUQ|CVG|ORD";

			}*/
 			getLatLong(currentTransitRoute2Result[0].CurrentTransitRoute2.Disp_Drop_PIN_UNIQUE_AIRPORT).then(function(result){
			
				var locArr = result[0].Location;
				var lastPos = ""
 				for(var i = 0; i < locArr.length; i++){					
					// for pos1 
					var loc = locArr[i].LocLatLONG.split(",")
					var currPos = {Lat : loc[0], Lang: loc[1], Label: locArr[i].Location, Start: "No"};
					
					if(lastPos != ""){
						//drawCurve(lastPos, currPos, map, "Dashed");
						addRoute(lastPos, currPos,"1", "#303030");
					}
 					lastPos =  currPos;

				}
				
				var duration = ((currentTransitRoute2Result[0].CurrentTransitRoute2.Duration/60).toFixed(2)).split(".");
				$('.current2FlightDuration').html(" "+ duration[0] + "h " + Math.ceil(duration[1] * 60/100) + "m");
				$('.current2STTRoute').html(currentTransitRoute2Result[0].CurrentTransitRoute2.Disp_Route_UNIQUE_LEGS);
				var timeStart = currentTransitRoute2Result[0].CurrentTransitRoute2.Fil_CUTOFF;
				var timeEnd = "";
				
				var todayTime  = timeStart.split(":");
								
				var today = new Date();
				var startDate = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate(), todayTime[0],todayTime[1]);
				startDate.setMinutes(currentTransitRoute2Result[0].CurrentTransitRoute2.Duration);
				var timeEnd = startDate.toLocaleTimeString().split(":");
				
				$('.current2STTTimeStart').html(timeStart);
				$('.current2STTTimeEnd').html(timeEnd[0] +":"+ timeEnd[1]); // change here
				$('.current2STTStops').html(currentTransitRoute2Result[0].CurrentTransitRoute2.Disp_No_of_stops_uniquelegslength + " Stops");

				var leg = currentTransitRoute2Result[0].CurrentTransitRoute2.Disp_Route_UNIQUE_LEGS.split("|");
 				
				$('.current2StartPoint').html(leg[0]);
				$('.current2EndPoint').html(leg[leg.length-1]);

				
				$('#show-result').show();
			})
			
		});
		
	});
});
function drawCurve(po1, po2, map, lineType) {

	
var icons = {
				path: google.maps.SymbolPath.CIRCLE,
 				fillColor: '#f5a623',
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

  var curvedLine = new GmapsCubicBezier(P1, pA, pB, P2, 0.01, map);
		  
		  
}
function addRoute(po1, po2, strokeOp, color){
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
		
		//map.fitBounds(bounds);
		var icons = {
				path: google.maps.SymbolPath.CIRCLE,
 				fillColor: '#C63726',
				fillOpacity: 1,
				scale: 12,
				strokeColor: 'black',
				strokeWeight: 2
 			};
			
		var markerP1 = new Marker({
			position: pos1,
			label: po1.Label,
			draggable: false,
			icon: ((po1.Start == "Yes") ? icons : null),
			map: map
		});
		 
		var markerP2 = new Marker({
			position: pos2,
			label: po2.Label,
			draggable: false,
			icon: ((po1.Start == "Yes") ? icons : null),
			map: map
		});
			var curveMarker, curveMarker1;

		updateCurveMarker(strokeOp, color);
	function updateCurveMarker(strokeOp) {
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
			
		/*if(map.getZoom() != 2)
			map.setZoom(2); */
				
        var zoom = map.getZoom(),
            scale = 1 / (Math.pow(2, -zoom));

        var symbol = {
            path: pathDef,
            scale: scale,
            strokeWeight: 6,
			strokeColor: color,
            fillColor: color,
			strokeOpacity: parseFloat(strokeOp),
        };
		var symbolBorder = {
            path: pathDef,
            scale: scale,
            strokeWeight: 8,
			strokeColor: '#4a4a4a',
            fillColor: color,
			strokeOpacity: parseFloat(strokeOp),
        };
        if (!curveMarker) {
            if(strokeOp != "0.6"){
				curveMarker1 = new Marker({
					position: pos1,
					clickable: false,
					icon: symbolBorder,
					zIndex: 0, // behind the other markers
					map: map
				});
			}
			curveMarker = new Marker({
                position: pos1,
                clickable: false,
                icon: symbol,
                zIndex: 0, // behind the other markers
                map: map
            });
        } else {
		     if(strokeOp != "0.6"){
				curveMarker1.setOptions({
					position: pos1,
					icon: symbolBorder,
				});
			}
            curveMarker.setOptions({
                position: pos1,
                icon: symbol,
            });
			 
        }
		
		/*google.maps.event.addListener(curveMarker,"click",function(event){
			infowindow = null;
			infowindow = new google.maps.InfoWindow({			
			  content: '<div id="content"> Test Window</div>'
			});
			infowindow.setPosition(event.latLng);
			infowindow.open(map);
		});
		*/
		
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
		  zoomControl: true,
	      scrollwheel: true, 
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
					featureType: "administrative.country",
					elementType: "geometry.stroke",
					stylers: [
						{ visibility: "off" }
					]
				  },
				  {
					featureType: "administrative.land_parcel",
					elementType: "geometry.stroke",
					stylers: [
						{ visibility: "off" }
					]
				  },
				  {
					featureType: "administrative.locality",
					elementType: "geometry.stroke",
					stylers: [
						{ visibility: "off" }
					]
				  },
				  {
					featureType: "administrative.neighborhood",
					elementType: "geometry.stroke",
					stylers: [
						{ visibility: "off" }
					]
				  },
				  {
					featureType: "administrative.province",
					elementType: "geometry.stroke",
					stylers: [
						{ visibility: "off" }
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
                        "visibility": "off"
                      }
                    ]
                  },
                  {
                    "elementType": "labels.text.stroke",
                    "stylers": [
                      {
                         "visibility": "off"
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
		
     /*google.maps.event.addListener(map, 'click', function(event){
	 
		alert(event);
	 });
*/

	}
function pixelToLatlng(xcoor, ycoor) {
  var ne = map.getBounds().getNorthEast();
  var sw = map.getBounds().getSouthWest();
  var projection = map.getProjection();
  var topRight = projection.fromLatLngToPoint(ne);
  var bottomLeft = projection.fromLatLngToPoint(sw);
  var scale = 1 << map.getZoom();
  var newLatlng = projection.fromPointToLatLng(new google.maps.Point(xcoor / scale + bottomLeft.x, ycoor / scale + topRight.y));
  return newLatlng;
};
function point2LatLng(point, map) {
  var topRight = map.getProjection().fromLatLngToPoint(map.getBounds().getNorthEast());
  var bottomLeft = map.getProjection().fromLatLngToPoint(map.getBounds().getSouthWest());
  var scale = Math.pow(2, map.getZoom());
  var worldPoint = new google.maps.Point(point.x / scale + bottomLeft.x, point.y / scale + topRight.y);
  return map.getProjection().fromPointToLatLng(worldPoint);
}
var GmapsCubicBezier = function(latlong1, latlong2, latlong3, latlong4, resolution, map) {
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
    fillColor: '#f5a623',
		fillOpacity: 1,
		scale: 12,
		strokeColor: '#f5a623',
		strokeWeight: 6   
/* dashed line:
    icons: [{
      icon: {
        path: 'M 0,-1 0,1',
        strokeOpacity: 1,
        scale: 4
      },
      offset: '0',
      repeat: '20px'
    }], */
  });

  Line.setMap(map);

  return Line;
};


GmapsCubicBezier.prototype = {

  B1: function(t) {
    return t * t * t;
  },
  B2: function(t) {
    return 3 * t * t * (1 - t);
  },
  B3: function(t) {
    return 3 * t * (1 - t) * (1 - t);
  },
  B4: function(t) {
    return (1 - t) * (1 - t) * (1 - t);
  },
  getBezier: function(C1, C2, C3, C4, percent) {
    var pos = {};
    pos.x = C1.x * this.B1(percent) + C2.x * this.B2(percent) + C3.x * this.B3(percent) + C4.x * this.B4(percent);
    pos.y = C1.y * this.B1(percent) + C2.y * this.B2(percent) + C3.y * this.B3(percent) + C4.y * this.B4(percent);
    return pos;
  }
};