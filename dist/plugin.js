"use strict";

/**
 * This is main plugin loading function
 * Feel free to write your own compiler
 */
W.loadPlugin(
/* Mounting options */
{
  "name": "windy-plugin-gretathunberg",
  "version": "0.1.0",
  "author": "Tedde de Boer @ Follow My Challenge",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/windycom/windy-plugins"
  },
  "description": "Live GPS Tracker for Greta Thunberg's ocean crossing.",
  "displayName": "Greta Thunberg",
  "hook": "menu",
  "dependencies": ["https://code.jquery.com/jquery-3.4.1.min.js", "https://cdn.jsdelivr.net/npm/leaflet-rotatedmarker@0.2.0/leaflet.rotatedMarker.js"]
},
/* HTML */
'',
/* CSS */
'#windy-plugin-gretathunberg{font-family:\'Roboto\',sans-serif;color:#000000}@font-face{font-family:\'MyWebFont\';src:url(\'https://fonts.googleapis.com/css?family=Roboto:300,700\');src:url(\'https://fonts.googleapis.com/css?family=Roboto:300,700\') format(\'embedded-opentype\'),url(\'https://fonts.googleapis.com/css?family=Roboto:300,700\') format(\'woff2\'),url(\'https://fonts.googleapis.com/css?family=Roboto:300,700\') format(\'woff\'),url(\'https://fonts.googleapis.com/css?family=Roboto:300,700\') format(\'truetype\')}#windy-plugin-gretathunberg #details{display:block;z-index:9999;position:absolute;width:268px;top:65px;left:13px;background-image:linear-gradient(to bottom, rgba(255,255,255,0.8), rgba(255,255,255,0.5));padding:15px 25px 10px 15px;font-size:14px;line-height:20px}#windy-plugin-gretathunberg #details hr{border-top:1px solid #ffffff94;border-bottom:1px solid #ffffff20;width:60%}#windy-plugin-gretathunberg #details .title{font-size:22px;font-weight:bold;margin-bottom:5px}#windy-plugin-gretathunberg #details .location a{text-decoration:none;color:#000000;cursor:pointer}#windy-plugin-gretathunberg #details .distanceNYC small{font-family:verdana;text-transform:uppercase;font-size:8px;color:#003300}#windy-plugin-gretathunberg #details .distance24{margin-top:5px;margin-bottom:5px}#windy-plugin-gretathunberg #details .localMeteoItem{min-width:50px;display:inline-block}#windy-plugin-gretathunberg #details .logoHolder{height:50px}#windy-plugin-gretathunberg #details .logoHolder img{height:50px}#windy-plugin-gretathunberg #details .logoHolder img.ybLogo{height:40px;padding:0px 0px 5px 25px;margin-bottom:5px}',
/* Constructor */
function () {
  var pluginDataLoader = W.require('pluginDataLoader');

  var map = W.require('map');

  var nycLat = '40.689086';
  var nycLon = '-74.045013';
  var localMeteo = 0;
  var markers = [];
  var markerIcons = [];
  var markerGroup = L.layerGroup().addTo(map);
  var getForecast = pluginDataLoader({
    key: 'FYZH0HjPk86Xr5Xz0KO7Aht5wR1dp6J7',
    plugin: 'windy-plugin-gretathunberg'
  });
  var boatTrackLayer;
  var BoatIcon = L.icon({
    iconUrl: 'https://www.followmychallenge.com/windy/plugins/tracker/assets/images/boat64x64.png',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [-3, -90],
    zIndexOffset: 999
  });

  var time2string = function time2string(timestamp) {
    timestamp = Math.floor(Date.now() / 1000) - timestamp;
    var days = Math.floor(timestamp / 86400);
    var hours = Math.floor((timestamp - days * 86400) / 3600);
    var minutes = Math.floor((timestamp - days * 86400 - hours * 3600) / 60);

    if (hours) {
      return hours + ' hr ' + minutes + ' min';
    } else {
      return minutes + ' min';
    }
  };

  var getDate = function getDate() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var yyyy = today.getFullYear();
    today = yyyy + '-' + mm + '-' + dd;
    return today;
  };

  var toRad = function toRad(value) {
    return value * Math.PI / 180;
  };

  var haversine = function haversine(lat1, lon1, lat2, lon2) {
    var R = 6371;
    var dLat = toRad(lat2 - lat1);
    var dLon = toRad(lon2 - lon1);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = Math.round(R * c);
    return d;
  };

  var updateIconStyle = function updateIconStyle() {
    for (var _i = 0, _markers = markers; _i < _markers.length; _i++) {
      var marker = _markers[_i];

      if (marker._icon) {
        var heading = marker._icon.getAttribute('data-heading');

        if (marker._icon.style.transform.indexOf('rotateZ') === -1) {
          marker._icon.style.transform = "".concat(marker._icon.style.transform, " rotateZ(").concat(heading || 0, "deg)");
          marker._icon.style.transformOrigin = 'center';
        }
      }
    }
  };

  var removeElement = function removeElement(elementId) {
    var element = document.getElementById(elementId);

    if (element) {
      element.parentNode.removeChild(element);
    }
  };

  function onClick(e) {
    window.open(this.options.url);
  }

  var loadMap = function loadMap() {
    fetch('https://www.followmychallenge.com/live/gretathunberg/feed.php').then(function (response) {
      return response.json();
    }).then(function (result) {
      return result.result;
    }).then(function (result) {
      try {
        for (var _i2 = 0, _Object$keys = Object.keys(result); _i2 < _Object$keys.length; _i2++) {
          var boatName = _Object$keys[_i2];

          if (map.hasLayer(boatTrackLayer)) {
            map.removeLayer(boatTrackLayer);
          }

          var boat = result[boatName];
          boatTrackLayer = L.polyline(boat.track, {
            color: "hsl(60, 100%, 45%)",
            weight: 2
          }).addTo(map);
          var marker = L.marker(boat.track[boat.track.length - 1], {
            icon: BoatIcon,
            rotationAngle: boat.heading
          }).addTo(markerGroup);
          markers.push(marker);
          marker.bindPopup(boatName);
          var el = document.createElement('div');
          el.setAttribute("id", "details");
          el.innerHTML += "<div class='title'>DASHBOARD</div>";
          el.innerHTML += "<hr align='left'><div class='lastseen'>Last seen: " + time2string(boat.timestamp) + "</div>";
          el.innerHTML += "<div class='location'>Location: <a href='https://www.google.com/maps/search/?api=1&query=" + boat.lat + "," + boat.lon + "' target='_blank'>" + boat.lat + "," + boat.lon + "</a></div>";
          el.innerHTML += "<hr align='left'><div class='sog'>Speed: " + boat.speedOverGround + " kn</div>";
          el.innerHTML += "<div class='cog'>Heading:  " + boat.heading + "&deg;</div>";
          el.innerHTML += "<div id='localMeteo'><hr align='left'>";

          if (boat.temp != 0) {
            el.innerHTML += "<div id='temp' class='temp'><div class='localMeteoItem'>Temp: </div>" + boat.temp + "&deg;C / " + Math.round(boat.temp * 1.8 + 32) + "&deg;F</div></div>";
          }

          el.innerHTML += "</div>";
          getForecast('forecast', {
            model: 'gfsWaves',
            lat: parseFloat(boat.lat),
            lon: parseFloat(boat.lon)
          }).then(function (result) {
            var status = result.status,
                data = result.data;

            if (data['data'][getDate()][0]['wind']) {
              var el_wind = document.createElement('div');
              el_wind.setAttribute("id", "wind");
              el_wind.innerHTML += "<div class='localMeteoItem'>Wind: </div>" + data['data'][getDate()][0]['wind'] + " m/s / " + data['data'][getDate()][0]['windDir'] + "&deg;";
              document.getElementById('localMeteo').append(el_wind);
            }

            if (data['data'][getDate()][0]['waves']) {
              var el_waves = document.createElement('div');
              el_waves.setAttribute("id", "waves");
              el_waves.innerHTML += "<div class='localMeteoItem'>Waves: </div>" + data['data'][getDate()][0]['waves'] + " m / " + data['data'][getDate()][0]['wavesDir'] + "&deg;";
              document.getElementById('localMeteo').append(el_waves);
            }

            if (data['data'][getDate()][0]['swell1']) {
              var el_swell = document.createElement('div');
              el_swell.setAttribute("id", "swell1");
              el_swell.innerHTML += "<div class='localMeteoItem'>Swell: </div>" + data['data'][getDate()][0]['swell1'] + " m / " + data['data'][getDate()][0]['swell1Dir'] + "&deg;";
              document.getElementById('localMeteo').append(el_swell);
            }
          });
          el.innerHTML += "<hr align='left'><div class='distanceNYC'>Distance to NYC:<br>" + Math.round(haversine(nycLat, nycLon, boat.lat, boat.lon) * 0.539957) + "NM <small>(Line-of-sight)</small></div>";
          el.innerHTML += "<div class='distance24'>Est. Distance past 24 hrs:<br>" + Math.round(boat.distance24hrsKM * 0.539957) + "NM</div>";
          el.innerHTML += "<div class='distanceCovered'>Est. Distance covered: <br>" + Math.round(boat.distanceKM * 0.539957) + "NM</div>";
          el.innerHTML += "<hr align='left'><div class='logoHolder'><a href='https://www.followmychallenge.com/?gt' target='_blank'><img src='https://www.followmychallenge.com/windy/plugins/tracker/assets/images/logo_fmc_shadow.png' class='fmcLogo' alt='Map by: Follow My Challenge' /></a><a href='https://www.ybtracking.com/?gt' target='_blank'><img src='https://www.followmychallenge.com/windy/plugins/tracker/assets/images/logo_yb.png' class='ybLogo' alt='GPS Hardware by: YB Tracking' /></a></div>";
          removeElement('details');
          document.getElementById('windy-plugin-gretathunberg').append(el);
          map.panTo([boat.lat, boat.lon]);
        }
      } catch (error) {
        console.error("Error: ".concat(error.message));
      }
    })["catch"](function (error) {
      console.error("Error boats: ".concat(error.message));
    });
  };

  setInterval(function () {
    markerGroup.clearLayers();
    loadMap();
  }, 60000);

  var remove = function remove() {
    map.removeLayer(boatTrackLayer);
    markerGroup.clearLayers();
    removeElement('details');
  };

  var hasHooks = false;

  this.onopen = function () {
    if (hasHooks) return;
    loadMap();
    hasHooks = true;
  };

  this.onclose = function () {
    if (!hasHooks) return;
    remove();
    hasHooks = false;
  };
});