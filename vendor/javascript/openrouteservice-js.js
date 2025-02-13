// openrouteservice-js@0.4.1 downloaded from https://ga.jspm.io/npm:openrouteservice-js@0.4.1/dist/ors-js-client.js

const e={defaultAPIVersion:"v2",defaultHost:"https://api.openrouteservice.org",missingAPIKeyMsg:"Please add your openrouteservice api_key..",baseUrlConstituents:["host","service","api_version","mime_type"],propNames:{apiKey:"api_key",host:"host",service:"service",apiVersion:"api_version",mimeType:"mime_type",profile:"profile",format:"format",timeout:"timeout"}};class OrsUtil{fillArgs(e,s){s={...e,...s};return s}saveArgsToCache(s){return{host:s[e.propNames.host],api_version:s[e.propNames.apiVersion],profile:s[e.propNames.profile],format:s[e.propNames.format],service:s[e.propNames.service],api_key:s[e.propNames.apiKey],mime_type:s[e.propNames.mimeType]}}prepareRequest(s){delete s[e.propNames.mimeType];delete s[e.propNames.host];delete s[e.propNames.apiVersion];delete s[e.propNames.service];delete s[e.propNames.apiKey];delete s[e.propNames.profile];delete s[e.propNames.format];delete s[e.propNames.timeout];return{...s}}
/**
   * Prepare the request url based on url constituents
   * @param {Object} args
   * @return {string} url
   */prepareUrl(s){let t=s[e.propNames.host];let r=[s[e.propNames.apiVersion],s[e.propNames.service],s[e.propNames.profile],s[e.propNames.format]];r=r.join("/");r=r.replace(/\/(\/)+/g,"/");r[0]==="/"&&(r=r.slice(1));let i=r.slice(-1);i[0]==="/"&&(r=r.slice(0,-1));t=t+"/"+r;return t}}const s=new OrsUtil;class OrsBase{constructor(e){this.defaultArgs={};this.requestArgs={};this.argsCache=null;this.customHeaders={};this._setRequestDefaults(e)}
/**
   * Set defaults for a request comparing with and overwriting default class arguments
   * @param {Object} args - constructor input
   */_setRequestDefaults(s){this.defaultArgs[e.propNames.host]=e.defaultHost;s[e.propNames.host]&&(this.defaultArgs[e.propNames.host]=s[e.propNames.host]);s[e.propNames.service]&&(this.defaultArgs[e.propNames.service]=s[e.propNames.service]);s[e.propNames.timeout]&&(this.defaultArgs[e.propNames.timeout]=s[e.propNames.timeout]);if(e.propNames.apiKey in s)this.defaultArgs[e.propNames.apiKey]=s[e.propNames.apiKey];else if(!s[e.propNames.host]){console.error(e.missingAPIKeyMsg);throw new Error(e.missingAPIKeyMsg)}}checkHeaders(){if(this.requestArgs.customHeaders){this.customHeaders=this.requestArgs.customHeaders;delete this.requestArgs.customHeaders}"Content-type"in this.customHeaders||(this.customHeaders={...this.customHeaders,"Content-type":"application/json"})}async fetchRequest(t,r){let i=s.prepareUrl(this.argsCache);this.argsCache[e.propNames.service]==="pois"&&(i+=i.indexOf("?")>-1?"&":"?");const o={Authorization:this.argsCache[e.propNames.apiKey]};return await fetch(i,{method:"POST",body:JSON.stringify(t),headers:{...o,...this.customHeaders},signal:r.signal})}async createRequest(s){var t;const r=new AbortController;const i=setTimeout((()=>r.abort()),this.defaultArgs[e.propNames.timeout]||5e3);try{const e=await this.fetchRequest(s,r);if(!e.ok){const s=new Error(e.statusText);s.status=e.status;s.response=e;throw s}return((t=this.argsCache)==null?void 0:t.format)==="gpx"?await e.text():await e.json()}finally{clearTimeout(i)}}getBody(){return this.httpArgs}async calculate(e){this.requestArgs=e;this.checkHeaders();this.requestArgs=s.fillArgs(this.defaultArgs,this.requestArgs);this.argsCache=s.saveArgsToCache(this.requestArgs);this.httpArgs=s.prepareRequest(this.requestArgs);const t=this.getBody(this.httpArgs);return await this.createRequest(t)}}const t=new OrsUtil;class OrsGeocode extends OrsBase{constructor(e){super(e);this.lookupParameter={api_key:function(e,s){return e+"="+s},text:function(e,s){return"&"+e+"="+encodeURIComponent(s)},focus_point:function(e,s){let t="";t+="&focus.point.lon="+s[1];t+="&focus.point.lat="+s[0];return t},boundary_bbox:function(e,s){let t="";t+="&boundary.rect.min_lon="+s[0][1];t+="&boundary.rect.min_lat="+s[0][0];t+="&boundary.rect.max_lon="+s[1][1];t+="&boundary.rect.max_lat="+s[1][0];return t},point:function(e,s){if(s&&Array.isArray(s.lat_lng)){let e="";e+="&point.lon="+s.lat_lng[1];e+="&point.lat="+s.lat_lng[0];return e}},boundary_circle:function(e,s){let t="";t+="&boundary.circle.lon="+s.lat_lng[1];t+="&boundary.circle.lat="+s.lat_lng[0];t+="&boundary.circle.radius="+s.radius;return t},sources:function(e,s){let t="&sources=";if(s){for(const e in s){Number(e)>0&&(t+=",");t+=s[e]}return t}},layers:function(e,s){let t="&layers=";let r=0;for(e in s){r>0&&(t+=",");t+=s[e];r++}return t},boundary_country:function(e,s){return"&boundary.country="+s},size:function(e,s){return"&"+e+"="+s},address:function(e,s){return"&"+e+"="+s},neighbourhood:function(e,s){return"&"+e+"="+s},borough:function(e,s){return"&"+e+"="+s},locality:function(e,s){return"&"+e+"="+s},county:function(e,s){return"&"+e+"="+s},region:function(e,s){return"&"+e+"="+s},postalcode:function(e,s){return"&"+e+"="+s},country:function(e,s){return"&"+e+"="+s}}}getParametersAsQueryString(s){let t="";for(const r in s){const i=s[r];e.baseUrlConstituents.indexOf(r)<=-1&&(t+=this.lookupParameter[r](r,i))}return t}async fetchGetRequest(e){let s=t.prepareUrl(this.requestArgs);s+="?"+this.getParametersAsQueryString(this.requestArgs);return await fetch(s,{method:"GET",headers:this.customHeaders,signal:e.signal})}async geocodePromise(){const s=new AbortController;const t=setTimeout((()=>s.abort()),this.defaultArgs[e.propNames.timeout]||5e3);try{const e=await this.fetchGetRequest(s);if(!e.ok){const s=new Error(e.statusText);s.status=e.status;s.response=e;throw s}return await e.json()||e.text()}finally{clearTimeout(t)}}async geocode(s){this.requestArgs=s;this.checkHeaders();this.defaultArgs[e.propNames.service]||this.requestArgs[e.propNames.service]||(this.requestArgs.service="geocode/search");this.requestArgs=t.fillArgs(this.defaultArgs,this.requestArgs);return await this.geocodePromise()}async reverseGeocode(s){this.requestArgs=s;this.checkHeaders();this.defaultArgs[e.propNames.service]||this.requestArgs[e.propNames.service]||(this.requestArgs.service="geocode/reverse");this.requestArgs=t.fillArgs(this.defaultArgs,this.requestArgs);return await this.geocodePromise()}async structuredGeocode(s){this.requestArgs=s;this.checkHeaders();this.defaultArgs[e.propNames.service]||this.requestArgs[e.propNames.service]||(this.requestArgs.service="geocode/search/structured");this.requestArgs=t.fillArgs(this.defaultArgs,this.requestArgs);return await this.geocodePromise()}}class OrsIsochrones extends OrsBase{constructor(s){super(s);this.defaultArgs[e.propNames.service]||this.requestArgs[e.propNames.service]||(this.defaultArgs.service="isochrones");s[e.propNames.apiVersion]||(this.defaultArgs.api_version=e.defaultAPIVersion)}getBody(e){const s={};if(e.restrictions){s.profile_params={restrictions:{...e.restrictions}};delete e.restrictions}if(e.avoidables){s.avoid_features=[...e.avoidables];delete e.avoidables}if(e.avoid_polygons){s.avoid_polygons={...e.avoid_polygons};delete e.avoid_polygons}return Object.keys(s).length>0?{...e,options:s}:{...e}}}class OrsMatrix extends OrsBase{constructor(s){super(s);this.defaultArgs[e.propNames.service]||this.requestArgs[e.propNames.service]||(this.defaultArgs[e.propNames.service]="matrix");s[e.propNames.apiVersion]||(this.defaultArgs.api_version=e.defaultAPIVersion)}}class OrsDirections extends OrsBase{constructor(s){super(s);this.defaultArgs[e.propNames.service]||(this.defaultArgs[e.propNames.service]="directions");s[e.propNames.apiVersion]||(this.defaultArgs.api_version=e.defaultAPIVersion)}getBody(e){e.options&&typeof e.options!=="object"&&(e.options=JSON.parse(e.options));if(e.restrictions){e.options=e.options||{};e.options.profile_params={restrictions:{...e.restrictions}};delete e.restrictions}if(e.avoidables){e.options=e.options||{};e.options.avoid_features=[...e.avoidables];delete e.avoidables}return e}}const r=new OrsUtil;class OrsPois extends OrsBase{constructor(s){super(s);this.defaultArgs[e.propNames.service]||(this.defaultArgs[e.propNames.service]="pois")}generatePayload(s){const t={};for(const r in s)e.baseUrlConstituents.indexOf(r)>-1||r===e.propNames.apiKey||r===e.propNames.timeout||(t[r]=s[r]);return t}async poisPromise(){this.requestArgs.request=this.requestArgs.request||"pois";this.argsCache=r.saveArgsToCache(this.requestArgs);this.requestArgs[e.propNames.service]&&delete this.requestArgs[e.propNames.service];const s=this.generatePayload(this.requestArgs);return await this.createRequest(s)}async pois(e){this.requestArgs=e;this.checkHeaders();this.requestArgs=r.fillArgs(this.defaultArgs,this.requestArgs);return await this.poisPromise()}}const i=new OrsUtil;class OrsElevation extends OrsBase{generatePayload(s){const t={};for(const r in s)e.baseUrlConstituents.indexOf(r)<=-1&&(t[r]=s[r]);return t}async elevationPromise(){this.argsCache=i.saveArgsToCache(this.requestArgs);const e=this.generatePayload(this.requestArgs);return await this.createRequest(e)}async lineElevation(s){this.requestArgs=s;this.checkHeaders();this.defaultArgs[e.propNames.service]||this.requestArgs[e.propNames.service]||(this.requestArgs[e.propNames.service]="elevation/line");this.requestArgs=i.fillArgs(this.defaultArgs,this.requestArgs);return await this.elevationPromise()}async pointElevation(s){this.requestArgs=s;this.checkHeaders();this.defaultArgs[e.propNames.service]||this.requestArgs[e.propNames.service]||(this.requestArgs[e.propNames.service]="elevation/point");this.requestArgs=i.fillArgs(this.defaultArgs,this.requestArgs);return await this.elevationPromise()}}const o=new OrsUtil;class OrsOptimization extends OrsBase{generatePayload(s){let t={};for(const r in s)e.baseUrlConstituents.indexOf(r)<=-1&&(t[r]=s[r]);return t}async optimizationPromise(){this.argsCache=o.saveArgsToCache(this.requestArgs);const e=this.generatePayload(this.requestArgs);return await this.createRequest(e)}async optimize(s){this.requestArgs=s;this.checkHeaders();this.defaultArgs[e.propNames.service]||s[e.propNames.service]||(s[e.propNames.service]="optimization");this.requestArgs=o.fillArgs(this.defaultArgs,this.requestArgs);return await this.optimizationPromise()}}class OrsSnap extends OrsBase{constructor(s){super(s);this.defaultArgs[e.propNames.service]||this.requestArgs[e.propNames.service]||(this.defaultArgs[e.propNames.service]="snap");s[e.propNames.apiVersion]||(this.defaultArgs.api_version=e.defaultAPIVersion)}}const a={Geocode:OrsGeocode,Isochrones:OrsIsochrones,Directions:OrsDirections,Matrix:OrsMatrix,Pois:OrsPois,Elevation:OrsElevation,Optimization:OrsOptimization,Snap:OrsSnap};typeof module==="object"&&typeof module.exports==="object"?module.exports=a:typeof define==="function"&&define.amd&&define(a);typeof window!=="undefined"&&(window.Openrouteservice=a);export{a as default};

