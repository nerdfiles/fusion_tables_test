;(function($) {

  // == testscript.js =================================== //
  //
  // @author        gilman.leah@gmail.com
  // @datetime      12.21.2011.7.51.p
  //
  // == //
 

  // == DEFAULTS =================================== //

  var map, FTresponse, geocoder;
  var $mapCanvas;
  var $sidebar = $('#sidebar');
  var some_layer;
  var info_window;
  var query = "";
  var info = null;
  var Marker_TableID = '2441665';
  var mrkr_array = [];
  var gmarkers = [];
  var global_suppressInfoWindows = false;


  // == DEBUG =================================== //
  
  var DEBUG = true;


  // == mapstyle =================================== //

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


  // == MAP SETTINGS =================================== //

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


  // == DEFAULT QUERY =================================== //

  var queryText = encodeURIComponent("SELECT 'Name', 'Lat', 'Description', 'Type' FROM " + Marker_TableID );
  var query = new google.visualization.Query('http://www.google.com/fusiontables/gvizdata?tq=' + queryText);


  // == FUNCTIONS: NOM =================================== //
  
  function windowControl(e) {
    info_window.setOptions({
      content: e.infoWindowHtml,
      position: e.latLng,
      pixelOffset: e.pixelOffset
    });
    info_window.open(map);
  }

  function getDataDiag(response) {

    if (!response) {
      alert('no response');
      return false;
    }

    if (response.isError()) {
      alert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
      return false;
    }

    FTresponse = response;
    if (DEBUG) {
      console.log("=== response ===");
      console.log(response);
      console.log("=== FTresponse ===");
      console.log(FTresponse);
    }

  } // End getDataDiag

  function getData(response) {

    if (!response) {
      alert('no response');
      return false;
    }

    if (response.isError()) {
      alert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
      return false;
    }

    var FTresponse = response;

    $sidebar.trigger('loadLayer', [response]);

  }

  // == MAP INIT =================================== //

  $mapCanvas = $('#map_canvas');

  $sidebar.bind('loadLayer', function(e, response) {
    var $this = $(this);
    var _res = response;
    var _tbl = _res.getDataTable();
    var _row_count = _tbl.getNumberOfRows();
    var _col_count = _tbl.getNumberOfColumns();
    var _col_label = _tbl.getColumnLabel(0);
    var name, pt, desc, type;

    for (var i = 0; i < _row_count; i++) {
      var id = i;
      name = _tbl.getValue(i, 0);
      pt = _tbl.getValue(i, 1),
          lat = pt.split(',')[0],
          lng = pt.split(',')[1];
      var latLng = new google.maps.LatLng(lat, lng);
      desc = _tbl.getValue(i, 2);
      type = _tbl.getValue(i, 3);

      $mapCanvas.gmap('addMarker', { 'position': pt, 'bounds': true }, function(map, marker) {

        $sidebar.find('.inner').append("<h2><a data-markerid='"+id+"' rel='"+pt+"' href='#markerid-"+id+"'>"+name+"</a></h2>");
        
        var html = "<h2>"+name+"</h2>";

        var new_marker = new google.maps.Marker({
          content: html,
          position: latLng,
          map: map  
        });

        gmarkers.push(new_marker);

        $mapCanvas.gmap('addInfoWindow', { 'content': html }, function(iw) {
          $(new_marker).click(function() {
            iw.open(map, new_marker);
          });
        });

      });

      //$mapCanvas.gmap('addMarker', { 'position': pt, 'bounds': true } ).click(function() {
        //console.log(pt);
        //$mapCanvas.gmap('openInfoWindow', , this);
      //});

    }

    //$this.find('.mod-type-selector .inner').append( html.join("") );

    /*
    $this.find('.mod-type-selector .inner a').each(function(e) {
      var $this = $(this);
      var pt = $this.attr('rel'),
          lat = pt.split(',')[0],
          lng = pt.split(',')[1];
      var latLng = new google.maps.LatLng(lat, lng);

      $mapCanvas.gmap('addMarker', { 'position': pt, 'bounds': true }, function(map, marker) {
        
        var new_marker = new google.maps.Marker({
          position: latLng,
          map: map  
        });

        gmarkers.push(new_marker);

        $mapCanvas.gmap('addInfoWindow', { 'content': 'hullo' }, function(iw) {
          $(new_marker).click(function() {
            iw.open(map, new_marker);
          });
        });
      });
    });
    */

    $this.find('.mod-type-selector .inner a').live('click.loadInfoWindow', function(e) {
      e.preventDefault();
      var $this = $(this),
          marker_id = parseInt($this.data("markerid")),
          pt = $this.attr('rel');

      if ( ! $this.hasClass('active') ) {
        $this.addClass('active');
      }

      if (gmarkers[marker_id]) {
        if ( DEBUG ) {
          console.log(marker_id);
        }
        google.maps.event.trigger(gmarkers[marker_id], 'click')
      }
      
    });

  });
  
  $mapCanvas.gmap(myOptions).bind('init', function(e, map) {
   
    /*
    $mapCanvas.gmap(
        'loadFusion', 
          { 
            'query': { 
              'select': 'Lat', 
              'from': Marker_TableID, 
              'where': 'Type LIKE "Eat"' } } );
    */
    
    // info_window 

    info_window = new google.maps.InfoWindow();

    // == some layer
    
    // set layer
    /*
    some_layer = new google.maps.FusionTablesLayer({
      query: {
        select: 'Lat'
        , from: Marker_TableID
        //, where: 'Type LIKE "Eat"'
      },
      map: map,
      styles: alexMapStyle,
      clickable: true,
      suppressInfoWindows: global_suppressInfoWindows
    });
    */

    // add tooltip
    //google.maps.event.addListener(some_layer, 'click', windowControl);

    // set map to layer
    //some_layer.setMap(map);

    query.send(getData);

    //$mapCanvas.gmap('clear', 'markers');

  });

  // == TEST CALL =================================== //

  //console.log( query.send(getDataDiag) );

























      
})(jQuery);


