
function setColorful(e){
    colorful = e.target.value
    c = replaceColor(colorful, 255);
    rc = reverseColor(c);
    console.log("e color "+c+","+rc);
    document.getElementById("colorful").style.color = c;
    document.getElementById("colorful").style.backgroundColor = reverseColor(c);
}
function setBgcolor(e){
    console.log("e bgcolor "+e.target.value);
    background = e.target.value;
    document.getElementById("bgcolor").style.color = replaceColor(background, 255);
    document.getElementById("canvas").style.backgroundColor = background;
    document.getElementById("bgcolor").style.backgroundColor = reverseColor(background);
}

function resetAll(e){
    window.location.reload();
}


function folding(){
    console.log("folding");
    if(document.getElementById("operations").style.visibility == "hidden"){
        document.getElementById("folder").classList.remove("folded");
        document.getElementById("operations").style.visibility = "";
        document.getElementById("monitors").style.visibility = "";
        document.exitFullscreen();
    }else{
        document.getElementById("folder").classList.add("folded");
        document.getElementById("operations").style.visibility = "hidden";
        document.getElementById("monitors").style.visibility = "hidden";
        document.documentElement.requestFullscreen();
        // resizeCanvas();
    }

}


// function setFadetime(e){
//     console.log("e fadetime "+e.target.value);
//     fadetime = e.target.value
//     document.getElementById("fadetimeValue").innerText = e.target.value;
// }
// function setRotateSpeed(e){
//     console.log("e rotate "+e.target.value);
//     rotateSpeed = e.target.value
//     document.getElementById("rotateSpeedValue").innerText = e.target.value;
// }
// function setBiasFreq(e){
//     console.log("e biasFreq "+e.target.value);
//     biasFreq = e.target.value;
// }



// function setEnlargeSpeed(e){
//     console.log("e "+e.target.value);
//     enlargeSpeed = e.target.value;
//     document.getElementById("enlargeSpeedValue").innerText = e.target.value;
// }
// function setLivingTimes(e){
//     console.log("e "+e.target.value);
//     livingTimes = e.target.value;
//     document.getElementById("livingTimesValue").innerText = e.target.value;
// }
// function setEdgeNo(e){
//     console.log("e "+e.target.value);
//     edgeNo = e.target.value;
//     // document.getElementById("edgeNoValue").innerText = e.target.value;
// }
// function setVolumeTimes(e){
//     console.log("e "+e.target.value);
//     volumeTimes = e.target.value;
//     document.getElementById("volumeTimesValue").innerText = e.target.value;
// }