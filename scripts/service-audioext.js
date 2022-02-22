
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
        let light = 100-volume;//Math.pow(volume/100, 2)*100;
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
        let maxVolume, minVolume;
        for(let v of vibratePeaks){
            maxVolume = Math.max(maxVolume, v.volume);
            minVolume = Math.min(maxVolume, v.volume);
        }
        //如果音量都差不多大，就应该不是人声。
        if(maxVolume - minVolume <= 3){
            return;
        }

        let i = 1;
        console.log("................Success................");
        for(let v of vibratePeaks){
            const peaks = v.peaks;
            const volume = v.volume;
            let string = `No${i++}. volume:${volume}.`;
            string += peaksToString(peaks);
            console.log(string);
        }
        console.log("................................");

        getSettingValue("vibrateRadius");
        let vibrateRadius = figures.vibrateRadius();
        let vibrations = [];


        for(let i = 0 ; i < 16 ; i ++ ){
            vibrations.push({x:vibrateRadius,y:0})
            vibrations.push({x:-vibrateRadius,y:0})
        }
        pushVibrate(vibrations)
        vibratePeaks = [];
        feedCanvas();
    }else{
        return;
        if(vibratePeaks.length > 0){
            console.log("________________FAIL________________");
            let i = 1;
            for(let v of vibratePeaks){
                const peaks = v.peaks;
                const volume = v.volume;
                let string = `No${i++}. volume:${volume}.`;
                string += peaksToString(peaks);
                console.log(string);
            }
            console.log("________________________________");    
        }

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
        if (peak.leftSlop < 1.2 && peak.rightSlop > -1.2) continue;
        if (peak.leftSlop < 0.5 || peak.rightSlop > -0.5) continue;

        //如果两边声音的差距比较小，就是电子声，不是人声。
        if ( Math.abs(peak.leftSlop + peak.rightSlop)/Math.abs(peak.leftSlop - peak.rightSlop) < 0.05)continue;

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
        let p2 = valids[i + 2];
        //如果峰值和峰值之间 能量差距太大,就算了
        if (Math.abs(p1.power - p0.power) / p0.power > 0.4) {
            // console.log("power to big:"+peaksToString(valids));
            // console.log("freq to big orginal:"+peaksToString(peaks));
            return null;
        }
        //如果峰值和峰值之间 频率差距太大,就算了
        if (Math.abs(p1.freq - p0.freq)  > 200) {
            // console.log("freq to big:"+peaksToString(valids));
            // console.log("freq to big orginal:"+peaksToString(peaks));
            return null;
        }
        //不是人声就算了
        if(p0.freq > 400){
            return null;
        }
        //左右偏离度太大，算了。
        if(Math.abs(p0.leftSlop + p0.rightSlop)/Math.min(p0.leftSlop, - p0.rightSlop) > 1){
            return null;
        }

        //如果两个步骤之间的频率，是几乎等步长的，说明是和弦。去掉
        // if(p2 != null){
        //     const freqStep = Math.abs(p1.freq - p0.freq)/ Math.abs(p2.freq - p1.freq);
        //     if( Math.abs(0.5 - freqStep) < 0.1 || Math.abs(1 - freqStep) < 0.1 || Math.abs(2 - freqStep) < 0.2 || Math.abs(4 - freqStep) < 0.2 ){
        //         return null;
        //     }    
        // }
    }
    return valids;
}
function peaksToString(peaks){
    let i = 1;
    let string = `len:${peaks.length}｜ `;
    for(let p of peaks){
        string += `f${p.freq.toFixed(0)},p${p.power},w${p.width.toFixed(0)},ls${p.leftSlop.toFixed(2)},rs${p.rightSlop.toFixed(2)}| `;
    }
    return string;
}