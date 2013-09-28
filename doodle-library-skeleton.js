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
        this.children[i].draw();
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
    this.attrs = attrs;
}

/*
 * Summary: Uses the passed in context object (passed in by a doodle object)
 * to draw itself.
 */
Drawable.prototype.draw = function(context)
{
    //Pass in attributes to context object
    for (var attribute in this.attrs)
    {
        context[attribute] = this.attrs[attribute];
    }

    //Draw drawable to screen
};


/* Base class for objects that cannot contain child objects.
 * Do not modify this class!
 */
function Primitive(attrs)
{
    var dflt = 
    {
        lineWidth: 1,
        color: "black"
    };
    attrs = mergeWithDefault(attrs, dflt);
    Drawable.call(this, attrs);
    for (var property in attrs)
    {
        this[property] = attrs.property;
    }
    //this.lineWidth = attrs.lineWidth;
    //this.color = attrs.color;
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
    
    for (var property in attrs)
    {
        this[property] = attrs.property;
    }
    // this.content = attrs.content;
    // this.fill = attrs.fill;
    // this.font = attrs.font;
    // this.height = attrs.height;
    
}
Text.inheritsFrom(Drawable);

Text.prototype.draw = function (context)
{
    for (var property in this)
    {
        context[property] = this.property;
    }
    context.fillText(this.content, this.left, this.top);
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
    
	for (var property in attrs)
    {
        this[property] = attrs.property;
    }

}
DoodleImage.inheritsFrom(Drawable);

DoodleImage.prototype.draw = function (context)
{
    var img = new Image();
    for (var property in this)
    {
        if (property != 'src')
            context[property] = this.property;
    }
    img.onload = function()
    {
        context.drawImage(img,this.left,this.top, this.width, this.height);
    }
    img.src = this.src;
    
};


function Line(attrs) {
    var dflt = {
        startX: 0,
        startY: 0,
        endX: 0,
        endY: 0
    };
    attrs = mergeWithDefault(attrs, dflt);
    Primitive.call(this, attrs);
    
    // your draw code here
}
Line.inheritsFrom(Primitive);

Line.prototype.draw = function (context) {
    // your draw code here
};


function Rectangle(attrs) {
    var dflt = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    };
    attrs = mergeWithDefault(attrs, dflt);
    Primitive.call(this, attrs);

	// rest of constructor code here
}
Rectangle.inheritsFrom(Primitive);

Rectangle.prototype.draw = function (context) {
    // draw code here
};

function Container(attrs) {
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
    
    // rest of constructor code here.
}
Container.inheritsFrom(Drawable);

Container.prototype.draw = function (context) {
    // draw code here
};
