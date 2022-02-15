let audioContext
const ledColor = [
    "#064dac",
    "#064dac",
    "#064dac",
    "#06ac5b",
    "#15ac06",
    "#4bac06",
    "#80ac06",
    "#acaa06",
    "#ac8b06",
    "#ac5506",
]

let isFirtsClick = true
let listeing = false

function onMicrophoneDenied() {
    console.log('denied')
}

function setVolumns(vol) {
  pushFigure({
    size: vol,
  });

    // console.log("vol: "+ Math.round(vol));
    // let leds = [...document.getElementsByClassName('led')]
    // let range = leds.slice(0, Math.round(vol))

    // for (var i = 0; i < leds.length; i++) {
    //     leds[i].style.boxShadow = "-2px -2px 4px 0px #a7a7a73d inset, 2px 2px 4px 0px #0a0a0e5e inset";
    // }

    // for (var i = 0; i < range.length; i++) {
    //     range[i].style.boxShadow = `5px 2px 5px 0px #0a0a0e5e inset, -2px -2px 1px 0px #a7a7a73d inset, -2px -2px 30px 0px ${ledColor[i]} inset`;
    // }
}

async function onMicrophoneGranted(stream) {
    if (true) {
        console.log("active sound1");
        audioContext = new AudioContext()
        console.log("active sound2");
        await audioContext.audioWorklet.addModule('/scripts/vumeter-processor.js')
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
        microphone.connect(node).connect(audioContext.destination)

        // isFirtsClick = false
    }

    // let audioButton = document.getElementsByClassName('audio-control')[0]
    // if (listeing) {
    //     audioContext.suspend()
    //     audioButton.style.boxShadow = "-2px -2px 4px 0px #a7a7a73d, 2px 2px 4px 0px #0a0a0e5e"
    //     audioButton.style.fontSize = "25px"
    // } else {
    //     audioContext.resume()
    //     audioButton.style.boxShadow = "5px 2px 5px 0px #0a0a0e5e inset, -2px -2px 1px 0px #a7a7a73d inset"
    //     audioButton.style.fontSize = "24px"
    // }

    // listeing = !listeing
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

// document.getElementById('audio').addEventListener('click', () => {
//     activeSound()
// })



// function useVolume(stream) {
    
//     const onmessage = React.useCallback((event) => {
//       if (!ref.current.audioContext) {
//         return;
//       }
//       // let _volume = 0;
//       // let _sensibility = 5;
//       // const current = performance.now();
//       // if (ref.current.now && 120 > current - ref.current.now) {
//       //   console.log(current);
//       //   return;
//       // }
//       // ref.current.now = current;
//       if (event.data.volume) {
//         // _volume = event.data.volume;
//         setVolume(Math.round(event.data.volume * 200));
//       }
//       // console.log((_volume * 100) / _sensibility);
//       // setVolume(event.data.volume * 100);
//     }, []);
  
//     const disconnectAudioContext = React.useCallback(() => {
//       if (ref.current.node) {
//         try {
//           ref.current.node.disconnect();
//         } catch (errMsg) {}
//       }
//       if (ref.current.source) {
//         try {
//           ref.current.source.disconnect();
//         } catch (errMsg) {}
//       }
//       ref.current.node = null;
//       ref.current.source = null;
//       ref.current.audioContext = null;
//       setVolume(0);
//     }, []);
  
//     const connectAudioContext = React.useCallback(
//       async (mediaStream) => {
//         if (ref.current.audioContext) {
//           disconnectAudioContext();
//         }
//         try {
//           ref.current.audioContext = new AudioContext();
//           await ref.current.audioContext.audioWorklet.addModule('./worklet/vumeter.js');
//           if (!ref.current.audioContext) {
//             return;
//           }
//           ref.current.source = ref.current.audioContext.createMediaStreamSource(mediaStream);
//           ref.current.node = new AudioWorkletNode(ref.current.audioContext, 'vumeter');
//           ref.current.node.port.onmessage = onmessage;
//           ref.current.source.connect(ref.current.node).connect(ref.current.audioContext.destination);
//         } catch (errMsg) {
//           disconnectAudioContext();
//         }
//       },
//       [disconnectAudioContext, onmessage],
//     );
  
//     return volume;
// }
  


// const AudioWorkletNodeVolumeMeter = ({ stream, max, style }) => {
//     const volume = useVolume(stream);
//     return "<VolumeMeter volume={volume} max={max} style={style} />";
//   };
  
//   AudioWorkletNodeVolumeMeter.propTypes = {
//     stream: PropTypes.object,
//     max: PropTypes.number,
//     style: PropTypes.object,
//   };
  
//   AudioWorkletNodeVolumeMeter.defaultProps = {
//     stream: null,
//     max: 0,
//     style: null,
//   };


// function SoundMeter(context) {
//     this.context = context;
//     this.instant = 0.0;
//     this.slow = 0.0;
//     this.clip = 0.0;
//     this.script = context.createScriptProcessor(2048, 1, 1);
//     const that = this;
//     this.script.onaudioprocess = function(event) {
//       const input = event.inputBuffer.getChannelData(0);
//       let i;
//       let sum = 0.0;
//       let clipcount = 0;
//       for (i = 0; i < input.length; ++i) {
//         sum += input[i] * input[i];
//         if (Math.abs(input[i]) > 0.99) {
//           clipcount += 1;
//         }
//       }
//       that.instant = Math.sqrt(sum / input.length);
//       that.slow = 0.95 * that.slow + 0.05 * that.instant;
//       that.clip = clipcount / input.length;
//     };
// }
  
// SoundMeter.prototype.connectToSource = function(stream, callback) {
//     console.log('SoundMeter connecting');
//     try {
//       this.mic = this.context.createMediaStreamSource(stream);
//       this.mic.connect(this.script);
//       // necessary to make sample run, but should not be.
//       this.script.connect(this.context.destination);
//       if (typeof callback !== 'undefined') {
//         callback(null);
//       }
//     } catch (e) {
//       console.error(e);
//       if (typeof callback !== 'undefined') {
//         callback(e);
//       }
//     }
// };
  
// SoundMeter.prototype.stop = function() {
//     console.log('SoundMeter stopping');
//     this.mic.disconnect();
//     this.script.disconnect();
// };
  

// const constraints = window.constraints = {
//     audio: true,
//     video: false
//   };
  
//   let meterRefresh = null;
  
// function handleSuccess(stream) {
//     // Put variables in global scope to make them available to the
//     // browser console.
//     window.stream = stream;
//     const soundMeter = window.soundMeter = new SoundMeter(window.audioContext);
//     soundMeter.connectToSource(stream, function(e) {
//       if (e) {
//         alert(e);
//         return;
//       }
//     meterRefresh = setInterval(() => {
//         console.log("in: " + soundMeter.instant.toFixed(2)+ ", slow: " + soundMeter.slow.toFixed(2) + ", clip: "+ soundMeter.clip);
//       }, 200);
//     });
// }
  
// function handleError(error) {
//     console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
// }

// function startListening(){
//     try {
//         window.AudioContext = window.AudioContext || window.webkitAudioContext;
//         window.audioContext = new AudioContext();
//       } catch (e) {
//         alert('Web Audio API not supported.');
//       }
    
//       navigator.mediaDevices
//           .getUserMedia(constraints)
//           .then(handleSuccess)
//           .catch(handleError);
// }

// const audioContext = new AudioContext();
// audioContext.audioWorklet.addModule('./worklet/vumeter.js');
// const source = audioContext.createMediaStreamSource(mediaStream);
// const node = new AudioWorkletNode(audioContext, 'vumeter');
// node.port.onmessage = (event) => {
//   if (event.data.volume) {
//     console.log(Math.round(event.data.volume * 200));
//   }
// };
// source.connect(node).connect(audioContext.destination);

// /* eslint-disable no-underscore-dangle */
// const SMOOTHING_FACTOR = 0.8;
// // eslint-disable-next-line no-unused-vars
// const MINIMUM_VALUE = 0.00001;
// registerProcessor(
//   'vumeter',
//   class extends AudioWorkletProcessor {
//     _volume;
//     _updateIntervalInMS;
//     _nextUpdateFrame;

//     constructor() {
//       super();
//       this._volume = 0;
//       this._updateIntervalInMS = 25;
//       this._nextUpdateFrame = this._updateIntervalInMS;
//       this.port.onmessage = (event) => {
//         if (event.data.updateIntervalInMS) {
//           this._updateIntervalInMS = event.data.updateIntervalInMS;
//           // console.log(event.data.updateIntervalInMS);
//         }
//       };
//     }

//     get intervalInFrames() {
//       // eslint-disable-next-line no-undef
//       return (this._updateIntervalInMS / 1000) * sampleRate;
//     }

//     process(inputs, outputs, parameters) {
//       const input = inputs[0];

//       // Note that the input will be down-mixed to mono; however, if no inputs are
//       // connected then zero channels will be passed in.
//       if (0 < input.length) {
//         const samples = input[0];
//         let sum = 0;
//         let rms = 0;

//         // Calculated the squared-sum.
//         for (let i = 0; i < samples.length; i += 1) {
//           sum += samples[i] * samples[i];
//         }

//         // Calculate the RMS level and update the volume.
//         rms = Math.sqrt(sum / samples.length);
//         this._volume = Math.max(rms, this._volume * SMOOTHING_FACTOR);

//         // Update and sync the volume property with the main thread.
//         this._nextUpdateFrame -= samples.length;
//         if (0 > this._nextUpdateFrame) {
//           this._nextUpdateFrame += this.intervalInFrames;
//           this.port.postMessage({ volume: this._volume });
//         }
//       }

//       return true;
//     }
//   },
// );


// const player = document.getElementById('player');
// function getPeaksAtThreshold(data, threshold) {
//     var peaksArray = [];
//     var length = data.length;
//     for(var i = 0; i < length;) {
//         if (data[i] > threshold) {
//             peaksArray.push(i);
//         // Skip forward ~ 1/4s to get past this peak.
//             i += 10000;
//         }
//         i++;
//     }
//     return peaksArray;
// }

// function countIntervalsBetweenNearbyPeaks(peaks) {
//     var intervalCounts = [];
//     peaks.forEach(function(peak, index) {
//         for(var i = 0; i < 10; i++) {
//         var interval = peaks[index + i] - peak;
//         var foundInterval = intervalCounts.some(function(intervalCount) {
//             if (intervalCount.interval === interval)
//             return intervalCount.count++;
//         });
//         if (!foundInterval) {
//             intervalCounts.push({
//             interval: interval,
//             count: 1
//             });
//         }
//         }
//     });
//     return intervalCounts;
// }

// function groupNeighborsByTempo(intervalCounts) {
//     var tempoCounts = []
//     intervalCounts.forEach(function(intervalCount, i) {
//         // Convert an interval to tempo
//         var theoreticalTempo = 60 / (intervalCount.interval / 44100 );

//         // Adjust the tempo to fit within the 90-180 BPM range
//         while (theoreticalTempo < 90) theoreticalTempo *= 2;
//         while (theoreticalTempo > 180) theoreticalTempo /= 2;

//         var foundTempo = tempoCounts.some(function(tempoCount) {
//         if (tempoCount.tempo === theoreticalTempo)
//             return tempoCount.count += intervalCount.count;
//         });
//         if (!foundTempo) {
//         tempoCounts.push({
//             tempo: theoreticalTempo,
//             count: intervalCount.count
//         });
//         }
//     });
// }


// let max = 0;
// let min = 1;
// let lowpass = 1;
// const handleSuccess = function(stream) {
// const context = new AudioContext();
// const source = context.createMediaStreamSource(stream);
// const processor = context.createScriptProcessor(1024, 1, 1);

// source.connect(processor);
// processor.connect(context.destination);


// processor.onaudioprocess = function(e) {
//     let str =  e.inputBuffer.length +", duration: "+ e.inputBuffer.duration+", channels: " + e.inputBuffer.numberOfChannels ;
//     str +="\n";
//     let arraybuffer = e.inputBuffer.getChannelData(0);
//     for( let i  of arraybuffer){
//         if(i > max)max=Math.abs(i);
//         if(Math.abs(i) < min)min=Math.abs(i);
//     }
//     document.getElementById("audio").innerText = str+ ", max: " + max + ", min: " + min;
// // Do something with the data, e.g. convert it to WAV
// // console.log(e.inputBuffer);
// };
// };

