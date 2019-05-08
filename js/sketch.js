/*To do:
* Change opacity for nodes and labels based on filters
* Hover over line and increase stroke
* Hover or click on a node and use that as filter
* Add text to line quoting from TOS
* Add line tiying all together for the company
* Add label saying what company is collecting the data
* Add comparison option
* Add vagueness functionality

1. Eliminate c-links
2. Eliminate nodes not touching c-links
3. Eliminate links not touching nodes
4. Eliminate nodes not touching links

*/

// Get div width & height
var divWidth = document.getElementById('visualization').clientWidth;
var divHeight = document.getElementById('visualization').clientHeight;

// Get dropdown menus
var companySelector;
var dataTypeSelector;
var purposeSelector;
var resetButton;

let marginTop = 120;
let marginBottom = 50;
let marginLeft = 120;
let marginRight = 150;
let vizWidth = divWidth - marginLeft - marginRight;
let vizHeight = divHeight - marginTop - marginBottom;

let nodesTable;
let linksTable;
let complexLinksTable;
let nodes = [];
let links = [];
let complexLinks = [];
let currentFilter = ['all', 'all', 'all'];

let myFont;
let myTitleFont;

function preload(){
  nodesTable = loadTable('data/nodes.csv', 'csv', 'header');
  linksTable = loadTable('data/links.csv', 'csv', 'header');
  complexLinksTable = loadTable('data/complexLinks.csv', 'csv', 'header');
  myFont = loadFont('fonts/Inconsolata-Regular.ttf');
  myTitleFont = loadFont('fonts/Inconsolata-Bold.ttf');
}

function buildNodes(){
  let dataSourcesNum = 0;
  let dataTypesNum = 0;
  let companiesNum = 1;
  let purposeNum = 0;
  for (var i = 0; i < nodesTable.getRowCount(); i++) {
    var nodeCat = nodesTable.getString(i, 'category');
    if (nodeCat == 'dataSources') {dataSourcesNum += 1;}
    else if (nodeCat == 'dataTypes') {dataTypesNum += 1;}
    else if (nodeCat == 'collectionPurpose') {purposeNum += 1;}
  }
  for (var i = 0; i < nodesTable.getRowCount(); i++) {
    var nodeOrder = nodesTable.getNum(i, 'order');
    var nodeName = nodesTable.getString(i, 'name');
    var nodeCat = nodesTable.getString(i, 'category');
    if (nodeCat == 'dataSources') {nodes.push(new Node(nodeName, marginLeft, marginTop + (vizHeight/(dataSourcesNum - 1)) * (nodeOrder - 1), RIGHT));}
    else if (nodeCat == 'dataTypes') {nodes.push(new Node(nodeName, marginLeft + vizWidth / 3, marginTop + (vizHeight/(dataTypesNum - 1)) * (nodeOrder - 1), CENTER));}
    else if (nodeCat == 'companies') {nodes.push(new Node(nodeName, marginLeft + (vizWidth / 3) * 2, marginTop + (vizHeight/2), CENTER));}
    else {nodes.push(new Node(nodeName, marginLeft + vizWidth, marginTop + (vizHeight/(purposeNum - 1)) * (nodeOrder - 1), LEFT));}
  }
}

function buildLinks(){
  for (var i = 0; i < linksTable.getRowCount(); i++) {
    var startName = linksTable.getString(i, 'start');
    var endName = linksTable.getString(i, 'end');
    let startVector = createVector();
    let endVector = createVector();
    let midVector1 = createVector();
    let midVector2 = createVector();
    var mid1X;
    var mid1Y;
    var mid2X;
    var mid2Y;
    for (node of nodes){
      if (node.name == startName){
        startVector.x = node.x;
        startVector.y = node.y;
      }
      if (node.name == endName){
        endVector.x = node.x;
        endVector.y = node.y;
      }
    }
    midVector1.x = startVector.x + ((endVector.x - startVector.x)/8) * 3;
    midVector1.y = startVector.y;
    midVector2.x = startVector.x + ((endVector.x - startVector.x)/8) * 5;
    midVector2.y = endVector.y;
    links.push(new Link(startName, endName, startVector, endVector, midVector1, midVector2));
  }
}

function buildComplexLinks(){
  for (var i = 0; i < complexLinksTable.getRowCount(); i++) {
    var startName = ['all', complexLinksTable.getString(i, 'start')];
    var endName = ['all', complexLinksTable.getString(i, 'end')];
    var amazon = complexLinksTable.getString(i, 'amazon');
    var apple = complexLinksTable.getString(i, 'apple');
    var facebook = complexLinksTable.getString(i, 'facebook');
    var google = complexLinksTable.getString(i, 'google');
    var companies = complexLinksTable.getString(i, 'companies').split(',');
    companies.push('all');
    let startAnchor = createVector();
    let midAnchor = createVector();
    let endAnchor = createVector();
    let control1 = createVector();
    let control2 = createVector();
    let control3 = createVector();
    let control4 = createVector();
    for (node of nodes){
      if (node.name == startName[1]){
        startAnchor.x = node.x;
        startAnchor.y = node.y;
      }
      if (node.name == endName[1]){
        endAnchor.x = node.x;
        endAnchor.y = node.y;
      }
      if (node.name == 'companies'){
        midAnchor.x = node.x;
        midAnchor.y = node.y;
      }
    }
    midAnchor.y = (startAnchor.y - (startAnchor.y - endAnchor.y)/2) - (startAnchor.y - (startAnchor.y - endAnchor.y)/2 - midAnchor.y)/3;
    control1.x = startAnchor.x + (midAnchor.x - startAnchor.x) / 3;
    control1.y = startAnchor.y;
    control2.x = startAnchor.x + ((midAnchor.x - startAnchor.x) / 3) * 2;
    control2.y = midAnchor.y + (startAnchor.y - endAnchor.y) / 3;
    control3.x = midAnchor.x + (endAnchor.x - midAnchor.x) / 3;
    control3.y = midAnchor.y - (startAnchor.y - endAnchor.y) / 3;
    control4.x = midAnchor.x + ((endAnchor.x - midAnchor.x) / 3) * 2;
    control4.y = endAnchor.y;
    complexLinks.push(new ComplexLink(startName, endName, startAnchor, control1, control2, midAnchor, control3, control4, endAnchor, amazon, apple, facebook, google, companies));
  }
}

function setup(){
  let myCanvas = createCanvas(divWidth, divHeight);
  myCanvas.parent('visualization');
  colorMode(HSB);
  noLoop();
  buildNodes();
  buildLinks();
  buildComplexLinks();
  companySelector = select('#companySelector');
  companySelector.input(updateLines);
  dataTypeSelector = select('#dataTypeSelector');
  dataTypeSelector.input(updateLines);
  purposeSelector = select('#purposeSelector');
  purposeSelector.input(updateLines);
  resetButton = select('#resetButton');
  resetButton.mousePressed(resetFilters);
}

function resetFilters(){
  dataTypeSelector.value('all');
  companySelector.value('all');
  purposeSelector.value('all');
  currentFilter = ['all', 'all', 'all'];
  for (complexLink of complexLinks) {
    complexLink.update(currentFilter);
  }
  for (link of links){
    link.strokeAlpha = 1;
  }
  for (node of nodes){
    node.opacity = 1;
  }
  redraw();
}

function updateLines(inputType){
  let activeNodes = [];
  if (inputType.target.id == 'companySelector'){
    currentFilter[0] = inputType.target.value;
  }
  else if (inputType.target.id == 'dataTypeSelector'){
    currentFilter[1] = inputType.target.value;
  }
  else if (inputType.target.id == 'purposeSelector'){
    currentFilter[2] = inputType.target.value;
  }
  for (complexLink of complexLinks) {
    complexLink.update(currentFilter);
    if (complexLink.strokeAlpha == 1){
      if (activeNodes.includes(complexLink.purpose[1])){}
      else {activeNodes.push(complexLink.purpose[1]);}
      if (activeNodes.includes(complexLink.dataType[1])){}
      else {activeNodes.push(complexLink.dataType[1]);}
    }
  }
  for (link of links){
    link.update(activeNodes);
  }
  for (link of links){
    if (link.strokeAlpha == 1){
      if (activeNodes.includes(link.startName)){}
      else {activeNodes.push(link.startName);}
      if (activeNodes.includes(link.endName)){}
      else {activeNodes.push(link.endName);}
    }
  }
  for (node of nodes){
    node.update(activeNodes);
  }
  redraw();
}

function drawTitles(){
  fill(0, 0, 100, 1);
  noStroke();
  textSize(16);
  textAlign(CENTER, CENTER);
  text('DATA SOURCES', marginLeft, marginTop - 40);
  text('COLLECTION PURPOSE', marginLeft + vizWidth, marginTop - 40);
  text('TYPES OF DATA', marginLeft + vizWidth / 3, marginTop - 40);
}

function draw(){
  clear();
  textFont(myFont);
  drawTitles();
  textFont(myTitleFont);
  for (link of links){
    link.display();
  }
  for (complexLink of complexLinks){
    complexLink.display();
  }
  for (node of nodes) {
    if (node.name != "companies"){
      node.display();
    }
  }
}

class Node {
  constructor(name, xCoord, yCoord, textAlign) {
    this.name = name;
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
  }
  display(){
    fill(39, 100, 100, this.opacity);
    noStroke();
    ellipse(this.x, this.y, this.diameter, this.diameter);
    noFill();
    stroke(39, 100, 100, this.opacity);
    strokeWeight(1);
    ellipse(this.x, this.y, this.outerDiamter, this.outerDiamter);
    noStroke();
    fill(0, 0, 100, this.opacity);
    if (this.textAlign == RIGHT){
      this.textPositionX = -15;
      this.textPositionY = 0;
    }
    else if (this.textAlign == CENTER) {
      this.textPositionX = 0;
      this.textPositionY = 20;
    }
    else {
      this.textPositionX = 15;
      this.textPositionY = 0;
    }
    textAlign(this.textAlign, CENTER);
    textSize(9);
    text(this.name.toUpperCase(), this.x + this.textPositionX, this.y + this.textPositionY);
  }
  update(activeNodes){
    if (activeNodes.includes(node.name)){
      this.opacity = 1;
    }
    else {
      this.opacity = 0.1;
    }
  }
}

class Link {
  constructor(startName, endName, startVector, endVector, midVector1, midVector2){
    this.startName = startName;
    this.endName = endName;
    this.startVector = startVector;
    this.endVector = endVector;
    this.midVector1 = midVector1;
    this.midVector2 = midVector2;
    this.strokeAlpha = 1;
  }
  display(){
    noFill();
    stroke(0, 0, 100, this.strokeAlpha);
    strokeWeight(1);
    bezier(this.startVector.x, this.startVector.y, this.midVector1.x, this.midVector1.y, this.midVector2.x, this.midVector2.y, this.endVector.x, this.endVector.y);
  }
  update(activeNodes){
    if (activeNodes.includes(this.endName) || activeNodes.includes(this.startName)){
      this.strokeAlpha = 1;
    }
    else {
      this.strokeAlpha = 0.1;
    }
  }
}

class ComplexLink {
  constructor(dataType, purpose, startAnchor, control1, control2, midAnchor, control3, control4, endAnchor, amazon, apple, facebook, google, companies){
    this.dataType = dataType;
    this.purpose = purpose;
    this.startAnchor = startAnchor;
    this.endAnchor = endAnchor;
    this.midAnchor = midAnchor;
    this.control1 = control1;
    this.control2 = control2;
    this.control3 = control3;
    this.control4 = control4;
    this.strokeAlpha = 1;
    this.amazon = amazon;
    this.apple = apple;
    this.facebook = facebook;
    this.google = google;
    this.companies = companies;
  }
  display(){
    fill(0, 0, 100, 1);
    noFill();
    stroke(0, 0, 100, this.strokeAlpha);
    strokeWeight(1);
    beginShape();
    vertex(this.startAnchor.x, this.startAnchor.y);
    bezierVertex(this.control1.x, this.control1.y, this.control2.x, this.control2.y, this.midAnchor.x, this.midAnchor.y);
    bezierVertex(this.control3.x, this.control3.y, this.control4.x, this.control4.y, this.endAnchor.x, this.endAnchor.y);
    endShape();
  }
  update(currentFilter){
    if (this.companies.includes(currentFilter[0]) && this.dataType.includes(currentFilter[1]) && this.purpose.includes(currentFilter[2])){
      this.strokeAlpha = 1;
    }
    else {this.strokeAlpha = 0.1}
  }
}
