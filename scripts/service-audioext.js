
let vibratePeaks = [];
let vibratePeaksCache = [];
function visualShow(data){
    let base = data.base;
    let peaks = data.peaks;
    let volume= base.volume;

    if(base.frequency && base.volume > 0){
        let range= base.range;
        let freqWidth= base.freqWidth;
        let frequency= base.frequency;
        let maxFrequency = base.maxFrequency;
        let coloriterator = base.coloriterator;
        let colorStart = base.colorStart;
    
        let size = Math.sqrt(volume);
        let hue = (Math.floor(frequency/maxFrequency * 360* coloriterator)+colorStart + 360)%360;
        let light = 100-Math.sqrt(volume/100)*100;
        let color = `hsla(${hue},100%,${light}%,1)`;
        let edgeNo = Math.floor(Math.sqrt(freqWidth));
        if(edgeNo<3)edgeNo = 3;
        pushFigure({
            size: size,
            color: color,
            edgeNo: edgeNo,
        });    
    }
    
    let valids = filterPeaks(peaks, volume);

    if(valids == null){
        vibratePeaks = vibratePeaksCache;
        vibratePeaksCache = [];
    }else{
        vibratePeaksCache.push({peaks: valids, volume:volume});
    }

    if(vibratePeaks.length >= 3){
        let i = 1;
        for(let v of vibratePeaks){
            const peaks = v.peaks;
            const volume = v.volume;
            let string = `No${i++}. volume:${volume}.`;
            string += peaksToString(peaks);
            console.log(string);
        }
        console.log("................");

        let vibrations = [];
        for(let i = 0 ; i < 16 ; i ++ ){
            vibrations.push({x:2,y:0})
            vibrations.push({x:-2,y:0})
        }
        pushVibrate(vibrations)
        vibratePeaks = [];
        feedCanvas();
    }


    // console.log(`volume: ${volume}, size:${size}, color: ${color}, edgeNo: ${edgeNo}`);
}

function filterPeaks(peaks, volume) {
    let valids = [];
    //声音太小就算了
    if (volume <= 10) return null;


    //过滤一下
    for (let peak of peaks) {
        //声音过于尖锐，不浑厚，跳过
        if (peak.width <= 20) continue;
        // console.log(`filter peaks loop ${peak.leftSlop}`);
        //两边声音不突出，跳过, 有一边ok也行。
        if (peak.leftSlop <= 1.0 && peak.rightSlop >= -1.0) continue;
        //非人声，跳过
        if (peak.freq > 1000) continue;
        valids.push(peak);
    }
    //如果没有有效峰值，或者只有单一峰值就算了
    if (valids.length < 2) return null;

    //如果峰值太多，可能是音乐，就算了。
    if (valids.length >= 8) return null;

    // console.log(`filter peaks ${volume} ${peaks.length} ${valids.length}`);

    
    for (let i = 0; i < 1; i++) {
        let p0 = valids[i];
        let p1 = valids[i + 1];
        //如果峰值和峰值之间 能量差距太大,就算了
        if (Math.abs(p1.power - p0.power) / p0.power > 0.4) {
            // console.log("power to big:"+peaksToString(valids));
            // console.log("freq to big orginal:"+peaksToString(peaks));
            return null;
        }
        //如果峰值和峰值之间 频率差距太大,就算了
        if (Math.abs(p1.freq - p0.freq)  > 300) {
            // console.log("freq to big:"+peaksToString(valids));
            // console.log("freq to big orginal:"+peaksToString(peaks));
            return null;
        }
    }
    return valids;
}
function peaksToString(peaks){
    let i = 1;
    let string = `peaks.len:${peaks.length},`;
    for(let p of peaks){
        string += `f${p.freq.toFixed(0)},p${p.power},w${p.width.toFixed(0)},ls${p.leftSlop.toFixed(2)},rs${p.rightSlop.toFixed(2)}|`;
    }
    return string;
}