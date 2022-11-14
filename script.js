// config map
let config = {
  minZoom: 7,
  maxZoom: 18,
};
// magnification with which the map will start
const zoom = 18;
// co-ordinates
const lat = 50.038166;
const lng = 22.002835;

// calling map
const map = L.map('leafletmap').setView([lat, lng], 13);
L.control.scale().addTo(map);



// Used to load and display tile layers on the map
// Most tile servers require attribution, which you can set under `Layer`


var googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
                maxZoom: 20,
                subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
            });
            googleSat.addTo(map)
            


//osm maps
var osm = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

//GeoJSON///////////////////////////////////////////////////////////////////////////////////////////////////////


// geojson + info

var miasta = L.geoJSON(granice, {
    onEachFeature : function(feature, layer){
        var popupContent =  '<h4 class = "text-primary">Granica miasta</h4>' +
                            '<div class="container"><table class="table table-striped">' +
                            '<thead><tr><th>Properties</th><th>Value</th></tr></thead>' +
                            '<tbody><tr><td>Numer</td><td>'+ feature.properties.NAZWAJEDNO +'</td></tr>';
        layer.bindPopup(popupContent)
	}
}).addTo(map);


function styleplace(feature) {
        return {
            weight: 3,
            color: "#3333ff",
        };}
    
var place = L.geoJSON(place,{style: styleplace,
    onEachFeature : function(feature, layer){
        var popupContent =  '<h4 class = "text-primary">Place, skwery i osiedla</h4>' +
                            '<div class="container"><table class="table table-striped">' +
                            '<thead><tr><th>Properties</th><th>Value</th></tr></thead>' +
                            '<tbody><tr><td>Nazwa</td><td>'+ feature.properties.nazwa +'</td></tr>';
        layer.bindPopup(popupContent)
	}
}).addTo(map);

function styleulica(feature) {
        return {
            weight: 3,
            color: "#808080",
        };
    }
var ulice = L.geoJSON(ulica,{style: styleulica,
    onEachFeature : function(feature, layer){
        var popupContent =  '<h4 class = "text-primary">Ulica</h4>' +
                            '<div class="container"><table class="table table-striped">' +
                            '<thead><tr><th>Properties</th><th>Value</th></tr></thead>' +
                            '<tbody><tr><td>Nazwa</td><td>'+ feature.properties.nazwa +'</td></tr>';
        layer.bindPopup(popupContent)
	}, 
                      
}).addTo(map);


var s_light_style = {
    radius: 6,
    fillColor:  " #cc0000",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.9
};

var nazwy_geo = L.geoJSON(nazwy_geograf, {
    onEachFeature : function(feature, layer){
        var popupContent =  '<h4 class = "text-primary">Nazwa geograficzna</h4>' +
                            '<div class="container"><table class="table table-striped">' +
                            '<thead><tr><th>Properties</th><th>Value</th></tr></thead>' +
                            '<tbody><tr><td>Nazwa</td><td>'+ feature.properties.NAZWAGLOWNA +'</td></tr>'+
                            '<tbody><tr><td>Rodzaj</td><td>'+ feature.properties.RODZAJOBIEKTU +'</td></tr>';
        layer.bindPopup(popupContent)
	},
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, s_light_style);
    }
}).addTo(map);


// layer controller/////////////////////////////////////////////////////////////////////////////////////////////////////
var baseMaps = {
    "Google Satellite": googleSat,
    "OSM": osm,
};

var overlayMaps = {
    "granice miast": miasta,
    "place/skwery/osiedla":place,
    "Ulice": ulice,
    "Nazwy geograficzne": nazwy_geo

};
var layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);


/// COORDINATE////////////////////////////////////////////////////////////////////////////////////////////////////////
// obtaining coordinates after clicking on the map
map.on("click", function (e) {
  const markerPlace = document.querySelector(".marker-position");
  markerPlace.textContent = e.latlng;
});

///PRINT///////////////////////////////////////////////////////////////////////////////////////////////////////////////
var browserControl = L.control.browserPrint({position: 'topleft', title: 'Design Viewer | OPGK Rzeszów'}).addTo(map);

//SIDE TO SIDE///////////////////////////////////////////////////////////////////////////////////////////////////////

var compareFunction = (function() {
    var executed = false;
    return function() {
        if (!executed) {
            executed = true;

            var orto = L.tileLayer.betterWms('https://mapy.geoportal.gov.pl/wss/service/PZGIK/ORTO/WMS/HighResolution', {
                 maxZoom: 20
                   }).addTo(map);

             var nmt = L.tileLayer.betterWms('https://mapy.geoportal.gov.pl/wss/service/PZGIK/NMT/GRID1/WMS/Hypsometry', {
                 maxZoom: 20
                   }).addTo(map);
            
            var side = L.control.sideBySide(googleSat, osm).addTo(map);   
        } else {
            
          map.remove(side)
          map = L.map('leafletmap').setView([52.652, 18.8896], 13);
        }
    };
})();

//////*****KEY SITES//////////////////////////////////////////////////////////////////////////////////////////


var sitesFunction = (function () {
    var element = document.getElementById('toolbar');
    element.classList.toggle("open");
});



var buildingLayers = L.layerGroup().addTo(map);

L.geoJson(nazwy_geograf, {
      onEachFeature: function (feature, layer) {
        var thisLayer = layer;
        // layer.bindPopup(feature.properties.NAME);
        var $listItem = $("<li>")
          .html(feature.properties.NAZWAGLOWNA)
          .appendTo("#toolbar ul");
        $listItem.on("click", function () {
          buildingLayers.clearLayers(); // remove existing markers
          var thisLat = thisLayer.feature.geometry.coordinates[1];
          var thisLon = thisLayer.feature.geometry.coordinates[0];
          map.panTo([thisLat, thisLon]);
          //thisLayer.addTo(mymap);
          buildingLayers.addLayer(thisLayer);
          var notifyIcon = L.divIcon({
            className: "notify-icon",
            iconSize: [25, 25],
            html: "<span></span>"
          });
          var notifyMarker = L.marker([thisLat, thisLon], { icon: notifyIcon });
          buildingLayers.addLayer(notifyMarker);

          if (map.getSize().x < 768) {
            $("#toolbar").removeClass("open");
          }
          thisLayer.on("click", function () {
            alert(
              thisLayer.feature.properties.NAME);
          });
        });
      }
    });


//////////////// DRAW///////////////////////////////////////////////////////////////////////////////////////////////

// --------------------------------------------------
// Nofiflix options

Notiflix.Notify.init({
  width: "280px",
  position: "right-bottom",
  distance: "10px",
});

// --------------------------------------------------
// add buttons to map

const customControl = L.Control.extend({
  // button position
  options: {
    position: "topright",
  },

  // method
  onAdd: function () {
    const array = [
      {
        title: "export features geojson",
        html: "<svg class='icon-geojson'><use xlink:href='#icon-export'></use></svg>",
        className: "export link-button leaflet-bar",
      },
      {
        title: "save geojson",
        html: "<svg class='icon-geojson'><use xlink:href='#icon-add'></use></svg>",
        className: "save link-button leaflet-bar",
      },
      {
        title: "remove geojson",
        html: "<svg class='icon-geojson'><use xlink:href='#icon-remove'></use></svg>",
        className: "remove link-button leaflet-bar",
      },
      {
        title: "load gejson from file",
        html: "<input type='file' id='geojson' class='geojson' accept='text/plain, text/json, .geojson' onchange='openFile(event)' /><label for='geojson'><svg class='icon-geojson'><use xlink:href='#icon-import'></use></svg></label>",
        className: "load link-button leaflet-bar",
      },
    ];

    const container = L.DomUtil.create(
      "div",
      "leaflet-control leaflet-action-button"
    );

    array.forEach((item) => {
      const button = L.DomUtil.create("a");
      button.href = "#";
      button.setAttribute("role", "button");

      button.title = item.title;
      button.innerHTML = item.html;
      button.className += item.className;

      // add buttons to container;
      container.appendChild(button);
    });

    return container;
  },
});
map.addControl(new customControl());

// Drow polygon, circle, rectangle, polyline
// --------------------------------------------------

let drawnItems = L.featureGroup().addTo(map);

map.addControl(
  new L.Control.Draw({
    edit: {
      featureGroup: drawnItems,
      poly: {
        allowIntersection: false,
      },
    },
    draw: {
      polygon: {
        allowIntersection: false,
        showArea: true,
      },
    },
  })
);

map.on(L.Draw.Event.CREATED, function (event) {
  let layer = event.layer;
  let feature = (layer.feature = layer.feature || {});
  let type = event.layerType;

  feature.type = feature.type || "Feature";
  let props = (feature.properties = feature.properties || {});

  props.type = type;

  if (type === "circle") {
    props.radius = layer.getRadius();
  }

  drawnItems.addLayer(layer);
});

// --------------------------------------------------
// save geojson to file

const exportJSON = document.querySelector(".export");

exportJSON.addEventListener("click", () => {
  // Extract GeoJson from featureGroup
  const data = drawnItems.toGeoJSON();

  if (data.features.length === 0) {
    Notiflix.Notify.failure("You must have some data to save a geojson file");
    return;
  } else {
    Notiflix.Notify.info("You can save the data to a geojson");
  }

  // Stringify the GeoJson
  const convertedData =
    "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));

  exportJSON.setAttribute("href", "data:" + convertedData);
  exportJSON.setAttribute("download", "data.geojson");
});

// --------------------------------------------------
// save geojson to localstorage
const saveJSON = document.querySelector(".save");

saveJSON.addEventListener("click", (e) => {
  e.preventDefault();

  const data = drawnItems.toGeoJSON();

  if (data.features.length === 0) {
    Notiflix.Notify.failure("You must have some data to save it");
    return;
  } else {
    Notiflix.Notify.success("The data has been saved to localstorage");
  }

  localStorage.setItem("geojson", JSON.stringify(data));
});

// --------------------------------------------------
// remove gojson from localstorage

const removeJSON = document.querySelector(".remove");

removeJSON.addEventListener("click", (e) => {
  e.preventDefault();
  localStorage.removeItem("geojson");

  Notiflix.Notify.info("All layers have been deleted");

  drawnItems.eachLayer(function (layer) {
    drawnItems.removeLayer(layer);
  });
});

// ------------------------------------------------------------------------------------------------------
// load geojson from localstorage

const geojsonFromLocalStorage = JSON.parse(localStorage.getItem("geojson"));

function setGeojsonToMap(geojson) {
  const feature = L.geoJSON(geojson, {
    style: function (feature) {
      return {
        color: "red",
        weight: 2,
      };
    },
    pointToLayer: (feature, latlng) => {
      if (feature.properties.type === "circle") {
        return new L.circle(latlng, {
          radius: feature.properties.radius,
        });
      } else if (feature.properties.type === "circlemarker") {
        return new L.circleMarker(latlng, {
          radius: 10,
        });
      } else {
        return new L.Marker(latlng);
      }
    },
    onEachFeature: function (feature, layer) {
      drawnItems.addLayer(layer);
      const coordinates = feature.geometry.coordinates.toString();
      const result = coordinates.match(/[^,]+,[^,]+/g);

      layer.bindPopup(
        "<span>Coordinates:<br>" + result.join("<br>") + "</span>"
      );
    },
  }).addTo(map);

  map.flyToBounds(feature.getBounds());
}

if (geojsonFromLocalStorage) {
  setGeojsonToMap(geojsonFromLocalStorage);
}

// ------------------------------------------------------------------------------------------------------------
// get geojson from file

function openFile(event) {
  const input = event.target;

  const reader = new FileReader();
  reader.onload = function () {
    const result = reader.result;
    const geojson = JSON.parse(result);

    Notiflix.Notify.info("The data has been loaded from the file");

    setGeojsonToMap(geojson);
  };
  reader.readAsText(input.files[0]);
}


///locate
L.control.locate().addTo(map);
