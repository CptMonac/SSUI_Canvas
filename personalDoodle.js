//Adapted from http://tympanus.net/codrops/2011/11/09/interactive-html5-typography/
function initialize()
{
    //Initialize default parameters
    window.particleDensity = 5;
    window.canvasWidth = 700;
    window.canvasHeight = 700;
    window.mouse = {x:0, y:0};
    window.applyEffect = false;
    window.explode = false;
    window.randomParticles = [];
    window.wiggleX = 2;
    window.wiggleY = 12;
    window.explodeCount = 0;

    //Configure canvas to fill browser window dynamically
    window.addEventListener('resize', reloadCanvas, false);

    //Draw canvas objects
    reloadCanvas();    
}

function reloadCanvas()
{
    //Get canvas reference and initialize
    window.canvas = document.getElementById("myCanvas");
    window.canvasHeight = 700;
    window.canvasWidth = window.innerWidth;
    window.context = canvas.getContext('2d');
    canvas.width  = canvasWidth;
    canvas.height = canvasHeight;
    canvas.addEventListener('mousemove', onMouseMove, false);
    canvas.addEventListener('mouseout', onMouseOut,  false );
    canvas.addEventListener('mousedown', onMouseDown, false);
    //canvas.addEventListener('mouseup', onMouseRelease, false);

    //Create background canvas
    window.bgCanvas  = document.createElement('canvas');
    window.bgContext = bgCanvas.getContext('2d');
    var honeycolors = ['#fff0a4', '#ffe98f', '#ffcf52', '#fbad1d', '#c48d1c'];
    var checkeredColors = ['8e324c', '563750', '3e3951', 'a14b4a', 'cc5247']
    var pantoneColors = ['d75c37','67727a', '6991ac', 'c3d7df'];
    var passionFruitColors = ['b4ac01', 'ecbb09', 'e86e1b', 'd41e46', '1b1521'];
    var roseWoodColors = ['460201', '901f0f', 'a92205'];
    window.colors = pantoneColors;

    bgCanvas.width = canvasWidth;
    bgCanvas.height = canvasHeight;

    //Load logo image and draw text on canvas
    var doodle = new Doodle(bgContext);
    var logoFont = '190px Prociono';
    bgContext.font = logoFont;
    var logoBorder = new Container({width: bgCanvas.width, height: bgCanvas.height, borderWidth: 1});
    var logoContent = 'Ayo Olubeko';
    var contentWidth = bgContext.measureText(logoContent).width + 15;
    var center = (canvasWidth/2) - (Math.round((contentWidth+140)/2));
    var logoText =  new Text({content: logoContent, font: logoFont, left: center, top: 210});
    var logoImage = new DoodleImage({src: 'https://dl.dropboxusercontent.com/s/6cy108r4meq5jz7/fedora.png', left: center+contentWidth, width: 120, height: 130, top: 120, callback: onImageLoad});
    doodle.children.push(logoBorder);
    doodle.children.push(logoText);
    doodle.children.push(logoImage);
    doodle.draw();
}

function onImageLoad()
{
    createParticulate();
    drawCanvas();
}

function onMouseMove(event)
{
    mouse.x = event.offsetX || (event.layerX - canvas.offsetLeft);
    mouse.y = event.offsetY || (event.layerY - canvas.offsetTop);

    if (!applyEffect)
    {
        applyEffect = true;
        //Draw after 70ms 
        window.drawTimeout = setTimeout(function()
        {
            drawCanvas();
            applyEffect = false;
            explode = false;
        }, 70);
    }
}

function onMouseOut(event)
{
    applyEffect = false;
    clearTimeout(drawTimeout);
    drawCanvas();
}

function onMouseDown(event)
{
    if ((!explode) && explodeCount < 1)
    {
        explode = true;
        for (var i = 0; i < particles.length; i++)
        {
            randomParticles.push({
                        color: colors[Math.floor(Math.random()* colors.length)],
                        x    : Math.floor(Math.random()* canvasWidth),
                        y    : Math.floor(Math.random()* canvasHeight)
                    });
        }
        //Explode after 70ms
        setTimeout(function()
        {
            drawCanvas();
        }, 70);
        explodeCount++
    }
}



//Scan over pixel data in canvas element and create corresponding particles
function createParticulate()
{
    window.particles = [];
    var pixel;
    var imageData = bgContext.getImageData(0,0, canvasWidth, canvasHeight).data;

    //Iterate horizontally over all pixels
    for (var width = 0; width < canvasWidth; width+= particleDensity)
    {
        //Iterate vertically over image row
        for (var height = 0; height < canvasHeight; height+= particleDensity)
        {
            //Get pixel located at current iteration
            pixel = imageData[((width + (height * canvasWidth)) * 4) - 1];

            //Particularize if pixel has text drawn on it.
            if (pixel == 255)
            {
                //Add particle coordinates along with random assigned color
                particles.push({
                    color: colors[Math.floor(Math.random()* colors.length)],
                    x    : width,
                    y    : height
                });
            }
        }
    }
    setInterval(drawCanvas, 250);
}

function drawCanvas()
{
    //Initialize drawing canvas
    context.clearRect(0, 0, canvasWidth, canvasHeight);

    //Draw background color
    context.fillStyle = '#f5f5f5';
    //context.fillStyle = '#231f20';
    context.fillRect(0,0, canvasWidth, canvasHeight);

    var dx, dy, distance;
    var scale = 1;

    //Draw previously stored particles
    var particleArray;
    if (explode)
        particleArray = randomParticles;
    else
        particleArray = particles;
    
    context.globalCompositeOperation = "source-over";
    context.fillStyle = "rgba(0,0,0,0.83)";
    context.fillRect(0, 0, canvasWidth, 265);
    for (var i = 0, len = particleArray.length; i < len; i++)
    {
        var particle = particleArray[i];
        dx = particle.x - mouse.x;
        dy = particle.y - mouse.y;

        //Calulate distance from mouse to particle
        distance = Math.sqrt((dx*dx) + (dy*dy));

        //Apply interactive effect
        (applyEffect) ? scale = Math.max(Math.min(10 - (distance/10), 5), 1) : scale = 1;
        context.fillStyle = particle.color;

        //Draw particle
        context.beginPath();
        
        //Randomly perturbate particles
        if (explode)
        {
            var finalPosition = particles[i];
            if ((finalPosition.x > particle.x) && (finalPosition.y > particle.y))
            {
                particle.x+=wiggleY;
                particle.y+=wiggleY;
            }
            else if ((finalPosition.x > particle.x) && (finalPosition.y < particle.y))
            {
                particle.x+=wiggleY;
                particle.y-=wiggleY;
            }
            else if ((finalPosition.x < particle.x) && (finalPosition.y > particle.y))
            {
                particle.x-=wiggleY;
                particle.y+=wiggleY;
            }
            else if ((finalPosition.x < particle.x) && (finalPosition.y < particle.y))
            {
                particle.x-=wiggleY;
                particle.y-=wiggleY;
            }
        }
        else
            particle.x += Math.random()* wiggleX;

        context.arc(particle.x, particle.y, 1.6* scale, 0, Math.PI * 2, true);
        context.closePath();
        context.fill();
    }
    if (!explode)   //Reverse wiggle direction
        wiggleX*= -1;
}

window.onload = initialize;

