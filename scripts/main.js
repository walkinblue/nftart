isRunning = false;
function loading(){
    resizeCanvas();
    
    ctx = document.getElementById('canvas').getContext('2d');



    flash();

    pushFigure({
        size: 10,
        color: "hsla{240,100%,80%,1}"
    });

    loadingAudion(document.getElementById('microphone'));
    document.getElementById("enlargeSpeed").addEventListener("change", setEnlargeSpeed);
    document.getElementById("livingTimes").addEventListener("change", setLivingTimes);
    document.getElementById("edgeNo").addEventListener("change", setEdgeNo);
    // document.getElementById("colorful").addEventListener("change", setColorful);
    document.getElementById("fadetime").addEventListener("change", setFadetime);
    document.getElementById("rotateSpeed").addEventListener("change", setRotateSpeed);
    // document.getElementById("volumeTimes").addEventListener("change", setVolumeTimes);
    document.getElementById("folder").addEventListener("click", folding);
    // document.getElementById("bgcolor").addEventListener("change", setBgcolor);

    // setColorful({target:{value:document.getElementById("colorful").value}});
    // setBgcolor({target:{value:document.getElementById("bgcolor").value}});
    // console.log(lit_element_1.css);


    // let sbutton = document.getElementsByTagName("tone-mic-button")[0].shadowRoot.querySelector("tone-button").shadowRoot.querySelector("button");

    // sbutton.style.backgroundColor="#ffffff";
    // sbutton.style.width = 120;
    // sbutton.style.height = 30;
    // sbutton.style.marginTop = 9;
    // sbutton.style.border = "none";
    // sbutton.style.padding = 0;
    // sbutton.style.color = "#444444";
    // sbutton.style.boxShadow = "";
    // sbutton.style.outline = "";
    
    
    // sbutton.addEventListener("click", function () {
    //     if(micListening == false){
    //         this.style.backgroundColor = "#ff8888";
    //     }else{
    //         this.style.backgroundColor = "#ffffff";  
    //     }

    // });

}



