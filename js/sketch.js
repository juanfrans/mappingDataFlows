// TODO: Add selected cases
// TODO: Add download data option (with creative commons license)
// TODO: Add privacy functionality
// TODO: Add intro paragraph
// TODO: Add credits, links and methods at the end
// TODO: Add text to line quoting from TOS
// TODO: Add link to TOS (with paragraph and section number)
// TODO: Take a look at this link: https://public.os.alis.fund/
// TODO: Add "built with p5 & tachyons"
// TODO: Add "collection method" dropdown (harvested or user provided or from third parties)

document.addEventListener('click', function (event) {
  if (event.target.parentElement.id == 'visualization') {
    canvasClicked = true;
    console.log('Canvas clicked...');
  }
  else {
    canvasClicked = false;
  }
}, false);

var numberOfComplexLinks = 2000;

// Get div width & height
var divWidth = document.getElementById('visualization').clientWidth;
var divHeight = document.getElementById('visualization').clientHeight;

// Get dropdown menus & buttons
var allCompaniesButton = document.getElementById('allCompanies');
var amazonButton = document.getElementById('amazon');
var appleButton = document.getElementById('apple');
var facebookButton = document.getElementById('facebook');
var googleButton = document.getElementById('google');
var comparisonButton1 = document.getElementById('companyComparison1');
var comparisonButton2 = document.getElementById('companyComparison2');
var dataTypeSelector;
var purposeSelector;
var collectionMethodSelector;
var companyComparison1;
var companyComparison2;
var resetButton;

// Set global variables
var marginTop = 100;
var marginBottom = 50;
var marginLeft = 120;
var marginRight = 150;
var vizWidth = divWidth - marginLeft - marginRight;
var vizHeight = divHeight - marginTop - marginBottom;
var nodesTable;
var linksTable;
var complexLinksTable;
var nodes = [];
var links = [];
var complexLinks = [];
var currentFilter = ['all', 'all', 'all', ['none', 'none']];
var myFont;
var myTitleFont;
var hiddenLinkStroke = 0.03;
var hiddenNodeOpacity = 0.08;
var canvasClicked = false;
var comparisonActive = false;

// Load the datasets
function preload() {
  console.log('Loading data...');
  nodesTable = loadTable('data/Nodes.csv', 'csv', 'header');
  linksTable = loadTable('data/SimpleLinks.csv', 'csv', 'header');
  complexLinksTable = loadTable('data/ComplexLinks.csv', 'csv', 'header');
  myFont = loadFont('fonts/Inconsolata-Regular.ttf');
  myTitleFont = loadFont('fonts/Inconsolata-Bold.ttf');
}

// Setup everything and build the objects
function setup() {
  let myCanvas = createCanvas(divWidth, divHeight);
  myCanvas.parent('visualization');
  colorMode(HSB, 360, 100, 100, 1);
  noLoop();
  buildNodes();
  buildLinks();
  buildComplexLinks();
  dataTypeSelector = select('#dataTypeSelector');
  dataTypeSelector.input(updateLines);
  purposeSelector = select('#purposeSelector');
  purposeSelector.input(updateLines);
  // collectionMethodSelector = select('#collectionMethod');
  // collectionMethodSelector.input(updateLines);
  companyComparison1 = select('#companyComparison1');
  companyComparison2 = select('#companyComparison2');
  companyComparison1.input(updateLines);
  companyComparison2.input(updateLines);
  resetButton = select('#resetButton');
  resetButton.mousePressed(resetFilters);
}

// Build nodes
function buildNodes() {
  console.log('Building nodes...');
  let dataSourcesNum = 0;
  let dataTypesNum = 0;
  let purposeNum = 0;
  for (let i = 0; i < nodesTable.getRowCount(); i++) {
    let nodeCat = nodesTable.getString(i, 'CATEGORY');
    if (nodeCat == 'DATASOURCE') { dataSourcesNum += 1; }
    else if (nodeCat == 'TYPE OF DATA') { dataTypesNum += 1; }
    else if (nodeCat == 'PURPOSE') { purposeNum += 1; }
  }
  for (let i = 0; i < nodesTable.getRowCount(); i++) {
    let nodeOrder = nodesTable.getNum(i, 'ORDER');
    let nodeName = nodesTable.getString(i, 'NAME');
    let nodeCat = nodesTable.getString(i, 'CATEGORY');
    let nodeSubCat = nodesTable.getString(i, 'SUBCATEGORY');
    let includes = nodesTable.getString(i, 'INCLUDES');
    if (nodeCat == 'DATASOURCE') { nodes.push(new Node(nodeName, nodeCat, nodeSubCat, includes, marginLeft, marginTop + (vizHeight / (dataSourcesNum - 1)) * (nodeOrder - 1), RIGHT)); }
    else if (nodeCat == 'TYPE OF DATA') { nodes.push(new Node(nodeName, nodeCat, nodeSubCat, includes, marginLeft + vizWidth / 2, marginTop + (vizHeight / (dataTypesNum - 1)) * (nodeOrder - 1), CENTER)); }
    else if (nodeCat == 'companies') { nodes.push(new Node(nodeName, nodeCat, nodeSubCat, includes, marginLeft + (vizWidth / 3) * 2, marginTop + (vizHeight / 2), CENTER)); }
    else { nodes.push(new Node(nodeName, nodeCat, nodeSubCat, includes, marginLeft + vizWidth, marginTop + (vizHeight / (purposeNum - 1)) * (nodeOrder - 1), LEFT)); }
  }
}

// Build simple links
function buildLinks() {
  console.log('Building simple links...');
  for (var i = 0; i < linksTable.getRowCount(); i++) {
    let startName = linksTable.getString(i, 'DATASOURCE');
    let endName = linksTable.getString(i, 'DATATYPE');
    let how = linksTable.getString(i, 'HOW');
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
    links.push(new Link(startName, endName, how, startVector, endVector, midVector1, midVector2));
  }
}

// Build complex links
function buildComplexLinks() {
  console.log('Building complex links...');
  for (var i = 0; i < complexLinksTable.getRowCount(); i++) {
  // for (var i = 0; i < numberOfComplexLinks; i++) {
    let startName = ['all', complexLinksTable.getString(i, 'DATATYPE')];
    let endName = ['all', complexLinksTable.getString(i, 'PURPOSE')];
    let dataTypeSubCat = ['all', complexLinksTable.getString(i, 'DATATYPESUBCATEGORY')];
    let purposeSubCat = ['all', complexLinksTable.getString(i, 'PURPOSESUBCATEGORY')];
    let companies = complexLinksTable.getString(i, 'COMPANIES').split(',');
    companies.push('all');
    // let textAmazon = complexLinksTable.getString(i, 'TextAmazon');
    // let textApple = complexLinksTable.getString(i, 'TextApple');
    // let textFacebook = complexLinksTable.getString(i, 'TextFacebook');
    // let textGoogle = complexLinksTable.getString(i, 'TextGoogle');
    let textAmazon = '';
    let textApple = '';
    let textFacebook = '';
    let textGoogle = '';
    let allText = '';
    if (textAmazon != '') { allText += 'Amazon: ' + textAmazon + '\n\n'; }
    if (textApple != '') { allText += 'Apple: ' + textApple + '\n\n'; }
    if (textFacebook != '') { allText += 'Facebook: ' + textFacebook + '\n\n'; }
    if (textGoogle != '') { allText += 'Google: ' + textGoogle + '\n\n'; }
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
      if (node.name == 'companies') {
      }
    }
    midAnchor1.x = startAnchor.x + ((endAnchor.x - startAnchor.x) / 8) * 3;
    midAnchor1.y = startAnchor.y;
    midAnchor2.x = startAnchor.x + ((endAnchor.x - startAnchor.x) / 8) * 5;
    midAnchor2.y = endAnchor.y;
    complexLinks.push(new ComplexLink(startName, dataTypeSubCat, endName, purposeSubCat, startAnchor, midAnchor1, midAnchor2, endAnchor, amazon, apple, facebook, google, companies, allText));
  }
}

// Draw everything
function draw() {
  clear();
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

// Companies buttons
allCompaniesButton.onclick = function () {
  comparisonButtons('reset');
  updateLines('all');
  updateButtons(allCompanies);
  resetButtons(amazonButton);
  resetButtons(appleButton);
  resetButtons(facebookButton);
  resetButtons(googleButton);
}
amazonButton.onclick = function () {
  console.log('Amazon pressed...');
  comparisonButtons('reset');
  updateLines('AMAZON');
  updateButtons(amazonButton);
  resetButtons(allCompaniesButton);
  resetButtons(appleButton);
  resetButtons(facebookButton);
  resetButtons(googleButton);
}
appleButton.onclick = function () {
  console.log('Apple pressed...');
  comparisonButtons('reset');
  updateLines('APPLE');
  updateButtons(appleButton);
  resetButtons(amazonButton);
  resetButtons(allCompaniesButton);
  resetButtons(facebookButton);
  resetButtons(googleButton);
}
facebookButton.onclick = function () {
  console.log('Facebook pressed...');
  comparisonButtons('reset');
  updateLines('FACEBOOK');
  updateButtons(facebookButton);
  resetButtons(amazonButton);
  resetButtons(appleButton);
  resetButtons(allCompaniesButton);
  resetButtons(googleButton);
}
googleButton.onclick = function () {
  console.log('Google pressed...');
  comparisonButtons('reset');
  updateLines('GOOGLE');
  updateButtons(googleButton);
  resetButtons(amazonButton);
  resetButtons(appleButton);
  resetButtons(facebookButton);
  resetButtons(allCompaniesButton);
}

// This function updates lines and nodes based on the filters
function updateLines(inputType) {
  let activeNodes = [];
  // Assign the input type to the right place in the filter array
  if (typeof (inputType) == 'string') {
    currentFilter[0] = inputType;
    currentFilter[3][0] = 'none';
    currentFilter[3][1] = 'none';
  }
  else if (inputType.target.id == 'dataTypeSelector') {
    currentFilter[1] = inputType.target.value;
  }
  else if (inputType.target.id == 'purposeSelector') {
    currentFilter[2] = inputType.target.value;
  }
  else if (inputType.target.id == 'companyComparison1' & companyComparison1.value() != 'none' & companyComparison2.value() != 'none' & companyComparison1.value() != companyComparison2.value()) {
    currentFilter[0] = 'all';
    currentFilter[3][0] = companyComparison1.value();
    currentFilter[3][1] = companyComparison2.value();
    comparisonButtons('compare');
    comparisonActive = true;
    clearButtons();
  }
  else if (inputType.target.id == 'companyComparison2' & companyComparison2.value() != 'none' & companyComparison1.value() != 'none' & companyComparison1.value() != companyComparison2.value()) {
    currentFilter[0] = 'all';
    currentFilter[3][0] = companyComparison1.value();
    currentFilter[3][1] = companyComparison2.value();
    comparisonButtons('compare');
    comparisonActive = true;
    clearButtons();
  }
  console.log(currentFilter);
  // Deactivate the complex links that don't meet the filter conditions
  for (complexLink of complexLinks) {
    complexLink.update(currentFilter);
    // Run through the active complex links and create a list of active nodes
    if (complexLink.active) {
      if (activeNodes.includes(complexLink.purpose[1])) { }
      else { activeNodes.push(complexLink.purpose[1]);}
      if (activeNodes.includes(complexLink.dataType[1])) { }
      else { activeNodes.push(complexLink.dataType[1]);}
    }
  }
  // Deactivate simple links based on the list of active nodes
  for (link of links) {
    link.update(activeNodes);
  }
  // Update the list of active nodes based on the visible simple links
  for (link of links){
    if (link.active) {
      if (activeNodes.includes(link.startName)) { }
      else { activeNodes.push(link.startName);}
      if (activeNodes.includes(link.endName)) { }
      else { activeNodes.push(link.endName);}
    }
  }
  // Update nodes' visibility based on the list of active nodes
  for (node of nodes) {
    node.update(activeNodes);
  }
  redraw();
}

// This function resets everthing ==> all active and all visible
function resetFilters() {
  dataTypeSelector.value('all');
  purposeSelector.value('all');
  companyComparison1.value('none');
  companyComparison2.value('none');
  currentFilter = ['all', 'all', 'all', ['none', 'none']];
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
  updateButtons(allCompanies);
  resetButtons(amazonButton);
  resetButtons(appleButton);
  resetButtons(facebookButton);
  resetButtons(googleButton);
  comparisonButtons('reset');
  redraw();
}

function updateButtons(button) {
  button.className = button.className.replace('bg-transparent', 'bg-gold');
  button.className = button.className.replace('white', 'dark-gray');
  button.className = button.className.replace('b--white-50', 'b--navy');
  button.className = button.className.replace(' hover-bg-white-20', '');
}

function comparisonButtons(action) {
  if (action == 'compare') {
    comparisonButton1.className = comparisonButton1.className.replace('bg-transparent', 'bg-dark-blue');
    comparisonButton2.className = comparisonButton2.className.replace('bg-transparent', 'bg-orange');
  }
  else {
    comparisonButton1.className = comparisonButton1.className.replace('bg-dark-blue', 'bg-transparent');
    comparisonButton2.className = comparisonButton2.className.replace('bg-orange', 'bg-transparent');
    companyComparison1.value('none');
    companyComparison2.value('none');
    comparisonActive = false;
  }
}

function clearButtons() {
  resetButtons(allCompanies);
  resetButtons(amazonButton);
  resetButtons(appleButton);
  resetButtons(facebookButton);
  resetButtons(googleButton);
}

function resetButtons(button) {
  button.className = button.className.replace('bg-gold', 'bg-transparent');
  button.className = button.className.replace('dark-gray', 'white');
  button.className = button.className.replace('b--navy', 'b--white-50');
  if (button.className.includes('hover-bg-white-20')) { }
  else { button.className = button.className.concat(' hover-bg-white-20'); }
}

function drawTitles() {
  fill(0, 0, 100, 1);
  noStroke();
  textSize(16);
  textAlign(CENTER, CENTER);
  text('DATA SOURCES', marginLeft, marginTop - 40);
  text('COLLECTION PURPOSE', marginLeft + vizWidth, marginTop - 40);
  text('TYPES OF DATA', marginLeft + vizWidth / 2, marginTop - 40);
}

function mouseClicked() {
  if (canvasClicked) {
    let matchComplexLink = false;
    let matchNode = false;
    let matchLink = false;
    // Was a node clicked?
    for (node of nodes) {
      if (node.active){
        if (dist(mouseX, mouseY, node.x, node.y) < 6) {
          console.log('matchNode');
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
              console.log('matchComplexLink');
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
              console.log('matchLink');
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
    }
    redraw();
  }
}

function selectBasedOnComplexLink(clickedLink){
  clickedLink.visible = true;
  let visibleNodes = [clickedLink.dataType[1], clickedLink.purpose[1]];
  for (complexLink of complexLinks){
    if (complexLink != clickedLink){
      complexLink.visible = false;
    }
  }
  for (link of links){
    if (link.active){
      if (link.endName == clickedLink.dataType[1]){
        link.visible = true;
        visibleNodes.push(link.startName);
      }
      else{
        link.visible = false;
      }
    }
  }
  for (node of nodes){
    node.showIncludes = false;
    if (node.active){
      if (visibleNodes.includes(node.name)){
        node.visible = true;
      }
      else {
        node.visible = false;
      }
    }
  }
}

function selectBasedOnLink(clickedLink){
  clickedLink.visible = true;
  let visibleNodes = [clickedLink.startName, clickedLink.endName];
  for (link of links){
    if (link != clickedLink){
      link.visible = false;
    }
  }
  for (complexLink of complexLinks){
    if (complexLink.active){
      if (complexLink.dataType[1] == clickedLink.endName){
        complexLink.visible = true;
        visibleNodes.push(complexLink.purpose[1]);
      }
      else{
        complexLink.visible = false;
      }
    }
  }
  for (node of nodes){
    node.showIncludes = false;
    if (node.active){
      if (visibleNodes.includes(node.name)){
        node.visible = true;
      }
      else {
        node.visible = false;
      }
    }
  }
}

function selectBasedOnNode(clickedNode) {
  for (node of nodes){
    if (node == clickedNode){
      node.showIncludes = true;
    }
    else {
      node.showIncludes = false;
    }
  }
  let visibleNodes = [clickedNode.name];
  if (clickedNode.category == 'DATASOURCE') {
    for (link of links) {
      if (link.startName == clickedNode.name) {
        link.visible = true;
        visibleNodes.push(link.endName);
      }
      else {
        link.visible = false;
      }
    }
    for (complexLink of complexLinks) {
      if (visibleNodes.includes(complexLink.dataType[1])) {
        complexLink.visible = true;
        visibleNodes.push(complexLink.purpose[1]);
      }
      else {
        complexLink.visible = false;
      }
    }
    for (node of nodes) {
      if (visibleNodes.includes(node.name)) {
        node.visible = true;
      }
      else {
        node.visible = false;
      }
    }
  }
  else if (clickedNode.category == 'TYPE OF DATA') {
    for (link of links) {
      if (link.endName == clickedNode.name) {
        link.visible = true;
        visibleNodes.push(link.startName);
      }
      else {
        link.visible = false;
      }
    }
    for (complexLink of complexLinks) {
      if (complexLink.dataType[1] == clickedNode.name) {
        complexLink.visible = true;
        visibleNodes.push(complexLink.purpose[1]);
      }
      else {
        complexLink.visible = false;
      }
    }
    for (node of nodes) {
      if (visibleNodes.includes(node.name)) {
        node.visible = true;
      }
      else {
        node.visible = false;
      }
    }
  }
  else {
    for (complexLink of complexLinks) {
      if (complexLink.purpose[1] == clickedNode.name) {
        complexLink.visible = true;
        visibleNodes.push(complexLink.dataType[1]);
      }
      else {
        complexLink.visible = false;
      }
    }
    for (link of links) {
      if (visibleNodes.includes(link.endName)) {
        link.visible = true;
        visibleNodes.push(link.startName);
      }
      else {
        link.visible = false;
      }
    }
    for (node of nodes) {
      if (visibleNodes.includes(node.name)) {
        node.visible = true;
      }
      else {
        node.visible = false;
      }
    }
  }
}