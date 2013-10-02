window.onload = function () {
    var canvas = document.getElementById("myCanvas");
    var context = canvas.getContext("2d");

    var doodle = new Doodle(context);
    
    context.save();
	
    // Write some text.
    var text = new Text({ left: 360, height: 440, content: "Om nom nom" });

    doodle.children.push(text);
    
    doodle.draw();
};
