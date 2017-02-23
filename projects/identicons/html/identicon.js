/*
identicon.js v1.0
maogm12@gmail.com
*/
function Identicon(options){
    /*default options*/
    this.renderTo = '';
    this.width = 8;
    this.height = 8;
    this.text = '';
    this.canvas = null;
    if (options) {
        if (options.hasOwnProperty('renderTo'))
            this.renderTo = options.renderTo;
        if (options.hasOwnProperty('width'))
            this.width = options.width;
        if (options.hasOwnProperty('height'))
            this.height = options.height;
        if (options.hasOwnProperty('text'))
            this.text = options.text;
    }
    this.hash = CryptoJS.MD5(this.text).toString(CryptoJS.enc.Hex); //md5 hash

    this.render();
};

Identicon.prototype.genColor = function(h, s, l){
    //Generate a random nice color.
    var h, s, l, choices = [0, 120, 240];
    if (arguments[0]) { //(0.02 - 0.31) + n*(1/3) n = 0, 1, 2
        h = arguments[0]*360;
        h = h%120*104.4/120+7.2 + Math.floor(h/120)*120;
    } else {
        //random
        //Void solid red, green, blue
        h = (Math.random()*104.4+7.2) + choices[Math.floor(Math.random()*3)];
    }
    
    if (arguments[1]) {
        s = arguments[1];
        s = (s*0.5+0.3)*100;
    } else {
        //random, Void too dark or too bright
        s = (Math.random()*0.5 + 0.3)*100;
    }
    
    if (arguments[2]) {
        l = arguments[2];
        l = (l*0.5+0.3)*100;
    } else {
        //random, void too dark or too light
        l = (Math.random()*0.5 + 0.3)*100;
    }

    return 'hsl(' + h + ',' + s + '%,' + l + '%)';
};

Identicon.prototype.render = function(repaint){
    if (typeof repaint == "undefined")
        repaint = false;

    var container = document.getElementById(this.renderTo);
    if (container === null)  //no such a div
        return;

    //force repain or the canvas is not inited yet
    if (repaint === true || this.canvas === null) {
        this.canvas = document.createElement('canvas');
        container.innerHTML = ""; //clear content in container
        container.appendChild(this.canvas);
    }

    this.canvas.width = this.width;
    this.canvas.height = this.height;

    //render on canvas
    var icon_ctx = this.canvas.getContext('2d');
    icon_ctx.canvas.width = this.width;
    icon_ctx.canvas.height = this.height;
    icon_ctx.clearRect(0, 0, this.width, this.height);

    //get the color
    var h = parseInt(this.hash.slice(13, 16), 16)/4096,
        s = parseInt(this.hash.slice(21, 24), 16)/4096,
        l = parseInt(this.hash.slice(29, 32), 16)/4096;
    var color = this.genColor(h, s, l);
    icon_ctx.fillStyle=color;

    //render cubes
    var px_len = Math.floor(Math.min(this.width, this.height)/8),
        icon_edge = px_len*8;
    var top = Math.floor((this.height - icon_edge)/2),
        left = Math.floor((this.width - icon_edge)/2);

    for (idx in this.hash) { //size = 32
        if ('01234567'.indexOf(this.hash[idx]) != -1) {
            var xl = left+idx%4*px_len,
                xr = left+(7-idx%4)*px_len,
                y = top+Math.floor(idx/4)*px_len;
            icon_ctx.fillRect(xl, y, px_len, px_len); 
            icon_ctx.fillRect(xr, y, px_len, px_len); 
        }
    }
};

Identicon.prototype.setText = function(text){
    if (typeof text == 'undefined')
        return;
    this.text = text;
    this.hash = CryptoJS.MD5(this.text).toString(CryptoJS.enc.Hex); //md5 hash
    
    this.render(false);
};

Identicon.prototype.resize = function(width, height){
    if (typeof width == 'undefined' || typeof height == 'undefined')
        return;

    this.width = width;
    this.height = height;
    
    this.render(false);
};
