require([
    "esri/Map",
    //  "esri/layers/ArcGISDynamicMapServiceLayer",
    "esri/views/MapView",
    "esri/layers/FeatureLayer",
    //"esri/widgets/Legend",
    // "esri/widgets/Home",
    // "esri/widgets/Fullscreen",
    "dojo/domReady!"
], 
        function
        (
        Map, 
         MapView, 
         FeatureLayer)
         //  Legend, 
         //   Home, 
         //    Fullscreen)
         // TimeExtent, 
         // TimeSlider,
         // arrayUtils, 
         //dom
         
{
         var map = new Map({
         basemap: "osm", 
         portalItem: {
         id: "a8d243ec60e64ed29cfc5057403c3863" // This was created in the "Style a web map" and "Configure pop-ups" design labs
         }
         });

        var view = new MapView({
        container: "viewDiv",
        map: map,
        center: [-104.54368,40.25293],
        zoom: 9
        });

var crash =
    {
        field:"LOC_3",
        type: "picture-marker",
        url: "https://png.icons8.com/ios/40/000000/crashed-car.png",
        width: 7,
        height: 7
    };

var killed =
    {
        field: "killed",
        type: "picture-marker",
        url: "https://png.icons8.com/ios/40/000000/self-destruct-button-filled.png",
        width: 7,
        height: 7
    };

var injured =
    {
        type:"picture-marker",
        field:"injured",            url:"https://png.icons8.com/ios/50/000000/ambulance.png",
        width:7,
        height:7
    };

var defaultSym={
    type: "picture-marker",
    url:"style/icons8-crashed-car-24.png"};

var symRenderer ={
    type:"unique-value",
    defaultSymbol: defaultSym,
    defaultLable:"No Crash",
    //field:"LOC_3",
    field:"killed",
    field2:"injured",
    fieldDelimiter:", ",
    uniqueValueInfos:[{
        /*  value:"['*'], <1, <1",
            symbol:crash

    },{*/
        value:">=01, null",

        symbol:killed

    },{
        value:"null, >=01",
        symbol:injured
    }]
};


/*  var opLayer = new ArcGISDynamicMapServiceLayer("https://services.arcgis.com/YseQBnl2jq0lrUV5/arcgis/rest/services/cdot_2010_crash_shp_1/FeatureServer");
     opLayer.setVisibleLayers([0]);

    var layerDefinitions = [];
    layerDefinitions[0] = "accident_d";
    opLayer.setLayerDefinitions(layerDefinitions);
*/

// Create the layer and set the popup
var CDOT2010 = new FeatureLayer({
    url: "https://services.arcgis.com/YseQBnl2jq0lrUV5/arcgis/rest/services/cdot_2010_crash_shp_1/FeatureServer/0",
    // renderer: CDOT2010Renderer,
    renderer: symRenderer,

    outFields: ["LOC_3","CITY_NM","vehicles","killed","injured","accident_d"],
    popupTemplate: {
        title:"Crash Site",
        content: "<b>Location:</b> {LOC_3}<br><b>City:</b> {CITY_NM}<br><b>Date of Crash:</b>{accident_d}<br><b>Number of Vehicles Involved:</b>{vehicles}<br><b>Crash Result in Injury:</b> {injured} <br><b>Crash Result in Death:</b> {killed} <br>"
    }
});

map.add(CDOT2010)
/*Add the layer
    map.add([opLayer]);
    map.on("layers-add-result", initSlider);

    function initSlider() {
        var timeSlider = new TimeSlider({
            style: "width: 100%;"
        }, dom.byId("timeSliderDiv"));
        map.setTimeSlider(timeSlider);

        var timeExtent = new TimeExtent();
        timeExtent.startTime = new Date("1/1/2010 UTC");
        timeExtent.endTime = new Date("12/31/2010 UTC");
        timeSlider.setThumbCount(2);
        timeSlider.createTimeStopsByTimeInterval(timeExtent, 2, "esriTimeUnitsYears");
        timeSlider.setThumbIndexes([0,1]);
        timeSlider.setThumbMovingRate(2000);
        timeSlider.startup();

        var labels = arrayUtils.map(timeSlider.timeStops, function(timeStop, i) { 
            if ( i % 2 === 0 ) {
                return timeStop.getUTCFullMonth(); 
            } else {
                return "";
            }
        }); 

        timeSlider.setLabels(labels);

        timeSlider.on("time-extent-change", function(evt) {
            var startValString = evt.startTime.getUTCFullYear();
            var endValString = evt.endTime.getUTCFullYear();
            dom.byId("daterange").innerHTML = "<i>" + startValString + " and " + endValString  + "<\/i>";
        });
    } 
        }
        ]
        }
        }*/
});