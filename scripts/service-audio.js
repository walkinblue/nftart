let audioContext



async function processMonitor(elements){
    let height = elements.height;
    let fftElement  = elements.fft;
    let meterElement  = elements.meter;
    let waveElement = elements.wave;

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

async function processMeter(ctx){

    await ctx.audioWorklet.addModule('/nftart/scripts/vumeter-processor.js')

    let node = new AudioWorkletNode(ctx, 'vumeter')

    node.port.onmessage = event => {
        let _volume = 0
        let _sensibility = 5
        if (event.data.volume)
            _volume = event.data.volume;

        // console.log("mic event", event.data.volume);
        if (_volume < 0) {
            window.location.reload();
            return;
        }
        // pushFigure({
        //     size: (_volume * 100) / _sensibility,
        // });
    }

    return node;

}

let frequencyArray = null;
let analysis = null;
let AWIDTH;
let AHEIGHT;
let bufferLengthAlt = null;
const SAMPLE_RATE = 22050;
const FFT_SIZE  = 512;

let minManFreq = 70;
let maxManFreq = 200;
let minWomanFreq = 200;
let maxWomanFreq = 350;
let biasFreq = 0;

async function procesLoop(){
    // console.log("onaudioprocess: "+ 1);
    analysis.getByteFrequencyData(frequencyArray);

    let canvasCTX = document.getElementById("fftcanvas").getContext('2d');
    canvasCTX.clearRect(0,0, AWIDTH, AHEIGHT);
    canvasCTX.fillStyle = 'rgba(255, 255, 255, 0)';
    canvasCTX.fillRect(0, 0, AWIDTH, AHEIGHT);

    let barWidth = (AWIDTH / bufferLengthAlt) * 2.5;
    let x = 0;

    let maxPower = 0;
    let minPower = 100;
    let avgPowerSum = 0;
    let rmsPowerSum = 0;
    let validNo = 0;
    let sizeSum = 0;
    let lowSum = 0;
    let manSum = 0;
    let womanSum =0;
    let ultraSum = 0

    let minManIndex =Math.floor((minManFreq +biasFreq) * FFT_SIZE / SAMPLE_RATE);
    let maxManIndex = Math.floor((maxManFreq  +biasFreq) * FFT_SIZE / SAMPLE_RATE);
    let minWomanIndex = Math.floor((minWomanFreq  +biasFreq) * FFT_SIZE / SAMPLE_RATE);
    let maxWomanIndex = Math.floor((maxWomanFreq  +biasFreq) * FFT_SIZE / SAMPLE_RATE);

    for (let i = 0; i < bufferLengthAlt; i++) {
        barHeight = frequencyArray[i];

        let frequency = i * SAMPLE_RATE/FFT_SIZE;

        let hue = null;
        let color = null;
        let saturation = AHEIGHT  - barHeight/256*AHEIGHT;
        let c = Math.floor(Math.sqrt((256 - barHeight)/256)*256);

        let defaultColor = `rgba(${c},${c},${c},1)`;;
        if(i < minManIndex){
            color = `rgba(${c},${c},${c},1)`;
            lowSum ++;
        }else if(i >= minManIndex && i <= maxManIndex){
            color = `rgba(0,${c},${c},1)`;
            manSum ++;
        }else if(i > maxManIndex && i <= maxWomanIndex){
            let hc = Math.floor(c/2);
            color = `rgba(${c},${hc},${hc},1)`;
            womanSum ++;
        }else if(i > maxWomanIndex){
            color = defaultColor;
            ultraSum ++;
        }
        let size = Math.floor(Math.pow(barHeight/256,2) *16);
        if(size <=2 ){
            color = defaultColor;
        }


        if(size >= 1 && i <= maxWomanIndex ){
            pushFigure({
                color: color,
                size: Math.floor( size ),
            });    
            validNo++;
            sizeSum += size;
            if(size > maxPower){
                maxPower = size;
            }
            if(size < minPower){
                minPower = size;
            }
        }else if( i > maxWomanIndex && size >= 1){
            if(i % 3 == 0){
                pushFigure({
                    color: color,
                    size: Math.floor( size ),
                });    
                validNo++;
            }
        }

        canvasCTX.fillStyle = color;

        canvasCTX.fillRect(x, AHEIGHT - size*(AHEIGHT/16), barWidth, size*(AHEIGHT/16));    

        avgPowerSum += barHeight;
        rmsPowerSum += barHeight*barHeight;

        x += barWidth + 1;

    }

    let avgPower = Math.floor (avgPowerSum / bufferLengthAlt);
    let rmsPower = Math.floor (Math.sqrt(rmsPowerSum / bufferLengthAlt));
    let avgSize = Math.floor (sizeSum/validNo);

    // console.log(`maxman: ${biasFreq}, valid:${validNo},min:${minPower},max:${maxPower},manNo:${manSum},womNo:${womanSum},ultra:${ultraSum},low:${lowSum}`);
    // 

    // requestAnimationFrame(procesLoop);
}

async function processAnalysis(ctx){
    let analyser = ctx.createAnalyser();
    analyser.minDecibels = -96;
    analyser.maxDecibels = -10;
    analyser.smoothingTimeConstant = 0.85;
    analyser.fftSize = FFT_SIZE;
    bufferLengthAlt = analyser.frequencyBinCount;
    console.log(bufferLengthAlt);
    frequencyArray = new Uint8Array(bufferLengthAlt);

    let maxFrequency = analyser.frequencyBinCount * SAMPLE_RATE/FFT_SIZE;


    // manIndex  = Math.floor(manFreq * FFT_SIZE / SAMPLE_RATE);
    // womanIndex  = Math.floor(womanFreq * FFT_SIZE / SAMPLE_RATE);
    // radiusIndex = Math.floor(radiusFreq  * FFT_SIZE / SAMPLE_RATE);
    // finalIndex = Math.floor(finalFreq  * FFT_SIZE / SAMPLE_RATE);
    // maxIndex = Math.floor(maxFreq  * FFT_SIZE / SAMPLE_RATE);    


    // console.log(`frequence from 0hz to ${maxFrequency}, sampleRate: ${SAMPLE_RATE}, bitCount: ${bufferLengthAlt}`);
    // console.log(`man index : ${manIndex}, , woman index: ${womanIndex}, maxIndex: ${maxIndex} finalInde:${finalIndex}`);
    // console.log(`man index from ${minManIndex}, ${maxManIndex}, woman index from ${minWomanIndex}, to ${maxWomanIndex}`);

    return analyser;
}


let minManIndex;
let maxManIndex;
let minWomanIndex;
let maxWomanIndex;

let isFirstTime = true;
let usermic = null;
let monitorheight = 80;
let micMonitoring = false;
let micListening = false;

let manFreq = 140;
let womanFreq = 230;
let maxFreq = 1000;

// let manHue = 240;
// let womanHue = 60;
// let zeroHue = 180;
// let finalHue = 180;


async function initAudioNodes(){
    audioContext = new AudioContext({sampleRate: SAMPLE_RATE});
        
    console.log("sampleRate: ", audioContext.sampleRate);

    Tone.setContext(audioContext);
    usermic = new Tone.UserMedia();

    let node = await processMeter(audioContext);
    analysis = await processAnalysis(audioContext);

    let mointors = await processMonitor({
            fft: document.querySelector("#fftmonitor"),
            meter: document.querySelector("#metermonitor"),
            wave: document.querySelector("#wavemonitor"),
            height: monitorheight,
    });

    usermic.connect(node);
    usermic.connect(analysis);
    if(mointors.fft){usermic.connect(mointors.fft);}
    if(mointors.meter){usermic.connect(mointors.meter);}
    if(mointors.wave){usermic.connect(mointors.wave);}        
    
    // usermic.connect(audioContext.destination);

    usermic.open();    

    setInterval(procesLoop, 500);

}

function onMicrophoneDenied(e) {
    console.log('denied',e)
}

async function onMicrophoneGranted() {

    if (isFirstTime) {
        miclock = true;

        miclock = false;
        micListening = false;
        
        await initAudioNodes();

        micListening = true;
        miclock = false;
        isFirstTime = false;
    }else{
        let loop = 5;
        while(miclock && loop -- > 0){
            await sleep(1000);
        }
        if(miclock)return;
        miclock = true;
        await audioContext.resume();
        usermic.open();    
        
        await sleep(1000);
        micListening = true;
        console.log("audio context resumed..");
        miclock = false;

    }
}

async function onMicrophoneSuspend(){
    let loop = 5;
    while(miclock && loop -- > 0){
        await sleep(1000);
    }
    if(miclock)return;
    console.log("audio context suspend..");
    miclock = true;
    await audioContext.suspend();
    usermic.close();
    await sleep(1000);
    micListening = false;
    miclock = false;

}

function loadingAudion(button){


    // bind the interface
              

    const micButton = document.querySelector("tone-mic-button");
    const mButton = document.getElementById("microphone");
    const fftCanvas = document.getElementById("fftcanvas");

    AWIDTH = fftCanvas.width;
    AHEIGHT = fftCanvas.height;
    console.log(`fftcanvs width: ${AWIDTH}, height: ${AHEIGHT}`);

    micButton.supported = Tone.UserMedia.supported;
    // micButton.addEventListener("touch", () => {
        
    // micButton.addEventListener("close", () => {
    //     usermic.close();
    // });


    mButton.addEventListener("click", () => {
        
        if(micListening == false){
            // AudioContext.resume();
            navigator.mediaDevices.getUserMedia({ audio: true, video: false })
            .then(onMicrophoneGranted)
            .catch(onMicrophoneDenied);   
                
            mButton.classList.add("recording");
        }else{
            onMicrophoneSuspend();
            mButton.classList.remove("recording");
        }
            // usermic.open();
    });
    

}

