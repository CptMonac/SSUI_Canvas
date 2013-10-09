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
    this.context = context;              //Stores canvas context
    this.children = [];                  //Holds children doodles.
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
        theta: 0
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
        
        //Rotate text if necessary
        context.save();
        if (this.theta != 0)
        {
            var contentWidth = context.measureText(this).width;
            var centerx = this.left + (this.contentWidth/2);
            var centery = this.top + (this.height/2);
            context.translate(centerx, centery);
            context.rotate(this.theta*Math.PI/180);
            context.translate(-centerx, -centery);
        }
        context.fillText(this.content, this.left, this.top+this.height); //Draw context
        context.restore();
    }
};

function DoodleImage(attrs)
{
    var dflt =
    {
        width: -1,
        height: -1,
        src: "",
        callback: false
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

        if (this.callback)
            img.crossOrigin = 'anonymous';
        
        img.onload = function()
        {
            context.save();
            console.log(imageObject);
            //Restore rotation --it was removed before image loaded
            if (imageObject.parentRotation !== undefined)
            {
                for (var i = 0; i < imageObject.parentRotation.length; i++)
                {
                    context.translate(imageObject.parentRotation[i].x, imageObject.parentRotation[i].y);
                    context.rotate(imageObject.parentRotation[i].theta * Math.PI/180);
                    context.translate(-imageObject.parentRotation[i].x, -imageObject.parentRotation[i].y);
                }
            }
            //Restore clipping region -- it was removed before the image loaded
            if (imageObject.clipRegion !== undefined)
            { 
                context.beginPath();
                context.rect(imageObject.clipRegion.x, imageObject.clipRegion.y, imageObject.clipRegion.width, imageObject.clipRegion.height);
                context.clip();
            }

            //Draw image
            if (imageObject.theta != 0)
            {
                var centerx = imageObject.left + (imageObject.width/2);
                var centery = imageObject.top  + (imageObject.height/2);
                context.translate(centerx, centery)
                context.rotate(imageObject.theta * Math.PI/180);
                context.translate(-centerx, -centery);
            }
            if ((imageObject.width != -1) && (imageObject.height != -1))
                context.drawImage(img,imageObject.left,imageObject.top, imageObject.width, imageObject.height);
            else
                context.drawImage(img,imageObject.left,imageObject.top);

            //Fire callback function if any included
            if (imageObject.callback)
                imageObject.callback();
            
            context.restore();
        }
        img.src = this.src;
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
        
        //Rotate line if necessary
        context.save();
        if (this.theta != 0)
        {
            var contentWidth = this.endX - this.startX;
            var centerx = this.left + (this.contentWidth/2);
            var centery = this.top + (this.height/2);
            context.translate(centerx, centery);
            context.rotate(this.theta*Math.PI/180);
            context.translate(-centerx, -centery);
        }
        context.beginPath();
        context.moveTo(this.startX, this.startY);
        context.lineTo(this.endX, this.endY);
        context.stroke();
        context.restore();
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
        
        //Rotate rectangle if necessary
        context.save();
        if (this.theta != 0)
        {
            var centerx = this.left + (this.width/2);
            var centery = this.top + (this.height/2);
            context.translate(centerx, centery);
            context.rotate(this.theta*Math.PI/180);
            context.translate(-centerx, -centery);
        }
        context.beginPath();
        context.rect(this.x,this.y,this.width,this.height);
        context.stroke();
        context.restore();
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
        
        //Rotate container if necessary
        context.save();
        if (this.theta != 0)
        {
            context.save();
            var centerx = this.left + (this.width/2);
            var centery = this.top + (this.height/2);
            context.translate(centerx, centery);
            context.rotate(this.theta*Math.PI/180)
            context.translate(-centerx, -centery);
        }

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
            //Save rotation context for children elements
            if ((this.theta != 0) && (this.parentRotation !== undefined))
            {
                this.children[i].parentRotation = [];
                for (var parentContext = 0; parentContext < this.parentRotation.length; parentContext++)
                {
                    this.children[i].parentRotation.push(this.parentRotation[i]);   
                }
                this.children[i].parentRotation.push({'x': centerx, 'y': centery, 'theta': this.theta});
            }
            else if (this.theta != 0)
            {
                this.children[i].parentRotation = [];
                this.children[i].parentRotation.push({'x': centerx, 'y': centery, 'theta': this.theta});
            }
            else if (this.parentRotation !== undefined)
            {
                this.children[i].parentRotation = [];
                for (var parentContext = 0; parentContext < this.parentRotation.length; parentContext++)
                {
                    this.children[i].parentRotation.push(this.parentRotation[i]);   
                }
            }
            this.children[i].draw(context);
        }
        //Restore context before translation and rotation
        context.restore();
 
        //Remove container clipping region
        context.restore();
    }
};
