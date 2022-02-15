let audioContext
function onMicrophoneDenied() {
    console.log('denied')
}

function setVolumns(vol) {
  pushFigure({
    size: vol,
  });
}

async function onMicrophoneGranted(stream) {
    if (true) {
        console.log("active sound1");
        audioContext = new AudioContext()
        console.log("active sound2");
        await audioContext.audioWorklet.addModule('scripts/vumeter-processor.js')
        console.log("active sound3");
        let microphone = audioContext.createMediaStreamSource(stream)
        console.log("active sound4");

        const node = new AudioWorkletNode(audioContext, 'vumeter')
        node.port.onmessage  = event => {
            let _volume = 0
            let _sensibility = 5
            if (event.data.volume)
                _volume = event.data.volume;
            setVolumns((_volume * 100) / _sensibility)
        }
        microphone.connect(node).connect(audioContext.destination);
    }
}

function activeSound () {
    console.log("active sound0");
    try {
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        
        navigator.getUserMedia(
            { audio: true, video: false },
            onMicrophoneGranted,
            onMicrophoneDenied
        );

    } catch(e) {
        console.error(e);
    }
}
