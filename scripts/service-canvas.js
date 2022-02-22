
let colorful = "rgba(0,1,1,#)";
let background = "rgba(255,255,255,1)";
const BPM = 429;

function drawStar(ctx, star, time){
    let radius = star.radius;
    let lastTime = star.lastTime;
    let x = star.x;
    let y = star.y;
    let edge = star.edge;
    let initAngle = star.angle;
    let color = star.color;
    let rotateDirection = star.rotateDirection;
    let enlargeSpeed = star.enlargeSpeed;
    let fadetime = star.fadetime;
    let rotateSpeed = star.rotateSpeed;
    let status = star.status;
    

    let enlarge = (time - lastTime)*enlargeSpeed/(BPM*400) + 1.0;    
    
    if(status.label == "deaded"){
        let fadeRate = (status.nextTime - time.getTime()) / fadetime;
        if(fadeRate > 1) fadeRate = 1;
        else if(fadeRate < 0)fadeRate = 0;
        fadeRate = Math.pow(fadeRate, 2);
        color = replaceAlpha(color, fadeRate);    
        enlarge = Math.sqrt(enlarge);    
    }
    


    // console.log(`color: ${color} ${fadeRate} ${fadetime} ${living} ${born} ${time}`);
    
    let rotateAngle = (((2*Math.PI)/60)*time.getSeconds() + ((2*Math.PI)/60000)*time.getMilliseconds())*rotateSpeed*rotateDirection + initAngle;
    let inRadius = radius/2;
    let lineWidth = radius/25;
    let horn = edge; 
    let angle = 360/horn; 
    let inAngle = 360/edge/2;

    let points = [];
    let inpoints = [];

    for(let i = 0 ; i < horn ; i ++ ){
        let xd = Math.cos((0 + i * angle) / 180 * Math.PI + rotateAngle) * radius;
        let yd = Math.sin((0 + i * angle) / 180 * Math.PI + rotateAngle) * radius;
        points.push({x:xd +x, y:yd +y});

        let ixd = Math.cos((inAngle + i * angle) / 180 * Math.PI + rotateAngle) * inRadius;
        let iyd = Math.sin((inAngle + i * angle) / 180 * Math.PI + rotateAngle) * inRadius;
        inpoints.push({x:ixd +x, y:iyd +y});
    }

    // console.log("color: " + color);
    ctx.lineWidth = lineWidth+"";
    ctx.strokeStyle = color;
    ctx.fillStyle = color;


    ctx.beginPath();
    for(let i = 0 ; i < horn ; i ++ ){
        ctx.lineTo(points[i].x, points[i].y);
        if(edge > 3){
            ctx.lineTo(inpoints[i].x, inpoints[i].y);
        }
    }
    ctx.closePath();

    // ctx.stroke();
    ctx.fill();

    star.radius = radius * enlarge;
    star.lastTime = time;            
    // console.log("radius : " + star.radius + ", " + enlarge + ", initangle: "+ initAngle);
}

function flash(){
    const width = figures.width();
    const height = figures.height();
    const items = figures.items;
    const canvas = figures.canvas;
    const ctx = figures.context;
    const feedColor = figures.feedColor();
    const vibrates = figures.vibrates;
    const sizeLimit = figures.sizeLimit();

    let vibrate = null;
    if(vibrates.length > 0)vibrate = vibrates.splice(0,1)[0];

    canvas.height = height;
    canvas.width = width;

    // console.log(`flash width ${width} height: ${height}, sizeLimit${sizeLimit}`);

    ctx.globalCompositeOperation = 'destination-over';
    ctx.clearRect(0,0,width,height); // clear canvas

    if(vibrate){
        // console.log(`vibrate ${vibrate}`, vibrate);
        ctx.translate(vibrate.x, vibrate.y);
    }
    // ctx.fillStyle =  feedColor;
    // canvas.style.feedColor = figures.feedColor();
    var time = new Date();
    for(let i = 0 ; i < items.length ; i ++ ){
        const item = items[i];
        // const living = item.living;
        // const born = item.born;
        const radius = item.radius;
        const fadetime = item.fadetime;
        // const period = living + fadetime;
        // const statusTime = born + living;
        // const disappareTime = born + living + ;
        const status = item.status.label;
        const statusNextTime = item.status.nextTime;

        if(status == "living" && statusNextTime < time.getTime()){
            item.status.label = "deaded";
            item.status.nextTime = statusNextTime + fadetime;
            drawStar(ctx, item, time);
        }else if(status == "living" && radius > sizeLimit){
            item.status.label = "deaded";
            item.status.nextTime = time.getTime() + fadetime;
            drawStar(ctx, item, time);
        }else if(status == "deaded" && statusNextTime < time.getTime()){
            item.status.label = "disappare";
            figures.items.splice(i,1);
        }else{
            drawStar(ctx, item, time);
        }
        
    }
    // if(vibrate){
    //     ctx.translate(-vibrate.x, -vibrate.y);
    // }
    ctx.save();
    
    let grad = ctx.createRadialGradient(width/2, height/2, width/10, width/2, height/2, height);
    grad.addColorStop(0, "rgba(255,255,255,0)");
    grad.addColorStop(1, feedColor);
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,width,height);
    ctx.restore();

    window.requestAnimationFrame(flash);
}


function loadFlash(data){
    let width = data.width;
    let height = data.height;
    let radius = data.radius;
    let canvas = document.querySelector(data.canvas);
    let context = canvas.getContext('2d');
    let backgroundColor = data.backgroundColor;
    let feedColorValue = data.backgroundColor();
    let sizeLimit = data.sizeLimit;
    let vibrateRadius = data.vibrateRadius;

    let feedColor = function(){
        let backgroundColor = figures.backgroundColor();
        let feedColorValue = figures.feedColorValue;
        let startIndex = feedColorValue.lastIndexOf(",") + 1;
        if(feedColorValue.substring(0, startIndex) != backgroundColor.substring(0, startIndex)){
            feedColorValue = backgroundColor;
            figures.feedColorValue = feedColorValue;
        }        
        return figures.feedColorValue;
    };

    let items = [];
    let vibrates = [];
    figures = {
        width: width,
        height: height,
        radius : radius,
        canvas: canvas,
        context: context,
        items: items,
        vibrates: vibrates,
        backgroundColor: backgroundColor,
        feedColor: feedColor,
        feedColorValue: feedColorValue,
        sizeLimit: sizeLimit,
        vibrateRadius: vibrateRadius,
    };
    flash();
}

var ctx = null;
var figures = {
    items:[]
};

function setBackground(){
    const canvas = figures.canvas;
    const ctx = figures.context;

}

function pushVibrate(data){
    for(let d of data)
        figures.vibrates.push(d);
}


function feedCanvas(){
    let feedColorValue = figures.feedColorValue;
    let startIndex = feedColorValue.lastIndexOf(",") + 1;
    let endIndex = feedColorValue.length - 1;
    let alpha = parseFloat(feedColorValue.substring(startIndex, endIndex));
    if(alpha < 1.0){
        alpha += 0.1;
    }else{
        return;
    } 
    feedColorValue = feedColorValue.substring(0, startIndex)+alpha.toFixed(2)+")";
    // console.log(`canvas alpha ${alpha} ${feedColorValue} ${figures.feedColorValue}`);
    figures.feedColorValue = feedColorValue;
}

function pushFigure(data){
    // console.log(`pushFigure: ${data.color}`);
    let color = data.color;
    let edgeNo = data.edgeNo;
    let livingTimes = getSettingValue("livingTimes");
    let enlargeSpeed = getSettingValue("enlargeSpeed");
    let rotateSpeed = getSettingValue("rotateSpeed");
    let fadetime = getSettingValue("fadetime");
    let volumeTimes = getSettingValue("volumeTimes");
    let size = data.size*volumeTimes;
    let width = figures.width();
    let height = figures.height();
    let radius = figures.radius();
    

    // console.log(`push width ${width}, height${height}, ${livingTimes} ${size}`);

    if(size == 0)return;
    // return;
    let figure = {
        radius: radius * Math.sqrt(size),
        edge: convertEdge(edgeNo),
        x: Math.floor(Math.random()*width),
        y: Math.floor(Math.random()*height),
        angle: Math.floor(Math.random()*360),
        living: livingTimes*size,
        lastTime: Date.now(),
        born: Date.now(),
        color: color,
        rotateDirection: Math.floor(Math.random()*2)*2-1,
        enlargeSpeed: enlargeSpeed,
        rotateSpeed: rotateSpeed,
        fadetime: fadetime,
        status: {
            label: "living",
            nextTime: livingTimes*size + Date.now(),
        },
    };

    figures.items.push(figure);
}


function convertEdge(edgeNo){
    if(edgeNo == "*"){
        return Math.floor(Math.random()*10) + 3;
    }
    return parseInt(edgeNo);
}
function convertToColor(s){
    let size = Math.floor(s);
    if(size > 16)size = 16;
    // if(size == 0)
    //     return replaceColor("F");
    // else if(size == 1)
    //     return replaceColor("E");
    // else if(size == 2)
    //     return replaceColor("D");
    // else if(size == 3)
    //     return replaceColor("C");
    // else if(size == 4)
    //     return replaceColor("B");
    // else if(size == 5)
    //     return replaceColor("A");
    // else if(size >= 15){
    //     return "#000000";
    // }
    return replaceColor(colorful, (15-size)*17);
}
function replaceColor(template, c){
    if(template == "*"){
        return "rgba("+Math.floor(Math.random()*2)*c+","+Math.floor(Math.random()*2)*c+","+Math.floor(Math.random()*2)*c+",1)";
    }

    return template.replace(/1/g,c+"").replace("#", "1");
}
function replaceAlpha(color, a){
    // console.log(`replace alpha: ${color}, ${a}`);
    return color.replace(/,[0-9.]+\)/g, ","+a+")");
}
function reverseColor(color){
    let ocolor = color.substr(5,color.length-3-5);
    let numbers = ocolor.split(",");
    let no = [];
    for(let n of numbers){
        no.push(255-parseInt(n));
    }
    let rcolor = "rgba("+no[0]+","+no[1]+","+no[2]+",1)";
    // console.log("reverse color "+color+"," + ocolor + "," + rcolor);
    return rcolor;
}

// let enlargeSpeed = 40;
// let livingTimes = 1600;
// let edgeNo = 5;
// let fadetime = 3000;
// let rotateSpeed = 4
// let volumeTimes = 1;
