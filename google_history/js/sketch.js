// Written by Juan Francisco Saldarriaga
// Brown Institute for Media Innovation
// Columbia University
// 2019

document.addEventListener(
  "click",
  function (event) {
    if (event.target.parentElement.id == "visualization") {
      canvasClicked = true;
      console.log("Canvas clicked...");
    } else {
      canvasClicked = false;
    }
  },
  false
);

// Get div width & height
var divWidth = document.getElementById("visualization").clientWidth;
var divHeight = document.getElementById("visualization").clientHeight;

// Get dropdown menus & buttons
var dataTypeSelector;
var purposeSelector;
var collectionMethodSelector;
var resetButton;
var button2001 = document.getElementById("2001");
var button2010 = document.getElementById("2010");
var button2019 = document.getElementById("2019");
var compareYearsButton = document.getElementById("compareYears");
var policyYearSlider = document.getElementById("policyYear");

// Set global variables
var marginTop = 100;
var marginBottom = 88;
var marginLeft = 140;
var marginRight = 160;
var vizWidth = divWidth - marginLeft - marginRight;
var vizHeight = divHeight - marginTop - marginBottom;
var nodesTable;
var linksTable;
var complexLinksTable;
var nodes = [];
var links = [];
var complexLinks = [];
var currentFilter = ["2019", "all", "all"];
var collectionFilter = "all";
var myFont;
var myTitleFont;
var hiddenLinkStroke = 0.03;
var hiddenNodeOpacity = 0.08;
var canvasClicked = false;
var comparisonActive = false;
var policyYear = 2019;
var firstDraw = true;

// Load the datasets
function preload() {
  console.log("Loading data...");
  nodesTable = loadTable("data/nodes.csv", "csv", "header");
  linksTable = loadTable("data/generates.csv", "csv", "header");
  complexLinksTable = loadTable("data/collectsUsesShares.csv", "csv", "header");
  myFont = loadFont("../fonts/Inconsolata-Regular.ttf");
  myTitleFont = loadFont("../fonts/Inconsolata-Bold.ttf");
}

// Setup everything and build the objects
function setup() {
  let myCanvas = createCanvas(divWidth, divHeight);
  myCanvas.parent("visualization");
  colorMode(HSB, 360, 100, 100, 1);
  noLoop();
  buildNodes();
  buildLinks();
  buildComplexLinks();
  dataTypeSelector = select("#dataTypeSelector");
  dataTypeSelector.input(updateFilters);
  purposeSelector = select("#purposeSelector");
  purposeSelector.input(updateFilters);
  collectionMethodSelector = select("#collectionMethod");
  collectionMethodSelector.input(selectByCollectionMethod);
  resetButton = select("#resetButton");
  resetButton.mousePressed(resetFilters);
}

// Build nodes
function buildNodes() {
  console.log("Building nodes...");
  let dataSourcesNum = 0;
  let dataTypesNum = 0;
  let purposeNum = 0;
  for (let i = 0; i < nodesTable.getRowCount(); i++) {
    let nodeCat = nodesTable.getString(i, "CATEGORY");
    if (nodeCat == "DATASOURCE") {
      dataSourcesNum += 1;
    } else if (nodeCat == "TYPE OF DATA") {
      dataTypesNum += 1;
    } else if (nodeCat == "PURPOSE") {
      purposeNum += 1;
    }
  }
  for (let i = 0; i < nodesTable.getRowCount(); i++) {
    let nodeOrder = nodesTable.getNum(i, "ORDER");
    let nodeName = nodesTable.getString(i, "NAME");
    let nodeCat = nodesTable.getString(i, "CATEGORY");
    let nodeSubCat = nodesTable.getString(i, "SUBCATEGORY");
    let includes = nodesTable.getString(i, "INCLUDES");
    if (nodeCat == "DATASOURCE") {
      nodes.push(
        new Node(
          nodeName,
          nodeCat,
          nodeSubCat,
          includes,
          marginLeft,
          marginTop + (vizHeight / (dataSourcesNum - 1)) * (nodeOrder - 1),
          RIGHT
        )
      );
    } else if (nodeCat == "TYPE OF DATA") {
      nodes.push(
        new Node(
          nodeName,
          nodeCat,
          nodeSubCat,
          includes,
          marginLeft + vizWidth / 2,
          marginTop + (vizHeight / (dataTypesNum - 1)) * (nodeOrder - 1),
          CENTER
        )
      );
    } else if (nodeCat == "companies") {
      nodes.push(
        new Node(
          nodeName,
          nodeCat,
          nodeSubCat,
          includes,
          marginLeft + (vizWidth / 3) * 2,
          marginTop + vizHeight / 2,
          CENTER
        )
      );
    } else {
      nodes.push(
        new Node(
          nodeName,
          nodeCat,
          nodeSubCat,
          includes,
          marginLeft + vizWidth,
          marginTop + (vizHeight / (purposeNum - 1)) * (nodeOrder - 1),
          LEFT
        )
      );
    }
  }
}

// Build simple links
function buildLinks() {
  console.log("Building simple links...");
  for (var i = 0; i < linksTable.getRowCount(); i++) {
    let startName = linksTable.getString(i, "DATASOURCE");
    let endName = linksTable.getString(i, "DATATYPE");
    let how = linksTable.getString(i, "HOW");
    let startVector = createVector();
    let endVector = createVector();
    let midVector1 = createVector();
    let midVector2 = createVector();
    for (node of nodes) {
      if (node.name == startName) {
        startVector.x = node.x;
        startVector.y = node.y;
      }
      if (node.name == endName) {
        endVector.x = node.x;
        endVector.y = node.y;
      }
    }
    midVector1.x = startVector.x + ((endVector.x - startVector.x) / 8) * 3;
    midVector1.y = startVector.y;
    midVector2.x = startVector.x + ((endVector.x - startVector.x) / 8) * 5;
    midVector2.y = endVector.y;
    links.push(
      new Link(
        startName,
        endName,
        how,
        startVector,
        endVector,
        midVector1,
        midVector2
      )
    );
  }
}

// Build complex links
function buildComplexLinks() {
  console.log("Building complex links...");
  for (var i = 0; i < complexLinksTable.getRowCount(); i++) {
    let startName = ["all", complexLinksTable.getString(i, "DATATYPE")];
    let endName = ["all", complexLinksTable.getString(i, "PURPOSE")];
    let dataTypeSubCat = [
      "all",
      complexLinksTable.getString(i, "DATATYPESUBCATEGORY"),
    ];
    let purposeSubCat = [
      "all",
      complexLinksTable.getString(i, "PURPOSESUBCATEGORY"),
    ];
    let year2001, year2010, year2019;
    if (complexLinksTable.getString(i, "GOOGLE2001") == "GOOGLE") {
      year2001 = "2001";
    } else {
    }
    if (complexLinksTable.getString(i, "GOOGLE2010") == "GOOGLE") {
      year2010 = "2010";
    } else {
    }
    if (complexLinksTable.getString(i, "GOOGLE2019") == "GOOGLE") {
      year2019 = "2019";
    } else {
    }
    let years = [year2001, year2010, year2019].filter(Boolean).join(",");
    // let years = complexLinksTable.getString(i, 'YEARS').split(',');
    let startAnchor = createVector();
    let midAnchor1 = createVector();
    let midAnchor2 = createVector();
    let endAnchor = createVector();
    for (node of nodes) {
      if (node.name == startName[1]) {
        startAnchor.x = node.x;
        startAnchor.y = node.y;
      }
      if (node.name == endName[1]) {
        endAnchor.x = node.x;
        endAnchor.y = node.y;
      }
      if (node.name == "companies") {
      }
    }
    midAnchor1.x = startAnchor.x + ((endAnchor.x - startAnchor.x) / 8) * 3;
    midAnchor1.y = startAnchor.y;
    midAnchor2.x = startAnchor.x + ((endAnchor.x - startAnchor.x) / 8) * 5;
    midAnchor2.y = endAnchor.y;
    complexLinks.push(
      new ComplexLink(
        startName,
        dataTypeSubCat,
        endName,
        purposeSubCat,
        startAnchor,
        midAnchor1,
        midAnchor2,
        endAnchor,
        years
      )
    );
  }
}

// Draw everything
function draw() {
  clear();
  if (firstDraw) {
    updateLines();
    firstDraw = false;
  }
  textFont(myFont);
  drawTitles();
  textFont(myTitleFont);
  for (link of links) {
    link.display();
  }
  for (complexLink of complexLinks) {
    complexLink.display();
  }
  for (node of nodes) {
    if (node.name != "companies") {
      node.display();
    }
  }
}

// Select by year function
button2001.onclick = function () {
  updateFilters("2001");
  updateButtons(button2001);
  resetButtons(button2010);
  resetButtons(button2019);
  resetButtons(compareYearsButton);
};
button2010.onclick = function () {
  updateFilters("2010");
  updateButtons(button2010);
  resetButtons(button2001);
  resetButtons(button2019);
  resetButtons(compareYearsButton);
};
button2019.onclick = function () {
  updateFilters("2019");
  updateButtons(button2019);
  resetButtons(button2001);
  resetButtons(button2010);
  resetButtons(compareYearsButton);
};
compareYearsButton.onclick = function () {
  updateFilters("allYears");
  updateButtons(compareYearsButton);
  let yearButtons = [button2001, button2010, button2019]
  let buttonColors = ['bg-near-white', 'bg-yellow', 'bg-orange']
  for (let i = 0; i < yearButtons.length; i++) {
    yearButtons[i].className = yearButtons[i].className.replace("bg-gold", buttonColors[i]);
    yearButtons[i].className = yearButtons[i].className.replace("bg-transparent", buttonColors[i]);
    yearButtons[i].className = yearButtons[i].className.replace("white", "dark-gray");
    yearButtons[i].className = yearButtons[i].className.replace("b--white-50", "b--navy");
    if (yearButtons[i].className.includes("hover-bg-white-20")) {
    } else {
      yearButtons[i].className = yearButtons[i].className.concat(" hover-bg-white-20");
    }
  }
}

// // Policy Year Slider
// policyYearSlider.onchange = function () {
//   thisYear = this.value;
//   console.log('Filtering for ' + thisYear);
//   updateFilters(thisYear);
// }

// This function updates lines and nodes based on the filters
function updateFilters(inputType) {
  // Assign the input type to the right place in the filter array
  if (typeof inputType == "string") {
    currentFilter[0] = inputType;
  } else if (inputType.target.id == "dataTypeSelector") {
    currentFilter[1] = inputType.target.value;
  } else if (inputType.target.id == "purposeSelector") {
    currentFilter[2] = inputType.target.value;
  }
  updateLines();
}

function updateLines() {
  console.log(currentFilter);
  console.log(collectionFilter);
  let activeNodes = [];
  let activeNodes2 = [];
  for (complexLink of complexLinks) {
    complexLink.update(currentFilter);
    if (complexLink.active) {
      activeNodes.push(complexLink.dataType[1]);
    }
  }
  for (link of links) {
    if (
      (link.how == collectionFilter || collectionFilter == "all") &&
      activeNodes.includes(link.endName)
    ) {
      activeNodes2.push(link.endName);
      activeNodes2.push(link.startName);
      link.active = true;
      link.visible = true;
    } else {
      link.active = false;
      link.visible = false;
    }
  }
  for (complexLink of complexLinks) {
    if (complexLink.active && activeNodes2.includes(complexLink.dataType[1])) {
      activeNodes2.push(complexLink.purpose[1]);
      complexLink.active = true;
      complexLink.visible = true;
    } else {
      complexLink.active = false;
    }
  }
  for (node of nodes) {
    if (activeNodes2.includes(node.name)) {
      node.active = true;
      node.visible = true;
    } else {
      node.active = false;
    }
  }
  redraw();
}

// This function resets everthing ==> all active and all visible
function resetFilters() {
  dataTypeSelector.value("all");
  purposeSelector.value("all");
  currentFilter = ["2019", "all", "all"];
  collectionFilter = "all";
  collectionMethodSelector.value("all");
  // policyYearSlider.value = '2019';
  for (complexLink of complexLinks) {
    complexLink.update(currentFilter);
    complexLink.active = true;
    complexLink.visible = true;
  }
  for (link of links) {
    link.active = true;
    link.visible = true;
  }
  for (node of nodes) {
    node.showIncludes = false;
    node.active = true;
    node.visible = true;
  }
  updateButtons(button2019);
  resetButtons(button2001);
  resetButtons(button2010);
  resetButtons(compareYearsButton);
  updateLines();
  redraw();
}

function updateButtons(button) {
  button.className = "dark-gray ba b--navy br2 ph3 pv1 link bg-gold"
  // button.className = button.className.replace("bg-transparent", "bg-gold");
  // button.className = button.className.replace("white", "dark-gray");
  // button.className = button.className.replace("b--white-50", "b--navy");
  // button.className = button.className.replace(" hover-bg-white-20", "");
}

function resetButtons(button) {
  // button.className = button.className.replace("bg-gold", "bg-transparent");
  // button.className = button.className.replace("dark-gray", "white");
  // button.className = button.className.replace("b--navy", "b--white-50");
  // if (button.className.includes("hover-bg-white-20")) {
  // } else {
  //   button.className = button.className.concat(" hover-bg-white-20");
  // }
  button.className = "white ba b--white-50 br2 ph3 pv1 link bg-transparent hover-bg-white-20"
}

function drawTitles() {
  fill(0, 0, 100, 1);
  noStroke();
  textSize(16);
  textAlign(CENTER, CENTER);
  text("DATA SOURCES", marginLeft, marginTop - 40);
  text("COLLECTION PURPOSE", marginLeft + vizWidth, marginTop - 40);
  text("TYPES OF DATA", marginLeft + vizWidth / 2, marginTop - 40);
}

function mouseClicked() {
  if (canvasClicked) {
    let matchComplexLink = false;
    let matchNode = false;
    let matchLink = false;
    // Was a node clicked?
    for (node of nodes) {
      if (node.active) {
        if (dist(mouseX, mouseY, node.x, node.y) < 6) {
          console.log("matchNode");
          matchNode = true;
          selectBasedOnNode(node);
          break;
        }
      }
    }
    if (matchNode == false) {
      for (complexLink of complexLinks) {
        if (matchComplexLink) {
          break;
        }
        if (complexLink.active) {
          for (thisPoint of complexLink.pointList) {
            if (dist(mouseX, mouseY, thisPoint.x, thisPoint.y) < 3) {
              matchComplexLink = true;
              console.log("matchComplexLink");
              selectBasedOnComplexLink(complexLink);
              break;
            }
          }
        }
      }
    }
    if (matchNode == false && matchComplexLink == false) {
      for (link of links) {
        if (matchLink) {
          break;
        }
        if (link.active) {
          for (thisPoint of link.pointList) {
            if (dist(mouseX, mouseY, thisPoint.x, thisPoint.y) < 3) {
              matchLink = true;
              console.log("matchLink");
              selectBasedOnLink(link);
              break;
            }
          }
        }
      }
    }
    if (matchNode == false && matchComplexLink == false && matchLink == false) {
      for (complexLink of complexLinks) {
        if (complexLink.active) {
          complexLink.visible = true;
        }
      }
      for (node of nodes) {
        node.showIncludes = false;
        if (node.active) {
          node.visible = true;
        }
      }
      for (link of links) {
        if (link.active) {
          link.visible = true;
        }
      }
      // selectByCollectionMethod(document.getElementById("collectionMethod").value);
    }
    redraw();
  }
}

function selectBasedOnComplexLink(clickedLink) {
  clickedLink.visible = true;
  let visibleNodes = [clickedLink.dataType[1], clickedLink.purpose[1]];
  for (complexLink of complexLinks) {
    if (complexLink != clickedLink) {
      complexLink.visible = false;
    }
  }
  for (link of links) {
    if (link.active) {
      if (link.endName == clickedLink.dataType[1]) {
        link.visible = true;
        visibleNodes.push(link.startName);
      } else {
        link.visible = false;
      }
    }
  }
  for (node of nodes) {
    node.showIncludes = false;
    if (node.active) {
      if (visibleNodes.includes(node.name)) {
        node.visible = true;
      } else {
        node.visible = false;
      }
    }
  }
}

function selectBasedOnLink(clickedLink) {
  clickedLink.visible = true;
  let visibleNodes = [clickedLink.startName, clickedLink.endName];
  for (link of links) {
    if (link != clickedLink) {
      link.visible = false;
    }
  }
  for (complexLink of complexLinks) {
    if (complexLink.active) {
      if (complexLink.dataType[1] == clickedLink.endName) {
        complexLink.visible = true;
        visibleNodes.push(complexLink.purpose[1]);
      } else {
        complexLink.visible = false;
      }
    }
  }
  for (node of nodes) {
    node.showIncludes = false;
    if (node.active) {
      if (visibleNodes.includes(node.name)) {
        node.visible = true;
      } else {
        node.visible = false;
      }
    }
  }
}

function selectByCollectionMethod(input) {
  if (typeof input == "string") {
    collectionFilter = input;
  } else {
    collectionFilter = input.target.value;
  }
  console.log(collectionFilter);
  updateLines();
}

function selectBasedOnNode(clickedNode) {
  for (node of nodes) {
    if (node == clickedNode) {
      node.showIncludes = true;
    } else {
      node.showIncludes = false;
    }
  }
  let visibleNodes = [clickedNode.name];
  if (clickedNode.category == "DATASOURCE") {
    for (link of links) {
      if (link.startName == clickedNode.name && link.active) {
        link.visible = true;
        visibleNodes.push(link.endName);
      } else {
        link.visible = false;
      }
    }
    for (complexLink of complexLinks) {
      if (
        visibleNodes.includes(complexLink.dataType[1]) &&
        complexLink.active
      ) {
        complexLink.visible = true;
        visibleNodes.push(complexLink.purpose[1]);
      } else {
        complexLink.visible = false;
      }
    }
    for (node of nodes) {
      if (visibleNodes.includes(node.name)) {
        node.visible = true;
      } else {
        node.visible = false;
      }
    }
  } else if (clickedNode.category == "TYPE OF DATA") {
    for (link of links) {
      if (link.endName == clickedNode.name && link.active) {
        link.visible = true;
        visibleNodes.push(link.startName);
      } else {
        link.visible = false;
      }
    }
    for (complexLink of complexLinks) {
      if (complexLink.dataType[1] == clickedNode.name && complexLink.active) {
        complexLink.visible = true;
        visibleNodes.push(complexLink.purpose[1]);
      } else {
        complexLink.visible = false;
      }
    }
    for (node of nodes) {
      if (visibleNodes.includes(node.name)) {
        node.visible = true;
      } else {
        node.visible = false;
      }
    }
  } else {
    for (complexLink of complexLinks) {
      if (complexLink.purpose[1] == clickedNode.name && complexLink.active) {
        complexLink.visible = true;
        visibleNodes.push(complexLink.dataType[1]);
      } else {
        complexLink.visible = false;
      }
    }
    for (link of links) {
      if (visibleNodes.includes(link.endName) && link.active) {
        link.visible = true;
        visibleNodes.push(link.startName);
      } else {
        link.visible = false;
      }
    }
    for (node of nodes) {
      if (visibleNodes.includes(node.name)) {
        node.visible = true;
      } else {
        node.visible = false;
      }
    }
  }
}
