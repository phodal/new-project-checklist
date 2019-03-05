var width = 900, height = 800;

// Set-up the export button
d3.select('#saveButtonPng').on('click', function () {
  let svg = d3.select('#body').selectAll('svg');
  var svgString = getSVGString(svg.node());
  svgString2Image(svgString, 2 * width, 2 * height, 'png', save); // passes Blob and filesize String to the callback

  function save(dataBlob) {
    saveAs(dataBlob, 'tla.png');
  }
});

// Below are the functions that handle actual exporting:
// getSVGString ( svgNode ) and svgString2Image( svgString, width, height, format, callback )
function getSVGString(svgNode) {
  svgNode.setAttribute('xlink', 'http://www.w3.org/1999/xlink');
  var cssStyleText = getCSSStyles(svgNode);
  appendCSS(cssStyleText, svgNode);

  var serializer = new XMLSerializer();
  var svgString = serializer.serializeToString(svgNode);
  svgString = svgString.replace(/(\w+)?:?xlink=/g, 'xmlns:xlink='); // Fix root xlink without namespace
  svgString = svgString.replace(/NS\d+:href/g, 'xlink:href'); // Safari NS namespace fix

  return svgString;

  function getCSSStyles(parentElement) {
    var selectorTextArr = [];

    // Add Parent element Id and Classes to the list
    selectorTextArr.push('#' + parentElement.id);
    for (var c = 0; c < parentElement.classList.length; c++)
      if (!contains('.' + parentElement.classList[c], selectorTextArr))
        selectorTextArr.push('.' + parentElement.classList[c]);

    // Add Children element Ids and Classes to the list
    var nodes = parentElement.getElementsByTagName("*");
    for (var i = 0; i < nodes.length; i++) {
      var id = nodes[i].id;
      if (!contains('#' + id, selectorTextArr))
        selectorTextArr.push('#' + id);

      var classes = nodes[i].classList;
      for (var c = 0; c < classes.length; c++)
        if (!contains('.' + classes[c], selectorTextArr))
          selectorTextArr.push('.' + classes[c]);
    }

    // Extract CSS Rules
    var extractedCSSText = "";
    for (var i = 0; i < document.styleSheets.length; i++) {
      var s = document.styleSheets[i];

      try {
        if (!s.cssRules) continue;
      } catch (e) {
        if (e.name !== 'SecurityError') throw e; // for Firefox
        continue;
      }

      var cssRules = s.cssRules;
      for (var r = 0; r < cssRules.length; r++) {
        if (contains(cssRules[r].selectorText, selectorTextArr))
          extractedCSSText += cssRules[r].cssText;
      }
    }


    return extractedCSSText;

    function contains(str, arr) {
      return arr.indexOf(str) !== -1;
    }

  }

  function appendCSS(cssText, element) {
    var styleElement = document.createElement("style");
    styleElement.setAttribute("type", "text/css");
    styleElement.innerHTML = cssText;
    var refNode = element.hasChildNodes() ? element.children[0] : null;
    element.insertBefore(styleElement, refNode);
  }
}


function svgString2Image(svgString, width, height, format, callback) {
  var imgsrc = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString))); // Convert SVG string to data URL

  var canvas = document.createElement("canvas");
  var context = canvas.getContext("2d");

  canvas.width = width;
  canvas.height = height;

  var image = new Image();
  image.onload = function () {
    context.clearRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    canvas.toBlob(function (blob) {
      var fileSize = Math.round(blob.length / 1024) + ' KB';
      if (callback) callback(blob, fileSize);
    });


  };

  image.src = imgsrc;
}

function generateHash(resultsArray) {
  return '#' + window.storagePreifx + '_' + encodeURI(JSON.stringify(resultsArray));
}

function hasHash() {
  var hashScores = window.location.hash.split('_');
  if (hashScores[0] === '#' + window.storagePreifx || hashScores[0] === '#custom') {
    return true;
  }
  return false;
}

function drawFromHash() {
  var hashScores = window.location.hash.split('_');
  if (hashScores[0] === '#' + window.storagePreifx || hashScores[0] === '#custom') {
    window.results = JSON.parse(decodeURI(hashScores[1]));
    generateNewDimensions(window.results[0]);
    drawChart(results);
  }
}

function generateNewDimensions(dimensions) {
  var results = [];
  for (var i = 0; i < dimensions.length; i++) {
    results.push(dimensions[i].axis);
  }

  window.dimensionsArray = results;
  renderForm();
}
