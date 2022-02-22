isRunning = false;
function loading(){    


    console.log("body width"+document.body.clientWidth);
    console.log("body height"+document.querySelector("#body").clientHeight);

    registerSetting("enlargeSpeed");
    registerSetting("livingTimes");
    registerSetting("edgeNo");
    registerSetting("fadetime");
    registerSetting("rotateSpeed");
    registerSetting("volumeTimes");
    registerSetting("folder", folding);
    registerSetting("freqRange");
    registerSetting("coloriterator");
    registerSetting("colorStart");
    registerSetting("bgcolor");
    registerSetting("sizeLimit");
    registerSetting("vibrateRadius");
    registerSetting("resetAll", resetAll);
    
    
    loadFlash({
        width: function(){return document.body.clientWidth;},
        height: function(){return document.body.clientHeight;},
        radius: function(){return Math.min(document.body.clientWidth, document.body.clientHeight)/200;},
        canvas: "#canvas",
        backgroundColor: function(){return getSettingValue("bgcolor")},
        sizeLimit: function(){return getSettingValue("sizeLimit")*Math.min(document.body.clientWidth, document.body.clientHeight)},
        vibrateRadius: function(){return getSettingValue("vibrateRadius")*Math.min(document.body.clientWidth, document.body.clientHeight)},
    });

    loadAudio({
        button: document.getElementById("microphone"),
        tonejs: {
            canvases: {
                fft:"#fftmonitor",
                meter:"#metermonitor",
                wave: "#wavemonitor",
                height: 80,
            }
        },
        recording: {
            css: "recording",
            text: "停止倾听",
        },
        callback: visualShow,
        monitor: {
            canvas: "#artcanvas",
            height: function(){return 80},
            width: function(){return Math.floor(document.body.clientWidth/2)},
            coloriterator: function(){return getSettingValue("coloriterator")},
        },
        range: function(){return getSettingValue("freqRange")},
        colorStart: function(){return getSettingValue("colorStart")}
    });

    

    pushFigure({
        size: 10,
        color: "hsla(240,100%,50%,1)",
        edgeNo: 5,
    });

}



                        // fft: document.querySelector(),
                    // meter: document.querySelector(),
                    // wave: document.querySelector(),
                    // height: monitorheight,

    // loadingAudion(document.getElementById('microphone'));

    // registerSetting("colorful").addEventListener("change", setColorful);
    // registerSetting("volumeTimes").addEventListener("change", setVolumeTimes);
    // registerSetting("biasFreq").addEventListener("change", setBiasFreq);
    // registerSetting("bgcolor").addEventListener("change", setBgcolor);

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