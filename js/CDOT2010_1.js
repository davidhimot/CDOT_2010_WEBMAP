require([
    "esri/Map",
    "esri/layers/FeatureLayer",
    "esri/views/MapView",
    "esri/widgets/Legend",
    "esri/widgets/Home",
    "esri/widgets/Fullscreen",
    "dojo/domReady!"
], function(
        Map,
         FeatureLayer,
         MapView,
         Legend, Home, Fullscreen
        ) {

    //--------------------------------------------------------------------------
    //
    //  Setup Map and View
    //
    //--------------------------------------------------------------------------

   
    var map = new Map({
        basemap:"osm",
        /*    portalItem: {
                        id: "a8d243ec60e64ed29cfc5057403c3863"
                    }, 
                    /*   {
          portalItem: {
            id: "1c8788144bfe448aa3ab18f7109afd80"

        },*/
        //     layers: [layer]
    });

    var view = new MapView({
        map: map,
        //   layers: [layer],
        container: "viewDiv",
        center: [-105, 40.5],
        zoom: 9,
        constraints: {
            minScale:// 72223.819286
            1444470.6385720
            //This also has something to do with the legend.
        },
        // This ensures that when going fullscreen
        // The top left corner of the view extent
        // stays aligned with the top left corner
        // of the view's container
        resizeAlign: "top-left"
    });
     var layer = new FeatureLayer({
        url: "https://services.arcgis.com/YseQBnl2jq0lrUV5/arcgis/rest/services/cdot_2010_crash_shp_1/FeatureServer",
        /*portalItem: {
            id: "1c8788144bfe448aa3ab18f7109afd80"
          },*/
        definitionExpression: "accident_d > 1/1/2010",
        title: "Crash Incedents",
        minScale://72223.819286
        1444470.6385720
        //What does this have to doe with the legend?
    });
 //   map.add("layer");

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
    setMonth(1/1/2010);

    //--------------------------------------------------------------------------
    //
    //  Methods
    //
    //--------------------------------------------------------------------------


    // * Sets the current visualized construction year.

    function setMonth(value) {
        sliderValue.innerHTML = Math.year(value);+
            " %</span> of the votes separate the two candidates";
        slider.value = Math.date(value);
        layer.renderer = createRenderer(value);
    }

    /**
       * Returns a renderer with a color visual variable driven by the input
       * year. The selected year will always render buildings built in that year
       * with a light blue color. Buildings built 20+ years before the indicated
       * year are visualized with a pink color. Buildings built within that
       * 20-year time frame are assigned a color interpolated between blue and pink.
       */

    function createRenderer(setMonth) {
        var opacityStops = [{
            opacity: 1,
            value: "accident_d"
        },
                            {
                                opacity: 0,
                                value: "accident_d" + 1440
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
                    title: "Happened:"
                },
                stops: [{
                    value: accident_d,
                    color: "#0ff",
                    label: "in " + Math.floor(accident_d)
                }, {
                    value: month - 1,
                    color: "#f0f",
                    label: "in " + (Math.floor(accident_d) - 2)
                }, {
                    value: month - 5,
                    color: "#404",
                    label: "before " + (Math.floor(accident_d) - 5)
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
                    tooltip.show(screenPoint, "Crash Date " + graphic.getAttribute(
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
            if (value > 12/31/2010) {
                value = 1/1/2010;
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