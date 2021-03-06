// Written by Juan Francisco Saldarriaga
// Brown Institute for Media Innovation
// Columbia University
// 2019
// TODO: Remove leading and trailing whitespace from text from TOS

document.addEventListener('click', function (event) {
  if (event.target.parentElement.id == 'visualization') {
    canvasClicked = true;
    console.log('Canvas clicked...');
  }
  else {
    canvasClicked = false;
  }
}, false);

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
var privacySelector;
var resetButton;

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
var currentFilter = ['all', 'all', 'all', ['none', 'none']];
var collectionFilter = 'all';
var myFont;
var myTitleFont;
var hiddenLinkStroke = 0.03;
var hiddenNodeOpacity = 0.08;
var canvasClicked = false;
var comparisonActive = false;
var displayText = false;
var linkForText;
var textCoords;
var textBoxHeight = 300;
var textBoxWidth = 250;

// Load the datasets
function preload() {
  console.log('Loading data...');
  nodesTable = loadTable('data/Nodes.csv', 'csv', 'header');
  linksTable = loadTable('data/Generates.csv', 'csv', 'header');
  complexLinksTable = loadTable('data/CollectsUsesShares.csv', 'csv', 'header');
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
  dataTypeSelector.input(updateFilters);
  purposeSelector = select('#purposeSelector');
  purposeSelector.input(updateFilters);
  collectionMethodSelector = select('#collectionMethod');
  collectionMethodSelector.input(selectByCollectionMethod);
  companyComparison1 = select('#companyComparison1');
  companyComparison2 = select('#companyComparison2');
  companyComparison1.input(updateFilters);
  companyComparison2.input(updateFilters);
  resetButton = select('#resetButton');
  resetButton.mousePressed(resetFilters);
  textCoords = createVector();
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
    let startName = ['all', complexLinksTable.getString(i, 'DATATYPE')];
    let endName = ['all', complexLinksTable.getString(i, 'PURPOSE')];
    let dataTypeSubCat = ['all', complexLinksTable.getString(i, 'DATATYPESUBCATEGORY')];
    let purposeSubCat = ['all', complexLinksTable.getString(i, 'PURPOSESUBCATEGORY')];
    let companies = complexLinksTable.getString(i, 'COMPANIES').split(',');
    let privacySettings = complexLinksTable.getString(i, 'USERCONTROLFACEBOOK');
    if (privacySettings == ''){
      privacySettings = 'No';
    }
    companies.push('all');
    let textAmazon = complexLinksTable.getString(i, 'AMAZONCONCRETETEXT');
    let textApple = complexLinksTable.getString(i, "APPLECONCRETETEXT");
    let textFacebook = complexLinksTable.getString(i, "FACEBOOKCONCRETETEXT");
    let textGoogle = complexLinksTable.getString(i, "GOOGLECONCRETETEXT");
    // let textAmazon = '';
    // let textApple = '';
    // let textFacebook = '';
    // let textGoogle = '';
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
    complexLinks.push(new ComplexLink(startName, dataTypeSubCat, endName, purposeSubCat, startAnchor, midAnchor1, midAnchor2, endAnchor, amazon, apple, facebook, google, companies, textAmazon, textApple, textFacebook, textGoogle, allText, privacySettings));
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
  if (displayText == true) {
    renderText();
    
  }
}

function renderText(){
  console.log("Display text...");
  let textToDisplay = '';
  let textHeight;
  // fill(0, 0, 100, 0.1);
  // rectMode(CENTER);
  // rect(linkForText.midAnchor1.x, linkForText.midAnchor1.y, 300, 400);
  textSize(12);
  textAlign(LEFT, TOP);
  if (currentFilter[0] == "AMAZON") {
    textToDisplay =
      '"' + linkForText.textAmazon + `" (Amazon's Terms of Service)`;
  } else if (currentFilter[0] == "APPLE") {
    textToDisplay =
      '"' + linkForText.textApple + `" (Apple's Terms of Service)`;
  } else if (currentFilter[0] == "FACEBOOK") {
    textToDisplay =
      '"' + linkForText.textFacebook + `" (Facebook's Terms of Service)`;
  } else {
    textToDisplay =
      '"' + linkForText.textGoogle + `" (Google's Terms of Service)`;
  }
  if (textToDisplay.length > 35) {
    textHeight = (textWidth(textToDisplay) / textBoxWidth) * 24;
    if (textHeight > 250){
      console.log('Reducing text height...');
      textHeight = textHeight * 0.8;
    }
    else if (textHeight > 125){
      textHeight = textHeight * 0.9;
      console.log('Reducing a little text height...');
    }
    if (textCoords.x > marginLeft + vizWidth * 0.75) {
      textCoords.x = textCoords.x - textBoxWidth + 10;
    } else {
      textCoords.x = textCoords.x + 10;
    }
    if (textCoords.y > (vizHeight) - textHeight){
      textCoords.y = textCoords.y - textHeight;
    }
    fill(0, 0, 100, 0.1);
    stroke(38, 100, 100);
    strokeWeight(1);
    rect(textCoords.x - 10, textCoords.y, textBoxWidth + 10, textHeight, 5);
    noStroke();
    fill(0, 0, 100, 1);
    text(
      textToDisplay,
      textCoords.x,
      textCoords.y + 10,
      textBoxWidth,
      textBoxHeight
    );
  } else {
  }
}

// Companies buttons
allCompaniesButton.onclick = function () {
  displayText = false;
  comparisonButtons('reset');
  updateFilters('all');
  updateButtons(allCompanies);
  resetButtons(amazonButton);
  resetButtons(appleButton);
  resetButtons(facebookButton);
  resetButtons(googleButton);
}
amazonButton.onclick = function () {
  console.log('Amazon pressed...');
  displayText = false;
  comparisonButtons('reset');
  updateFilters('AMAZON');
  updateButtons(amazonButton);
  resetButtons(allCompaniesButton);
  resetButtons(appleButton);
  resetButtons(facebookButton);
  resetButtons(googleButton);
}
appleButton.onclick = function () {
  console.log('Apple pressed...');
  displayText = false;
  comparisonButtons('reset');
  updateFilters('APPLE');
  updateButtons(appleButton);
  resetButtons(amazonButton);
  resetButtons(allCompaniesButton);
  resetButtons(facebookButton);
  resetButtons(googleButton);
}
facebookButton.onclick = function () {
  console.log('Facebook pressed...');
  displayText = false;
  comparisonButtons('reset');
  updateFilters('FACEBOOK');
  updateButtons(facebookButton);
  resetButtons(amazonButton);
  resetButtons(appleButton);
  resetButtons(allCompaniesButton);
  resetButtons(googleButton);
}
googleButton.onclick = function () {
  console.log('Google pressed...');
  displayText = false;
  comparisonButtons('reset');
  updateFilters('GOOGLE');
  updateButtons(googleButton);
  resetButtons(amazonButton);
  resetButtons(appleButton);
  resetButtons(facebookButton);
  resetButtons(allCompaniesButton);
}

// This function updates lines and nodes based on the filters
function updateFilters(inputType) {
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
  updateLines();
}

function updateLines(){
  console.log(currentFilter);
  console.log(collectionFilter);
  let activeNodes = [];
  let activeNodes2 = [];
  for (complexLink of complexLinks){
    complexLink.update(currentFilter);
    if (complexLink.active){
      activeNodes.push(complexLink.dataType[1]);
    }
  }
  for (link of links){
    if ((link.how == collectionFilter || collectionFilter == 'all') && activeNodes.includes(link.endName)){
      activeNodes2.push(link.endName);
      activeNodes2.push(link.startName);
      link.active = true;
      link.visible = true;
    }
    else {
      link.active = false;
      link.visible = false;
    }
  }
  for (complexLink of complexLinks) {
    if (complexLink.active && activeNodes2.includes(complexLink.dataType[1])) {
      activeNodes2.push(complexLink.purpose[1]);
      complexLink.active = true;
      complexLink.visible = true;
    }
    else {
      complexLink.active = false;
    }
  }
  for (node of nodes){
    if (activeNodes2.includes(node.name)){
      node.active = true;
      node.visible = true;
    }
    else {
      node.active = false;
    }
  }
  redraw();
}

// This function resets everthing ==> all active and all visible
function resetFilters() {
  displayText = false;
  dataTypeSelector.value('all');
  purposeSelector.value('all');
  companyComparison1.value('none');
  companyComparison2.value('none');
  currentFilter = ['all', 'all', 'all', ['none', 'none']];
  collectionFilter = 'all';
  collectionMethodSelector.value('all');
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
    comparisonButton1.className = comparisonButton1.className.replace('bg-transparent', 'bg-light-blue');
    comparisonButton2.className = comparisonButton2.className.replace('bg-transparent', 'bg-orange');
  }
  else {
    comparisonButton1.className = comparisonButton1.className.replace('bg-light-blue', 'bg-transparent');
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
    displayText = false;
    // Was a node clicked?
    for (node of nodes) {
      if (node.active) {
        if (dist(mouseX, mouseY, node.x, node.y) < 6) {
          console.log('Node clicked...');
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
              console.log("Complex link clicked...");
              matchComplexLink = true;
              if (currentFilter[0] != 'all'){
                linkForText = complexLink;
                displayText = true;
                textCoords.set(mouseX, mouseY);
              }
              else {
                displayText = false;
              }
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
              console.log('Simple link clicked...');
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
      }
      else {
        link.visible = false;
      }
    }
  }
  for (node of nodes) {
    node.showIncludes = false;
    if (node.active) {
      if (visibleNodes.includes(node.name)) {
        node.visible = true;
      }
      else {
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
      }
      else {
        complexLink.visible = false;
      }
    }
  }
  for (node of nodes) {
    node.showIncludes = false;
    if (node.active) {
      if (visibleNodes.includes(node.name)) {
        node.visible = true;
      }
      else {
        node.visible = false;
      }
    }
  }
}

function selectByCollectionMethod(input) {
  // updateLines();
  // let collectionMethod = '';
  if (typeof(input) == 'string'){
    collectionFilter = input;
  }
  else {
    collectionFilter = input.target.value;
  }
  console.log(collectionFilter);
  updateLines();
}

function selectBasedOnNode(clickedNode) {
  for (node of nodes) {
    if (node == clickedNode) {
      node.showIncludes = true;
    }
    else {
      node.showIncludes = false;
    }
  }
  let visibleNodes = [clickedNode.name];
  if (clickedNode.category == 'DATASOURCE') {
    for (link of links) {
      if (link.startName == clickedNode.name && link.active) {
        link.visible = true;
        visibleNodes.push(link.endName);
      }
      else {
        link.visible = false;
      }
    }
    for (complexLink of complexLinks) {
      if (visibleNodes.includes(complexLink.dataType[1]) && complexLink.active) {
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
      if (link.endName == clickedNode.name && link.active) {
        link.visible = true;
        visibleNodes.push(link.startName);
      }
      else {
        link.visible = false;
      }
    }
    for (complexLink of complexLinks) {
      if (complexLink.dataType[1] == clickedNode.name && complexLink.active) {
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
      if (complexLink.purpose[1] == clickedNode.name && complexLink.active) {
        complexLink.visible = true;
        visibleNodes.push(complexLink.dataType[1]);
      }
      else {
        complexLink.visible = false;
      }
    }
    for (link of links) {
      if (visibleNodes.includes(link.endName) && link.active) {
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

// ****************************************** Modals ******************************************* //
// Mobile warning
var mobile_modal = document.getElementById("mobile_modal");
var close_mobile_modal = document.getElementsByClassName("close_mobile_modal")[0];
function myFunction(x) {
  if (x.matches) { // If media query matches
    mobile_modal.className = mobile_modal.className.replace('dn', 'db');
  }
  else {
    mobile_modal.className = mobile_modal.className.replace('db', 'dn');
  }
}
var x = window.matchMedia("(max-width: 1200px)")
myFunction(x) // Call listener function at run time
// x.addListener(myFunction) // Attach listener function on state changes
close_mobile_modal.onclick = function () {
  mobile_modal.className = mobile_modal.className.replace('db', 'dn');
}

// Modals code
// Get the modal
var case1_1Modal = document.getElementById("case1_1Modal");
var case2_1Modal = document.getElementById("case2_1Modal");
var case3_1Modal = document.getElementById("case3_1Modal");
var case4_1Modal = document.getElementById("case4_1Modal");
// Get the button that opens the modal
var buttonCase1 = document.getElementById("case1");
var buttonCase2 = document.getElementById("case2");
var buttonCase3 = document.getElementById("case3");
var buttonCase4 = document.getElementById("case4");
// Get the <span> element that closes the modal
var nextCase1_1Modal = document.getElementsByClassName("nextCase1_1Modal")[0];
var nextCase1_2Modal = document.getElementsByClassName("nextCase1_2Modal")[0];
var nextCase1_3Modal = document.getElementsByClassName("nextCase1_3Modal")[0];
var previousCase1_2Modal = document.getElementsByClassName("previousCase1_2Modal")[0];
var previousCase1_3Modal = document.getElementsByClassName("previousCase1_3Modal")[0];
var nextCase2_1Modal = document.getElementsByClassName("nextCase2_1Modal")[0];
var nextCase2_2Modal = document.getElementsByClassName("nextCase2_2Modal")[0];
var nextCase2_3Modal = document.getElementsByClassName("nextCase2_3Modal")[0];
var previousCase2_2Modal = document.getElementsByClassName("previousCase2_2Modal")[0];
var previousCase2_3Modal = document.getElementsByClassName("previousCase2_3Modal")[0];
var nextCase3_1Modal = document.getElementsByClassName("nextCase3_1Modal")[0];
var nextCase3_2Modal = document.getElementsByClassName("nextCase3_2Modal")[0];
var nextCase3_3Modal = document.getElementsByClassName("nextCase3_3Modal")[0];
var nextCase3_4Modal = document.getElementsByClassName("nextCase3_4Modal")[0];
var nextCase3_5Modal = document.getElementsByClassName("nextCase3_5Modal")[0];
var previousCase3_2Modal = document.getElementsByClassName("previousCase3_2Modal")[0];
var previousCase3_3Modal = document.getElementsByClassName("previousCase3_3Modal")[0];
var previousCase3_4Modal = document.getElementsByClassName("previousCase3_4Modal")[0];
var previousCase3_5Modal = document.getElementsByClassName("previousCase3_5Modal")[0];
var nextCase4_1Modal = document.getElementsByClassName("nextCase4_1Modal")[0];
var nextCase4_2Modal = document.getElementsByClassName("nextCase4_2Modal")[0];
var nextCase4_3Modal = document.getElementsByClassName("nextCase4_3Modal")[0];
var previousCase4_2Modal = document.getElementsByClassName("previousCase4_2Modal")[0];
var previousCase4_3Modal = document.getElementsByClassName("previousCase4_3Modal")[0];
// When the user clicks on the button, open the modal
buttonCase1.onclick = function () {
  case1_1Modal.className = case1_1Modal.className.replace('dn', 'db');
  resetFilters();
  console.log('Apple pressed...');
  comparisonButtons('reset');
  updateFilters('APPLE');
  updateButtons(appleButton);
  resetButtons(amazonButton);
  resetButtons(allCompaniesButton);
  resetButtons(facebookButton);
  resetButtons(googleButton);
}
buttonCase2.onclick = function () {
  case2_1Modal.className = case2_1Modal.className.replace('dn', 'db');
  resetFilters();
  console.log('Facebook pressed...');
  comparisonButtons('reset');
  updateFilters('FACEBOOK');
  updateButtons(facebookButton);
  resetButtons(amazonButton);
  resetButtons(allCompaniesButton);
  resetButtons(appleButton);
  resetButtons(googleButton);
}
buttonCase3.onclick = function () {
  case3_1Modal.className = case3_1Modal.className.replace('dn', 'db');
  resetFilters();
  console.log('Facebook pressed...');
  comparisonButtons('reset');
  updateFilters('FACEBOOK');
  updateButtons(facebookButton);
  resetButtons(amazonButton);
  resetButtons(allCompaniesButton);
  resetButtons(appleButton);
  resetButtons(googleButton);
}
buttonCase4.onclick = function () {
  case4_1Modal.className = case4_1Modal.className.replace('dn', 'db');
  resetFilters();
}

// When the user clicks on <span> (x), close the modal
// Case 1 (Apple @Zoe)
nextCase1_1Modal.onclick = function () {
  case1_1Modal.className = case1_1Modal.className.replace('db', 'dn');
  case1_2Modal.className = case1_2Modal.className.replace('dn', 'db');
  let visibleNodes = [];
  for (node of nodes) {
    if (node.subCat != 'PERSONAL DATA') {
      visibleNodes.push(node.name);
    }
  }
  for (link of links) {
    if (visibleNodes.includes(link.endName) && link.active) {
      link.visible = true;
      visibleNodes.push(link.startName);
    }
    else {
      link.visible = false;
    }
  }
  for (complexLink of complexLinks) {
    if (visibleNodes.includes(complexLink.dataType[1]) && complexLink.active) {
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
  redraw();
}
previousCase1_2Modal.onclick = function () {
  case1_1Modal.className = case1_1Modal.className.replace('dn', 'db');
  case1_2Modal.className = case1_2Modal.className.replace('db', 'dn');
  resetFilters();
  console.log('Apple pressed...');
  comparisonButtons('reset');
  updateFilters('APPLE');
  updateButtons(appleButton);
  resetButtons(amazonButton);
  resetButtons(allCompaniesButton);
  resetButtons(facebookButton);
  resetButtons(googleButton);
}
nextCase1_2Modal.onclick = function () {
  case1_2Modal.className = case1_2Modal.className.replace('db', 'dn');
  case1_3Modal.className = case1_3Modal.className.replace('dn', 'db');
  let visibleNodes = [];
  let selectedNodes = ['ACCOUNT SECURITY', 'ADVERTISING', 'ANALYTICS', 'COMPANY OPERATIONS', 'IMPROVE PRODUCTS', 'LEGAL COMPLIANCE', 'PROVIDE SERVICES', 'RESEARCH AND DEVELOPMENT'];
  for (node of nodes) {
    if (node.subCat == 'PERSONAL DATA' || selectedNodes.includes(node.name)) {
      visibleNodes.push(node.name);
    }
  }
  for (link of links) {
    if (visibleNodes.includes(link.endName) && link.active) {
      link.visible = true;
      visibleNodes.push(link.startName);
    }
    else {
      link.visible = false;
    }
  }
  for (complexLink of complexLinks) {
    if (visibleNodes.includes(complexLink.dataType[1]) && complexLink.active) {
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
  redraw();
}
previousCase1_3Modal.onclick = function(){
  case1_3Modal.className = case1_3Modal.className.replace('db', 'dn');
  case1_2Modal.className = case1_2Modal.className.replace('dn', 'db');
  let visibleNodes = [];
  for (node of nodes) {
    if (node.subCat != 'PERSONAL DATA') {
      visibleNodes.push(node.name);
    }
  }
  for (link of links) {
    if (visibleNodes.includes(link.endName) && link.active) {
      link.visible = true;
      visibleNodes.push(link.startName);
    }
    else {
      link.visible = false;
    }
  }
  for (complexLink of complexLinks) {
    if (visibleNodes.includes(complexLink.dataType[1]) && complexLink.active) {
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
  redraw();
}
nextCase1_3Modal.onclick = function () {
  case1_3Modal.className = case1_1Modal.className.replace('db', 'dn');
}

// Case 2 (Facebook - Privacy Settings @Veronica)
nextCase2_1Modal.onclick = function () {
  case2_1Modal.className = case2_1Modal.className.replace('db', 'dn');
  case2_2Modal.className = case2_2Modal.className.replace('dn', 'db');
  let visibleNodes = [];
  for (complexLink of complexLinks) {
    if ((complexLink.privacySettings == 'No' || complexLink.privacySettings == '') && complexLink.active) {
      visibleNodes.push(complexLink.purpose[1]);
      visibleNodes.push(complexLink.dataType[1]);
      complexLink.visible = true;
    }
    else {
      complexLink.visible = false;
    }
  }
  for (link of links) {
    if (visibleNodes.includes(link.endName) && link.active) {
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
  redraw();
}
previousCase2_2Modal.onclick = function (){
  case2_1Modal.className = case2_1Modal.className.replace('dn', 'db');
  case2_2Modal.className = case2_2Modal.className.replace('db', 'dn');
  resetFilters();
  console.log('Facebook pressed...');
  comparisonButtons('reset');
  updateFilters('FACEBOOK');
  updateButtons(facebookButton);
  resetButtons(amazonButton);
  resetButtons(allCompaniesButton);
  resetButtons(appleButton);
  resetButtons(googleButton);
}
nextCase2_2Modal.onclick = function () {
  case2_2Modal.className = case2_1Modal.className.replace('db', 'dn');
  case2_3Modal.className = case2_2Modal.className.replace('dn', 'db');
  let visibleNodes = ['CURRENT LOCATION', 'LOCATION HISTORY', 'NEARBY LOCATIONS AND PEOPLE', 'BEHAVIOR ON DEVICES', 'DEVICE IDENTIFIERS'];
  for (link of links) {
    if (link.visible && visibleNodes.includes(link.endName) && link.active) {
      link.visible = true;
      visibleNodes.push(link.startName);
    }
    else {
      link.visible = false;
    }
  }
  for (complexLink of complexLinks) {
    if (complexLink.visible && visibleNodes.includes(complexLink.dataType[1]) && complexLink.active) {
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
  redraw();
}
previousCase2_3Modal.onclick = function (){
  case2_3Modal.className = case2_3Modal.className.replace('db', 'dn');
  case2_2Modal.className = case2_2Modal.className.replace('dn', 'db');
  let visibleNodes = [];
  for (complexLink of complexLinks) {
    if ((complexLink.privacySettings == 'No' || complexLink.privacySettings == '') && complexLink.active) {
      visibleNodes.push(complexLink.purpose[1]);
      visibleNodes.push(complexLink.dataType[1]);
      complexLink.visible = true;
    }
    else {
      complexLink.visible = false;
    }
  }
  for (link of links) {
    if (visibleNodes.includes(link.endName) && link.active) {
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
  redraw();
}
nextCase2_3Modal.onclick = function () {
  case2_3Modal.className = case2_1Modal.className.replace('db', 'dn');
}

// Case 3 (Facebook - @Natasha)
nextCase3_1Modal.onclick = function () {
  case3_1Modal.className = case3_1Modal.className.replace('db', 'dn');
  case3_2Modal.className = case3_2Modal.className.replace('dn', 'db');
  let visibleNodes = [];
  let visibleNodes2 = [];
  for (node of nodes) {
    if (node.subCat == 'ADVERTISING') {
      visibleNodes.push(node.name);
      visibleNodes2.push(node.name);
    }
  }
  for (complexLink of complexLinks) {
    if (visibleNodes.includes(complexLink.purpose[1]) && complexLink.active) {
      visibleNodes.push(complexLink.dataType[1]);
    }
  }
  for (link of links) {
    if (visibleNodes.includes(link.endName) && link.how == 'HARVESTED' && link.active) {
      link.visible = true;
      visibleNodes2.push(link.startName);
      visibleNodes2.push(link.endName);
    }
    else {
      link.visible = false;
    }
  }
  for (node of nodes) {
    if (visibleNodes2.includes(node.name)) {
      node.visible = true;
    }
    else {
      node.visible = false;
    }
  }
  for (complexLink of complexLinks) {
    if (visibleNodes2.includes(complexLink.purpose[1]) && visibleNodes2.includes(complexLink.dataType[1])) {
      complexLink.visible = true;
    }
    else {
      complexLink.visible = false;
    }
  }
  redraw();
  collectionMethodSelector.value('HARVESTED');
}
previousCase3_2Modal.onclick = function (){
  case3_1Modal.className = case3_1Modal.className.replace('dn', 'db');
  case3_2Modal.className = case3_2Modal.className.replace('db', 'dn');
  resetFilters();
  console.log('Facebook pressed...');
  comparisonButtons('reset');
  updateFilters('FACEBOOK');
  updateButtons(facebookButton);
  resetButtons(amazonButton);
  resetButtons(allCompaniesButton);
  resetButtons(appleButton);
  resetButtons(googleButton);
}
nextCase3_2Modal.onclick = function () {
  case3_2Modal.className = case3_2Modal.className.replace('db', 'dn');
  case3_3Modal.className = case3_3Modal.className.replace('dn', 'db');
  let visibleNodes = ['PRODUCT USE', 'ADVERTISING'];
  for (complexLink of complexLinks) {
    if (visibleNodes.includes(complexLink.purpose[1]) && visibleNodes.includes(complexLink.dataType[1]) && complexLink.active) {
      complexLink.visible = true;
    }
    else {
      complexLink.visible = false;
    }
  }
  for (link of links) {
    if (visibleNodes.includes(link.endName) && link.how == 'HARVESTED' && link.active) {
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
  redraw();
}
previousCase3_3Modal.onclick = function (){
  case3_2Modal.className = case3_2Modal.className.replace('dn', 'db');
  case3_3Modal.className = case3_3Modal.className.replace('db', 'dn');
  let visibleNodes = [];
  let visibleNodes2 = [];
  for (node of nodes) {
    if (node.subCat == 'ADVERTISING') {
      visibleNodes.push(node.name);
      visibleNodes2.push(node.name);
    }
  }
  for (complexLink of complexLinks) {
    if (visibleNodes.includes(complexLink.purpose[1]) && complexLink.active) {
      visibleNodes.push(complexLink.dataType[1]);
    }
  }
  for (link of links) {
    if (visibleNodes.includes(link.endName) && link.how == 'HARVESTED' && link.active) {
      link.visible = true;
      visibleNodes2.push(link.startName);
      visibleNodes2.push(link.endName);
    }
    else {
      link.visible = false;
    }
  }
  for (node of nodes) {
    if (visibleNodes2.includes(node.name)) {
      node.visible = true;
    }
    else {
      node.visible = false;
    }
  }
  for (complexLink of complexLinks) {
    if (visibleNodes2.includes(complexLink.purpose[1]) && visibleNodes2.includes(complexLink.dataType[1])) {
      complexLink.visible = true;
    }
    else {
      complexLink.visible = false;
    }
  }
  redraw();
  collectionMethodSelector.value('HARVESTED');
}
nextCase3_3Modal.onclick = function () {
  case3_3Modal.className = case3_3Modal.className.replace('db', 'dn');
  case3_4Modal.className = case3_4Modal.className.replace('dn', 'db');
  let visibleNodes = ['CURRENT LOCATION', 'IP ADDRESS', 'LOCATION HISTORY', 'NETWORK INFORMATION', 'ADVERTISING'];
  for (complexLink of complexLinks) {
    if (visibleNodes.includes(complexLink.purpose[1]) && visibleNodes.includes(complexLink.dataType[1]) && complexLink.active) {
      complexLink.visible = true;
    }
    else {
      complexLink.visible = false;
    }
  }
  for (link of links) {
    if (visibleNodes.includes(link.endName) && link.how == 'HARVESTED' && link.active) {
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
  redraw();
}
previousCase3_4Modal.onclick = function (){
  case3_3Modal.className = case3_3Modal.className.replace('dn', 'db');
  case3_4Modal.className = case3_4Modal.className.replace('db', 'dn');
  let visibleNodes = ['PRODUCT USE', 'ADVERTISING'];
  for (complexLink of complexLinks) {
    if (visibleNodes.includes(complexLink.purpose[1]) && visibleNodes.includes(complexLink.dataType[1]) && complexLink.active) {
      complexLink.visible = true;
    }
    else {
      complexLink.visible = false;
    }
  }
  for (link of links) {
    if (visibleNodes.includes(link.endName) && link.how == 'HARVESTED' && link.active) {
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
  redraw();
}
nextCase3_4Modal.onclick = function () {
  case3_4Modal.className = case3_4Modal.className.replace('db', 'dn');
  case3_5Modal.className = case3_5Modal.className.replace('dn', 'db');
  let visibleNodes = [];
  let visibleNodes2 = [];
  for (node of nodes) {
    if (node.subCat == 'ADVERTISING') {
      visibleNodes.push(node.name);
      visibleNodes2.push(node.name);
    }
  }
  for (complexLink of complexLinks) {
    if (visibleNodes.includes(complexLink.purpose[1]) && complexLink.active) {
      visibleNodes.push(complexLink.dataType[1]);
    }
  }
  for (link of links) {
    if (visibleNodes.includes(link.endName) && link.how == 'HARVESTED' && link.active) {
      link.visible = true;
      visibleNodes2.push(link.startName);
      visibleNodes2.push(link.endName);
    }
    else {
      link.visible = false;
    }
  }
  for (node of nodes) {
    if (visibleNodes2.includes(node.name)) {
      node.visible = true;
    }
    else {
      node.visible = false;
    }
  }
  for (complexLink of complexLinks) {
    if (visibleNodes2.includes(complexLink.purpose[1]) && visibleNodes2.includes(complexLink.dataType[1])) {
      complexLink.visible = true;
    }
    else {
      complexLink.visible = false;
    }
  }
  redraw();
}
previousCase3_5Modal.onclick = function (){
  case3_4Modal.className = case3_4Modal.className.replace('dn', 'db');
  case3_5Modal.className = case3_5Modal.className.replace('db', 'dn');
  let visibleNodes = ['CURRENT LOCATION', 'IP ADDRESS', 'LOCATION HISTORY', 'NETWORK INFORMATION', 'ADVERTISING'];
  for (complexLink of complexLinks) {
    if (visibleNodes.includes(complexLink.purpose[1]) && visibleNodes.includes(complexLink.dataType[1]) && complexLink.active) {
      complexLink.visible = true;
    }
    else {
      complexLink.visible = false;
    }
  }
  for (link of links) {
    if (visibleNodes.includes(link.endName) && link.how == 'HARVESTED' && link.active) {
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
  redraw();
}
nextCase3_5Modal.onclick = function () {
  case3_5Modal.className = case3_5Modal.className.replace('db', 'dn');
}

// Case 4 (Amazon - Vagueness @Matt)
nextCase4_1Modal.onclick = function () {
  case4_1Modal.className = case4_1Modal.className.replace('db', 'dn');
  case4_2Modal.className = case4_2Modal.className.replace('dn', 'db');
  console.log('Amazon pressed...');
  comparisonButtons('reset');
  updateFilters('AMAZON');
  updateButtons(amazonButton);
  resetButtons(facebookButton);
  resetButtons(allCompaniesButton);
  resetButtons(appleButton);
  resetButtons(googleButton);
}
previousCase4_2Modal.onclick = function(){
  case4_1Modal.className = case4_1Modal.className.replace('dn', 'db');
  case4_2Modal.className = case4_2Modal.className.replace('db', 'dn');
  resetFilters();
}
nextCase4_2Modal.onclick = function () {
  case4_2Modal.className = case4_1Modal.className.replace('db', 'dn');
  case4_3Modal.className = case4_2Modal.className.replace('dn', 'db');
  let visibleNodes = ['RESEARCH AND DEVELOPMENT'];
  for (complexLink of complexLinks) {
    if (complexLink.visible && visibleNodes.includes(complexLink.purpose[1]) && complexLink.active) {
      complexLink.visible = true;
      visibleNodes.push(complexLink.dataType[1]);
    }
    else {
      complexLink.visible = false;
    }
  }
  for (link of links) {
    if (link.visible && visibleNodes.includes(link.endName) && link.active) {
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
  redraw();
}
previousCase4_3Modal.onclick = function(){
  case4_3Modal.className = case4_3Modal.className.replace('db', 'dn');
  case4_2Modal.className = case4_2Modal.className.replace('dn', 'db');
  console.log('Amazon pressed...');
  comparisonButtons('reset');
  updateFilters('AMAZON');
  updateButtons(amazonButton);
  resetButtons(facebookButton);
  resetButtons(allCompaniesButton);
  resetButtons(appleButton);
  resetButtons(googleButton);
}
nextCase4_3Modal.onclick = function () {
  case4_3Modal.className = case4_1Modal.className.replace('db', 'dn');
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == case1_1Modal) {
    case1_1Modal.className = case1_1Modal.className.replace('db', 'dn');
  }
  else if (event.target == case1_2Modal) {
    case1_2Modal.className = case1_2Modal.className.replace('db', 'dn');
  }
  else if (event.target == case1_3Modal) {
    case1_3Modal.className = case1_3Modal.className.replace('db', 'dn');
  }
  else if (event.target == case2_1Modal) {
    case2_1Modal.className = case2_1Modal.className.replace('db', 'dn');
  }
  else if (event.target == case2_2Modal) {
    case2_2Modal.className = case2_2Modal.className.replace('db', 'dn');
  }
  else if (event.target == case2_3Modal) {
    case2_3Modal.className = case2_3Modal.className.replace('db', 'dn');
  }
  else if (event.target == case3_1Modal) {
    case3_1Modal.className = case3_1Modal.className.replace('db', 'dn');
  }
  else if (event.target == case3_2Modal) {
    case3_2Modal.className = case3_2Modal.className.replace('db', 'dn');
  }
  else if (event.target == case3_3Modal) {
    case3_3Modal.className = case3_3Modal.className.replace('db', 'dn');
  }
  else if (event.target == case3_4Modal) {
    case3_4Modal.className = case3_4Modal.className.replace('db', 'dn');
  }
  else if (event.target == case3_5Modal) {
    case3_5Modal.className = case3_5Modal.className.replace('db', 'dn');
  }
  else if (event.target == case4_1Modal) {
    case4_1Modal.className = case4_1Modal.className.replace('db', 'dn');
  }
  else if (event.target == case4_2Modal) {
    case4_2Modal.className = case4_2Modal.className.replace('db', 'dn');
  }
  else if (event.target == case4_3Modal) {
    case4_3Modal.className = case4_3Modal.className.replace('db', 'dn');
  }
  else if (event.target == mobile_modal) {
    mobile_modal.className = mobile_modal.className.replace('db', 'dn');
  }
} 