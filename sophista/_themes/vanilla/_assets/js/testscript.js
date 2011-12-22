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
  var $typecontrols = $('.field-settype');
  var some_layer;
  var info_window;
  var query = "";
  var info = null;
  var Marker_TableID = '2441665';
  var mrkr_array = [];
  var gmarkers = [];
  var global_suppressInfoWindows = false;
  var sidebarEnabled = true;
  var descCharLimit = 40;


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

  //var latlng = new google.maps.LatLng(31.22, 29.85);
  var latlng = new google.maps.LatLng(31.292212, 29.94237);
  var defaults = {
    center: latlng,
    zoom: 12,
    streetViewControl: false,
    mapTypeControl: true,
    zoomControl: true,
    zoomControlOptions:{
        style: google.maps.ZoomControlStyle.DEFAULT,
        position: google.maps.ControlPosition.LEFT_CENTER
    },
    scaleControl: false,
    panControl: false,
    styles: alexMapStyle,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };


  // == DEFAULT QUERY =================================== //

  var queryText = encodeURIComponent("SELECT 'Name', 'Lat', 'Description', 'Type' FROM " + Marker_TableID );
  var query = new google.visualization.Query('http://www.google.com/fusiontables/gvizdata?tq=' + queryText);

  var type_queryText = encodeURIComponent("SELECT 'Type' FROM " + Marker_TableID);
  var type_query = new google.visualization.Query('http://www.google.com/fusiontables/gvizdata?tq=' + type_queryText);


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
    
    $mapCanvas.height($sidebar.height());

  } // End getData

  function typeControlsData(response) {

    if (!response) {
      alert('no response');
      return false;
    }

    if (response.isError()) {
      alert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
      return false;
    }

    $typecontrols.trigger('loadLayer', [response]);

  }

  // == MAP INIT =================================== //

  $mapCanvas = $('#map_canvas');

  var htmlTypeContent = ['<ul>'];

  // clear markers
  $sidebar.find('.clearmarkers').bind('click', function(e) {
    e.preventDefault();
    $mapCanvas.gmap('clear', 'markers');
  });

  // typecontrols
  $typecontrols.bind('loadLayer', function(e, response) {
    var $this = $(this),
        _res = response;
        _tbl = _res.getDataTable(),
        _row_count = _tbl.getNumberOfRows();
    var type;

    if ( DEBUG ) {
      console.log( typeof( _tbl ) );
      console.log( _tbl );
    }

    if ( $this.find('input').length === 0 ) {
      for (var i = 0; i < _row_count; i++) {
        type = _tbl.getValue(i, 0);
        if ( $this.find('input.'+type).length === 0 )
          $this.append('<input type="checkbox" value="'+type+'" name="type" class="checkbox '+type+' active" id="type-'+type+'" checked="checked" /><label for="type-'+type+'" class="active">'+type+'</label>');
      }
    }
  });

  $('input.checkbox').live('change', function(e) {
    var $this = $(this),
        type = $this.val();

    if ( DEBUG ) {
      console.log( $sidebar.find('.'+type).length );
    }
    
    if ( ! $this.attr('checked') ) {
      $this.next().removeClass('active');
      $sidebar.find('.'+type).parent().parent().addClass('hide');
    } else {
      // the label
      $this.next().addClass('active');
      $sidebar.find('.'+type).parent().parent().removeClass('hide');
    }

    $sidebar.find('.'+type).siblings().removeClass('active');
    if ( ! $sidebar.find('.'+type).hasClass('active') )
      $sidebar.find('.'+type).parent().parent().addClass('active');
  });

  // sidebar
  $sidebar.bind('loadLayer', function(e, response) {
    var $this = $(this);
    var _res = response;
    var _tbl = _res.getDataTable();
    var _row_count = _tbl.getNumberOfRows();
    var _col_count = _tbl.getNumberOfColumns();
    var _col_label = _tbl.getColumnLabel(0);
    var name, pt, desc, type;
    var htmlSidebarContent = [];

    htmlSidebarContent[0] = "<ul>";

    for (var i = 0; i < _row_count; i++) {
      var id = i;
      name = _tbl.getValue(i, 0);
      pt = _tbl.getValue(i, 1),
          lat = pt.split(',')[0],
          lng = pt.split(',')[1];
      var latLng = new google.maps.LatLng(lat, lng);
      desc = _tbl.getValue(i, 2).substr(0, descCharLimit) + " ...";
      type = _tbl.getValue(i, 3);
      var sidebarContent = "";

      $mapCanvas.gmap('addMarker', { 'position': pt, 'bounds': true }, function(map, marker) {

        // sidebar content
        var sidebarContent = "<li><h2><a data-markerid='"+id+"' class='"+type+"' rel='"+pt+"' href='#markerid-"+id+"'>"+name+"</a></h2><p>"+desc+"</p><div class='type'>"+type+"</div><div class='latlng'>"+pt+"</div></li>";
        htmlSidebarContent[(i+1)] = sidebarContent;
        
        // html info window content
        var htmlInfoWindowContent = "<h2 class='tooltip-header'>"+name+"</h2><p class='tooltip-desc'>"+desc+"</p>";

        // new marker
        var new_marker = new google.maps.Marker({
          content: htmlInfoWindowContent,
          position: latLng,
          map: map  
        });

        // add marker to global list
        gmarkers.push(new_marker);

        if ( sidebarEnabled ) {
          
          // add a tool tip window instead of just activate
          $mapCanvas.gmap('addInfoWindow', { 'content': htmlInfoWindowContent }, function(iw) {
            $(new_marker).click(function() {
              iw.open(map, new_marker);
              $('.tooltip-header').trigger('load_scaffolding');
            });
          });

        } else {

          // activate a tool tip window instead of add
          $mapCanvas.gmap('addMarker', { 'position': pt, 'bounds': true } ).click(function() {
            $mapCanvas.gmap('openInfoWindow', { 'content': htmlInfoWindowContent }, this);
          });

        }


      });

      //htmlSidebarContent[-1] = "</ul>";
      htmlSidebarContent[(htmlSidebarContent.length+1)] = "</ul>";

      $sidebar.find('.inner').html(htmlSidebarContent.join(""));

    }

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
        google.maps.event.trigger(gmarkers[marker_id], 'click');
        $('.tooltip-header').trigger('load_scaffolding');
      }
      
    });

  });

  $('.tooltip-header').bind('load_scaffolding', function(e) {

    $(this).each(function(e) {
    
      var $this = $(this);
          $tt_lining = $this.parent(),
          $tt_inner = $tt_lining.parent(),
          $tt_container = $tt_lining.parent();

      $tt_container.addClass('mod');

    });

  });
  
  $mapCanvas.gmap(defaults).bind('init', function(e, map) {
   
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
    type_query.send(typeControlsData);

  });

  // == TEST CALL =================================== //

  //console.log( query.send(getDataDiag) );

      
})(jQuery);


