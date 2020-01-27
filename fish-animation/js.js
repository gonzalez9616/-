var canvas;
var ctx;
var canvasId = "Canvas";
var a;
var times = 0;
function startA() {
    times++;
    document.getElementById("p1").innerHTML = "Running at "+times+"x Speed"
    loop();
}
function loop() {
    a = requestAnimationFrame(loop);
    drawStuff()
}
function stopA() {
    if (times>0) {
        times--;
    }
    document.getElementById("p1").innerHTML = "Running at "+times+"x Speed"
    cancelAnimationFrame(a);
}
var sunBright = true;
var darkness = 0;
var cloudX = 100;
var waveY = 250;
var waveX = 0;
var shipX = 200;
var waveAdd = 0.25;
var f1x = 100;
var f1m = 0.5;
var f2x = 300;
var f2m = 1;
var f3x = 450;
var f3m = -0.5;
var f4x = 200;
var f4m = 0.5;
var f1t = 0;
var f1tm = 0.1;
var f2t = 3;
var f2tm = 0.2;
var f3t = 2;
var f3tm = 0.1;
var f4t = 5;
var f4tm = 0.1;
var lightning = false;
var sinking = false;
var extraShipY = 0;
var currentPlace = -5.5;
var prev = "";
var prev2 = "";
var prev3 = "";
var sunY = 0;
var sunYM = 0;
var sunCount = 0;
var isMoon = false;
var brightChanged = false;
function isNegative(num) {
    return -1*num===Math.abs(num);
}
var starAray = [];
function randN(u,l) {
    return (Math.random()*(u-l))+l;
}
function randomizeStars() {
    for (i=0;i<400;i++) {
        starAray[i] = [randN(5,500),randN(5,300)];
    }
}
randomizeStars();
//CurrentPlace is fine, addedY jumps from 1 to 0 pixels, causing jump.
function drawStuff() {
    //change the order of the two statements below.  Notice how the second is painted on the first.
    canvas = document.getElementById(canvasId);
    ctx = canvas.getContext("2d");
    background("#a5faff");
    //if (!sunBright) {
        ctx.globalAlpha = (darkness/0.5); //Fade in slowly
        //Night Sky
        background("#000000");
        color("#ffff00");
        //Stars
        for (i=0;i<starAray.length;i++) {
            drawCircle(starAray[i][0],starAray[i][1],1.5);
        }
        ctx.globalAlpha = 1;
    //}
    color("#fff200");//Sun
    if (isMoon) {
        color("#ffffff")
    }
    drawCircle(25,sunY,75);
    //Boat, set color auto
    drawBoat(shipX+200,155-(250-waveY)-extraShipY,sinking);
    drawBoat(shipX,155-(250-waveY));
    color("#0083ff"); //Water
    var waveNum = 0;
    var printText = "";
    var printText2 = "";
    for (i=0;i<=700;i=i+70) {
        var additionalY = 0;
        var difference = Math.floor((Math.abs(currentPlace-(waveNum)))*10)/10;
        var height = 20;
        additionalY = Math.floor((height-(difference*(height/5)))*10)/10;
        if (difference>=5) {
            additionalY = 0;
        }
        if (additionalY<0) {
            additionalY = 0;
        }
        if (i===140) {
            printText2 = difference;
            printText = additionalY;
        }
        drawCircle(i+waveX,waveY-additionalY,75);
        waveNum++;
    }
    drawRect(0,waveY,500,500);
    //Plants, set color automatically
    for (i=50;i<500;i=i+350) {
        drawPlant(i,450);
    }
    //Fish
    color("#ffff00");
    drawFish(f3x,300,isNegative(f3m),f3t);
    color("#ff8800");
    drawFish(f2x,400,isNegative(f2m),f2t);
    color("#ff0000");
    drawFish(f1x,300,isNegative(f1m),f1t);
    color("#55ff55");
    drawFish(f4x,400,isNegative(f4m),f4t);
    color("#ffc97e");//Sand
    for (i=0;i<=600;i=i+50) {
        drawCircle(i,500,75)
    }
    //Clouds
    drawCloud(cloudX,50);
    drawCloud(200+cloudX,50);
    if (lightning) {
        drawCloud(100+cloudX,50,true);
    } else {
        drawCloud(100+cloudX,50,false);
    }
    cloudX+=0.25;
    if (cloudX>=550) {
        cloudX = -350
    }
    //if (cloudX>-250&&cloudX<67.5) {
    //    sunBright = false;
    //} else {
    //    darkness = 0;
    //    sunBright = true;
    //}
    //Rise and fall waves
    //waveY = waveY+waveAdd;
    if (waveY<260) {
        waveAdd = 0.1;
    }
    if (waveY>280) {
        waveAdd = -0.1;
    }
    shipX = shipX-0.25;
    if (shipX<-300) {
        shipX = 600;
        extraShipY = 0;
    }
    waveX-=0.025;
    if (waveX<=-70) {
        waveX = -0.25;
    }
    f1x = f1x+ f1m;
    if (f1x>550) {
        f1m = -f1m;
    }
    if (f1x<-50) {
        f1m = -f1m;
    }
    f2x = f2x+ f2m;
    if (f2x>550) {
        f2m = -f2m;
    }
    if (f2x<-50) {
        f2m = -f2m;
    }
    f3x = f3x+ f3m;
    if (f3x>550) {
        f3m = -f3m;
    }
    if (f3x<-50) {
        f3m = -f3m;
    }
    f4x = f4x+ f4m;
    if (f4x>550) {
        f4m = -f4m;
    }
    if (f4x<-50) {
        f4m = -f4m;
    }
    f1t = f1t+f1tm;
    if (f1t>10) {
        f1tm = -f1tm;
    }
    if (f1t<=0) {
        f1tm = -f1tm;
    }
    f2t = f2t+f2tm;
    if (f2t>10) {
        f2tm = -f2tm;
    }
    if (f2t<=0) {
        f2tm = -f2tm;
    }
    f3t = f3t+f3tm;
    if (f3t>10) {
        f3tm = -f3tm;
    }
    if (f3t<=0) {
        f3tm = -f3tm;
    }
    f4t = f4t+f4tm;
    if (f4t>10) {
        f4tm = -f4tm;
    }
    if (f4t<=0) {
        f4tm = -f4tm;
    }
    if (shipX>95&&shipX<105) {
        lightning = true;
    } else {
        lightning = false;
    }
    if (shipX>-130&&shipX<103) {
        sinking = true;
        extraShipY = extraShipY-0.2;
    } else {sinking = false}
    currentPlace+=0.05;
    if (currentPlace>15.5) {
        currentPlace = -5.5;
    }
    if (sunYM===0) {
        sunYM = 0.2;
    }
    sunY = sunY+sunYM;
    if (sunY>260) {
        isMoon = !isMoon;
        sunCount = 0;
        sunYM = -sunYM;
        if (sunBright) {
            darkness = 0;
            randomizeStars();
        }
    }
    if (!brightChanged&&sunY>150) {
        brightChanged = true;
        sunBright = !sunBright;
    }
    if (sunY<=0) {
        brightChanged = false;
        if (sunCount<100) {
            sunY = 0;
            sunCount = sunCount + 1;
        } else {
            sunYM = -sunYM;
            sunY = sunY+sunYM;
        }
    }
    //Darken Sky
    if (!sunBright) {
        darkness = darkness+0.00125;
    }
    if (darkness>0.5) {
        darkness = 0.5
    }
    if (sunBright) {
        darkness = darkness-0.00125;
    }
    if (darkness<0) {
        darkness = 0;
    }
    color("#000000");
    ctx.globalAlpha = darkness;
    drawRect(0,0,500,500);
    ctx.globalAlpha = 1;

    color("#000000");
    if (printText!==0) {
        prev3 = Math.floor(currentPlace*1000)/1000;
    }
    //Debugging
    //drawText(printText+" < "+prev,30,200,30);
    //drawText(printText2,30,400,30);
    //drawText(waveY,30,400,30);
    //drawText(prev3+" < "+prev2,30,200,70);
    if (printText!==0) {
        prev = printText;
        prev2 = Math.floor(currentPlace * 1000) / 1000;
    }
}
function background(c) {
    color(c);
   drawRect(0,0,500,500)
}
function drawCloud(x,y,light) {
    color("#ffffff");
    if (!sunBright) {
        color("#5e5e5e");
    }
    if (light) {
        color("#ffff00");
        drawLine(x+25,y,x+30,y+50);
        drawLine(x+30,y+50,x+0,y+110);
        drawLine(x+30,y+50,x+30,y+110);
        drawLine(x+30,y+50,x+60,y+110);
        color("#555555")
    }
    drawCircle(x,y,20);
    drawCircle(x+10,y,20);
    drawCircle(x+20,y,20);
    drawCircle(x+30,y,20);
    drawCircle(x+40,y,20);
    drawCircle(x+20,y-20,20);
    if (light) {
        color("#000000");
        drawCircle(x,y-10,5);
        drawCircle(x+50,y-10,5);
        drawHalfArc(x+25,y+10,20)
    }
    ctx.globalAlpha = 1;
}
function drawPlant(x,y) {//Reference to bottom
    color("#00af00");
    for (d=y-200;d<y;d=d+50) {
        drawCircle(x,d+17,10);
        drawCircle(x+20,d+42,10);
    }
    color("#00bf00");
    drawRect(x,y-200,x+20,y);
}
function drawBoat(x,y,ss) {
    color("#ffffff");
    ctx.beginPath();
    ctx.moveTo(x+27,y-50);
    ctx.lineTo(x+64,y-5);
    ctx.lineTo(x-10,y-5);
    ctx.lineTo(x+27,y-50);
    ctx.fill();
    color("#884400");
    drawRect(x+20,y-50,x+35,y);
    color("#ffd900");
    drawCircle(x+27,y-50,10);
    color("#ff7700");
    drawHalfCircle(x,y,30);
    drawRect(x-2,y,x+52,y+31);
    drawHalfCircle(x+50,y,30);
    if (ss) {
        var s = 25;
        color("#ff0000");
        drawCircle(x+50,y,s);
        drawCircle(x+50,y-20,s);
        drawCircle(x+50,y+20,s);
        color("#ff8800");
        drawCircle(x,y+10,s);
        drawCircle(x+75,y+10,s);
    }
}
function drawFish(x,y,reverse,tailAdd) {
    if (!tailAdd) {
        tailAdd = 0;
    }
    if (!reverse) {
        drawCircle(x,y,20);
        ctx.beginPath();
        ctx.moveTo(x+5,y+20);
        ctx.lineTo(x+35,y);
        ctx.lineTo(x+5,y-20);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x-40+tailAdd,y+20);
        ctx.lineTo(x-15,y);
        ctx.lineTo(x-40+tailAdd,y-20);
        ctx.fill();
        color("#ffffff");
        drawCircle(x+19,y-5,5);
        color("#000000");
        drawCircle(x+21.5,y-5,2.5);
    } else {
        drawCircle(x,y,20);
        ctx.beginPath();
        ctx.moveTo(x-5,y+20);
        ctx.lineTo(x-35,y);
        ctx.lineTo(x-5,y-20);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x+40-tailAdd,y+20);
        ctx.lineTo(x+15,y);
        ctx.lineTo(x+40-tailAdd,y-20);
        ctx.fill();
        color("#ffffff");
        drawCircle(x-19,y-5,5);
        color("#000000");
        drawCircle(x-21.5,y-5,2.5);
    }
}
function color(colorHex) {
    ctx.strokeStyle = colorHex;
    ctx.fillStyle = colorHex;
}
function drawRect(x,y,ex,ey){
    ctx.fillRect(x,y,ex-x,ey-y);
}
function drawCircle(x,y,sx) {
    ctx.beginPath();

    ctx.arc(x,y,sx,0,360);
    ctx.fill();
}
function drawHalfCircle(x,y,sx) {
    ctx.beginPath();

    ctx.arc(x,y,sx,0,Math.PI,false);
    ctx.fill();
    ctx.stroke();
}
function drawHalfArc(x,y,sx) {
    ctx.beginPath();
    ctx.arc(x,y,sx,Math.PI,2*Math.PI);
    ctx.stroke();
}

function drawLine(x,y,sx,sy) {
    ctx.beginPath();
    ctx.moveTo(x,y);
    ctx.lineWidth=5;
    ctx.lineTo(sx,sy);
    ctx.stroke();
}

function drawText(txt,size,x,y) {
    ctx.font = size+"px Arial";
    ctx.fillText(txt, x,y);
}

function drawImage(img,x,y,sx,sy) {
    var pict = new Image();	//create a new image object and attach it to a reference variable
    pict.src = img; //creates a pathname to an image to use. must do this once for each image.
    ctx.drawImage(pict,x,y,sx,sy); //(variable for image, xcoord, ycoord, width, height
}
