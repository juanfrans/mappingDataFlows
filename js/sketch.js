// TODO: Hover or click on a node and use that as filter
// TODO: Add intro paragraph
// TODO: Add credits, links and methods at the end
// TODO: Add text to line quoting from TOS
// TODO: Add link to TOS (with paragraph and section number)
// TODO: Add privacy functionality
// TODO: Take a look at this link: https://public.os.alis.fund/
// TODO: Add "built with p5 & tachyons"
// TODO: Add "collection method" dropdown (harvested or user provided or from third parties)

var numberOfComplexLinks = 100;

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

function preload() {
  console.log('Loading data...');
  nodesTable = loadTable('data/tempNodes.csv', 'csv', 'header');
  linksTable = loadTable('data/tempLinks.csv', 'csv', 'header');
  complexLinksTable = loadTable('data/tempComplexLinks.csv', 'csv', 'header');
  myFont = loadFont('fonts/Inconsolata-Regular.ttf');
  myTitleFont = loadFont('fonts/Inconsolata-Bold.ttf');
}

function buildNodes() {
  console.log('Building nodes...');
  let dataSourcesNum = 0;
  let dataTypesNum = 0;
  let purposeNum = 0;
  for (let i = 0; i < nodesTable.getRowCount(); i++) {
    let nodeCat = nodesTable.getString(i, 'category');
    if (nodeCat == 'data source') { dataSourcesNum += 1; }
    else if (nodeCat == 'type of data') { dataTypesNum += 1; }
    else if (nodeCat == 'purpose') { purposeNum += 1; }
  }
  for (let i = 0; i < nodesTable.getRowCount(); i++) {
    let nodeOrder = nodesTable.getNum(i, 'order');
    let nodeName = nodesTable.getString(i, 'name');
    let nodeCat = nodesTable.getString(i, 'category');
    let nodeSubCat = nodesTable.getString(i, 'subcategory');
    if (nodeCat == 'data source') { nodes.push(new Node(nodeName, nodeCat, nodeSubCat, marginLeft, marginTop + (vizHeight / (dataSourcesNum - 1)) * (nodeOrder - 1), RIGHT)); }
    else if (nodeCat == 'type of data') { nodes.push(new Node(nodeName, nodeCat, nodeSubCat, marginLeft + vizWidth / 2, marginTop + (vizHeight / (dataTypesNum - 1)) * (nodeOrder - 1), CENTER)); }
    else if (nodeCat == 'companies') { nodes.push(new Node(nodeName, nodeCat, nodeSubCat, marginLeft + (vizWidth / 3) * 2, marginTop + (vizHeight / 2), CENTER)); }
    else { nodes.push(new Node(nodeName, nodeCat, nodeSubCat, marginLeft + vizWidth, marginTop + (vizHeight / (purposeNum - 1)) * (nodeOrder - 1), LEFT)); }
  }
}

function buildLinks() {
  console.log('Building simple links...');
  for (var i = 0; i < linksTable.getRowCount(); i++) {
    let startName = linksTable.getString(i, 'dataSource');
    let endName = linksTable.getString(i, 'typeOfData');
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
    links.push(new Link(startName, endName, startVector, endVector, midVector1, midVector2));
  }
}

function buildComplexLinks() {
  console.log('Building complex links...');
  for (var i = 0; i < complexLinksTable.getRowCount(); i++) {
    // for (var i = 0; i < numberOfComplexLinks; i++) {
    let startName = ['all', complexLinksTable.getString(i, 'dataType')];
    let endName = ['all', complexLinksTable.getString(i, 'purpose')];
    let dataTypeSubCat = ['all', complexLinksTable.getString(i, 'dataTypeSubCat')];
    let purposeSubCat = ['all', complexLinksTable.getString(i, 'purposeSubCat')];
    let companies = complexLinksTable.getString(i, 'companies').split(',');
    companies.push('all');
    let textAmazon = complexLinksTable.getString(i, 'TextAmazon');
    let textApple = complexLinksTable.getString(i, 'TextApple');
    let textFacebook = complexLinksTable.getString(i, 'TextFacebook');
    let textGoogle = complexLinksTable.getString(i, 'TextGoogle');
    let allText = '';
    if (textAmazon != '') { allText += 'Amazon: ' + textAmazon + '\n\n'; }
    if (textApple != '') { allText += 'Apple: ' + textApple + '\n\n'; }
    if (textFacebook != '') { allText += 'Facebook: ' + textFacebook + '\n\n'; }
    if (textGoogle != '') { allText += 'Google: ' + textGoogle + '\n\n'; }
    let startAnchor = createVector();
    let midAnchor1 = createVector();
    let midAnchor2 = createVector();
    // let midAnchor = createVector();
    let endAnchor = createVector();
    // let control1 = createVector();
    // let control2 = createVector();
    // let control3 = createVector();
    // let control4 = createVector();
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
        // midAnchor.x = node.x;
        // midAnchor.y = node.y;
      }
    }
    midAnchor1.x = startAnchor.x + ((endAnchor.x - startAnchor.x) / 8) * 3;
    midAnchor1.y = startAnchor.y;
    midAnchor2.x = startAnchor.x + ((endAnchor.x - startAnchor.x) / 8) * 5;
    midAnchor2.y = endAnchor.y;

    // midAnchor.y = (startAnchor.y - (startAnchor.y - endAnchor.y)/2) - (startAnchor.y - (startAnchor.y - endAnchor.y)/2 - midAnchor.y)/3;
    // control1.x = startAnchor.x + (midAnchor.x - startAnchor.x) / 3;
    // control1.y = startAnchor.y;
    // control2.x = startAnchor.x + ((midAnchor.x - startAnchor.x) / 3) * 2;
    // control2.y = midAnchor.y + (startAnchor.y - endAnchor.y) / 3;
    // control3.x = midAnchor.x + (endAnchor.x - midAnchor.x) / 3;
    // control3.y = midAnchor.y - (startAnchor.y - endAnchor.y) / 3;
    // control4.x = midAnchor.x + ((endAnchor.x - midAnchor.x) / 3) * 2;
    // control4.y = endAnchor.y;
    complexLinks.push(new ComplexLink(startName, dataTypeSubCat, endName, purposeSubCat, startAnchor, midAnchor1, midAnchor2, endAnchor, amazon, apple, facebook, google, companies, allText));
  }
}

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

allCompaniesButton.onclick = function () {
  updateLines('all');
  updateButtons(allCompanies);
  resetButtons(amazonButton);
  resetButtons(appleButton);
  resetButtons(facebookButton);
  resetButtons(googleButton);
  comparisonButtons('reset');
}
amazonButton.onclick = function () {
  console.log('Amazon pressed...');
  updateLines('amazon');
  updateButtons(amazonButton);
  resetButtons(allCompaniesButton);
  resetButtons(appleButton);
  resetButtons(facebookButton);
  resetButtons(googleButton);
  comparisonButtons('reset');
}
appleButton.onclick = function () {
  console.log('Apple pressed...');
  updateLines('apple');
  updateButtons(appleButton);
  resetButtons(amazonButton);
  resetButtons(allCompaniesButton);
  resetButtons(facebookButton);
  resetButtons(googleButton);
  comparisonButtons('reset');
}
facebookButton.onclick = function () {
  console.log('Facebook pressed...');
  updateLines('facebook');
  updateButtons(facebookButton);
  resetButtons(amazonButton);
  resetButtons(appleButton);
  resetButtons(allCompaniesButton);
  resetButtons(googleButton);
  comparisonButtons('reset');
}
googleButton.onclick = function () {
  console.log('Google pressed...');
  updateLines('google');
  updateButtons(googleButton);
  resetButtons(amazonButton);
  resetButtons(appleButton);
  resetButtons(facebookButton);
  resetButtons(allCompaniesButton);
  comparisonButtons('reset');
}

function resetFilters() {
  dataTypeSelector.value('all');
  purposeSelector.value('all');
  companyComparison1.value('none');
  companyComparison2.value('none');
  currentFilter = ['all', 'all', 'all', ['none', 'none']];
  for (complexLink of complexLinks) {
    complexLink.update(currentFilter);
  }
  for (link of links) {
    link.strokeAlpha = 1;
  }
  for (node of nodes) {
    node.opacity = 1;
  }
  redraw();
  updateButtons(allCompanies);
  resetButtons(amazonButton);
  resetButtons(appleButton);
  resetButtons(facebookButton);
  resetButtons(googleButton);
  comparisonButtons('reset');
}

function updateLines(inputType) {
  let activeNodes = [];
  // Assign the imput type to the right place in the filter array
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
    clearButtons();
  }
  else if (inputType.target.id == 'companyComparison2' & companyComparison2.value() != 'none' & companyComparison1.value() != 'none' & companyComparison1.value() != companyComparison2.value()) {
    currentFilter[0] = 'all';
    currentFilter[3][0] = companyComparison1.value();
    currentFilter[3][1] = companyComparison2.value();
    comparisonButtons('compare');
    clearButtons();
  }
  console.log(currentFilter);
  // Hide the complex links that don't meet the filter conditions
  for (complexLink of complexLinks) {
    complexLink.update(currentFilter);
    // Run through the active complex links and create a list of active nodes
    if (complexLink.strokeAlpha == 1) {
      if (activeNodes.includes(complexLink.purpose[1])) { }
      else { activeNodes.push(complexLink.purpose[1]); }
      if (activeNodes.includes(complexLink.dataType[1])) { }
      else { activeNodes.push(complexLink.dataType[1]); }
    }
  }
  // Hide simple links based on the list of active nodes
  for (link of links) {
    link.update(activeNodes);
    // Update the list of active nodes based on the visible simple links
    if (link.strokeAlpha == 1) {
      if (activeNodes.includes(link.startName)) { }
      else { activeNodes.push(link.startName); }
      if (activeNodes.includes(link.endName)) { }
      else { activeNodes.push(link.endName); }
    }
  }
  // Update nodes' visibility based on the list of active nodes
  for (node of nodes) {
    node.update(activeNodes);
  }
  redraw();
}

// Click on a node
// Depending on the type of node, start with the simple or complex links at one point or another
// Hide the lines not connected to the node or lines

function drawTitles() {
  fill(0, 0, 100, 1);
  noStroke();
  textSize(16);
  textAlign(CENTER, CENTER);
  text('DATA SOURCES', marginLeft, marginTop - 40);
  text('COLLECTION PURPOSE', marginLeft + vizWidth, marginTop - 40);
  text('TYPES OF DATA', marginLeft + vizWidth / 2, marginTop - 40);
}

function draw() {
  clear();
  textFont(myFont);
  drawTitles();
  textFont(myTitleFont);
  for (link of links) {
    link.display();
  }
  // for (let index = 0; index < numberOfComplexLinks; index++) {
  //   complexLinks[index].display();
  // }
  for (complexLink of complexLinks) {
    complexLink.display();
  }
  for (node of nodes) {
    if (node.name != "companies") {
      node.display();
    }
  }
}

class Node {
  constructor(name, category, subCat, xCoord, yCoord, textAlign) {
    this.name = name;
    this.category = category;
    this.subCat = subCat;
    this.x = xCoord;
    this.y = yCoord;
    this.diameter = 10;
    this.outerDiamter = 15;
    this.stroke;
    this.strokeWeight;
    this.textAlign = textAlign;
    this.textPositionX;
    this.textPositionY;
    this.opacity = 1;
    this.selected = false;
  }
  display() {
    fill(38, 100, 100, this.opacity);
    noStroke();
    ellipse(this.x, this.y, this.diameter, this.diameter);
    noFill();
    stroke(38, 100, 100, this.opacity);
    strokeWeight(1);
    ellipse(this.x, this.y, this.outerDiamter, this.outerDiamter);
    noStroke();
    fill(0, 0, 100, this.opacity);
    if (this.textAlign == RIGHT) {
      this.textPositionX = -15;
      this.textPositionY = 0;
    }
    else if (this.textAlign == CENTER) {
      this.textPositionX = 0;
      this.textPositionY = 0;
      fill(38, 100, 100, this.opacity / 1.3);
      rect(this.x - (this.name.length * 4.8) / 2, this.y - 4, this.name.length * 4.8, 10);
    }
    else {
      this.textPositionX = 15;
      this.textPositionY = 0;
    }
    fill(0, 0, 100, this.opacity);
    textAlign(this.textAlign, CENTER);
    textSize(9);
    text(this.name.toUpperCase(), this.x + this.textPositionX, this.y + this.textPositionY);
  }
  update(activeNodes) {
    if (activeNodes.includes(node.name)) {
      this.opacity = 1;
    }
    else {
      this.opacity = 0.1;
    }
  }
}

class Link {
  constructor(startName, endName, startVector, endVector, midVector1, midVector2) {
    this.startName = startName;
    this.endName = endName;
    this.startVector = startVector;
    this.endVector = endVector;
    this.midVector1 = midVector1;
    this.midVector2 = midVector2;
    this.strokeAlpha = 0.8;
  }
  display() {
    noFill();
    stroke(0, 0, 100, this.strokeAlpha);
    strokeWeight(0.8);
    bezier(this.startVector.x, this.startVector.y, this.midVector1.x, this.midVector1.y, this.midVector2.x, this.midVector2.y, this.endVector.x, this.endVector.y);
  }
  update(activeNodes) {
    if (activeNodes.includes(this.endName) || activeNodes.includes(this.startName)) {
      this.strokeAlpha = 1;
    }
    else {
      this.strokeAlpha = 0.05;
    }
  }
}

class ComplexLink {
  constructor(dataType, dataTypeSubCat, purpose, purposeSubCat, startAnchor, midAnchor1, midAnchor2, endAnchor, amazon, apple, facebook, google, companies, testText) {
    this.dataType = dataType;
    this.dataTypeSubCat = dataTypeSubCat;
    this.purpose = purpose;
    this.purposeSubCat = purposeSubCat;
    this.startAnchor = startAnchor;
    this.endAnchor = endAnchor;
    this.midAnchor1 = midAnchor1;
    this.midAnchor2 = midAnchor2;
    // this.midAnchor = midAnchor;
    // this.control1 = control1;
    // this.control2 = control2;
    // this.control3 = control3;
    // this.control4 = control4;
    this.h = 0;
    this.s = 0;
    this.b = 100;
    this.strokeAlpha = 1;
    this.amazon = amazon;
    this.apple = apple;
    this.facebook = facebook;
    this.google = google;
    this.companies = companies;
    this.strokeWeight = 0.8;
    this.testText = testText;
    this.displayText = false;
    this.pointList = [];
    for (var i = 0; i < 80; i++) {
      let t = i / 80;
      let x = bezierPoint(this.startAnchor.x, this.midAnchor1.x, this.midAnchor2.x, this.endAnchor.x, t);
      let y = bezierPoint(this.startAnchor.y, this.midAnchor1.y, this.midAnchor2.y, this.endAnchor.y, t);
      let point = createVector(x, y);
      this.pointList.push(point);
      // x = bezierPoint(this.midAnchor.x, this.control3.x, this.control4.x, this.endAnchor.x, t);
      // y = bezierPoint(this.midAnchor.y, this.control3.y, this.control4.y, this.endAnchor.y, t);
      // point = createVector(x, y);
      // this.pointList.push(point);
    }
  }
  display() {
    noFill();
    stroke(this.h, this.s, this.b, this.strokeAlpha);
    strokeWeight(this.strokeWeight);
    bezier(this.startAnchor.x, this.startAnchor.y, this.midAnchor1.x, this.midAnchor1.y, this.midAnchor2.x, this.midAnchor2.y, this.endAnchor.x, this.endAnchor.y);
    // beginShape();
    // vertex(this.startAnchor.x, this.startAnchor.y);
    // bezierVertex(this.control1.x, this.control1.y, this.control2.x, this.control2.y, this.midAnchor.x, this.midAnchor.y);
    // bezierVertex(this.control3.x, this.control3.y, this.control4.x, this.control4.y, this.endAnchor.x, this.endAnchor.y);
    // endShape();
    if (this.displayText) {
      noStroke();
      fill(0, 0, 100, 1);
      textAlign(LEFT, TOP);
      textSize(9);
      text(this.testText, this.midAnchor1.x, vizHeight, 200, 400);
    }
  }
  update(currentFilter) {
    if (this.companies.includes(currentFilter[0]) && this.dataTypeSubCat.includes(currentFilter[1]) && this.purposeSubCat.includes(currentFilter[2])) {
      if (currentFilter[3][0] != 'none') {
        if (this.companies.includes(currentFilter[3][0]) & (this.companies.includes(currentFilter[3][1]) == false)) {
          this.h = 213;
          this.s = 100;
          this.b = 61;
          this.strokeAlpha = 1;
        }
        else if (this.companies.includes(currentFilter[3][1]) & (this.companies.includes(currentFilter[3][0]) == false)) {
          this.h = 22;
          this.s = 100;
          this.b = 100;
          this.strokeAlpha = 1;
        }
        else if (this.companies.includes(currentFilter[3][0]) & this.companies.includes(currentFilter[3][1])) {
          this.h = 0;
          this.s = 0;
          this.b = 100;
          this.strokeAlpha = 1;
        }
        else {
          this.h = 0;
          this.s = 0;
          this.b = 100;
          this.strokeAlpha = 0.05;
        }
      }
      else {
        this.h = 0;
        this.s = 0;
        this.b = 100;
        this.strokeAlpha = 1;
      }
    }
    else {
      this.h = 0;
      this.s = 0;
      this.b = 100;
      this.strokeAlpha = 0.05
    }
  }
}

function mouseClicked() {
  let matchComplexLink = false;
  let matchNode = false;
  // Reset the nodes and links to full view
  for (complexLink of complexLinks) {
    if (complexLink.strokeWeight == 4) {
      complexLink.strokeWeight = 1;
      complexLink.displayText = false;
    }
  }
  for (node of nodes){
    node.selected = false;
    node.opacity = 1;
  }
  // Was a node clicked?
  for (node of nodes){
    if (dist(mouseX, mouseY, node.x, node.y) < 6){
      console.log('matchNode');
      matchNode = true;
      node.selected = true;
      selectBasedOnNodes(node);
    }
  }
  // If a node was clicked
  if (matchNode){
    for (node of nodes){
      if (node.selected == false){
        node.opacity = 0.1;
      }
      else{
        node.opacity = 1;
      }
    }
  }
  else {
    // Was an active line clicked?
    for (complexLink of complexLinks) {
      if (complexLink.strokeAlpha == 1) {
        for (thisPoint of complexLink.pointList) {
          if (dist(mouseX, mouseY, thisPoint.x, thisPoint.y) < 3) {
            matchComplexLink = true;
            console.log('matchComplexLink');
            complexLink.strokeWeight = 4;
            complexLink.displayText = true;
          }
        }
      }
      if (matchComplexLink) {
        break;
      }
    }
  }
  redraw();
}

function selectBasedOnNodes(clickedNode){
  console.log(clickedNode);
  let activeNodes = [];
  if (clickedNode.category == 'data source'){
    console.log('select simple links first...');
    for (link of links){
      if (link.startName == clickedNode.name){
        link.strokeAlpha = 1;
        activeNodes.push(link.endName);
      }
      else {
        link.strokeAlpha = 0.05;
      }
    }
    console.log(activeNodes);
    for (complexLink of complexLinks){
      if (activeNodes.includes(complexLink.dataType[1])){
        complexLink.strokeAlpha = 1;
        activeNodes.push(complexLink.purpose[1]);
      }
      else {
        complexLink.strokeAlpha = 0.05;
      }
    }
    console.log(activeNodes);
    for (node of nodes){
      if (activeNodes.includes(node.name)){
        node.selected = true;
      }
    }
  }
  else if (node.category == 'type of data'){
    console.log('select simple links & complex links...');
  }
  else {
    console.log('select complex links first...');
  }
}