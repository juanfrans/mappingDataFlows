// Classes definitions
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
    this.visible = true;
    this.active = true;
  }
  display() {
    if (this.active && this.visible){
      this.opacity = 1;
    }
    else{
      this.opacity = hiddenNodeOpacity;
    }
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
  update(chosenNodes) {
    if (chosenNodes.includes(node.name)) {
      this.active = true;
    }
    else {
      this.active = false;
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
    this.visible = true;
    this.active = true;
    this.pointList = [];
    for (var i = 0; i < 100; i++) {
      let t = i / 100;
      let x = bezierPoint(this.startVector.x, this.midVector1.x, this.midVector2.x, this.endVector.x, t);
      let y = bezierPoint(this.startVector.y, this.midVector1.y, this.midVector2.y, this.endVector.y, t);
      let point = createVector(x, y);
      this.pointList.push(point);
    }
  }
  display() {
    if (this.active && this.visible){
      this.strokeAlpha = 0.8;
    }
    else {
      this.strokeAlpha = hiddenLinkStroke;
    }
    noFill();
    stroke(0, 0, 100, this.strokeAlpha);
    strokeWeight(0.8);
    bezier(this.startVector.x, this.startVector.y, this.midVector1.x, this.midVector1.y, this.midVector2.x, this.midVector2.y, this.endVector.x, this.endVector.y);
  }
  update(chosenNodes) {
    if (chosenNodes.includes(this.endName) || chosenNodes.includes(this.startName)) {
      this.active = true;
    }
    else {
      this.active = false;
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
    this.visible = true;
    this.active = true;
    for (var i = 0; i < 80; i++) {
      let t = i / 80;
      let x = bezierPoint(this.startAnchor.x, this.midAnchor1.x, this.midAnchor2.x, this.endAnchor.x, t);
      let y = bezierPoint(this.startAnchor.y, this.midAnchor1.y, this.midAnchor2.y, this.endAnchor.y, t);
      let point = createVector(x, y);
      this.pointList.push(point);
    }
  }
  display() {
    if (this.visible && this.active){
      this.strokeAlpha = 0.8;
    }
    else {
      this.strokeAlpha = hiddenLinkStroke;
    }
    noFill();
    stroke(this.h, this.s, this.b, this.strokeAlpha);
    strokeWeight(this.strokeWeight);
    bezier(this.startAnchor.x, this.startAnchor.y, this.midAnchor1.x, this.midAnchor1.y, this.midAnchor2.x, this.midAnchor2.y, this.endAnchor.x, this.endAnchor.y);
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
          this.active = true;
        }
        else if (this.companies.includes(currentFilter[3][1]) & (this.companies.includes(currentFilter[3][0]) == false)) {
          this.h = 22;
          this.s = 100;
          this.b = 100;
          this.active = true;
        }
        else if (this.companies.includes(currentFilter[3][0]) & this.companies.includes(currentFilter[3][1])) {
          this.h = 0;
          this.s = 0;
          this.b = 100;
          this.active = true;
        }
        else {
          this.h = 0;
          this.s = 0;
          this.b = 100;
          this.active = false;
        }
      }
      else {
        this.h = 0;
        this.s = 0;
        this.b = 100;
        this.active = true;
      }
    }
    else {
      this.h = 0;
      this.s = 0;
      this.b = 100;
      this.active = false;
    }
  }
}