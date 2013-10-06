//Adapted from http://tympanus.net/codrops/2011/11/09/interactive-html5-typography/
function initialize()
{
    //Initialize default parameters
    window.particleDensity = 4;
    window.canvasWidth = 700;
    window.canvasHeight = 700;
    window.mouse = {x:0, y:0};
    window.applyEffect = false;
    window.explode = false;
    window.magnetizedParticles = [];
    window.wiggleX = 2;
    window.wiggleY = 12;
    window.explodeCount = 0;

    //Configure canvas to fill browser window dynamically on size change
    //window.addEventListener('resize', initializeCanvas, false);

    init();
    //Draw canvas objects
    //initializeCanvas();    
}

function resetCanvas()
{
    console.log('Window resize event...');
    window.stateSequence.reset();
}

function init()
{
    //Initialize default parameters
    window.particleDensity = 5;     //Initialize particle density 
    window.canvasWidth = 700;       //Initialize canvas width
    window.canvasHeight = 700;      //Initialize canvas height
    window.mouse = {x:0, y:0};      //Initialize mouse location
    window.particles = [];          //Initialize container for particles
    window.attractionStrength = 30; //Size of the pulsing magnetic field
    window.innercoreSize = 15;      //Size of the inner magnetic core
    window.mincoreSize = 10;        //Minimum size of the inner magnetic core
    window.maxcoreSize = 15;        //Maximum size of the inner magnetic core
    window.darkBackground = '#f5f5f5';
    window.lightBackground = '#231f20';
    window.pulseDirection = 'outward';
    window.innercorePulseRate = 0.2;
    window.outercorePulseRate = 1.0;

    //Configure canvas to fill browser window dynamically on size change
    window.addEventListener('resize', resetCanvas, false);

    //Configure state machine to control flow
    window.stateSequence = StateMachine.create({
        events: [
        { name: 'startup', from: 'none', to: 'init'},
        { name: 'initiate', from: 'init', to: 'rest'},
        { name: 'explode',from: 'rest',  to: 'capture' },
        { name: 'implode', from: 'capture', to: 'rest'},
        { name: 'reset', from: ['rest', 'capture', 'release'], to: 'init'}
    ]});
    stateSequence.oninit = initializeCanvas;
    stateSequence.onexplode = null;
    stateSequence.onimplode = null;
    stateSequence.onrest = updateCanvas;
    stateSequence.oncapture = updateCanvas;
    stateSequence.startup();
}

function initializeCanvas(event, from, to, params)
{
    //Get canvas reference and initialize sizes
    window.canvas = document.getElementById("myCanvas");
    window.canvasHeight = 700;
    window.canvasWidth = window.innerWidth;
    canvas.width  = canvasWidth;
    canvas.height = canvasHeight;
    //Get canvas context
    window.context = canvas.getContext('2d');
    //Configure event listeners
    canvas.addEventListener('mousemove', onMouseMove, false);
    canvas.addEventListener('mousedown', onMouseDown, false);
    canvas.addEventListener('mouseup', onMouseRelease,false);

    //Create background canvas
    window.bgCanvas  = document.createElement('canvas');
    window.bgContext = bgCanvas.getContext('2d');
    //Initialize color swatches
    var honeycolors = ['#fff0a4', '#ffe98f', '#ffcf52', '#fbad1d', '#c48d1c'];
    var checkeredColors = ['8e324c', '563750', '3e3951', 'a14b4a', 'cc5247']
    var pantoneColors = ['d75c37','67727a', '6991ac', 'c3d7df'];
    var passionFruitColors = ['b4ac01', 'ecbb09', 'e86e1b', 'd41e46', '1b1521'];
    var roseWoodColors = ['460201', '901f0f', 'a92205'];
    window.colors = pantoneColors;

    //Initialize background canvas size
    bgCanvas.width = canvasWidth;
    bgCanvas.height = canvasHeight;

    //Load logo image and text onto canvas
    var doodle = new Doodle(bgContext);
    var logoFont = '190px Sancreek';
    var logoContent = 'Ayo Olubeko';
    bgContext.font = logoFont;
    var contentWidth = bgContext.measureText(logoContent).width;
    var center = (canvasWidth/2) - (Math.round((contentWidth)/2));
    var logoText =  new Text({content: logoContent, font: logoFont, top: 210});
    var ideaImage = 'https://dl.dropboxusercontent.com/s/45j85ir5wsyo5he/idea_bulb.png';
    var fedoraImage = 'https://dl.dropboxusercontent.com/s/6cy108r4meq5jz7/fedora.png';
    var phoenixImage = 'https://dl.dropboxusercontent.com/s/oqh5hw92r6q7obt/phoenix.png';
    var biohazardImage = 'https://dl.dropboxusercontent.com/s/goop38ceypd5ti9/biohazard.png'; 
    var crownImage = 'https://dl.dropboxusercontent.com/s/9n61seugw3pe7dh/crown-image.png';
    var logoImage = new DoodleImage({src: crownImage, left: center+contentWidth+80, width: 400, height: 130, top: 110, callback: onImageLoad});
    window.xscale = canvasWidth/(contentWidth+logoImage.width);
    window.yscale = 1;
    bgContext.scale(xscale, yscale);

    //Draw text and image onto canvas
    doodle.children.push(logoText);
    doodle.children.push(logoImage);
    doodle.draw();
}

//This function executes the draw function after the image is loaded.
function onImageLoad()
{
    createParticulate();        //Create particles from text data
    drawCanvas();               //Draw particles onto canvas
    stateSequence.initiate();   //Transition to next state
}

function updateCanvas(event,from,to,params)
{
    //Redraw canvas every 30ms
    window.timer = setInterval(drawCanvas, 30);
}

//Updates mouse position on mouse movements
function onMouseMove(event)
{
    //Set the mouse position relative to the canvas container element.
    mouse.x = event.offsetX || (event.layerX - canvas.offsetLeft);
    mouse.y = event.offsetY || (event.layerY - canvas.offsetTop);
}

function onMouseDown(event)
{
    //Error checking
    if (stateSequence.current != 'rest')
    {
        console.error('Mouse down event: unexpected fsm state ->'+ stateSequence.current);
        return;
    }
    
    //Stop canvas update
    window.clearInterval(window.timer);
    //Increase magnetic field strength
    mincoreSize*=2;
    maxcoreSize*=2;
    attractionStrength = maxcoreSize;
    var angleStep = ((2*Math.PI) / (particles.length));
    var angle = 0;
    for (var i = 0; i < particles.length; i++)
        {
            magnetizedParticles.push({
                        color: colors[Math.floor(Math.random()* colors.length)],
                        x    : Math.floor(mouse.x +(attractionStrength * Math.cos(angle))),
                        y    : Math.floor(mouse.y +(attractionStrength * Math.sin(angle))),
                        scale: 1,
                        pulse: true,
                        angle: angle
                    });
            angle+= angleStep;
        }
    //Perform state transition
    stateSequence.explode();
}

function onMouseRelease(event)
{
    //Error checking
    if (stateSequence.current != 'capture')
    {
        console.error('Mouse release event: unexpected fsm state ->'+ stateSequence.current);
        return;
    }

    //Stop canvas update
    window.clearInterval(window.timer);
    //Decrease magnetic field strength
    mincoreSize/=2;
    maxcoreSize/=2;
    attractionStrength = maxcoreSize;
    //Perform state transition
    stateSequence.implode();
}

//Scan over pixel data in canvas element and create corresponding particles
function createParticulate()
{
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
                    y    : height,
                    scale: 1,
                    pulse: false,
                    angle: null
                });
            }
        }
    }
}

function drawParticles()
{
    var dx, dy, distance;       //Stores calculated distances

    if (stateSequence.current == 'rest')
        window.particleContainer = particles;
    else if (stateSequence.current == 'capture')
        window.particleContainer = magnetizedParticles;
        
    //Draw all particles in container
    for (var i = 0, len = particleContainer.length; i < len; i++)
    {
        var particle = particleContainer[i];
        //Calulate distance from mouse to particle
        dx = particle.x - mouse.x;
        dy = particle.y - mouse.y;
        distance = Math.sqrt((dx*dx) + (dy*dy));

        //Apply interactive effect
        if (distance <= attractionStrength)
            particle.pulse = true;
        else
            particle.scale = Math.max(Math.min(10 - (distance/10), 5), 1);
        
        //Draw particle
        context.beginPath();
        context.fillStyle = particle.color;
        context.arc(particle.x, particle.y,1.6*particle.scale, 0, Math.PI * 2, true);
        context.closePath();
        context.fill();

        //Update particle position if needed
        if (particle.angle != null)
        {
            particle.x = Math.floor(mouse.x +(attractionStrength * Math.cos(particle.angle)));
            particle.y = Math.floor(mouse.y +(attractionStrength * Math.sin(particle.angle)));
        }
    }
}

//Draws pulsing magnetic field around mouse cursor and particles
function drawPulseAction()
{
    var gradient = context.createRadialGradient(mouse.x,mouse.y,innercoreSize,mouse.x,mouse.y,attractionStrength);
    gradient.addColorStop(0, 'rgba(240,0,0,0.9)');
    gradient.addColorStop(1, 'rgba(230,0,0,0.4)');
    context.beginPath();
    context.fillStyle = gradient;
    context.arc(mouse.x,mouse.y,window.attractionStrength*1.6,0,Math.PI * 2,true);
    context.fill();

    //Configure pulsing cursor action
    if (pulseDirection == 'outward')
    {
        if (innercoreSize < maxcoreSize)
        {    
            innercoreSize+=innercorePulseRate;
            attractionStrength+=outercorePulseRate;

            //Configure pulsing particle action
            for (var i = 0; i < particleContainer.length; i++)
            {
                if (particleContainer[i].pulse)
                    particleContainer[i].scale+=innercorePulseRate;
            }

        }
        else
            pulseDirection = 'inward';
    }
    else if (pulseDirection == 'inward')
    {
        if (innercoreSize > mincoreSize)
        {
            innercoreSize-=innercorePulseRate;
            if (attractionStrength > 10)
                attractionStrength-=outercorePulseRate;

            //Configure pulsing particle action
            for (var i = 0; i < particleContainer.length; i++)
            {
                if (particleContainer[i].pulse)
                    particleContainer[i].scale-=innercorePulseRate;
            }
        }
        else
            pulseDirection = 'outward';
    }
}

function drawCanvas()
{
    //Initialize drawing canvas
    context.clearRect(0, 0, canvasWidth, canvasHeight);

    //Draw background color
    context.fillStyle = window.darkBackground;
    context.fillRect(0,0, canvasWidth, canvasHeight);

    //Draw particle banner
    context.globalCompositeOperation = "source-over";
    context.fillStyle = "rgba(0,0,0,0.83)";
    context.fillRect(0, 0, canvasWidth, 265);

    //Draw canvas objects
    if (stateSequence.current != 'init')
    {
        drawParticles();
        drawPulseAction();
        if (stateSequence.current == 'capture') //Draw stroked text
        {
            context.save();
            context.font = '170px Sancreek';
            context.strokeText('Ayo Olubeko',10,220);
            context.scale(window.xscale, window.yscale);
            context.restore();
        }
    }
}

window.onload = initialize;

