const d = new Date();

const monthNameEng = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const monthNameHun = ["Január","Február","Március","Április","Május","Június","Július","Augusztus","Szeptember","Október","November","December"];
const dayNameEng = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const dayNameHun = ["Vasárnap","Hétfő","Kedd","Szerda","Csütörtök","Péntek","Szombat"];

function addZero(i) {
    if (i < 10) {i = "0" + i}
    return i;
}

let month = monthNameHun[d.getMonth()];
let date = d.getDate();
let day = dayNameHun[d.getDay()];
let hour = d.getHours(); 
let min = addZero(d.getMinutes());

function writeDate(){
    document.getElementById("month").innerHTML = month;
    document.getElementById("date").innerHTML = date+".";
    document.getElementById("day").innerHTML = day;
    document.getElementById("hour").innerHTML = hour +":"+ min;
}

function writeGreet(){
    let greet = "Good Evening!";
    if(hour > 6){ greet = "Good Morning!"; }
    if(hour > 12){greet = "Good Afternoon!";}
    if(hour > 18){greet = "Good Evening!";}
    document.getElementById("greet").innerHTML = greet;
}

function eventListeners(){
    document.getElementById("inpField").addEventListener("focus", function(){
        document.getElementById("search").classList.add("focused");
    })
    document.getElementById("inpField").addEventListener("blur", function(){
        document.getElementById("search").classList.remove("focused");
    })
}

function main(){
    writeDate();
    writeGreet();
    eventListeners();
    document.getElementById("inpField").value = "";
}