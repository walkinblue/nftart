
async function loadTonejsMonitor(elements){
    let height = elements.height;
    let fftElement  = document.querySelector(elements.fft);
    let meterElement  = document.querySelector(elements.meter);
    let waveElement = document.querySelector(elements.wave);

    let micFFT = null;
    if(fftElement != null){
        micFFT = new Tone.FFT();
        fft({
            tone: micFFT,
            parent: fftElement,
            height: height,
        });    
    }

    let micMeter = null;
    if(meterElement != null){
        micMeter = new Tone.Meter();
        meter({
            tone: micMeter,
            parent: meterElement,
            height: height,
        });    
    }

    let micWaveform = null;
    if(waveElement != null){
        micWaveform = new Tone.Waveform();
        waveform({
            tone: micWaveform,
            parent: waveElement,
            height: height,
        });    
    }

    return {
        fft: micFFT,
        meter: micMeter,
        wave: micWaveform,
    }

}

async function audioMonitor(frequencyArray, data){
    let height = data.height;
    let width  = data.width;
    let range = data.range;
    let canvasCTX = data.context;
    let volume = data.volume;
    let callback = data.callback;
    let coloriterator = data.coloriterator;
    let colorStart = data.colorStart;
    let canvas = data.canvas;

    canvas.height = height;
    canvas.width = width;
    canvasCTX.clearRect(0,0, width, height);
    canvasCTX.fillStyle = 'rgba(255, 255, 255, 0)';
    canvasCTX.fillRect(0, 0, width, height);

    range = Math.floor(range  * FFT_SIZE / SAMPLE_RATE);

    let barWidth = 1;
    if(range > width){
        barWidth = 1;
    } else{
        barWidth = (width -1) / (range);
        if(barWidth > 2)barWidth--;
    }

    // console.log(`range:${range} colorStart : ${colorStart}, coloriterator:${coloriterator} `);

    let maxPower = 0;
    let maxIndex = -1;
    let deltas = [];
    for (let i = 0; i < range; i++) { 
        let power = frequencyArray[i];
        let size = power/256;//Math.pow(power/256,2);
        let barHeight = Math.floor(size*height);
        let hue = (Math.floor(i / range * 360* coloriterator)+colorStart + 360)%360;
        let saturation = Math.floor((1-Math.pow(power/256, 2))*100);
        let color = `hsla(${hue}, ${saturation}%, 50%,1)`;
        let startX = width/range*i;
        canvasCTX.fillStyle =color;
        canvasCTX.fillRect(startX, (height - barHeight), barWidth, barHeight);    

        if(i < range -1){
            let delta = frequencyArray[i] - frequencyArray[i+1];
            deltas.push(delta);
        }
        if(maxPower < power){
            maxIndex = i;
            maxPower = power;
        }
    
    }

    if(maxIndex < 0){
        return;
    }

    let leftWidth = 0;
    for(let i = maxIndex-1 ; i >= 0 ; i -- ){
        if(deltas[i] < 0){
            leftWidth++;
        }else{
            break;
        }
    }
    let rightWidth = 0;
    for(let i = maxIndex ; i < range - 1 ; i++ ){
        if(deltas[i] > 0){
            rightWidth++;
        }else{
            break;
        }
    }
    let freqLeft = (maxIndex - leftWidth) * SAMPLE_RATE/FFT_SIZE;
    let freqRight = (maxIndex + rightWidth) * SAMPLE_RATE/FFT_SIZE;
    let freqWidth = Math.floor(freqRight - freqLeft);
    let frequency = Math.floor(maxIndex * SAMPLE_RATE/FFT_SIZE);
    let maxFrequency = Math.floor(range * SAMPLE_RATE/FFT_SIZE);
    
    // console.log(`frequency width : ${freqWidth} volume: ${volume}  frequency: ${frequency}`);
    // console.log(`index width : ${leftWidth} + ${rightWidth} maxPower: ${maxPower}  maxIndex: ${maxIndex}`);

    callback({
        range: range,
        volume: volume,
        freqWidth: freqWidth,
        frequency: frequency,
        maxFrequency: maxFrequency,
        coloriterator: coloriterator,
        colorStart: colorStart,
    });

    return;

}

async function loadAnalyser(ctx){
    let analyser = ctx.createAnalyser();
    analyser.minDecibels = -96;
    analyser.maxDecibels = -10;
    analyser.smoothingTimeConstant = 0.85;
    analyser.fftSize = FFT_SIZE;
    let analyserBufferLength = analyser.frequencyBinCount;
    frequencyArray = new Uint8Array(analyserBufferLength);
    return analyser;
}

async function loadAnalyserWorklet(ctx, data){
    let worklet = new AudioWorkletNode(ctx, 'analyser')
    let height = data.height;
    let width = data.width;
    let callback = data.callback;
    let context = data.context;
    let coloriterator = data.coloriterator;
    let range = data.range;
    let colorStart = data.colorStart;
    let canvas = data.canvas;

    worklet.port.onmessage = event => {
        if(isAudioRunning()==false)
            return;

        analyser.getByteFrequencyData(frequencyArray);

        audioMonitor(frequencyArray, {
            context: context,
            canvas: canvas,
            height: height(),
            width: width(),
            range: range(), //Math.floor(frequencyArray.length / 6),
            volume: Math.floor(event.data.volume * 100),
            callback: callback,
            coloriterator: coloriterator(),
            colorStart: colorStart()
        });
    }
    return worklet;
}

async function audioClose(){
    await audioMedia.close();
    audioStatus = "stopped";
}

async function audioOpen(){
    await audioMedia.open();
    audioStatus = "running";
}

function isAudioRunning(){
    return audioStatus == "running";
}


let audioMedia = null;
let audioContext = null;
let analyserWorklet = null;
let analyser = null;
const SAMPLE_RATE = 11025;//44100//22050//11025//3675//735//245//49//7// 5*5*7*7*2*2*3*3;
const FFT_SIZE  = 1024;
let auidoButtonIdleText = null;
let audioStatus = "stopped";
let analyserCanvas = null;
let frequencyArray = null;


function loadAudio(data){
    let audiobutton = data.button;
    let recordingCSS = data.recording.css; //"recording"
    let recordingText = data.recording.text; //"recording"
    let tonejscanvas = data.tonejs.canvases;
    let analyserCallback = data.callback;


    let analyserCanvas = document.querySelector(data.monitor.canvas);
    let analyserCanvasCTX = analyserCanvas.getContext('2d');
    // analyserCanvas.height = data.monitor.height;
    // analyserCanvas.width = data.monitor.width;
    let analyserWidth = data.monitor.width;
    let analyserHeight = data.monitor.height;
    let coloriterator = data.monitor.coloriterator;
    let freqencyRange = data.range;
    let colorStart = data.colorStart;

    // AWIDTH = audiocanvas.width;
    // AHEIGHT = audiocanvas.height;
    const micButton = document.querySelector("tone-mic-button")
    micButton.supported = Tone.UserMedia.supported;


    
    console.log("analyserCallback ", analyserCallback);
    audiobutton.addEventListener("click", async () => {
        console.log("isAudioRunning ", isAudioRunning());
        
        if(isAudioRunning() == false){
            if(audioContext == null){
                audioContext = new AudioContext({sampleRate: SAMPLE_RATE}); 
                Tone.setContext(audioContext);
                audioMedia = await new Tone.UserMedia();
                await audioContext.audioWorklet.addModule('/nftart/scripts/module-analyser.js');
                analyserWorklet = await loadAnalyserWorklet(audioContext, {
                    callback: analyserCallback,
                    height: analyserHeight,
                    width: analyserWidth,
                    context: analyserCanvasCTX,
                    canvas: analyserCanvas,
                    coloriterator: coloriterator,
                    range: freqencyRange,
                    colorStart: colorStart,
                });
                analyser = await loadAnalyser(audioContext, 'analyser');

                let mointors = await loadTonejsMonitor(tonejscanvas);

                let node = audioMedia;
                if (mointors.fft) { node.connect(mointors.fft); node = mointors.fft;}
                if (mointors.meter) { node.connect(mointors.meter); node = mointors.meter}
                if (mointors.wave) { node.connect(mointors.wave); node = mointors.wave}

                node.connect(analyser);
                analyser.connect(analyserWorklet);
                await audioOpen();
                console.log("audio context inited..");
            }else{
                await audioOpen();
                console.log("audio context resumed..", audioStatus);
            }
            if(audioMedia == null){
                console.error('denied',e)
                return;
            }

            audiobutton.classList.add(recordingCSS);
            auidoButtonIdleText = audiobutton.innerText;
            audiobutton.innerText = recordingText;

            isListening = true;


        }else{
            await audioClose();
        
            audiobutton.classList.remove(recordingCSS);
            audiobutton.innerText = auidoButtonIdleText;
            isListening = false;
            console.log("audio closed...");
        }
    });

}
// let minManFreq = 70;
// let maxManFreq = 200;
// let minWomanFreq = 200;
// let maxWomanFreq = 350;
// let biasFreq = 0;

// let minManIndex;
// let maxManIndex;
// let minWomanIndex;
// let maxWomanIndex;

// let manFreq = 140;
// let womanFreq = 230;
// let maxFreq = 1000;


    // let maxFrequency = analyser.frequencyBinCount * SAMPLE_RATE/FFT_SIZE;


    // manIndex  = Math.floor(manFreq * FFT_SIZE / SAMPLE_RATE);
    // womanIndex  = Math.floor(womanFreq * FFT_SIZE / SAMPLE_RATE);
    // radiusIndex = Math.floor(radiusFreq  * FFT_SIZE / SAMPLE_RATE);
    // finalIndex = Math.floor(finalFreq  * FFT_SIZE / SAMPLE_RATE);
    // maxIndex = Math.floor(maxFreq  * FFT_SIZE / SAMPLE_RATE);    


    // console.log(`frequence from 0hz to ${maxFrequency}, sampleRate: ${SAMPLE_RATE}, bitCount: ${analyserBufferLength}`);
    // console.log(`man index : ${manIndex}, , woman index: ${womanIndex}, maxIndex: ${maxIndex} finalInde:${finalIndex}`);
    // console.log(`man index from ${minManIndex}, ${maxManIndex}, woman index from ${minWomanIndex}, to ${maxWomanIndex}`);

// function loadingAudion(button){


//     // bind the interface
              

//     const micButton = document.querySelector("tone-mic-button");
//     const mButton = document.getElementById("microphone");
//     const fftCanvas = document.getElementById("fftcanvas");

//     console.log(`fftcanvs width: ${AWIDTH}, height: ${AHEIGHT}`);


// }


    // micButton.addEventListener("touch", () => {
        
    // micButton.addEventListener("close", () => {
    //     usermic.close();
    // });


// async function processMeter(ctx){

//     await ctx.audioWorklet.addModule('/nftart/scripts/module-vmeter.js');

//     let node = new AudioWorkletNode(ctx, 'vumeter')

//     node.port.onmessage = event => {
//         let _volume = 0
//         let _sensibility = 5
//         if (event.data.volume)
//             _volume = event.data.volume;

//         // console.log("mic event", event.data.volume);
//         if (_volume < 0) {
//             window.location.reload();
//             return;
//         }
//         // pushFigure({
//         //     size: (_volume * 100) / _sensibility,
//         // });
//     }

//     return node;

// }


        // await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        //     .then(async function(stream){

        //         // audioMedia = stream;
        //         // let node = await processMeter(audioContext);
        //         // let analysis = await this.processAnalysis(audioContext);


        //     })
        //     .catch(onMicrophoneDenied);  

            
            // audioMedia.getTracks().forEach(function(track){
            //     console.log(`track ${track}`, track);
            // });
            // .then(async function(){
            //     this.audioContext = new AudioContext({sampleRate: SAMPLE_RATE});                
            //     Tone.setContext(audioContext);
            //     audioMedia = new Tone.UserMedia();

            //     let node = await this.processMeter(audioContext);
            //     let analysis = await this.processAnalysis(audioContext);

            //     let mointors = await this.processTonejsMonitor({
            //         tonejscanvas,
            //     });

            //     audioMedia.connect(node);
            //     audioMedia.connect(analysis);
            //     if (mointors.fft) { audioMedia.connect(mointors.fft); }
            //     if (mointors.meter) { audioMedia.connect(mointors.meter); }
            //     if (mointors.wave) { audioMedia.connect(mointors.wave); }

            //     // usermic.connect(audioContext.destination);

            //     audioMedia.open();
            //     console.log("audio context inited..");
            // })
            // .catch(onMicrophoneDenied);  


            // async function onMicrophoneGranted() {
//     await audioContext.resume();
//     usermic.open();        
//     micListening = true;
//     console.log("audio context resumed..");
// }



// let manHue = 240;
// let womanHue = 60;
// let zeroHue = 180;
// let finalHue = 180;


// async function onMicrophoneSuspend(){
//     console.log("audio context suspend..");
//     usermic.close();    
// }


// async function procesLoop(){
//     // console.log("onaudioprocess: "+ 1);
//     // analysis.getByteFrequencyData(frequencyArray);

//     // let canvasCTX = ;
//     // canvasCTX.clearRect(0,0, AWIDTH, AHEIGHT);
//     // canvasCTX.fillStyle = 'rgba(255, 255, 255, 0)';
//     // canvasCTX.fillRect(0, 0, AWIDTH, AHEIGHT);

//     // let barWidth = (AWIDTH / frequencyRange) * 2.5;
//     // let x = 0;

//     // let maxPower = 0;
//     // let minPower = 100;
//     // let avgPowerSum = 0;
//     // let rmsPowerSum = 0;
//     // let validNo = 0;
//     // let sizeSum = 0;
//     // let lowSum = 0;
//     // let manSum = 0;
//     // let womanSum =0;
//     // let ultraSum = 0

//     // let minManIndex =Math.floor((minManFreq +biasFreq) * FFT_SIZE / SAMPLE_RATE);
//     // let maxManIndex = Math.floor((maxManFreq  +biasFreq) * FFT_SIZE / SAMPLE_RATE);
//     // let minWomanIndex = Math.floor((minWomanFreq  +biasFreq) * FFT_SIZE / SAMPLE_RATE);
//     // let maxWomanIndex = Math.floor((maxWomanFreq  +biasFreq) * FFT_SIZE / SAMPLE_RATE);



//     // for (let i = 0; i < frequencyRange; i++) {
//     //     barHeight = frequencyArray[i];

//     //     let frequency = i * SAMPLE_RATE/FFT_SIZE;

//     //     let hue = null;
//     //     let color = null;
//     //     let saturation = AHEIGHT  - barHeight/256*AHEIGHT;
//     //     let c = Math.floor(Math.sqrt((256 - barHeight)/256)*256);

//     //     let defaultColor = `rgba(${c},${c},${c},1)`;;
//     //     if(i < minManIndex){
//     //         color = `rgba(${c},${c},${c},1)`;
//     //         lowSum ++;
//     //     }else if(i >= minManIndex && i <= maxManIndex){
//     //         color = `rgba(0,${c},${c},1)`;
//     //         manSum ++;
//     //     }else if(i > maxManIndex && i <= maxWomanIndex){
//     //         let hc = Math.floor(c/2);
//     //         color = `rgba(${c},${hc},${hc},1)`;
//     //         womanSum ++;
//     //     }else if(i > maxWomanIndex){
//     //         color = defaultColor;
//     //         ultraSum ++;
//     //     }
//     //     let size = Math.floor(Math.pow(barHeight/256,2) *16);
//     //     if(size <=2 ){
//     //         color = defaultColor;
//     //     }


//     //     if(size >= 1 && i <= maxWomanIndex ){
//     //         pushFigure({
//     //             color: color,
//     //             size: Math.floor( size ),
//     //         });    
//     //         validNo++;
//     //         sizeSum += size;
//     //         if(size > maxPower){
//     //             maxPower = size;
//     //         }
//     //         if(size < minPower){
//     //             minPower = size;
//     //         }
//     //     }else if( i > maxWomanIndex && size >= 1){
//     //         if(i % 3 == 0){
//     //             pushFigure({
//     //                 color: color,
//     //                 size: Math.floor( size ),
//     //             });    
//     //             validNo++;
//     //         }
//     //     }

//     //     canvasCTX.fillStyle = color;

//     //     canvasCTX.fillRect(x, AHEIGHT - size*(AHEIGHT/16), barWidth, size*(AHEIGHT/16));    

//     //     avgPowerSum += barHeight;
//     //     rmsPowerSum += barHeight*barHeight;

//     //     x += barWidth + 1;

//     // }

//     // let avgPower = Math.floor (avgPowerSum / analyserBufferLength);
//     // let rmsPower = Math.floor (Math.sqrt(rmsPowerSum / analyserBufferLength));
//     // let avgSize = Math.floor (sizeSum/validNo);

//     // console.log(`maxman: ${biasFreq}, valid:${validNo},min:${minPower},max:${maxPower},manNo:${manSum},womNo:${womanSum},ultra:${ultraSum},low:${lowSum}`);
//     // 

//     // requestAnimationFrame(procesLoop);
// }


// let x = 0;

// let maxPower = 0;
// let minPower = 100;
// let avgPowerSum = 0;
// let rmsPowerSum = 0;
// let validNo = 0;
// let sizeSum = 0;
// let lowSum = 0;
// let manSum = 0;
// let womanSum =0;
// let ultraSum = 0

// let minManIndex =Math.floor((minManFreq +biasFreq) * FFT_SIZE / SAMPLE_RATE);
// let maxManIndex = Math.floor((maxManFreq  +biasFreq) * FFT_SIZE / SAMPLE_RATE);
// let minWomanIndex = Math.floor((minWomanFreq  +biasFreq) * FFT_SIZE / SAMPLE_RATE);
// let maxWomanIndex = Math.floor((maxWomanFreq  +biasFreq) * FFT_SIZE / SAMPLE_RATE);



// for (let i = 0; i < frequencyRange; i++) {
//     barHeight = frequencyArray[i];

//     let frequency = i * SAMPLE_RATE/FFT_SIZE;

//     let hue = null;
//     let color = null;
//     let saturation = AHEIGHT  - barHeight/256*AHEIGHT;
//     let c = Math.floor(Math.sqrt((256 - barHeight)/256)*256);

//     let defaultColor = `rgba(${c},${c},${c},1)`;;
//     if(i < minManIndex){
//         color = `rgba(${c},${c},${c},1)`;
//         lowSum ++;
//     }else if(i >= minManIndex && i <= maxManIndex){
//         color = `rgba(0,${c},${c},1)`;
//         manSum ++;
//     }else if(i > maxManIndex && i <= maxWomanIndex){
//         let hc = Math.floor(c/2);
//         color = `rgba(${c},${hc},${hc},1)`;
//         womanSum ++;
//     }else if(i > maxWomanIndex){
//         color = defaultColor;
//         ultraSum ++;
//     }
//     let size = Math.floor(Math.pow(barHeight/256,2) *16);
//     if(size <=2 ){
//         color = defaultColor;
//     }


//     if(size >= 1 && i <= maxWomanIndex ){
//         pushFigure({
//             color: color,
//             size: Math.floor( size ),
//         });    
//         validNo++;
//         sizeSum += size;
//         if(size > maxPower){
//             maxPower = size;
//         }
//         if(size < minPower){
//             minPower = size;
//         }
//     }else if( i > maxWomanIndex && size >= 1){
//         if(i % 3 == 0){
//             pushFigure({
//                 color: color,
//                 size: Math.floor( size ),
//             });    
//             validNo++;
//         }
//     }

//     canvasCTX.fillStyle = color;

//     canvasCTX.fillRect(x, AHEIGHT - size*(AHEIGHT/16), barWidth, size*(AHEIGHT/16));    

//     avgPowerSum += barHeight;
//     rmsPowerSum += barHeight*barHeight;

//     x += barWidth + 1;

// }

// let avgPower = Math.floor (avgPowerSum / analyserBufferLength);
// let rmsPower = Math.floor (Math.sqrt(rmsPowerSum / analyserBufferLength));
// let avgSize = Math.floor (sizeSum/validNo);
