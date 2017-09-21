function openDB(){
	return  window.openDatabase("DHL.db", '1', 'DHL', 1024 * 1024 * 50); // browser
}

function createTable(){
    var defer = $.Deferred();

	var db = openDB();	
	var sql = ["DROP TABLE IF EXISTS tblRoute",
	"DROP TABLE IF EXISTS tblDropPIN",
	"CREATE TABLE IF NOT EXISTS  tblRoute (ID INTEGER PRIMARY KEY AUTOINCREMENT, Fil_DAY_OF_WEEK  VARCHAR(255), Fil_CUTOFF  VARCHAR(50), Fil_Destination_Service_Area VARCHAR(10), Fil_Origin_Service_Area VARCHAR(10), Fil_Network_Product_Code VARCHAR(10), Duration INTEGER, Disp_Route_UNIQUE_LEGS VARCHAR(255), Disp_Drop_PIN_UNIQUE_AIRPORT VARCHAR(255), Disp_No_of_stops_uniquelegslength INTEGER, Type_of_route VARCHAR(255), Value_Date_Count_Duration INTEGER );",
	"CREATE TABLE IF NOT EXISTS tblDropPIN(ID INTEGER PRIMARY KEY AUTOINCREMENT, Location VARCHAR(255), LocLatLONG VARCHAR(255));"
	 
	]

	db.transaction(function(tx) {
		var i = 1;
		$.each(sql, function(index, value) {
		  tx.executeSql(value, []);
		  if(i == sql.length){
			defer.resolve();
		  }
		  i++;
		});
 	});
		
    return defer;
	
 }

function insertData(){
    var defer = $.Deferred();

 	var db = openDB(); 	
   //Check for app Constant file in case any changes in delete statement
	db.transaction(function(tx) {
		var data = routeArray;
		var i = 1;
			$.each( data, function( key, obj ) {
			 var sql = "INSERT INTO tblRoute (Fil_DAY_OF_WEEK, Fil_CUTOFF, Fil_Destination_Service_Area,Fil_Origin_Service_Area, Fil_Network_Product_Code, Duration, Disp_Route_UNIQUE_LEGS, Disp_Drop_PIN_UNIQUE_AIRPORT, Disp_No_of_stops_uniquelegslength, Type_of_route, Value_Date_Count_Duration) VALUES ('"+obj.Fil_DAY_OF_WEEK +"', '"+obj.Fil_CUTOFF +"','" + obj.Fil_Destination_Service_Area  +"' , '" + obj.Fil_Origin_Service_Area  +"' , '" + obj.Fil_Network_Product_Code+"',  " + obj.Duration+", '" + obj.Disp_Route_UNIQUE_LEGS+"',  '" + obj.Disp_Drop_PIN_UNIQUE_AIRPORT+"', " + obj.Disp_No_of_stops_uniquelegslength+",  '" + obj.Type_of_route+"', '" + obj.Value_Date_Count_Duration+"');";
				tx.executeSql(sql, [], function (tx, results) {
 		 		            	// do something
				},  function (tx, err) {
					console.log(err.message);
					console.log(sql);
 				});
			 if(i == data.length){
				defer.resolve();
			  }
			 i++;
    	                           
		  });
		  var dropPinData = dropPin;
		  $.each( dropPinData, function( key, obj ) {
				var sql = "INSERT INTO tblDropPIN (Location, LocLatLONG) VALUES ('"+obj.Location +"', '"+obj.LocLatLONG +"');";
				tx.executeSql(sql, [], function (tx, results) {
 		 		            	// do something
				},  function (tx, err) {
					console.log(err.message);
					console.log(sql);
 				});
			 if(i == data.length){
				defer.resolve();
			  }
			 i++;
    	                           
		  });
 	});
   
    return defer;
}

function getDestination(){
	var defer = $.Deferred();

	var db = openDB();	
	var sql = "SELECT DISTINCT Fil_Destination_Service_Area FROM tblRoute where Fil_Destination_Service_Area !=  'NULL'";

	db.transaction(function(tx) { 		 
		tx.executeSql(sql, [], function(tx, results){
			  var arr = [];
			  for(var j = 0; j < results.rows.length; j++){
				  arr.push( results.rows.item(j));
			  }
			  defer.resolve([{"Destination" : arr}]);
		  }, function(tx,error){
			  //d.reject(error);
		  });
  	});
		
    return defer;
}
function getOrigin(){
	var defer = $.Deferred();

	var db = openDB();	
	var sql = "SELECT DISTINCT Fil_Origin_Service_Area FROM tblRoute  where Fil_Origin_Service_Area !=  'NULL'";

	db.transaction(function(tx) { 		 
		tx.executeSql(sql, [], function(tx, results){
			  var arr = [];
			  for(var j = 0; j < results.rows.length; j++){
				  arr.push( results.rows.item(j));
			  }
			  defer.resolve([{"Origin" : arr}]);
		  }, function(tx,error){
			  //d.reject(error);
		  });
  	});
		
    return defer;
}
function getNPC(){
	var defer = $.Deferred();

	var db = openDB();	
	var sql = "SELECT DISTINCT Fil_Network_Product_Code FROM tblRoute where Fil_Network_Product_Code !=  'NULL' ";

	db.transaction(function(tx) { 		 
		tx.executeSql(sql, [], function(tx, results){
			  var arr = [];
			  for(var j = 0; j < results.rows.length; j++){
				  arr.push( results.rows.item(j));
			  }
			  defer.resolve([{"NPC" : arr}]);
		  }, function(tx,error){
			  //d.reject(error);
		  });
  	});
		
    return defer;
}
function getCOT(){
	var defer = $.Deferred();

	var db = openDB();	
	var sql = "SELECT DISTINCT Fil_CUTOFF FROM tblRoute where Fil_CUTOFF !=  'NULL' order by Fil_CUTOFF";

	db.transaction(function(tx) { 		 
		tx.executeSql(sql, [], function(tx, results){
			  var arr = [];
			  for(var j = 0; j < results.rows.length; j++){
				  arr.push( results.rows.item(j));
			  }
			  defer.resolve([{"COT" : arr}]);
		  }, function(tx,error){
			  //d.reject(error);
		  });
  	});
		
    return defer;
}
function getShortestTransitTime(org, dest, day, cot, npc){
	var defer = $.Deferred();
	var db = openDB();	
	var sql = "SELECT  * From tblRoute where Fil_Origin_Service_Area = '"+org+"' AND Fil_Destination_Service_Area= '"+ dest+"' AND Fil_DAY_OF_WEEK = '"+day.toUpperCase()+"' AND Fil_Network_Product_Code = '"+npc+"' AND Fil_CUTOFF= '" + cot+"' AND Type_of_route='Shortest Transit Time' order by Duration";

	db.transaction(function(tx) { 		 
		tx.executeSql(sql, [], function(tx, results){
			  var arr = [];
			  for(var j = 0; j < results.rows.length; j++){
				  arr.push( results.rows.item(j));
			  }
			  defer.resolve([{"ShortestTransit" : arr[0]}]);
		  }, function(tx,error){
			  alert(error.message);
		  });
  	});
		
    return defer;
}
function getRecentTransitTime(org, dest, day, cot, npc){
	var defer = $.Deferred();
	var db = openDB();	
	var sql = "SELECT  * From tblRoute where Fil_Origin_Service_Area = '"+org+"' AND Fil_Destination_Service_Area= '"+ dest+"' AND Fil_DAY_OF_WEEK = '"+day.toUpperCase()+"' AND Fil_Network_Product_Code = '"+npc+"' AND Fil_CUTOFF= '" + cot+"' AND Type_of_route='Recently Used' order by Value_Date_Count_Duration desc";

	db.transaction(function(tx) { 		 
		tx.executeSql(sql, [], function(tx, results){
			  var arr = [];
			  for(var j = 0; j < results.rows.length; j++){
				  arr.push( results.rows.item(j));
			  }
			  defer.resolve([{"RecentTransit" : arr[0]}]);
		  }, function(tx,error){
			  alert(error.message);
		  });
  	});
		
    return defer;
}
function getFrequentTransitTime(org, dest, day, cot, npc){
	var defer = $.Deferred();
	var db = openDB();	
	var sql = "SELECT SUM(Value_Date_Count_Duration) as TotalCount, * From tblRoute where Fil_Origin_Service_Area = '"+org+"' AND Fil_Destination_Service_Area= '"+ dest+"' AND Fil_DAY_OF_WEEK = '"+day.toUpperCase()+"' AND Fil_Network_Product_Code = '"+npc+"' AND Fil_CUTOFF= '" + cot+"' AND Type_of_route='Most Frequent' group by Disp_Route_UNIQUE_LEGS";

	db.transaction(function(tx) { 		 
		tx.executeSql(sql, [], function(tx, results){
			  var arr = [];
			  for(var j = 0; j < results.rows.length; j++){
				  arr.push( results.rows.item(j));
			  }
			  defer.resolve([{"FrequentTransit" : arr[0]}]);
		  }, function(tx,error){
			  alert(error.message);
		  });
  	});
		
    return defer;
}
function getCurrentTransitTime(org, dest, day, cot, npc){
	var defer = $.Deferred();
	var db = openDB();	
	var sql = "SELECT SUM(Value_Date_Count_Duration) as TotalCount, * From tblRoute where Fil_Origin_Service_Area = '"+org+"' AND Fil_Destination_Service_Area= '"+ dest+"' AND Fil_DAY_OF_WEEK = '"+day.toUpperCase()+"' AND Fil_Network_Product_Code = '"+npc+"' AND Fil_CUTOFF= '" + cot+"' AND Type_of_route='Current route 1' group by Disp_Route_UNIQUE_LEGS";

	db.transaction(function(tx) { 		 
		tx.executeSql(sql, [], function(tx, results){
			  var arr = [];
			  for(var j = 0; j < results.rows.length; j++){
				  arr.push( results.rows.item(j));
			  }
			  defer.resolve([{"CurrentTransit" : arr[0]}]);
		  }, function(tx,error){
			  alert(error.message);
		  });
  	});
		
    return defer;
}
function getCurrentTransitTimeRoute2(org, dest, day, cot, npc){
	var defer = $.Deferred();
	var db = openDB();	
	var sql = "SELECT SUM(Value_Date_Count_Duration) as TotalCount, * From tblRoute where Fil_Origin_Service_Area = '"+org+"' AND Fil_Destination_Service_Area= '"+ dest+"' AND Fil_DAY_OF_WEEK = '"+day.toUpperCase()+"' AND Fil_Network_Product_Code = '"+npc+"' AND Fil_CUTOFF= '" + cot+"' AND Type_of_route='Current route 2' group by Disp_Route_UNIQUE_LEGS";

	db.transaction(function(tx) { 		 
		tx.executeSql(sql, [], function(tx, results){
			  var arr = [];
			  for(var j = 0; j < results.rows.length; j++){
				  arr.push( results.rows.item(j));
			  }
			  defer.resolve([{"CurrentTransitRoute2" : arr[0]}]);
		  }, function(tx,error){
			  alert(error.message);
		  });
  	});
		
    return defer;
}
function getLatLong(loc){
	var defer = $.Deferred();
	var db = openDB();	
	//var cls = loc.replace(/\|/g,",");
	var cls = loc.split("|");
	var locStr = "";
	for(var j = 0; j < cls.length; j++){
		if(cls.length == (j+1)){
			locStr = locStr + "'" + cls[j] + "'";
		}
		else
			locStr = locStr + "'" + cls[j] + "',";
	  
	}
	 
	var sql = "SELECT  * From tblDropPIN where Location IN ("+ locStr +")";

	db.transaction(function(tx) { 		 
		tx.executeSql(sql, [], function(tx, results){
			  var arr = [];
			  var newArr = [];
			  for(var j = 0; j < results.rows.length; j++){
				  arr.push( results.rows.item(j));
			  }
			  
			  for(var j = 0; j < cls.length; j++){
				  var obj = $.grep(arr, function(e){ return e.Location == cls[j]; });		
				  newArr.push( obj[0]);
			  }
			  defer.resolve([{"Location" : newArr}]);
		  }, function(tx,error){
			  alert(error.message);
		  });
  	});
		
    return defer;
}