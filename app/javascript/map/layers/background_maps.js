// eslint expects variables to get imported, but we load the full lib in header
const ol = window.ol
const olms = window.olms

export function backgroundTiles () {
  const satelliteTiles = new ol.layer.Tile({
    source: new ol.source.XYZ({
      attributions: ['Powered by Esri',
        'Sources: Esri, DigitalGlobe, GeoEye, i-cubed, USDA FSA, USGS, AEX, Getmapping, Aerogrid, IGN, IGP, swisstopo, and the GIS User Community'],
      url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attributionsCollapsible: false,
      maxZoom: 19
    })
  })

  const satelliteStreetTiles = new ol.layer.Tile({
    source: new ol.source.XYZ({
      url: 'https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v10/tiles/{z}/{x}/{y}?' +
           'access_token=' + window.gon?.map_keys?.mapbox,
      attributions: ['<a href="https://www.mapbox.com/about/maps/" target="_blank">© Mapbox</a>',
        '<a href="http://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap</a>',
        '<a href="https://www.mapbox.com/feedback/" target="_blank">Improve this map</a>'],
      attributionsCollapsible: false,
      tileSize: 512
    })
  })

  const osmDefaultTiles = new ol.layer.Tile({ source: new ol.source.OSM() })

  const osmTiles = new ol.layer.Tile({
    source: new ol.source.XYZ({
      url: 'https://api.maptiler.com/maps/basic-v2/{z}/{x}/{y}@2x.png?key=' + window.gon?.map_keys?.maptiler,
      tileSize: 512,
      attributions: ['<a href="https://maptiler.com/" target="_blank">© MapTiler</a>',
        ' and © <a href="https://openstreetmap.org/" target="_blank">OpenStreetMap contributors</a>'
      ],
      attributionsCollapsible: false
    })
  })

  const streetTiles = new ol.layer.Tile({
    source: new ol.source.XYZ({
      url: 'https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?' +
           'access_token=' + window.gon?.map_keys?.mapbox,
      attributions: ['<a href="https://www.mapbox.com/about/maps/" target="_blank">© Mapbox</a>',
        '<a href="http://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap</a>',
        '<a href="https://www.mapbox.com/feedback/" target="_blank">Improve this map</a>'],
      attributionsCollapsible: false
    })
  })

  // https://opentopomap.org/about#verwendung
  const openTopoTiles = new ol.layer.Tile({
    source: new ol.source.XYZ({
      url: 'https://a.tile.opentopomap.org/{z}/{x}/{y}.png',
      attributions: ['Kartendaten: © ',
        '<a href="https://openstreetmap.org/copyright" target="_blank">OpenStreetMap-Mitwirkende</a>',
        'SRTM, SRTM | Kartendarstellung: © ',
        '<a href="http://opentopomap.org/" target="_blank">OpenTopoMap</a> ',
        '<a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank">(CC-BY-SA)</a>'],
      attributionsCollapsible: false
    })
  })

  const esriTiles = new ol.layer.Tile({
    source: new ol.source.XYZ({
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
      attributions: ['Powered by <a href="https://developers.arcgis.com/" target="_blank">Esri</a>'],
      attributionsCollapsible: false
    })
  })

  const stamenTonerTiles = new ol.layer.Tile({
    source: new ol.source.StadiaMaps({
      layer: 'stamen_toner',
      retina: true,
      attributionsCollapsible: false
    })
  })

  const stamenWatercolorTiles = new ol.layer.Tile({
    source: new ol.source.StadiaMaps({
      layer: 'stamen_watercolor',
      retina: true,
      attributionsCollapsible: false
    })
  })

  const mapboxBrightVector = new olms.MapboxVectorLayer({
    styleUrl: 'mapbox://styles/mapbox/bright-v9',
    accessToken: window.gon.map_keys.mapbox
  })

  const mapboxBasicVector = new olms.MapboxVectorLayer({
    styleUrl: 'mapbox://styles/mapbox/basic-v9',
    accessToken: window.gon.map_keys.mapbox
  })

  return {
    satelliteTiles,
    satelliteStreetTiles,
    osmTiles,
    osmDefaultTiles,
    streetTiles,
    esriTiles,
    stamenWatercolorTiles,
    stamenTonerTiles,
    openTopoTiles,
    mapboxBrightVector,
    mapboxBasicVector
  }
}
