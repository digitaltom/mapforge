import * as functions from 'helpers/functions'

// eslint expects variables to get imported, but we load the full lib in header
const ol = window.ol
const olms = window.olms

const mapClasses = 'map-layer fade-in-slow'
export const backgroundTiles = {

  osmDefaultTiles: function () {
    return new ol.layer.Tile({ source: new ol.source.OSM(), className: mapClasses })
  },

  osmTiles: function () {
    return new ol.layer.Tile({
      source: new ol.source.XYZ({
        url: 'https://api.maptiler.com/maps/basic-v2/{z}/{x}/{y}@2x.png?key=' + window.gon?.map_keys?.maptiler,
        tileSize: 512,
        attributions: ['<a href="https://maptiler.com/" target="_blank">© MapTiler</a>',
          ' and © <a href="https://openstreetmap.org/" target="_blank">OpenStreetMap contributors</a>'
        ],
        attributionsCollapsible: functions.isMobileDevice()
      }),
      className: mapClasses + ' map-layer-osmTiles'
    })
  },

  satelliteTiles: function () {
    return new ol.layer.Tile({
      source: new ol.source.XYZ({
        attributions: ['Powered by Esri',
          'Sources: Esri, DigitalGlobe, GeoEye, i-cubed, USDA FSA, USGS, AEX, Getmapping, Aerogrid, IGN, IGP, swisstopo, and the GIS User Community'],
        url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attributionsCollapsible: functions.isMobileDevice(),
        maxZoom: 19
      }),
      className: mapClasses + ' map-layer-satelliteTiles'
    })
  },

  satelliteStreetTiles: function () {
    return new ol.layer.Tile({
      source: new ol.source.XYZ({
        url: 'https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v10/tiles/{z}/{x}/{y}?' +
             'access_token=' + window.gon?.map_keys?.mapbox,
        attributions: ['<a href="https://www.mapbox.com/about/maps/" target="_blank">© Mapbox</a>',
          '<a href="http://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap</a>',
          '<a href="https://www.mapbox.com/feedback/" target="_blank">Improve this map</a>'],
        attributionsCollapsible: functions.isMobileDevice(),
        tileSize: 512
      }),
      className: mapClasses + ' map-layer-satelliteStreetTiles'
    })
  },

  streetTiles: function () {
    return new ol.layer.Tile({
      source: new ol.source.XYZ({
        url: 'https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?' +
             'access_token=' + window.gon?.map_keys?.mapbox,
        attributions: ['<a href="https://www.mapbox.com/about/maps/" target="_blank">© Mapbox</a>',
          '<a href="http://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap</a>',
          '<a href="https://www.mapbox.com/feedback/" target="_blank">Improve this map</a>'],
        attributionsCollapsible: functions.isMobileDevice()
      }),
      className: mapClasses + ' map-layer-streetTiles'
    })
  },

  // // https://opentopomap.org/about#verwendung
  openTopoTiles: function () {
    return new ol.layer.Tile({
      source: new ol.source.XYZ({
        url: 'https://a.tile.opentopomap.org/{z}/{x}/{y}.png',
        attributions: ['Kartendaten: © ',
          '<a href="https://openstreetmap.org/copyright" target="_blank">OpenStreetMap-Mitwirkende</a>',
          'SRTM, SRTM | Kartendarstellung: © ',
          '<a href="http://opentopomap.org/" target="_blank">OpenTopoMap</a> ',
          '<a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank">(CC-BY-SA)</a>'],
        attributionsCollapsible: functions.isMobileDevice()
      }),
      className: mapClasses + ' map-layer-openTopoTiles'
    })
  },

  esriTiles: function () {
    return new ol.layer.Tile({
      source: new ol.source.XYZ({
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
        attributions: ['Powered by <a href="https://developers.arcgis.com/" target="_blank">Esri</a>'],
        attributionsCollapsible: functions.isMobileDevice()
      }),
      className: mapClasses + ' map-layer-esriTiles'
    })
  },

  stamenTonerTiles: function () {
    return new ol.layer.Tile({
      source: new ol.source.StadiaMaps({
        layer: 'stamen_toner',
        retina: true,
        attributionsCollapsible: functions.isMobileDevice()
      }),
      className: mapClasses + ' map-layer-stamenTonerTiles'
    })
  },

  stamenWatercolorTiles: function () {
    return new ol.layer.Tile({
      source: new ol.source.StadiaMaps({
        layer: 'stamen_watercolor',
        retina: true,
        attributionsCollapsible: functions.isMobileDevice()
      }),
      className: mapClasses + ' map-layer-stamenWatercolorTiles'
    })
  },

  // // Vector maps:
  // // create custom styles at https://maplibre.org/maputnik
  // // https://openlayers.org/en/latest/apidoc/module-ol_layer_MapboxVector-MapboxVectorLayer.html

  mapboxBrightVector: function () {
    return new olms.MapboxVectorLayer({
      styleUrl: 'mapbox://styles/mapbox/bright-v9',
      accessToken: window.gon.map_keys.mapbox,
      className: mapClasses + ' map-layer-mapboxBrightVector'
    })
  },

  // // https://cloud.maptiler.com/maps/
  // // https://github.com/openlayers/ol-mapbox-style?tab=readme-ov-file#interfacesinternal_options-1md
  maptilerDataviz: function () {
    return new olms.MapboxVectorLayer({
      styleUrl: 'https://api.maptiler.com/maps/dataviz/style.json?key=' + window.gon.map_keys.maptiler,
      className: mapClasses + ' map-layer-maptilerDataviz'
    })
  },

  // https://cloud.maptiler.com/maps/
  // https://github.com/openlayers/ol-mapbox-style?tab=readme-ov-file#interfacesinternal_options-1md
  maptilerStreets: function () {
    return new olms.MapboxVectorLayer({
      styleUrl: '/layers/streets.json?key=' + window.gon.map_keys.maptiler,
      accessToken: window.gon.map_keys.maptiler,
      className: mapClasses + ' map-layer-maptilerStreets'
    })
  },

  maptilerNoStreets: function () {
    return new olms.MapboxVectorLayer({
      preload: Infinity,
      styleUrl: '/layers/nostreets.json?key=' + window.gon.map_keys.maptiler,
      accessToken: window.gon.map_keys.maptiler,
      className: mapClasses + ' map-layer-maptilerNoStreets'
    })
  }

}
