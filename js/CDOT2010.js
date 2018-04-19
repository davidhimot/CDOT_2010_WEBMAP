require([
    "esri/Map",
    //"esri/layers/ArcGISDynamicMapServiceLayer",
    "esri/views/MapView",
    "esri/layers/FeatureLayer",
    //"esri/widgets/Legend",
    "esri/widgets/Home",
    "esri/widgets/Fullscreen",
    "dojo/domReady!"
], 
        function
        (
        Map, 
         MapView, 
         FeatureLayer,
         //  Legend, 
         Home, 
         Fullscreen)
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
        zoom: 9,
        constraints: {
            minScale:// 72223.819286
            14444700.63857200},
        resizeAlign: "top-left"
    });

    view.ui.empty("top-left");
    view.ui.add(titleDiv, "top-left");
    view.ui.add(new Home({
        view: view
    }), "top-left");
    view.ui.add(new Fullscreen({
        view: view,
    }), "top-right");



    var defaultSym={
        type: "picture-marker",
        url:"style/icons8-crashed-car-24.png"};

    var symRenderer ={
        type:"unique-value",
        defaultSymbol: defaultSym,
        defaultLable:"No Crash",

    };

    // Create the layer and set the popup
    var CDOT2010 = new FeatureLayer({
        url: "https://services.arcgis.com/YseQBnl2jq0lrUV5/arcgis/rest/services/cdot_2010_crash_shp_1/FeatureServer/0",

        renderer: symRenderer,

        outFields: ["LOC_3","CITY_NM","vehicles","killed","injured","accident_d"],
        popupTemplate: {
            title:"Crash Site",
            content: "<b>Location:</b> {LOC_3}<br><b>City:</b> {CITY_NM}<br><b>Date of Crash:</b>{month_CRSH}/{day_CRSH} <b>Hour:</b>{hour_CRSH}<br><b>Number of Vehicles Involved:</b>{vehicles}<br><b>Crash Result in Injury:</b> {injured} <br><b>Crash Result in Death:</b> {killed} <br>"
        }
    });

    map.add(CDOT2010)

});