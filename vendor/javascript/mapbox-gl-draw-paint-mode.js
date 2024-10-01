import * as doubleClickZoom from "./mapbox-gl-draw-paint-mode/lib/double_click_zoom";
import * as dragPan from "./mapbox-gl-draw-paint-mode/lib/drag_pan";
import * as Constants from "./mapbox-gl-draw-paint-mode/lib/Constants";

var PaintMode = {};

PaintMode.onSetup = function () {
  var state = {};
  state.features = [];
  state.currentLine = null;
  state.currentLineFeature = null;
  doubleClickZoom.disable(this);
  if(isTouchDevice()){
    dragPan.disable(this);
  }
  return state;
};

PaintMode.onClick = function (state, e) {
  if (e.originalEvent.detail === 2) {
    stopDrawing(state, e, this);
  } else {
    startDrawing(state, e);
  }
};

PaintMode.onTouchStart = function (state, e) {
  startDrawing(state, e);
};

PaintMode.onTouchEnd = function (state, e) {
  stopDrawing(state, e, this);
};

function startDrawing(state, e) {
  state.currentLine = state.currentLine || [];
  state.currentLine.push([e.lngLat.lng, e.lngLat.lat]);
}
function stopDrawing(state, e, me) {
  state.features.push(state.currentLine);
  state.currentLine = null;
  me.changeMode(Constants.modes.SIMPLE_SELECT);
  me.map.fire("draw.create", {
    type: "FeatureCollection",
    features: state.features.map((coordinates) => ({
      type: "Feature",
      id: Math.floor(Math.random() * 16 ** 14).toString(16),
      properties: {},
      geometry: {
        type: "MultiLineString",
        coordinates: [coordinates],
      },
    })),
  });
}

PaintMode.onMouseMove = PaintMode.onTouchMove = function (state, e) {
  if (!state.currentLine) return;

  state.currentLine.push([e.lngLat.lng, e.lngLat.lat]);

  if (!state.currentLineFeature) {
    state.currentLineFeature = this.newFeature({
      type: "Feature",
      properties: {},
      geometry: {
        type: "MultiLineString",
        coordinates: [state.currentLine],
      },
    });
    this.addFeature(state.currentLineFeature);
    this.map.fire("draw.selectionchange", {
      featureIds: [state.currentLineFeature.id],
    });
  } else {
    let updatedLineFeature = this.newFeature({
      type: "Feature",
      properties: {},
      geometry: {
        type: "MultiLineString",
        coordinates: [state.currentLine],
      },
    });
    this.deleteFeature(state.currentLineFeature.id);
    state.currentLineFeature = updatedLineFeature;
    this.addFeature(state.currentLineFeature);
    this.map.fire("draw.selectionchange", {
      featureIds: [state.currentLineFeature.id],
    });
  }
};

PaintMode.toDisplayFeatures = function (state, geojson, display) {
  display(geojson);
};

PaintMode.onStop = function (state) {
  dragPan.enable(this);
  doubleClickZoom.enable(this);
};

function isTouchDevice() {
  return (('ontouchstart' in window) ||
     (navigator.maxTouchPoints > 0) ||
     (navigator.msMaxTouchPoints > 0));
}

export default PaintMode;
