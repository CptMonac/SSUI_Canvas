/* Doodle Drawing Library
 *
 * Drawable and Primitive are base classes and have been implemented for you.
 * Do not modify them! 
 *
 * Stubs have been added to indicate where you need to complete the
 * implementation.
 * Please email me if you find any errors!
 */

/*
 * Root container for all drawable elements.
   Function: hold and draw all the elements in the doodle
 */
function Doodle (context)
{
    this.context = context;
    this.children = [];
}

Doodle.prototype.draw = function()
{
	//Draw all children
    for(var i = 0; i < this.children.length; i++)
    {
        this.children[i].draw(this.context);
    }
};


/* Base class for all drawable objects.
 * Do not modify this class!
 */
function Drawable (attrs)
{
    var dflt =
    { 
        left: 0,
        top: 0,
        visible: true,
    };
    attrs = mergeWithDefault(attrs, dflt);
    
    //Add property fields to drawable object
    for (var attribute in attrs)
    {
        this[attribute] = attrs[attribute];
    }
}

/*
 * Summary: Uses the passed in context object (passed in by a doodle object)
 * to draw itself.
 */
Drawable.prototype.draw = function(context)
{
    console.log("ERROR: Calling unimplemented draw method on drawable object.");
};


/* Base class for objects that cannot contain child objects.
 * Do not modify this class!
 */
function Primitive(attrs)
{
    var dflt = {
        lineWidth: 1,
        color: "black"
    };
    attrs = mergeWithDefault(attrs, dflt);
    Drawable.call(this, attrs);
    this.lineWidth = attrs.lineWidth;
    this.color = attrs.color;
}
Primitive.inheritsFrom(Drawable);


function Text(attrs)
{
    var dflt = 
    {
        content: "",
        fill: "black",
        font: "12pt Helvetica",
        height: 12
    };
    attrs = mergeWithDefault(attrs, dflt);
    Drawable.call(this, attrs);
}
Text.inheritsFrom(Drawable);

Text.prototype.draw = function (context)
{
    if (this.visible)
    {
        context.font = this.font;       //Set correct font property of context
        context.content = this.content; //Set text property of context   
        context.fillStyle = this.fill;  //Set text color property of context
        context.fillText(this.content, this.left, this.top+this.height); //Draw context
    }
};

function DoodleImage(attrs)
{
    var dflt =
    {
        width: -1,
        height: -1,
        src: "",
    };
    attrs = mergeWithDefault(attrs, dflt);
    Drawable.call(this, attrs);
}
DoodleImage.inheritsFrom(Drawable);

DoodleImage.prototype.draw = function(context)
{
    if (this.visible)
    {
        var img = new Image();
        var imageObject = this;
        img.src = this.src;
        img.onload = function()
        {
            //Restore clipping region -- it was removed before the image loaded
            context.save();
            context.beginPath();
            context.rect(imageObject.clipRegion.x, imageObject.clipRegion.y, imageObject.clipRegion.width, imageObject.clipRegion.height);
            context.clip();

            if ((imageObject.width != -1) && (imageObject.height != -1))
                context.drawImage(img,imageObject.left,imageObject.top, imageObject.width, imageObject.height);
            else
                context.drawImage(img,imageObject.left,imageObject.top);

            context.restore();
        }
    }
};


function Line(attrs)
{
    var dflt = {
        startX: 0,
        startY: 0,
        endX: 0,
        endY: 0
    };

    //Range checking
    if (attrs['startX'] < 0)
        attrs['startX'] = 0;
    if (attrs['startY'] < 0)
        attrs['startY'] = 0;
    //Merge default parameters
    attrs = mergeWithDefault(attrs, dflt);
    Primitive.call(this, attrs);
}
Line.inheritsFrom(Primitive);

Line.prototype.draw = function (context)
{
    if(this.visible)
    {
        //Draw line from start point to end point
        context.strokeStyle= this.color;
        context.lineWidth = this.lineWidth;
        context.beginPath();
        context.moveTo(this.startX, this.startY);
        context.lineTo(this.endX, this.endY);
        context.stroke();
    }
};


function Rectangle(attrs)
{
    var dflt = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    };
    attrs = mergeWithDefault(attrs, dflt);
    Primitive.call(this, attrs);
}
Rectangle.inheritsFrom(Primitive);

Rectangle.prototype.draw = function (context)
{
    if (this.visible)
    {    
        context.strokeStyle= this.color;
        context.lineWidth = this.lineWidth;
        context.beginPath();
        context.rect(this.x,this.y,this.width,this.height);
        context.stroke();
    }
};

function Container(attrs)
{
    var dflt = {
        width: 100,
        height: 100,
        fill: false,
        borderColor: "black",
        borderWidth: 0,
    };
    attrs = mergeWithDefault(attrs, dflt);
    Drawable.call(this, attrs);    
    this.children = [];
}
Container.inheritsFrom(Drawable);

Container.prototype.draw = function (context)
{
    if (this.visible)
    {   
        //Create clipping region for container
        context.save();         
        context.beginPath();
        context.rect(this.left,this.top,this.width,this.height);

        //Draw container
        if (this.borderWidth)
        {
            context.lineWidth   = this.borderWidth;
            context.strokeStyle = this.borderColor;
            context.stroke();
        }
        if (this.fill)      //Fill container if necessary
        {
            context.fillStyle = this.fill;
            context.fill();
        }
        context.clip();
   
        //Draw container children
        for (var i = 0; i < this.children.length; i++)
        {
            this.children[i].left+= this.left;
            this.children[i].top += this.top;
            this.children[i].clipRegion = {'x': this.left, 'y': this.top, 'width': this.width, 'height': this.height};
            this.children[i].draw(context);
            console.log(this.children[i])
        }
 
        //Remove container clipping region
        context.restore();
    }
};
