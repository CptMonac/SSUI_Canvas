function initialize()
{
    //Configure canvas to fill browser window dynamically
    window.addEventListener('resize', resizeCanvas, false);

    //Draw canvas objects
    resizeCanvas();    
}

function drawCanvas()
{
    var canvas = document.getElementById("myCanvas");
    var context = canvas.getContext("2d");

    //Create doodle object
    var doodle = new Doodle(context);
    doodle.enableMouseFollow = true;
    context.save();

    //Draw objects on doodle
    var border = new Container({width: canvas.width, height: canvas.height, borderWidth: 1});
    var logoName = new Text({content: "Ayo Olubeko", font: '16pt Helvetica', enableMouseFollow: true});
    doodle.children.push(border);
    doodle.children.push(logoName);
    doodle.draw();
}

function resizeCanvas()
{
    var canvas = document.getElementById("myCanvas");
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    drawCanvas();
}

window.onload = initialize;

