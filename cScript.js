var PMZoom = new function() {
  // Is CSS rule active? true/false
  var cssIsActive = false;
  // <style> sheet node for card CSS, initialized in init()
  var styleSheet;
  // <paper-slider> element, initialized in init()
  var slider;
  // Array of hashes for wich the slider and CSS should activate
  // Slider will display for play.google.com/music/listen#/artists and play.google.com/music/listen#/albums
  var include_hashes=["#/artists","#/albums"];

  var maxCardWidth = 650;
  var minCardWidth = 180;

  /*
   * Inject HTML Imports for Polymer & paper-slider element,
   * inject paper-slider into DOM, initialize it with last value from localStorage
   */
  this.init = function() {
    //Style element for rules, appended to <head>
    var styleEl = document.createElement("style");
    document.head.appendChild(styleEl);
    styleSheet = styleEl.sheet;

    //Import vulcanized Polymer & paper-slider, appended to <head>
    var polyImportEl = document.createElement("link");
    polyImportEl.setAttribute("rel", "import");
    polyImportEl.setAttribute("href", chrome.extension.getURL("vulcanized.html"));
    document.head.appendChild(polyImportEl);

    //paper-slider DOM Node
    slider = document.createElement("paper-slider")
    slider.setAttribute("min", minCardWidth);
    slider.setAttribute("max", maxCardWidth);

    //Try reading last slider value from localStorage
    startValue = parseInt(localStorage.getItem("last-zoom-value"));
    if (startValue && startValue <= maxCardWidth && startValue >= minCardWidth) {
      slider.setAttribute("value", startValue);
    } else {
      //Start at 180 if localStorage return nothing or nonsense
      slider.setAttribute("value", minCardWidth);
      localStorage.setItem("last-zoom-value", minCardWidth);
    }

    //Set initial visibility based on current location hash
    if (shouldActivateForHash(location.hash)) {
      showSlider();
    } else {
      hideSlider();
    }

    //Insert the slider into the nav bar, next to the countSummary
    document.querySelector(".nav-bar").insertBefore(slider, document.getElementById("countSummary"));

    //listen for core-change event (user moved slider)
    slider.addEventListener("core-change", sliderChanged, false);

    //Register onHashChange handler to activate/deactivate css and slider on navigation
    window.onhashchange = hashChangeHandler;
  }



  /*
   * Value of paper-slider changed
   * Update CSS and localStorage
   */
  var sliderChanged = function(e) {
    updateCss(styleSheet);
    localStorage.setItem("last-zoom-value", slider.getAttribute("aria-valuenow"));
  }

  /*
   * Inserts CSS rule for all elements where class="card",
   * read width from paper-slider
   */
  var activateCss = function(sheet) {
    if (!cssIsActive) {
      sheet.insertRule('.card {width: '+slider.getAttribute("aria-valuenow")+'px !important;}',0);
      cssIsActive=true;
    }
  };

  /*
   * Delete CSS rule for all elements where class="card"
   */
  var deactivateCss = function(sheet) {
    if(cssIsActive) {
      sheet.deleteRule(0);
      cssIsActive = false;
    }
  }

  /*
   * Update CSS when paper-slider value changed.
   * Deletes "old" rule from the sheet, adds new rule with current paper-slider.value
   * FIXME: Update rule instead of removing/adding.
   */
  var updateCss = function(sheet) {
    if(shouldActivateForHash(location.hash)) {
      if(cssIsActive) {
        deactivateCss(sheet);
      }
      activateCss(sheet);
    }
  }

  /*
   * Check if provided hash is present in include_hashes
   */
  var shouldActivateForHash = function(hash) {
    shouldActivate = false;
    for (var i in include_hashes) {
      if (hash === include_hashes[i]) {
        shouldActivate = true;
      }
    }
    return shouldActivate;
  }

  /*
   * Handle window.onhashchange by showing / hiding slider
   * and activating/deactivating CSS
   */
  var hashChangeHandler = function() {
    if(shouldActivateForHash(location.hash)) {
      activateCss(styleSheet);
      showSlider();
    } else {
      deactivateCss(styleSheet);
      hideSlider();
    }
  }


  var showSlider = function() {
    slider.setAttribute("should-display","yupp");
  }

  var hideSlider = function() {
    slider.setAttribute("should-display","nope");
  }
};


PMZoom.init();