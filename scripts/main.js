
let isRecording = false;
function loading(){
    let height = window.innerHeight;
    let width = window.innerWidth;
    //console.log(`${screen.width}, ${window.innerHeight}`);
    let canvas = document.getElementById('canvas');
    canvas.height = height;
    canvas.width = width;
    ctx = document.getElementById('canvas').getContext('2d');

    figures = {
        width: width,
        height: height,
        radius: height/200,
        items: []
    };

    flash();

    pushFigure({
        size: 10
    });

    document.getElementById('microphone').addEventListener('click', () => {
        activeSound();
        document.getElementById('microphone').classList.add("recording");
        isRecording = !isRecording;
    })

    // activeSound();
    // startListening();
    // draw();
    // setInterval(function(){draw();},1000/60);

}