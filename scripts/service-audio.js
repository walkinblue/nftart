let audioContext
function onMicrophoneDenied(e) {
    console.log('denied',e)
}

function setVolumns(vol, inputs, input) {
    document.getElementById("debug").innerText += `v: ${vol}\ninputs ${inputs}, input: ${input}\n`;
  pushFigure({
    size: vol,
  });
}
miclock = false;
micListening = false;
watchRefresh = false;
node = null;
async function onMicrophoneGranted(stream) {

    if (isFirstTime) {
        miclock = true;

        audioContext = new AudioContext();
        Tone.setContext(audioContext);

        await audioContext.audioWorklet.addModule('/nftart/scripts/vumeter-processor.js')
        
        let microphone = audioContext.createMediaStreamSource(stream)

        node = new AudioWorkletNode(audioContext, 'vumeter')
        
        // node.onprocessorerror(function(e){
        //     console.log("process error",e)
        // })

        node.port.onmessage  = event => {
            let _volume = 0
            let _sensibility = 5
            if (event.data.volume)
                _volume = event.data.volume;
            
            // console.log("mic event", event.data.volume);
            if(_volume < 0){
                window.location.reload();
                return;
            }
            
            setVolumns((_volume * 100) / _sensibility, event.data.inputs, event.data.input)
        }
        microphone.connect(node).connect(audioContext.destination);
        micListening = true;
        miclock = false;
        


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
let isFirstTime = true;
let usermic = null;
let monitorheight = 80;
let micMonitoring = false;

function loadingAudion(button){




    // bind the interface
              

    const micButton = document.querySelector("tone-mic-button");
    const mButton = document.getElementById("microphone");

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

