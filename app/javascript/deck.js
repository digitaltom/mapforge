// eslint expects variables to get imported, but we load the full lib in header
const maplibregl = window.maplibregl
const deck = window.deck;

['turbo:load'].forEach(function (e) {
  window.addEventListener(e, function () {
    // console.log(e)
    if (document.getElementById('deck-map')) {
      init()
    }
  })
})

async function init () {
  const map = new maplibregl.Map({
    container: 'deck-map', // container ID
    // style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    style: '/layers/nostreets.json?key=' + window.gon.map_keys.maptiler,
    center: [8.271366455078127, 50.013330503465454],
    zoom: 9,
    pitch: 45 // tilt the map
  })
  map.addControl(new maplibregl.NavigationControl())

  // await map.once('load')

  const data = [
    { position: [8.271366455078127, 50.013330503465454], iconUrl: '/icons/mapforge-logo.png', size: 100 },
    { position: [8.371366, 50.11333], iconUrl: '/icons/mapforge-logo.png', size: 150 }
    // Add more points as needed
  ]

  const iconLayer = new deck.IconLayer({
    id: 'icon-layer',
    data,
    pickable: true,
    // Auto-pack icons by providing icon URLs directly
    getIcon: d => ({
      url: d.iconUrl,
      height: 100,
      width: 100,
      anchorY: 128
    }),
    onIconError: e => console.log(e),
    getSize: 40
    // getPosition: d => d.position,
  })

  // https://deck.gl/docs/api-reference/layers/geojson-layer
  const geojsonLayer = new deck.GeoJsonLayer({
    id: 'airports',
    data: '/maps/frontpage-category-friends/features',
    // Styles
    filled: true,
    // stroked: false,
    pointType: 'icon', // 'icon+circle+text',

    getIcon: d => ({
      url: d.properties['marker-icon'],
      height: 100,
      width: 100,
      anchorY: 128
    }),
    onIconError: e => console.log(e),
    getIconSize: 40,
    // sizeScale: 10,
    // sizeMinPixels: 20,
    // pickable: true,
    // getPosition: d => d.position,

    pointRadiusMinPixels: 2,
    pointRadiusScale: 10,
    getPointRadius: f => 128,
    getFillColor: [200, 0, 80, 180],
    // // Interactive props
    // pickable: true,
    // autoHighlight: true,
    getText: f => f.properties['marker-icon'],
    getTextSize: 12
    // onClick: info =>
    //   // eslint-disable-next-line
    //   info.object && alert(`${info.object.properties['marker-icon']} (${info.object.properties.abbrev})`)
    // // beforeId: 'watername_ocean' // In interleaved mode, render the layer under map labels
  })

  const deckOverlay = new deck.MapboxOverlay({
    // interleaved: true,
    layers: [
      geojsonLayer,
      iconLayer
    ]
  })

  map.addControl(deckOverlay)
}
