
function drawGrass(x, y) {
	ctx.strokeStyle = "rgb("+ro(rnd()*50+20)+","+ro(rnd()*80+160)+","+ro(rnd()*50+20)+")";
	ctx.lineWidth = 1;
	ctx.translate(100, 100);
	var i = 0;
	while (i < 20) {
		ctx.translate(rnd() * 3, 0);
		ctx.beginPath();
		ctx.moveTo(0, 0);
		var gh = rnd() * 25 + 25;
		var gw = rnd() * 40 - 20;
		ctx.quadraticCurveTo(0, -gh, gw, -gh);
		ctx.stroke();
		i++;
	}
	ctx.translate(-100, -100);
}

drawGrass();