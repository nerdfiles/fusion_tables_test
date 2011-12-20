//;(function($) {
  
  var map, gmarkers, touristLayer, miscLayer, FTresponse, geocoder;
  var infoWindow;
  var query = "";
  var info = null;
  var Marker_TableID = 2441665;
  var mrkr_array = [];

  /*
  function initialize() {

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

      map = new google.maps.Map(document.getElementById("map_canvas"),
          myOptions);

      // Layers!

      touristLayer = new google.maps.FusionTablesLayer(
          Marker_TableID, { 
            suppressInfoWindows: true });
      touristLayer.setQuery("SELECT Lat FROM " + Marker_TableID + " WHERE Type LIKE 'Tourist'");
      touristLayer.setMap(map);
      //addClickHandler(touristLayer);

      //console.log( touristLayer );
      
      miscLayer = new google.maps.FusionTablesLayer(
          Marker_TableID, {
            suppressInfoWindows: true });
      miscLayer.setQuery("SELECT Lat FROM " + Marker_TableID + " WHERE Type LIKE 'Misc'");
      miscLayer.setMap(map);
      //addClickHandler(miscLayer);

      // Geocoder/InfoWindow

      infoWindow = new google.maps.InfoWindow();
      geocoder = new google.maps.Geocoder();
      
      //$('body').data('map', map);

  } // End initialize
  */

  var alexMapStyle = [
      {
          featureType: "water",
          elementType: "geometry",
          stylers: [
            { hue: "#1100ff" },
            { lightness: -94 } ]
      },
      {
          elementType: "labels",
          stylers: [
              { saturation: -100 } ]
      },
      {
          featureType: "landscape",
          elementType: "geometry",
          stylers: [
            { hue: "#ffdd00" },
            { saturation: 79 },
            { gamma: 1.72 },
            { lightness: -71} ]
      },
      {
        featureType: "road",
        stylers: [
            { hue: "#00ff6f" },
            { saturation: -100 },
            { lightness: 100 }
          ]
      },
      {
        featureType: "poi",
        stylers: [
          { hue: "#00ff4d" },
          { saturation: -95 },
          { lightness: 57 } ]
      }
    
  ];

  google.load('visualization', '1', {'packages':['corechart', 'table', 'geomap']});

  function createSidebar() {

      // https://www.google.com/fusiontables/api/query?sql=SELECT%20ROWID,%20%2A%20FROM%20564705
      //set the query using the parameter
      // var queryText = encodeURIComponent("http://www.google.com/fusiontables/gvizdata?tq=SELECT * FROM FT_TableID");
      // var query = new google.visualization.Query(queryText);
      var queryText = [];
          
      queryText[0] = encodeURIComponent("SELECT 'Name', 'Lat', 'Description', 'Type' FROM " + Marker_TableID );

      var query = new google.visualization.Query('http://www.google.com/fusiontables/gvizdata?tq=' + queryText[0]);

      //set the callback function
      query.send(getData);

  } // End createSidebar

  //google.setOnLoadCallback(createSidebar);

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

    //concatenate the results into a string, you can build a table here
    var $fusiontabledata = $('<ul />');
        
    $fusiontabledata.append('<header><h2>' + response.getDataTable().getColumnLabel(0) + '</h2></header>');

    var html = [];
    //FT_infowindow
    for(i = 0; i < numRows; i++) {
      //console.log( response.getDataTable().getValue(i, 3) );
      html.push('<li class="' + response.getDataTable().getValue(i, 3) + '"><td><a href="#" data-markerid="'+i+'">'+response.getDataTable().getValue(i, 0) + '</a></li>');
      var ll_array = response.getDataTable().getValue(i,1).toString().split(" ");
      var latlng = new google.maps.LatLng(ll_array[0], ll_array[1]);
      var mrkr = new google.maps.Marker({
        position: latlng
      });
      mrkr_array.push(mrkr);
    }

    $fusiontabledata.append( html.join('') );

    //display the results on the page
    $('#sidebar > div.mod-type-selector > div.inner').append( $fusiontabledata );

  } // End getData


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

  } // End openInfoWindowGeocoded

  function openFtInfoWindow(position, name, description) {
       // Set up and create the infowindow
       if (!infoWindow) infoWindow = new google.maps.InfoWindow();
       var content = '<div class="FT_infowindow">' + name;
       if (description)  content += '<br>'+description;
       //console.log( infoWindow );

       infoWindow.setOptions({
         content: content,
         pixelOffset: null,
         position: position
       });

       // Infowindow-opening event handler
       infoWindow.open(map);

       //google.maps.event.trigger(map, 'click');
       
  } // End openFtInfoWindow

/*
  function addClickHandler(FTLayer) {

    var FTLayer = FTLayer;

    google.maps.event.addListener(FTLayer, "click", function(event) {
    
    if (infoWindow) {
      infoWindow.close();
    }

    infoWindow.setOptions({
        pixelOffset:null,
        //content:event.infoWindowHtml,
        position:event.latLng
    });

    infoWindow.open(map);
    
    });

  } // End func addClickHandler
*/

/*
  function toggleLayer(checkbox, layer) {

      var $sidebar = $("#sidebar"),
          $info_window = $(".googft-info-window");

      //console.log( $info_window );
      var className = $(checkbox).next().text();

      if (checkbox.checked) {
          //console.log( $sidebar.find('.'+className) );
          $sidebar.find('.'+className).removeClass('hide');
          $info_window.removeClass('hide');
          layer.setMap(map);
      } else {
          $sidebar.find('.'+className).addClass('hide');
          $info_window.addClass('hide');
          layer.setMap(null);
      }

  } // End toggleLayer
*/

  var mapThing = {

    toggleLayer: function() {
      $('input[type="checkbox"]').bind('change', function(e) {
        var $elem = $(this);
      });
    },

    openMarkers: function() {

      $('#sidebar a').live('click', function(e) {
        e.preventDefault();

        var $this = $(this),
            row = $this.data('markerid'),
            row = parseInt( row, 10 );
        var name = FTresponse.getDataTable().getValue(row,0);
        var description = FTresponse.getDataTable().getValue(row,2);
        var latlng =  FTresponse.getDataTable().getValue(row,1);

        //if ( latlng.indexOf("<") === -1 ) {

        var coords = latlng.split(',');
        var lat = parseFloat(coords[0]);
        var lng = parseFloat(coords[1]);

        if (isNaN(lat) || isNaN(lng)) {
        // assume address, send to geocoder
          openInfoWindowGeocoded(latlng, name, description);
        }

        var position = new google.maps.LatLng(lat,lng);

        //console.log( position );
        console.log( position );
        console.log( name );
        console.log( description );
        console.log( map );
        //console.log( FTlayer );
        //openFtInfoWindow(position, name, description);

        //}

      });

    },

    init: function() {

      //this.toggleLayer();
      this.openMarkers();
      //initialize();

      var latlng = new google.maps.LatLng(31.22, 29.85);
      var myOptions = {
          center: latlng,
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

      map = $('#map_canvas').gmap(myOptions).bind('init', function() {

        $('#map_canvas').gmap(
          'loadFusion', 
            { 
              'query': { 
                'select': 'Lat', 
                'from': Marker_TableID, 
                'where': 'Type LIKE "Eat"' } } );
        /*$('#map_canvas').gmap(
          'loadFusion', 
            { 
              'query': { 
                'select': 'Lat', 
                'from': Marker_TableID, 
                'where': 'Type LIKE "Experience"' } } );*/
        var queryText = encodeURIComponent("SELECT 'Name', 'Lat', 'Description', 'Type' FROM " + Marker_TableID );             
        //console.log( queryText );
        var query = new google.visualization.Query('http://www.google.com/fusiontables/gvizdata?tq='+queryText);
        //console.log ( query );
        query.send(getData);
        //var q = query.send(getData);
        
        //console.log( map.markers );
        //map.trigger(map.markers[2].marker, 'click');

        
        //$('#map_canvas').gmap('findMarker', 'Type', 'Eat', false, function(marker, found) {
            //if ( found ) {
                //marker.setVisible(false);
            //} else {
                //marker.setVisible(false);
            //}
        //});
        

      });

    }

  };

  mapThing.init();
  
  //initialize();
      
//})(jQuery);


