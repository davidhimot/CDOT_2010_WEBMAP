require([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/FeatureLayer",
    "dojo/domReady!"
], 
        function(Map, MapView, FeatureLayer) {

    var map = new Map({
        basemap: "gray", 
        portalItem: {
            id: "a8d243ec60e64ed29cfc5057403c3863" // This was created in the "Style a web map" and "Configure pop-ups" design labs
            }
    });
            var view = new MapView({
            container: "viewDiv",
            map: map
        });
    
   /*     var popupCDOT2010 = {
        "title": "Crash Site",
        "content": "<b>Location:</b> {LOC_3}<br><b>City:</b> {CITY_NM}<br><b>Date of Crash:</b> {accident_d}<b>Number of Vehicles Involved:</b> {vehicles}<br><b>Crash Result in Injury:</b> {injured} injured<br><b>Crash Result in Death:</b> {killed} killed<br>"
    }*/

                            // Create the layer and set the popup
                            var CDOT2010 = new FeatureLayer({
                            url: "https://services.arcgis.com/YseQBnl2jq0lrUV5/arcgis/rest/services/cdot_2010_crash_shp_1/FeatureServer/0",
                           // renderer: CDOT2010Renderer,
                            outFields: ["LOC_3","CITY_NM","vehicles","killed","injured","accident_d"],
                            popupTemplate: {
                                title:"Crash Site",
                                content: "<b>Location:</b> {LOC_3}<br><b>City:</b> {CITY_NM}<br><b>Date of Crash:</b> {accident_d}<b>Number of Vehicles Involved:</b> {vehicles}<br><b>Crash Result in Injury:</b> {injured} injured<br><b>Crash Result in Death:</b> {killed} killed<br>"
                            }
                            });
    // Add the layer
   map.add(CDOT2010);
   /* var CDOT2010Renderer = {
        type: "simple",
        symbol: {
            type: "picture-marker",
            url: "https://png.icons8.com/ios/40/000000/crashed-car.png",
            contentType: "image/png",
            width: 10.5,
            height: 10.5
        };

        var CDOT2010Renderer = {
        "type": "unique-value",
        "field": "killed",
        "uniqueValueInfos": [
        {
        "value": "02",
        "symbol":{
        "type": "picture-marker",
        "url": "https://png.icons8.com/ios/40/000000/self-destruct-button-filled.png",
        "contentType": "image/png",
    },
        "width": 10.5,
            "height": 10.5
}, 
        "label": "All Vehicles"
        },
        {
        "value": "01",
        "type": "picture-marker",
        "symbol":{
        "url": "https://png.icons8.com/ios/40/000000/self-destruct-button-filled.png",
        "contentType": "image/png",
        "width": 10.5,
        "height": 10.5
        },
        "label": "One Vehicle"
        }
        ]
        }
        }*/
        });