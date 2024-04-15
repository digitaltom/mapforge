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
    style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    center: [8.271366455078127, 50.013330503465454],
    zoom: 9
  })
  await map.once('load')

  const deckOverlay = new deck.MapboxOverlay({
    // interleaved: true,
    layers: [
      new deck.GeoJsonLayer({
        id: 'airports',
        data: '/maps/frontpage-category-friends/features',
        // Styles
        filled: true,
        pointRadiusMinPixels: 2,
        pointRadiusScale: 2000,
        getPointRadius: f => 11 - f.properties.scalerank,
        getFillColor: [200, 0, 80, 180],
        // Interactive props
        pickable: true,
        autoHighlight: true,
        onClick: info =>
          // eslint-disable-next-line
          info.object && alert(`${info.object.properties.name} (${info.object.properties.abbrev})`)
        // beforeId: 'watername_ocean' // In interleaved mode, render the layer under map labels
      }),
      new deck.IconLayer({
        id: 'icon-layer',
        data: '/maps/frontpage-category-friends/features', // URL to your GeoJSON data
        // Define how to extract the icon URL and position from each feature
        getIcon: d => ({
          url: d.properties.markerIcon,
          width: 128,
          height: 128,
          anchorY: 128 // Adjust based on your image's anchor point
        }),
        sizeScale: 1, // Adjust the scale as needed
        getPosition: d => d.geometry.coordinates,
        getSize: d => 1, // Adjust size as needed, or use a function to determine size dynamically
        pickable: true,
        // Optional: Define onClick behavior
        onClick: ({ object, x, y }) => {
          console.log('Clicked on', object)
        }
      })
    ]
  })

  map.addControl(deckOverlay)
  map.addControl(new maplibregl.NavigationControl())
}
