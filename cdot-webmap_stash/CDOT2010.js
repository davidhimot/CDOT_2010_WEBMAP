require([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/FeatureLayer",
    "esri/widgets/Legend",
    "esri/widgets/Home",    
    "esri/widgets/Fullscreen",
    "dojo/domReady!"
],
        function (Map, MapView, FeatureLayer, Home, Fullscreen
                  ) {

    var layer = new FeatureLayer({
        portalItem: {
            id: "1c8788144bfe448aa3ab18f7109afd80"
        },
        definitionExpression: "accident_d > 0",
        title: "Crash Date",
        minScale: 72223.819286
    });

    var map = new Map({
        basemap: "osm",
        portalItem:{
            id:"1c8788144bfe448aa3ab18f7109afd80"
        },
        layers:[layer]
    });

    var view = new MapView({
        map: map,
        container: "viewDiv",
        center: [-104.74368,40.25293],
        zoom: 9,
        constraints: {
            snapToZoom: false,
            minScale: 72223.819286
        },
        resizeAlign: "top-left"
    });

    //--------------------------------------------------------------------------
    //
    //  Setup UI
    //
    //--------------------------------------------------------------------------

    var applicationDiv = document.getElementById("applicationDiv");
    var slider = document.getElementById("slider");
    var sliderValue = document.getElementById("sliderValue");
    var playButton = document.getElementById("playButton");
    var titleDiv = document.getElementById("titleDiv");
    var animation = null;

    // When user drags the slider:
    //  - stops the animation
    //  - set the visualized year to the slider one.
    function inputHandler() {
        stopAnimation();
        setMonth(parseInt(slider.value));
    }
    slider.addEventListener("input", inputHandler);
    slider.addEventListener("change", inputHandler);

    // Toggle animation on/off when user
    // clicks on the play button
    playButton.addEventListener("click", function() {
        if (playButton.classList.contains("toggled")) {
            stopAnimation();
        } else {
            startAnimation();
        }
    });

    view.ui.empty("top-left");
    view.ui.add(titleDiv, "top-left");
    view.ui.add(new Home({
        view: view
    }), "top-left");
    view.ui.add(new Legend({
        view: view
    }), "bottom-left");
    view.ui.add(new Fullscreen({
        view: view,
        element: applicationDiv
    }), "top-right");

    // When the layerview is available, setup hovering interactivity
    view.whenLayerView(layer).then(setupHoverTooltip);

    // Starts the application by visualizing year 1984
    //need to figure out if this is a variable or a datafield
    setMonth(1);
    //--------------------------------------------------------------------------
    //
    //  Methods
    //
    //--------------------------------------------------------------------------

    /**
       * Sets the current visualized construction year.
       */
    function setMonth(value) {
        sliderValue.innerHTML = Math.floor(value);
        slider.value = Math.floor(value);
        layer.renderer = createRenderer(value);
    }

    /**
       * Returns a renderer with a color visual variable driven by the input
       * year. The selected year will always render buildings built in that year
       * with a light blue color. Buildings built 20+ years before the indicated
       * year are visualized with a pink color. Buildings built within that
       * 20-year time frame are assigned a color interpolated between blue and pink.
       */
    function createRenderer(month) {
        var opacityStops = [{
            opacity: 1,
            value: month
        },
                            {
                                opacity: 0,
                                value: month + 1
                            }];

        return {
            type: "simple",
            symbol: {
                type: "simple-fill",
                color: "rgb(0, 0, 0)",
                outline: null
            },
            visualVariables: [{
                type: "opacity",
                field: "accident_d",
                stops: opacityStops,
                legendOptions: {
                    showLegend: false
                }
            }, {
                type: "color",
                field: "accident_d",
                legendOptions: {
                    title: "Built:"
                },
                stops: [{
                    value: month,
                    color: "#0ff",
                    label: "in " + Math.floor(month)
                }, {
                    value: month - 1,
                    color: "#f0f",
                    label: "in " + (Math.floor(month) - 2)
                }, {
                    value: month - 5,
                    color: "#404",
                    label: "before " + (Math.floor(month) - 5)
                }]
            }]
        };
    }
    /**
       * Sets up a moving tooltip that displays
       * the construction year of the hovered building.
       */
    function setupHoverTooltip(layerview) {
        var promise;
        var highlight;

        var tooltip = createTooltip();

        view.on("pointer-move", function(event) {
            if (promise) {
                promise.cancel();
            }

            promise = view.hitTest(event.x, event.y)
                .then(function(hit) {
                promise = null;

                // remove current highlighted feature
                if (highlight) {
                    highlight.remove();
                    highlight = null;
                }

                var results = hit.results.filter(function(result) {
                    return result.graphic.layer === layer;
                });

                // highlight the hovered feature
                // or hide the tooltip
                if (results.length) {
                    var graphic = results[0].graphic;
                    var screenPoint = hit.screenPoint;

                    highlight = layerview.highlight(graphic);
                    tooltip.show(screenPoint, "Occured on " + graphic.getAttribute(
                        "accident_d"));
                } else {
                    tooltip.hide();
                }
            });
        });
    }

    /**
       * Starts the animation that cycle
       * through the construction years.
       */
    function startAnimation() {
        stopAnimation();
        animation = animate(parseFloat(slider.value));
        playButton.classList.add("toggled");
    }

    /**
       * Stops the animations
       */
    function stopAnimation() {
        if (!animation) {
            return;
        }

        animation.remove();
        animation = null;
        playButton.classList.remove("toggled");
    }
    /**
       * Animates the color visual variable continously
       */
    function animate(startValue) {
        var animating = true;
        var value = startValue;

        var frame = function(timestamp) {
            if (!animating) {
                return;
            }

            value += 0.5;
            if (value > 12) {
                value = 1;
            }

            setMonth(value);

            // Update at 30fps
            setTimeout(function() {
                requestAnimationFrame(frame);
            }, 1000 / 30);
        };

        frame();

        return {
            remove: function() {
                animating = false;
            }
        };
    }

    /**
       * Creates a tooltip to display a the construction year of a building.
       */
    function createTooltip() {
        var tooltip = document.createElement("div");
        var style = tooltip.style;

        tooltip.setAttribute("role", "tooltip");
        tooltip.classList.add("tooltip");

        var textElement = document.createElement("div");
        textElement.classList.add("esri-widget");
        tooltip.appendChild(textElement);

        view.container.appendChild(tooltip);

        var x = 0;
        var y = 0;
        var targetX = 0;
        var targetY = 0;
        var visible = false;

        // move the tooltip progressively
        function move() {
            x += (targetX - x) * 0.1;
            y += (targetY - y) * 0.1;

            if (Math.abs(targetX - x) < 1 && Math.abs(targetY - y) < 1) {
                x = targetX;
                y = targetY;
            } else {
                requestAnimationFrame(move);
            }

            style.transform = "translate3d(" + Math.round(x) + "px," + Math.round(
                y) + "px, 0)";
        }

        return {
            show: function(point, text) {
                if (!visible) {
                    x = point.x;
                    y = point.y;
                }

                targetX = point.x;
                targetY = point.y;
                style.opacity = 1;
                visible = true;
                textElement.innerHTML = text;

                move();
            },

            hide: function() {
                style.opacity = 0;
                visible = false;
            }
        };
    }

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


var opLayer = new ArcGISDynamicMapServiceLayer("https://services.arcgis.com/YseQBnl2jq0lrUV5/arcgis/rest/services/cdot_2010_crash_shp_1/FeatureServer");
     opLayer.setVisibleLayers([0]);

    var layerDefinitions = [];
    layerDefinitions[0] = "accident_d";
    opLayer.setLayerDefinitions(layerDefinitions);


// Create the layer and set the popup
var CDOT2010 = new  FeatureLayer({
    url: "https://services.arcgis.com/YseQBnl2jq0lrUV5/arcgis/rest/services/cdot_2010_crash_shp_1/FeatureServer/0",
    renderer: CDOT2010Renderer,
    renderer: symRenderer,

    outFields: ["LOC_3","CITY_NM","vehicles","killed","injured","accident_d"],
    popupTemplate: {
        title:"Crash Site",
        content: "<b>Location:</b> {LOC_3}<br><b>City:</b> {CITY_NM}<br><b>Date of Crash:</b>{accident_d}<br><b>Number of Vehicles Involved:</b>{vehicles}<br><b>Crash Result in Injury:</b> {injured} <br><b>Crash Result in Death:</b> {killed} <br>"
    }
});
map.add(CDOT2010)
};


//map.add(CDOT2010)
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
        }
});
*/
