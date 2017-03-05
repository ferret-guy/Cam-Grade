window.videoParams = {
	_width: 200,
	get sourceWidth(){return this._width;},
	set sourceWidth(value){
		if(typeof value === 'number'){
			this._width = value;
			autosize();
			renderCanvas();
		}else{
			throw new Error("sourceWidth must be number");
		}
	},
	_height: 200,
	get sourceHeight(){return this._height;},
	set sourceHeight(value){
		if(typeof value === 'number'){
			this._height = value;
			autosize();
			renderCanvas();
		}else{
			throw new Error("sourceHeight must be number");
		}
	},
	trueScale: 1,
	_rotation: 0,
	get rotation(){return this._rotation;},
	set rotation(value){
		if(value >= 0 && value <= 3 && value === Math.floor(value)){
			this._rotation = value;
			autosize();
		}else{
			throw new Error("rotation must be 0, 1, 2, or 3");
		}
	},
	get aspectRatio(){
		var trueRatio = this.sourceWidth / this.sourceHeight;
		if (this._rotation == 1 || this._rotation == 3)
			return 1 / trueRatio;
		return trueRatio;
	},
	active: false,
	flipV: false, //post rotation
	flipH: false
}

window.canvasShapes = [];

function renderCanvas(){
	var vp = window.videoParams;
	var cs = window.canvasShapes;
	
	var canvas = $("#cam-canvas")[0]
	canvas.width = vp.sourceWidth;
	canvas.height = vp.sourceHeight;
	var ctx = canvas.getContext("2d");
	
	ctx.strokeStyle = "#FC5533";
	ctx.lineWidth = 3/vp.trueScale;
	ctx.fillStyle = "#FC5533";
	ctx.font = 20/vp.trueScale + "px Arial";
	
	for(var s = 0; s < cs.length; s++){
		var shape = cs[s];
		var lPoint = shape[shape.length-1];
		var avgX = 0;
		var avgY = 0;
		
		ctx.beginPath();
		ctx.moveTo(lPoint[0], lPoint[1]);
		
		for(var p = 0; p < shape.length; p++){
			var point = shape[p];
			avgX += point[0];
			avgY += point[1];
			
			ctx.lineTo(point[0], point[1]);
		}
		
		ctx.stroke();
		ctx.closePath();
		
		avgX /= shape.length;
		avgY /= shape.length;
		var text = "" + (s + 1);
		var textwidth = ctx.measureText(text).width;
		ctx.fillText(text, avgX - textwidth / 2, avgY);
	}
}

//Autoscale video and maintain aspect ratio
function autosize(){
	var Outer = $("#cam-container");
	var Inner = $("#cam-content");
	var vp = window.videoParams;
	var OuterWidth = Outer.width();
	var OuterHeight = Outer.height();
	var InnerWidth, innerHeight;
	if (OuterHeight * vp.aspectRatio < OuterWidth) {
		InnerHeight = OuterHeight;
		InnerWidth = OuterHeight * vp.aspectRatio;
	} else {
		InnerWidth = OuterWidth;
		InnerHeight = OuterWidth / vp.aspectRatio;
	}
	if (InnerWidth > vp.sourceWidth || InnerHeight > vp.sourceHeight) {
		InnerWidth = vp.sourceWidth;
		InnerHeight = vp.sourceHeight;
	}
	vp.trueScale = InnerHeight / vp.sourceHeight;
	Inner.css("height", String(InnerHeight)+"px");
	Inner.css("width", String(InnerWidth)+"px");
}

function dispatchNewImage(data){
	$("#cam-content").css("background", "#fff");
	$("#cam-actualinstructions").hide();
	var cframe = $("#cam-frame");
	cframe.attr("src", data);
	bcframe = cframe[0];
	window.videoParams.sourceWidth = bcframe.naturalWidth;
	window.videoParams.sourceHeight = bcframe.naturalHeight;
	
	var xhr = new XMLHttpRequest();
	xhr.open("POST", 'https://cam-grade-func.azurewebsites.net/api/Get-Equ', true);
	
	xhr.setRequestHeader("Content-type", "application/json");
	
	xhr.onreadystatechange = function() {
		if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
			var result = JSON.parse(xhr.responseText);
			console.log(result);
			processNewImage(result);
		}
	}
	xhr.send('{"img":"'+data+'"}');
}

function processNewImage(result){
	var shapes = [];
	for(var ibox in result){
		var box = result[ibox];
		var shape = [];
		for(var p = 0; p < box.points.length; p++){
			shape.push(box.points[p][0]);
		}
		shapes.push(shape);
	}
	window.canvasShapes = shapes;
	renderCanvas();
}

//Initialization junk
$(function(){
	$("#cam-content").css("backgroundImage", "none");
	$("#cam-instructions").css("display", "inline");
	
	$(window).on("resize", autosize);
	autosize();
	
	var camc = $("#cam-container");
	camc.on("dragover", function(e){
		e.stopPropagation();
		e.preventDefault();
		camc.css("background", "#8f9");
	});
	camc.on("dragleave", function(e){
		e.stopPropagation();
		e.preventDefault();
		if(event.target === this)
			camc.css("background", "");
	});
	camc.on("drop", function(e){
		e.stopPropagation();
		e.preventDefault();
		camc.css("background", "");
		if(e.originalEvent.dataTransfer.files.length){
			var file = e.originalEvent.dataTransfer.files[0];
			var fr = new FileReader();
			fr.readAsDataURL(file)
			fr.onload = function(){
				dispatchNewImage(fr.result);
			};
		}
	});
	var fchoose = $("#filechoose");
	fchoose.on("change", function(e){
		if(fchoose[0].files.length){
			var file = fchoose[0].files[0];
			var fr = new FileReader();
			fr.readAsDataURL(file)
			fr.onload = function(){
				dispatchNewImage(fr.result);
			};
		}
	});
});