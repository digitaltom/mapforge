const disable=e=>{setTimeout((()=>{e.map&&e.map.doubleClickZoom&&e.map.doubleClickZoom.disable()}),0)};const e={DRAW_LINE_STRING:"draw_line_string",DRAW_POLYGON:"draw_polygon",DRAW_POINT:"w",SIMPLE_SELECT:"simple_select",DIRECT_SELECT:"direct_select",STATIC:"static"};var t={};t.onSetup=function(){var e={};e.features=[];e.currentLine=null;e.currentLineFeature=null;disable(this);return e};t.onTap=t.onClick=function(t,r){if(2===r.originalEvent.detail){t.features.push(t.currentLine);t.currentLine=null;this.changeMode(e.SIMPLE_SELECT);this.map.fire("draw.create",{type:"FeatureCollection",features:t.features.map((e=>({id:t.currentLineFeature.id,type:"Feature",properties:{},geometry:{type:"MultiLineString",coordinates:[e]}})))});disable(this)}else{t.currentLine=t.currentLine||[];t.currentLine.push([r.lngLat.lng,r.lngLat.lat])}};t.onMouseMove=function(e,t){if(e.currentLine){e.currentLine.push([t.lngLat.lng,t.lngLat.lat]);if(e.currentLineFeature){let t=this.newFeature({type:"Feature",properties:{},geometry:{type:"MultiLineString",coordinates:[e.currentLine]}});this.deleteFeature(e.currentLineFeature.id);e.currentLineFeature=t;this.addFeature(e.currentLineFeature);this.map.fire("draw.selectionchange",{featureIds:[e.currentLineFeature.id]})}else{e.currentLineFeature=this.newFeature({type:"Feature",properties:{},geometry:{type:"MultiLineString",coordinates:[e.currentLine]}});this.addFeature(e.currentLineFeature);this.map.fire("draw.selectionchange",{featureIds:[e.currentLineFeature.id]})}}};t.toDisplayFeatures=function(e,t,r){r(t)};export{t as default};

