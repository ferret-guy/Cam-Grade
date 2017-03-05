window.videoParams = {
	_width: 200,
	get sourceWidth(){return this._width;},
	set sourceWidth(value){
		if(typeof value === 'number'){
			this._width = value;
			autosize();
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
		}else{
			throw new Error("sourceHeight must be number");
		}
	},
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
	Inner.css("height", String(InnerHeight)+"px");
	Inner.css("width", String(InnerWidth)+"px");
}

function processNewImage(data){
	$("#cam-content").css("background", "#fff");
	$("#cam-actualinstructions").hide();
	var cframe = $("#cam-frame");
	cframe.attr("src", data);
	bcframe = cframe[0];
	window.videoParams.sourceWidth = bcframe.naturalWidth;
	window.videoParams.sourceHeight = bcframe.naturalHeight;
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
				processNewImage(fr.result);
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
				processNewImage(fr.result);
			};
		}
	});
});