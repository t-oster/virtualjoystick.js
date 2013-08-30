//from https://github.com/jeromeetienne/virtualjoystick.js
var VirtualJoystick	= function(opts)
{
	opts			= opts			|| {};
	this._container		= opts.container	|| document.body;
	this._strokeStyle	= opts.strokeStyle	|| 'cyan';
	this._mouseSupport	= opts.mouseSupport !== undefined ? opts.mouseSupport : false;
	this._enableHorizontal  = opts.enableHorizontal !== undefined ? opts.enableHorizontal : true;
	this._enableVertical    = opts.enableVertical   !== undefined ? opts.enableVertical : true;
        this._stickEl		= opts.stickElement	|| this._buildJoystickStick(this._enableHorizontal, this._enableVertical);
	this._baseEl		= opts.baseElement	|| this._buildJoystickBase();
        this._alwaysShow        = opts.alwaysShow   !== undefined ? opts.alwaysShow : false;
        this._onUpdate          = opts.onUpdate;

	this._container.style.position	= "relative";

	this._container.appendChild(this._baseEl);
	this._baseEl.style.position	= "absolute";
	if (!this._alwaysShow)
        {
            this._baseEl.style.display	= "none";
        }
	
	this._container.appendChild(this._stickEl);
	this._stickEl.style.position	= "absolute";
        if (!this._alwaysShow)
        {
            this._stickEl.style.display	= "none";
        }
       
	this._pressed	= false;
	this._touchIdx	= null;
	this._baseX	= 0;
	this._baseY	= 0;
	this._stickX	= 0;
	this._stickY	= 0;
        this._oldDeltaX = 0;
        this._oldDeltaY = 0;
        this._enabled = true;

        if (this._alwaysShow)
        {
            this._resetViewToCenter();
        }

	var __bind	= function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
	this._$onTouchStart	= __bind(this._onTouchStart	, this);
	this._$onTouchEnd	= __bind(this._onTouchEnd	, this);
	this._$onTouchMove	= __bind(this._onTouchMove	, this);
	this._container.addEventListener( 'touchstart'	, this._$onTouchStart	, false );
	this._container.addEventListener( 'touchend'	, this._$onTouchEnd	, false );
	this._container.addEventListener( 'touchmove'	, this._$onTouchMove	, false );
	if( this._mouseSupport ){
		this._$onMouseDown	= __bind(this._onMouseDown	, this);
		this._$onMouseUp	= __bind(this._onMouseUp	, this);
		this._$onMouseMove	= __bind(this._onMouseMove	, this);
		this._container.addEventListener( 'mousedown'	, this._$onMouseDown	, false );
		this._container.addEventListener( 'mouseup'	, this._$onMouseUp	, false );
		this._container.addEventListener( 'mousemove'	, this._$onMouseMove	, false );
	}
};

VirtualJoystick.prototype.setEnabled    = function(enabled)
{
    this._enabled = enabled;
    if (!enabled)
    {
        this._onUp();
    }
}

VirtualJoystick.prototype.destroy	= function()
{
	this._container.removeChild(this._baseEl);
	this._container.removeChild(this._stickEl);

	this._container.removeEventListener( 'touchstart'	, this._$onTouchStart	, false );
	this._container.removeEventListener( 'touchend'		, this._$onTouchEnd	, false );
	this._container.removeEventListener( 'touchmove'	, this._$onTouchMove	, false );
	if( this._mouseSupport ){
		this._container.removeEventListener( 'mouseup'		, this._$onMouseUp	, false );
		this._container.removeEventListener( 'mousedown'	, this._$onMouseDown	, false );
		this._container.removeEventListener( 'mousemove'	, this._$onMouseMove	, false );
	}
};

/**
 * @returns {Boolean} true if touchscreen is currently available, false otherwise
*/
VirtualJoystick.touchScreenAvailable	= function()
{
	return 'createTouch' in document ? true : false;
};

/**
 * microevents.js - https://github.com/jeromeetienne/microevent.js
*/
(function(destObj){
	destObj.addEventListener	= function(event, fct){
		if(this._events === undefined) 	this._events	= {};
		this._events[event] = this._events[event]	|| [];
		this._events[event].push(fct);
		return fct;
	};
	destObj.removeEventListener	= function(event, fct){
		if(this._events === undefined) 	this._events	= {};
		if( event in this._events === false  )	return;
		this._events[event].splice(this._events[event].indexOf(fct), 1);
	};
	destObj.dispatchEvent		= function(event /* , args... */){
		if(this._events === undefined) 	this._events	= {};
		if( this._events[event] === undefined )	return;
		var tmpArray	= this._events[event].slice(); 
		for(var i = 0; i < tmpArray.length; i++){
			var result	= tmpArray[i].apply(this, Array.prototype.slice.call(arguments, 1));
			if( result !== undefined )	return result;
		}
		return undefined;
	};
})(VirtualJoystick.prototype);

//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////

VirtualJoystick.prototype.deltaX	= function(){ return this._stickX - this._baseX;	};
VirtualJoystick.prototype.deltaY	= function(){ return this._stickY - this._baseY;	};

VirtualJoystick.prototype.up	= function(){
	if( this._pressed === false )	return false;
	var deltaX	= this.deltaX();
	var deltaY	= this.deltaY();
	if( deltaY >= 0 )				return false;
	if( Math.abs(deltaX) > 2*Math.abs(deltaY) )	return false;
	return true;
};
VirtualJoystick.prototype.down	= function(){
	if( this._pressed === false )	return false;
	var deltaX	= this.deltaX();
	var deltaY	= this.deltaY();
	if( deltaY <= 0 )				return false;
	if( Math.abs(deltaX) > 2*Math.abs(deltaY) )	return false;
	return true;	
};
VirtualJoystick.prototype.right	= function(){
	if( this._pressed === false )	return false;
	var deltaX	= this.deltaX();
	var deltaY	= this.deltaY();
	if( deltaX <= 0 )				return false;
	if( Math.abs(deltaY) > 2*Math.abs(deltaX) )	return false;
	return true;	
};
VirtualJoystick.prototype.left	= function(){
	if( this._pressed === false )	return false;
	var deltaX	= this.deltaX();
	var deltaY	= this.deltaY();
	if( deltaX >= 0 )				return false;
	if( Math.abs(deltaY) > 2*Math.abs(deltaX) )	return false;
	return true;	
};

//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////

VirtualJoystick.prototype._resetViewToCenter = function()
{
    var x = !isNaN(this._container.width) ? this._container.width/2 : this._container.clientWidth/2;
    var y = !isNaN(this._container.height) ? this._container.height/2 : this._container.clientHeight/2;

    this._stickEl.style.left	= (x - this._stickEl.width /2)+"px";
    this._stickEl.style.top		= (y - this._stickEl.height/2)+"px";

    this._baseEl.style.left		= (x - this._baseEl.width /2)+"px";
    this._baseEl.style.top		= (y - this._baseEl.height/2)+"px";
    
};

VirtualJoystick.prototype._onUp	= function()
{
	this._pressed	= false; 
        if (!this._alwaysShow)
        {
            this._stickEl.style.display	= "none";
            this._baseEl.style.display	= "none";
        }
        else
        {
            this._resetViewToCenter();
        }
	
	this._baseX	= this._baseY	= 0;
	this._stickX	= this._stickY	= 0;
};

VirtualJoystick.prototype._onDown	= function(x, y)
{
        if (!this._enabled)
        {
            return;
        }
	this._pressed	= true; 
	this._baseX	= x;
	this._baseY	= y;
	this._stickX	= x;
	this._stickY	= y;


	this._stickEl.style.display	= "";
	this._stickEl.style.left	= (x - this._stickEl.width /2)+"px";
	this._stickEl.style.top		= (y - this._stickEl.height/2)+"px";

	this._baseEl.style.display	= "";
	this._baseEl.style.left		= (x - this._baseEl.width /2)+"px";
	this._baseEl.style.top		= (y - this._baseEl.height/2)+"px";
};

VirtualJoystick.prototype._onMove	= function(x, y)
{
        if (!this._enabled)
        {
            return;
        }
	if( this._pressed === true ){
                if (!this._enableHorizontal)
                {
                    x = this._baseX;
                }
                if (!this._enableVertical)
                {
                    y = this._baseY;
                }
		this._stickX	=  x;
		this._stickY	=  y;
		this._stickEl.style.left	= (x - this._stickEl.width /2)+"px";
		this._stickEl.style.top		= (y - this._stickEl.height/2)+"px";
                if (this._onUpdate)
                {
                    var deltaX = this.deltaX();
                    var deltaY = this.deltaY();
                    if (deltaX !== this._oldDeltaX || deltaY !== this._oldDeltaY)
                    {
                        //TODO calculate percent of min distance to container's wall, so values are in [-1,1]
                        this._onUpdate(deltaX, deltaY);
                        this._oldDeltaX = deltaX;
                        this._oldDeltaY = deltaY;
                    }
                }
	}
};


//////////////////////////////////////////////////////////////////////////////////
//		bind touch events (and mouse events for debug)			//
//////////////////////////////////////////////////////////////////////////////////

VirtualJoystick.prototype._onMouseUp	= function(event)
{
	return this._onUp();
};

function getPos(ele){
    var x=0;
    var y=0;
    while(true){
        x += ele.offsetLeft;
        y += ele.offsetTop;
        if(ele.offsetParent === null){
            break;
        }
        ele = ele.offsetParent;
    }
    return [x, y];
}

VirtualJoystick.prototype._onMouseDown	= function(event)
{
        var pos = getPos(this._container);
	var x	= event.clientX - pos[0];
	var y	= event.clientY - pos[1];
	return this._onDown(x, y);
};

VirtualJoystick.prototype._onMouseMove	= function(event)
{
	var pos = getPos(this._container);
	var x	= event.clientX - pos[0];
	var y	= event.clientY - pos[1];
	return this._onMove(x, y);
};

//////////////////////////////////////////////////////////////////////////////////
//		comment								//
//////////////////////////////////////////////////////////////////////////////////

VirtualJoystick.prototype._onTouchStart	= function(event)
{
	// if there is already a touch inprogress do nothing
	if( this._touchIdx !== null )	return;

	// notify event for validation
	var isValid	= this.dispatchEvent('touchStartValidation', event);
	if( isValid === false )	return;

	event.preventDefault();
	// get the first who changed
	var touch	= event.changedTouches[0];
	// set the touchIdx of this joystick
	this._touchIdx	= touch.identifier;

	// forward the action
	var x		= touch.pageX;
	var y		= touch.pageY;
	return this._onDown(x, y);
};

VirtualJoystick.prototype._onTouchEnd	= function(event)
{
	// if there is no touch in progress, do nothing
	if( this._touchIdx === null )	return;

	// try to find our touch event
	var touchList	= event.changedTouches;
	for(var i = 0; i < touchList.length && touchList[i].identifier !== this._touchIdx; i++);
	// if touch event isnt found, 
	if( i === touchList.length)	return;

	// reset touchIdx - mark it as no-touch-in-progress
	this._touchIdx	= null;

//??????
// no preventDefault to get click event on ios
event.preventDefault();

	return this._onUp();
};

VirtualJoystick.prototype._onTouchMove	= function(event)
{
	// if there is no touch in progress, do nothing
	if( this._touchIdx === null )	return;

	// try to find our touch event
	var touchList	= event.changedTouches;
	for(var i = 0; i < touchList.length && touchList[i].identifier !== this._touchIdx; i++ );
	// if touch event with the proper identifier isnt found, do nothing
	if( i === touchList.length)	return;
	var touch	= touchList[i];

	event.preventDefault();

	var x		= touch.pageX;
	var y		= touch.pageY;
	return this._onMove(x, y);
};


//////////////////////////////////////////////////////////////////////////////////
//		build default stickEl and baseEl				//
//////////////////////////////////////////////////////////////////////////////////

/**
 * build the canvas for joystick base
 */
VirtualJoystick.prototype._buildJoystickBase	= function()
{
	var canvas	= document.createElement( 'canvas' );
	canvas.width	= 126;
	canvas.height	= 126;
	
	var ctx		= canvas.getContext('2d');
	ctx.beginPath(); 
	ctx.strokeStyle = this._strokeStyle; 
	ctx.lineWidth	= 6; 
	ctx.arc( canvas.width/2, canvas.width/2, 40, 0, Math.PI*2, true); 
	ctx.stroke();	

	ctx.beginPath(); 
	ctx.strokeStyle	= this._strokeStyle; 
	ctx.lineWidth	= 2; 
	ctx.arc( canvas.width/2, canvas.width/2, 60, 0, Math.PI*2, true); 
	ctx.stroke();
	
	return canvas;
};

function canvas_arrow(context, fromx, fromy, tox, toy){
    var headlen = 10;   // length of head in pixels
    var angle = Math.atan2(toy-fromy,tox-fromx);
    context.moveTo(fromx, fromy);
    context.lineTo(tox, toy);
    context.lineTo(tox-headlen*Math.cos(angle-Math.PI/6),toy-headlen*Math.sin(angle-Math.PI/6));
    context.moveTo(tox, toy);
    context.lineTo(tox-headlen*Math.cos(angle+Math.PI/6),toy-headlen*Math.sin(angle+Math.PI/6));
}

/**
 * build the canvas for joystick stick
 */
VirtualJoystick.prototype._buildJoystickStick	= function(horizontalArrow, verticalArrow)
{
	var canvas	= document.createElement( 'canvas' );
	canvas.width	= 86;
	canvas.height	= 86;
	var ctx		= canvas.getContext('2d');
	ctx.beginPath(); 
	ctx.strokeStyle	= this._strokeStyle; 
	ctx.lineWidth	= 6; 
	ctx.arc( canvas.width/2, canvas.width/2, 40, 0, Math.PI*2, true);
        ctx.lineWidth   = 2;
        
        if (horizontalArrow)
        {
            canvas_arrow(ctx, canvas.width/2, canvas.height/2, canvas.width-12, canvas.height/2);
            canvas_arrow(ctx, canvas.width/2, canvas.height/2, 12, canvas.height/2);
        }
        if (verticalArrow)
        {
            canvas_arrow(ctx, canvas.width/2, canvas.height/2, canvas.width/2, canvas.height-12);
            canvas_arrow(ctx, canvas.width/2, canvas.height/2, canvas.width/2, 12);
        }
	ctx.stroke();
	return canvas;
};

