function visualShow(data){
    let range= data.range;
    let volume= data.volume;
    let freqWidth= data.freqWidth;
    let frequency= data.frequency;
    let maxFrequency = data.maxFrequency;
    let coloriterator = data.coloriterator;
    let colorStart = data.colorStart;

    if(volume < 1)return;

    let size = Math.sqrt(volume);
    let hue = (Math.floor(frequency/maxFrequency * 360* coloriterator)+colorStart + 360)%360;
    let light = 100-Math.sqrt(volume/100)*100;
    let color = `hsla(${hue},100%,${light}%,1)`;
    let edgeNo = Math.floor(Math.sqrt(freqWidth));
    if(edgeNo<3)edgeNo = 3;

    // console.log(`volume: ${volume}, size:${size}, color: ${color}, edgeNo: ${edgeNo}`);
    pushFigure({
        size: size,
        color: color,
        edgeNo: edgeNo,
    });
}