
function drawStar(ctx, star, time){
    let radius = star.radius;
    let lastTime = star.lastTime;
    let x = star.x;
    let y = star.y;
    let edge = star.edge;
    let initAngle = star.angle;


    let enlarge = (time - lastTime)/1000/2 + 1.0;    
    let rotateAngle = (((2*Math.PI)/60)*time.getSeconds() + ((2*Math.PI)/60000)*time.getMilliseconds())*4 + initAngle;
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

    ctx.beginPath();
    for(let i = 0 ; i < horn ; i ++ ){
        ctx.lineTo(points[i].x, points[i].y);
        if(edge > 3){
            ctx.lineTo(inpoints[i].x, inpoints[i].y);
        }
    }
    ctx.closePath();
    ctx.lineWidth = lineWidth+"";
    ctx.strokeStyle = "#444444";
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.stroke();

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
        if( born + living < time.getTime()){
            // console.log("lasttime: " + born + ", living " + living + ", timstamp: "+ (time.getTime() - born));
            figures.items.splice(i,1);
        }else if(radius > figures.width){
            figures.items.splice(i,1);
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
        edge: 5,
        x: Math.floor(Math.random()*figures.width),
        y: Math.floor(Math.random()*figures.height),
        angle: Math.floor(Math.random()*360),
        living: 1000*size,
        lastTime: Date.now(),
        born: Date.now(),
    };

    figures.items.push(figure);
}
