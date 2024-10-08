// Maptiler SDK shortcuts: https://docs.maptiler.com/sdk-js/api/map-styles/#mapstylelist

const openmaptilesGlyphs = 'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf'
const defaultRasterLayer = [
  {
    id: 'simple-tiles',
    type: 'raster',
    source: 'raster-tiles',
    minzoom: 0,
    maxzoom: 22
  }
]
const host = new URL(window.location.href).origin

export const basemaps = {
  // static test tile
  test: {
    version: 8,
    sources: {
      'raster-tiles': {
        type: 'raster',
        tiles: ['/layers/test_tile.png'],
        tileSize: 1024
      }
    },
    layers: defaultRasterLayer,
    glyphs: openmaptilesGlyphs
  },

  // Stadia maps
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
    layers: defaultRasterLayer,
    glyphs: openmaptilesGlyphs
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
    layers: defaultRasterLayer,
    glyphs: openmaptilesGlyphs
  },

  // free maps
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
    layers: defaultRasterLayer,
    glyphs: openmaptilesGlyphs
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
    layers: defaultRasterLayer,
    glyphs: openmaptilesGlyphs
  },
  osmRasterTiles: {
    version: 8,
    sources: {
      'raster-tiles': {
        type: 'raster',
        tiles: [
          'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
        ],
        tileSize: 256,
        attribution: '<a href="https://www.openstreetmap.org/copyright">© OpenStreetMap Contributors</a>'
      }
    },
    layers: defaultRasterLayer,
    glyphs: openmaptilesGlyphs
  },

  // openfreemap.org
  openfreemapPositron: 'https://tiles.openfreemap.org/styles/positron',
  openfreemapBright: 'https://tiles.openfreemap.org/styles/bright',
  openfreemapLiberty: 'https://tiles.openfreemap.org/styles/liberty',

  // https://github.com/versatiles-org/versatiles-style
  versatilesColorful: 'https://tiles.versatiles.org/assets/styles/colorful.json',
  versatilesGraybeard: 'https://tiles.versatiles.org/assets/styles/graybeard.json',
  versatilesNeutrino: 'https://tiles.versatiles.org/assets/styles/neutrino.json',

  // 3D Houses
  maptilerBasic: 'https://api.maptiler.com/maps/basic-v2/style.json?key=' + window.gon.map_keys.maptiler,
  maptilerOpenStreetmap: 'https://api.maptiler.com/maps/openstreetmap/style.json?key=' + window.gon.map_keys.maptiler,
  maptilerBuildings: 'https://api.maptiler.com/maps/streets-v2/style.json?key=' + window.gon.map_keys.maptiler,
  maptilerDataviz: 'https://api.maptiler.com/maps/dataviz/style.json?key=' + window.gon.map_keys.maptiler,
  maptilerStreets: host + '/layers/streets.json?key=' + window.gon.map_keys.maptiler,
  maptilerNoStreets: host + '/layers/nostreets.json?key=' + window.gon.map_keys.maptiler,
  maptilerSatellite: 'https://api.maptiler.com/maps/satellite/style.json?key=' + window.gon.map_keys.maptiler,
  maptilerWinter: 'https://api.maptiler.com/maps/winter-v2/style.json?key=' + window.gon.map_keys.maptiler,
  maptilerBike: 'https://api.maptiler.com/maps/64d03850-97e0-4aaa-bd1d-8287a9792de1/style.json?key=' + window.gon.map_keys.maptiler,
  maptilerHybrid: 'https://api.maptiler.com/maps/hybrid/style.json?key=' + window.gon.map_keys.maptiler
}
