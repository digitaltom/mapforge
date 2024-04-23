// import * as functions from 'helpers/functions'

// eslint expects variables to get imported, but we load the full lib in header
// const maplibregl = window.maplibregl

// BASE_MAPS = [ "osmTiles", "satelliteTiles", "satelliteStreetTiles",
//              "stamenTonerTiles", "openTopoTiles", "mapboxBrightVector",
//              "maptilerDataviz", "maptilerStreets", "maptilerNoStreets" ]

// Maptiler SDK shortcuts: https://docs.maptiler.com/sdk-js/api/map-styles/#mapstylelist

export const basemaps = {
  stamenWatercolorTiles: {
    version: 8,
    sources: {
      'raster-tiles': {
        type: 'raster',
        tiles: [
          // NOTE: Layers from Stadia Maps do not require an API key for localhost development or most production
          // web deployments. See https://docs.stadiamaps.com/authentication/ for details.
          'https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg'
        ],
        tileSize: 256,
        attribution: 'Map tiles by <a target="_blank" href="http://stamen.com">Stamen Design</a>; Hosting by <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a>. Data &copy; <a href="https://www.openstreetmap.org/about" target="_blank">OpenStreetMap</a> contributors'
      }
    },
    layers: [
      {
        id: 'simple-tiles',
        type: 'raster',
        source: 'raster-tiles',
        minzoom: 0,
        maxzoom: 22
      }
    ]
  },
  stamenTonerTiles: {
    version: 8,
    sources: {
      'raster-tiles': {
        type: 'raster',
        tiles: [
          // NOTE: Layers from Stadia Maps do not require an API key for localhost development or most production
          // web deployments. See https://docs.stadiamaps.com/authentication/ for details.
          'https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}.jpg'
        ],
        tileSize: 256,
        attribution: 'Map tiles by <a target="_blank" href="http://stamen.com">Stamen Design</a>; Hosting by <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a>. Data &copy; <a href="https://www.openstreetmap.org/about" target="_blank">OpenStreetMap</a> contributors'
      }
    },
    layers: [
      {
        id: 'simple-tiles',
        type: 'raster',
        source: 'raster-tiles',
        minzoom: 0,
        maxzoom: 22
      }
    ]
  },
  openTopoTiles: {
    version: 8,
    sources: {
      'raster-tiles': {
        type: 'raster',
        tiles: [
          // https://opentopomap.org/about#verwendung
          'https://a.tile.opentopomap.org/{z}/{x}/{y}.png'
        ],
        tileSize: 256,
        attribution: 'Kartendaten: © ' +
           '<a href="https://openstreetmap.org/copyright" target="_blank">OpenStreetMap-Mitwirkende</a> ' +
           'SRTM | Kartendarstellung: © ' +
           '<a href="http://opentopomap.org/" target="_blank">OpenTopoMap</a> ' +
           '<a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank">(CC-BY-SA)</a>'
      }
    },
    layers: [
      {
        id: 'simple-tiles',
        type: 'raster',
        source: 'raster-tiles',
        minzoom: 0,
        maxzoom: 22
      }
    ]
  },
  // 3D Houses
  maptilerBasic: 'https://api.maptiler.com/maps/basic-v2/style.json?key=' + window.gon.map_keys.maptiler,
  maptilerOpenStreetmap: 'https://api.maptiler.com/maps/openstreetmap/style.json?key=' + window.gon.map_keys.maptiler,
  maptiler3dBuildings: 'https://api.maptiler.com/maps/3d-buildings/style.json?key=' + window.gon.map_keys.maptiler,
  maptilerDataviz: 'https://api.maptiler.com/maps/dataviz/style.json?key=' + window.gon.map_keys.maptiler,
  maptilerStreets: '/layers/streets.json?key=' + window.gon.map_keys.maptiler,
  maptilerNoStreets: '/layers/nostreets.json?key=' + window.gon.map_keys.maptiler,
  satelliteStreets: 'https://api.maptiler.com/maps/hybrid/style.json?key=' + window.gon.map_keys.maptiler,
  satellite: 'https://api.maptiler.com/maps/satellite/style.json?key=' + window.gon.map_keys.maptiler,
  maptilerWinter: 'https://api.maptiler.com/maps/winter-v2/style.json?key=' + window.gon.map_keys.maptiler
}

// export const backgroundTiles = {

//   osmDefaultTiles: function () {
//     return new ol.layer.Tile({ source: new ol.source.OSM(), className: mapClasses })
//   },

//   osmTiles: function () {
//     return new ol.layer.Tile({
//       source: new ol.source.XYZ({
//         url: 'https://api.maptiler.com/maps/basic-v2/{z}/{x}/{y}@2x.png?key=' + window.gon?.map_keys?.maptiler,
//         tileSize: 512,
//         attributions: ['<a href="https://maptiler.com/" target="_blank">© MapTiler</a>',
//           ' and © <a href="https://openstreetmap.org/" target="_blank">OpenStreetMap contributors</a>'
//         ],
//         attributionsCollapsible: functions.isMobileDevice()
//       }),
//       className: mapClasses + ' map-layer-osmTiles'
//     })
//   },

//   satelliteTiles: function () {
//     return new ol.layer.Tile({
//       source: new ol.source.XYZ({
//         attributions: ['Powered by Esri',
//           'Sources: Esri, DigitalGlobe, GeoEye, i-cubed, USDA FSA, USGS, AEX, Getmapping, Aerogrid, IGN, IGP, swisstopo, and the GIS User Community'],
//         url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
//         attributionsCollapsible: functions.isMobileDevice(),
//         maxZoom: 19
//       }),
//       className: mapClasses + ' map-layer-satelliteTiles'
//     })
//   },

//   satelliteStreetTiles: function () {
//     return new ol.layer.Tile({
//       source: new ol.source.XYZ({
//         url: 'https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v10/tiles/{z}/{x}/{y}?' +
//              'access_token=' + window.gon?.map_keys?.mapbox,
//         attributions: ['<a href="https://www.mapbox.com/about/maps/" target="_blank">© Mapbox</a>',
//           '<a href="http://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap</a>',
//           '<a href="https://www.mapbox.com/feedback/" target="_blank">Improve this map</a>'],
//         attributionsCollapsible: functions.isMobileDevice(),
//         tileSize: 512
//       }),
//       className: mapClasses + ' map-layer-satelliteStreetTiles'
//     })
//   },

//   streetTiles: function () {
//     return new ol.layer.Tile({
//       source: new ol.source.XYZ({
//         url: 'https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?' +
//              'access_token=' + window.gon?.map_keys?.mapbox,
//         attributions: ['<a href="https://www.mapbox.com/about/maps/" target="_blank">© Mapbox</a>',
//           '<a href="http://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap</a>',
//           '<a href="https://www.mapbox.com/feedback/" target="_blank">Improve this map</a>'],
//         attributionsCollapsible: functions.isMobileDevice()
//       }),
//       className: mapClasses + ' map-layer-streetTiles'
//     })
//   },

//   esriTiles: function () {
//     return new ol.layer.Tile({
//       source: new ol.source.XYZ({
//         url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_ol/MapServer/tile/{z}/{y}/{x}',
//         attributions: ['Powered by <a href="https://developers.arcgis.com/" target="_blank">Esri</a>'],
//         attributionsCollapsible: functions.isMobileDevice()
//       }),
//       className: mapClasses + ' map-layer-esriTiles'
//     })
//   },

//   // // Vector maps:
//   // // create custom styles at https://maplibre.org/maputnik
//   // // https://openlayers.org/en/latest/apidoc/module-ol_layer_MapboxVector-MapboxVectorLayer.html

//   mapboxBrightVector: function () {
//     return new olms.MapboxVectorLayer({
//       styleUrl: 'mapbox://styles/mapbox/bright-v9',
//       accessToken: window.gon.map_keys.mapbox,
//       className: mapClasses + ' map-layer-mapboxBrightVector'
//     })
//   },

// }
