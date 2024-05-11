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
    ],
    glyphs: 'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf'
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
    ],
    glyphs: 'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf'
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
    ],
    glyphs: 'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf'
  },
  satelliteTiles: {
    version: 8,
    sources: {
      'raster-tiles': {
        type: 'raster',
        tiles: [
          'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        ],
        tileSize: 256,
        attribution: 'Powered by Esri, ' +
          'Sources: Esri, DigitalGlobe, GeoEye, i-cubed, USDA FSA, USGS, AEX, Getmapping, Aerogrid, IGN, IGP, swisstopo, and the GIS User Community'
      }
    },
    layers: [
      {
        id: 'simple-tiles',
        type: 'raster',
        source: 'raster-tiles',
        minzoom: 0,
        maxzoom: 18.5
      }
    ],
    glyphs: 'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf'
  },

  // 3D Houses
  maptilerBasic: 'https://api.maptiler.com/maps/basic-v2/style.json?key=' + window.gon.map_keys.maptiler,
  maptilerOpenStreetmap: 'https://api.maptiler.com/maps/openstreetmap/style.json?key=' + window.gon.map_keys.maptiler,
  maptilerBuildings: 'https://api.maptiler.com/maps/streets/style.json?key=' + window.gon.map_keys.maptiler,
  maptilerDataviz: 'https://api.maptiler.com/maps/dataviz/style.json?key=' + window.gon.map_keys.maptiler,
  maptilerStreets: '/layers/streets.json?key=' + window.gon.map_keys.maptiler,
  maptilerNoStreets: '/layers/nostreets.json?key=' + window.gon.map_keys.maptiler,
  satelliteStreets: 'https://api.maptiler.com/maps/hybrid/style.json?key=' + window.gon.map_keys.maptiler,
  satellite: 'https://api.maptiler.com/maps/satellite/style.json?key=' + window.gon.map_keys.maptiler,
  maptilerWinter: 'https://api.maptiler.com/maps/winter-v2/style.json?key=' + window.gon.map_keys.maptiler,

  // ol compat:
  osmTiles: 'https://api.maptiler.com/maps/basic-v2/style.json?key=' + window.gon.map_keys.maptiler,
  satelliteStreetTiles: 'https://api.maptiler.com/maps/hybrid/style.json?key=' + window.gon.map_keys.maptiler,
  mapboxBrightVector: 'https://api.maptiler.com/maps/streets/style.json?key=' + window.gon.map_keys.maptiler
}

//   osmDefaultTiles: function () {
//     return new ol.layer.Tile({ source: new ol.source.OSM(), className: mapClasses })
//   },

//   mapboxBrightVector: function () {
//     return new olms.MapboxVectorLayer({
//       styleUrl: 'mapbox://styles/mapbox/bright-v9',
//       accessToken: window.gon.map_keys.mapbox,
//       className: mapClasses + ' map-layer-mapboxBrightVector'
//     })
//   },
