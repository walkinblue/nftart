let enlargeSpeed = 40;
let livingTimes = 1000;
let edgeNo = 5;
let colorful = "rgba(0,1,1,#)";
let fadetime = 429*6;
let rotateSpeed = 4
let background = "rgba(255,255,255,1)";
const bpm = 429;

function drawStar(ctx, star, time){
    let radius = star.radius;
    let lastTime = star.lastTime;
    let x = star.x;
    let y = star.y;
    let edge = star.edge;
    let initAngle = star.angle;
    let color = star.color;
    let born = star.born;
    let living = star.living;
    let rotateDirection = star.rotateDirection;

    let fadeRate = (born + living + fadetime- time.getTime()) / fadetime;
    
    // console.log(`rotateDirection: ${rotateDirection}`);
    if(fadeRate > 1) fadeRate = 1;
    else if(fadeRate < 0)fadeRate = 0;
    color = replaceAlpha(color, fadeRate);

    let enlarge = (time - lastTime)*enlargeSpeed/(bpm*400) + 1.0;    
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

    // ctx.translate(x, y);
    // ctx.rotate( rotateAngle*3 );

    // ctx.translate(-x, -y);
    // ctx.rotate( -rotateAngle*3 );

    star.radius = radius * enlarge;
    star.lastTime = time;
    // console.log("radius : " + star.radius + ", " + enlarge + ", initangle: "+ initAngle);
}


function flash(){
    let width = figures.width;
    let height = figures.height;
    let items = figures.items;

    ctx.globalCompositeOperation = 'destination-over';
    ctx.clearRect(0,0,width,height); // clear canvas

    var time = new Date();
    for(let i = 0 ; i < items.length ; i ++ ){

        const item = items[i];
        const living = item.living;
        const born = item.born;
        const radius = item.radius;
        if( born + living + fadetime < time.getTime()){
            // console.log("lasttime: " + born + ", living " + living + ", timstamp: "+ (time.getTime() - born));
            figures.items.splice(i,1);
        // }else if(radius > figures.width){
        //     figures.items.splice(i,1);
        }else{
            // console.log("flash item drawing" );
            drawStar(ctx, item, time);
        }
    }
    window.requestAnimationFrame(flash);
}

var ctx = null;
var figures = {
    items:[]
};

function pushFigure(data){
    // console.log("push figure " + data.size);
    let size = data.size;
    if(size == 0)return;
    // return;
    let figure = {
        radius: figures.radius,
        edge: edgeNo,
        x: Math.floor(Math.random()*figures.width),
        y: Math.floor(Math.random()*figures.height),
        angle: Math.floor(Math.random()*360),
        living: livingTimes*size,
        lastTime: Date.now(),
        born: Date.now(),
        color: convertToColor(size),
        rotateDirection: Math.floor(Math.random()*2)*2-1,
    };

    figures.items.push(figure);
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