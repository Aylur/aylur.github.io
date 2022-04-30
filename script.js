//COLORS
const white = "#f6f5f4";
const yellow= "#f8e45c";
const green = "#2ec27e";
const blue  = "#62a0ea";
const red   = "#f66151";
const orange= "#ffa348";

//NAVBAR
var opened = 0;
function navbar(){
  var nav = document.getElementById("nav");
  if(opened){
    nav.classList.remove("opened");
    opened = 0;
  }else{
    nav.classList.add("opened");
    opened = 1;
  }
}


//SLIDE BUTTON COLORS
var colorIndexL = 0;
var colorIndexR = 0;

function btnColorL(){
  var btn = document.getElementsByClassName("btnLeft");
  var clr;
  if(colorIndexL === 6){colorIndexL = 0;}
  if(colorIndexL === 0){clr = blue;}
  if(colorIndexL === 1){clr = green;}
  if(colorIndexL === 2){clr = red;}
  if(colorIndexL === 3){clr = orange;}
  if(colorIndexL === 4){clr = yellow;}
  if(colorIndexL === 5){clr = white;}
  colorIndexL++;
  for(i=0; i<btn.length; i++){
    btn[i].style.backgroundColor = clr;
  }
}
function btnColorR(){
  var btn = document.getElementsByClassName("btnRight");
  var clr;
  if(colorIndexR === 6){colorIndexR = 0;}
  if(colorIndexR === 0){clr = blue;}
  if(colorIndexR === 1){clr = green;}
  if(colorIndexR === 2){clr = red;}
  if(colorIndexR === 3){clr = orange;}
  if(colorIndexR === 4){clr = yellow;}
  if(colorIndexR === 5){clr = white;}
  colorIndexR++;
  for(i=0; i<btn.length; i++){
    btn[i].style.backgroundColor = clr;
  }
}
function btnColor(){
  var btnL = document.getElementsByClassName("btnLeft");
  var btnR = document.getElementsByClassName("btnRight");
  var i;
  for(i=0; i<btnL.length; i++){
    btnL[i].style.backgroundColor = "rgba(255,255,255,0.12)";
  }
  for(i=0; i<btnR.length; i++){
    btnR[i].style.backgroundColor = "rgba(255,255,255,0.12)";
  }
}


//SLIDES
var slideIndex = 1;
function moveSlide(n) {
  showDivs(slideIndex += n);
}
function showDivs(n) {
  var i;
  var x = document.getElementsByClassName("slide");
  if (n > x.length) {slideIndex = 1}
  if (n < 1) {slideIndex = x.length} ;
  for (i = 0; i < x.length; i++) {
    x[i].style.display = "none";
  }
  x[slideIndex-1].style.display = "grid";
}


//BACKGROUND
function bg(){
  //BACKGROUND DIV
  var cols = Math.floor(innerWidth/72);
  var bg = document.createElement('div');
  bg.style.position = "absolute";
  bg.style.top = "0";
  bg.style.left = "0";
  bg.style.width = "100%";
  bg.style.zIndex = "-1";
  bg.style.fontSize = "0";

  // bg.style.display = "grid";
  // bg.style.gridTemplateColumns = "repeat("+cols+", 1fr)";
  // bg.style.justifyContent = "sapce-evenly";
  // bg.style.justifyItems = "center";
  // bg.style.alignContent = "space-evenly"
  // bg.style.alignItems = "center";


  bg.style.display = "flex";
  bg.style.justifyContent = "space-between";
  bg.style.flexWrap = "wrap";
  bg.style.gap = "0"

  document.body.appendChild(bg);

  //TILES
  const times = Math.ceil(document.documentElement.scrollHeight/72) * cols;
  var i;
  for(i = 0; i<times; i++){

    var tile = document.createElement('div');
    tile.style.width = "66px";
    tile.style.height = "66px";
    tile.style.margin = "3px"
    tile.style.borderRadius = "15%";
    tile.style.borderBottom = "3px solid rgba(0,0,0,0.4)";

    var rnd = Math.floor(Math.random() * 6);
    if(rnd === 0){ tile.style.backgroundColor = white; }
    if(rnd === 1){ tile.style.backgroundColor = yellow;}
    if(rnd === 2){ tile.style.backgroundColor = green; }
    if(rnd === 3){ tile.style.backgroundColor = blue;  }
    if(rnd === 4){ tile.style.backgroundColor = red;   }
    if(rnd === 5){ tile.style.backgroundColor = orange;}

    bg.appendChild(tile);
  }
}


window.onload = function() {
  showDivs(slideIndex);
  bg();
}
// document.body.addEventListener("DOMContentLoaded", function () {
//   showDivs(slideIndex);
//   bg();
// });