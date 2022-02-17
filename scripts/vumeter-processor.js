const SMOOTHING_FACTOR = 0.8;
const MINIMUM_VALUE = 0.00001;
registerProcessor('vumeter', class extends AudioWorkletProcessor {

  _volume
  _updateIntervalInMS
  _nextUpdateFrame

  constructor () {
    super();
    this._volume = 0;
    this._updateIntervalInMS = 25;
    this._nextUpdateFrame = this._updateIntervalInMS;
    this.port.onmessage = event => {
      if (event.data.updateIntervalInMS)
        this._updateIntervalInMS = event.data.updateIntervalInMS;
    }
  }

  get intervalInFrames () {
    return this._updateIntervalInMS / 1000 * sampleRate;
  }

  boolean 
  process (inputs, outputs, parameters) {
    const input = inputs[0];

    console.log("process input"+inputs.length+","+input.length + ", ");
    
    if (input.length > 0) {
        const samples = input[0];
      let sum = 0;
      let rms = 0;

      for (let i = 0; i < samples.length; ++i)
        sum += samples[i] * samples[i];

      rms = Math.sqrt(sum / samples.length);
      this._volume = Math.max(rms, this._volume * SMOOTHING_FACTOR);

      this._nextUpdateFrame -= samples.length;
      if (this._nextUpdateFrame < 0) {
        this._nextUpdateFrame += this.intervalInFrames;
        this.port.postMessage({volume: this._volume});
      }
    }else{
      this.port.postMessage({volume: -99});
      // console.log("reload window");
      return true;
    }
    
    return true;
  }
});