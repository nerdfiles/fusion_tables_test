var map, touristLayer, miscLayer, FTresponse, geocoder;
var infoWindow;
var query = "";
var info = null;
var Marker_TableID = 2441665;

function initialize() {
    var latlng = new google.maps.LatLng(31.22, 29.85);
    var myOptions = {
        singleInfoWindow: false,
        zoom: 11,
        streetViewControl: false,
        zoomControl: true,
        zoomControlOptions:{
            style: google.maps.ZoomControlStyle.DEFAULT,
            position: google.maps.ControlPosition.LEFT_CENTER
        },
        scaleControl: false,
        panControl: false,
        center: latlng,
        styles: alexMapStyle,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById("map_canvas"),
        myOptions);

    touristLayer = new google.maps.FusionTablesLayer(Marker_TableID, {
      suppressInfoWindows: true });

    //console.log(touristLayer);
    touristLayer.setQuery("SELECT Lat FROM " + Marker_TableID + " WHERE Type LIKE 'Tourist'");
    touristLayer.setMap(map);
    addClickHandler(touristLayer);

    miscLayer = new google.maps.FusionTablesLayer(Marker_TableID, {
      suppressInfoWindows: true });
    miscLayer.setQuery("SELECT Lat FROM " + Marker_TableID + " WHERE Type LIKE 'Misc'");
    miscLayer.setMap(map);
    addClickHandler(miscLayer);

    infoWindow = new google.maps.InfoWindow();
    geocoder = new google.maps.Geocoder();

  //$('body').data('map', map);
}


function toggleLayer(checkbox, layer) {

    var $sidebar = $("#sidebar"),
        $info_window = $(".googft-info-window");

    //console.log( $info_window );
    var className = $(checkbox).next().text();

    if (checkbox.checked) {
        console.log( $sidebar.find('.'+className) );
        $sidebar.find('.'+className).removeClass('hide');
        $info_window.removeClass('hide');
        layer.setMap(map);
    } else {
        $sidebar.find('.'+className).addClass('hide');
        $info_window.addClass('hide');
        layer.setMap(null);
    }

}

var alexMapStyle = [
     {
        featureType: "water",
        elementType: "geometry",
        stylers: [
          { hue: "#1100ff" },
          { lightness: -94 }
    ]
    },
    {
        elementType: "labels",
        stylers: [
            { saturation: -100 }
        ]
    },
    {
        featureType: "landscape",
        elementType: "geometry",
        stylers: [
          { hue: "#ffdd00" },
          { saturation: 79 },
          { gamma: 1.72 },
          { lightness: -71}
    ]
    },{
        featureType: "road",
        stylers: [
          { hue: "#00ff6f" },
          { saturation: -100 },
          { lightness: 100 }
        ]
      },{
        featureType: "poi",
        stylers: [
          { hue: "#00ff4d" },
          { saturation: -95 },
          { lightness: 57 }
        ]
      }
  
];

google.load('visualization', '1', {'packages':['corechart', 'table', 'geomap']});

function createSidebar() {
    // https://www.google.com/fusiontables/api/query?sql=SELECT%20ROWID,%20%2A%20FROM%20564705
    //set the query using the parameter
    // var queryText = encodeURIComponent("http://www.google.com/fusiontables/gvizdata?tq=SELECT * FROM FT_TableID");
    // var query = new google.visualization.Query(queryText);
    var queryText = new Array();
        queryText[0] = encodeURIComponent("SELECT 'Name', 'Lat', 'Description', 'Type' FROM " + Marker_TableID );
     
    var query = new google.visualization.Query('http://www.google.com/fusiontables/gvizdata?tq=' + queryText[0]);
    //set the callback function
    query.send(getData);
}

google.setOnLoadCallback(createSidebar);


function getData(response) {
    if (!response) {
        alert('no response');
        return;
    }

    if (response.isError()) {
        alert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
        return;
    }

    FTresponse = response;
  //for more information on the response object, see the documentation
  //http://code.google.com/apis/visualization/documentation/reference.html#QueryResponse
  numRows = response.getDataTable().getNumberOfRows();
  numCols = response.getDataTable().getNumberOfColumns();
  var classAttr = "class";

  //concatenate the results into a string, you can build a table here
  fusiontabledata = "<table class='" + classAttr + "'><tr>";
//  for(i = 0; i < numCols; i++) {
    fusiontabledata += "<th>" + response.getDataTable().getColumnLabel(0) + "</th>";
//   }
  fusiontabledata += "</tr><tr>";

  //FT_infowindow
  for(i = 0; i < numRows; i++) {
//    for(j = 0; j < numCols; j++) {
      fusiontabledata += "<td class="+response.getDataTable().getValue(i, 3)+"><a href='javascript:myFTclick("+i+")'>"+response.getDataTable().getValue(i, 0) + "</a></td>";
//    }
    fusiontabledata += "</tr><tr>";
  }
  fusiontabledata += "</table>"  

  //display the results on the page
  document.getElementById('sidebar').innerHTML = fusiontabledata;
}


function openInfoWindowGeocoded(address, name, description) {
    if(geocoder) {
        geocoder.geocode({ 'address': address}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                if (status != google.maps.GeocoderStatus.ZERO_RESULTS) {
                    map.setCenter(results[0].geometry.location);
                    openFtInfoWindow(results[0].geometry.location, name, description, lat);
                } else {
                    alert("No results found");
                }
            } else {
                alert("Geocode was not successful for the following reason: " + status);
            }
        });
    }
}

function openFtInfoWindow(position, name, description) {
     // Set up and create the infowindow
     if (!infoWindow) infoWindow = new google.maps.InfoWindow({});
     var content = '<div class="FT_infowindow">' + name;
     if (description)  content += '<br>'+description;

     infoWindow.setOptions({
       content: content,
       pixelOffset: null,
       position: position
     });

     // Infowindow-opening event handler
     infoWindow.open(map);
}

function myFTclick(row) {
   var name = FTresponse.getDataTable().getValue(row,0);
   var description = FTresponse.getDataTable().getValue(row,2);
   var latlng =  FTresponse.getDataTable().getValue(row,1);

    //console.log( name );

   if (latlng.indexOf("<") === -1) {
     var coords = latlng.split(',');
     var lat = parseFloat(coords[0]);
     var lng = parseFloat(coords[1]);

     if (isNaN(lat) || isNaN(lng)) {
       // assume address, send to geocoder
       openInfoWindowGeocoded(latlng, name, description);
     }

     var position = new google.maps.LatLng(lat,lng);
     openFtInfoWindow(position, name, description);
   }
}


function addClickHandler(FTLayer) {
    google.maps.event.addListener(FTLayer, "click", function(event) {
        if (infoWindow) infoWindow.close();
        infoWindow.setOptions({pixelOffset:null,
            content:event.infoWindowHtml,
            position:event.latLng
        });
        infoWindow.open(map);
    });
}


;(function($){
  
  var mapThing = {

    toggleLayer: function() {
      $('checkbox').bind('change', function(e) {
        var $elem = $(this);
        //console.log( $elem.attr('checked') );
        /*
        var latlng = new google.maps.LatLng(31.22, 29.85);
        var myOptions = {
            zoom: 11,
            streetViewControl: false,
            zoomControl: true,
            zoomControlOptions:{
                style: google.maps.ZoomControlStyle.DEFAULT,
                position: google.maps.ControlPosition.LEFT_CENTER
            },
            scaleControl: false,
            panControl: false,
            center: latlng,
            styles: alexMapStyle,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        map = new google.maps.Map($("#map_canvas"),
            myOptions);
        */
        //var miscLayer = new google.maps.FusionTablesLayer(Marker_TableID, {
        //  suppressInfoWindows: true
        //});
        //miscLayer.setQuery("SELECT Lat FROM " + Marker_TableID + " WHERE Type LIKE 'Misc'");
        //miscLayer.setMap(map);
        //console.log(miscLayer);
        //console.log($('body').data('map'));
        toggleLayer($elem, miscLayer);
      });
    },

    init: function() {
      
      this.toggleLayer();

      //initialize();
    }

  };

  mapThing.init();

})(jQuery);
