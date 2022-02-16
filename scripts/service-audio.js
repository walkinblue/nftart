let audioContext
function onMicrophoneDenied() {
    console.log('denied')
}

function setVolumns(vol) {
  pushFigure({
    size: vol,
  });
}
miclock = false;
micListening = false;
async function onMicrophoneGranted(stream) {
    if (true) {
        miclock = true;
        audioContext = new AudioContext()
        await audioContext.audioWorklet.addModule('/nftart/scripts/vumeter-processor.js')
        let microphone = audioContext.createMediaStreamSource(stream)

        const node = new AudioWorkletNode(audioContext, 'vumeter')
        node.port.onmessage  = event => {
            let _volume = 0
            let _sensibility = 5
            if (event.data.volume)
                _volume = event.data.volume;
            
            console.log("mic event", event.data);
            setVolumns((_volume * 100) / _sensibility)
        }
        microphone.connect(node).connect(audioContext.destination);
        // isFirstTime = false;
        micListening = true;
        miclock = false;
        
    }else{
        let loop = 5;
        while(miclock && loop -- > 0){
            await sleep(1000);
        }
        if(miclock)return;
        miclock = true;
        let result = await audioContext.resume();
        await sleep(1000);
        micListening = true;
        console.log("audio context resumed.." + result);
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
    await sleep(1000);
    micListening = false;
    miclock = false;
}
let isFirstTime = true;
let usermic = null;
let monitorheight = 160;

function loadingAudion(button){







    // bind the interface
              

    const micButton = document.querySelector("tone-mic-button");
    const mButton = document.getElementById("microphone");

    mButton.addEventListener("click", () => {
        if(micListening == false){
            navigator.mediaDevices.getUserMedia({ audio: true, video: false })
            .then(onMicrophoneGranted)
            .catch(onMicrophoneDenied);    
        }else{
            onMicrophoneSuspend();
        }
            // usermic.open();
    });

    micButton.supported = Tone.UserMedia.supported;
    micButton.addEventListener("open", () => {
        alert(1);
        usermic = new Tone.UserMedia();

        const micFFT = new Tone.FFT();
        usermic.connect(micFFT);
        fft({
            tone: micFFT,
            parent: document.querySelector("#fftmonitor"),
            height: monitorheight,
        });

        const micMeter = new Tone.Meter();
        usermic.connect(micMeter);
        meter({
            tone: micMeter,
            parent: document.querySelector("#metermonitor"),
            height: monitorheight,
        });

        const micWaveform = new Tone.Waveform();
        usermic.connect(micWaveform);
        waveform({
            tone: micWaveform,
            parent: document.querySelector("#wavemonitor"),
            height: monitorheight,
        });

        usermic.open();
        
    });
    
    micButton.addEventListener("close", () => {
        usermic.close()
    });
    
    

}

