/**
 * Created by Timothy on 11/27/18
 */
//Note: Set the shortcut varaiable to true to activate shortcuts
var doShortcut = false;
//This will activate the m key (skip round)
//Also activates the u key shrotcut (spawns ufo at begining) (If ufo hasn't already gone 10 times)
function a(ab) {
    alert(ab);
}

var a;
var score;
var prevX;
var prevY;
var prevX2;
var prevY2;
var prevX3;
var prevY3;
var pict = new Image();
var pict2 = new Image();
var gameOver = "Menu";
var bulletsAr = [];
var bulletsAr2 = [];
var multi = 1;
var createImage = function(src, title,x,y,w,h) {
    var img   = new Image();
    img.src   = src;
    img.alt   = title;
    img.title = title;
    img.left = x;
    img.top = y;
    img.width = w;
    img.height = h;
    img.destroyed = false;
    return img;
};
var ships;

pict.src = "resources/frosty.jpg";
pict2.src = "resources/snowstorm.jpg";

var ship = createImage("resources/yourShip.png","yourShip",0,0,50,50);
ship.destroyed = 1;
var shipDir;
var bulletsLeft;
var canShoot;
var shootCount = 0;
var canvasSize = 720;
var canvasSize2 = 900;
var round = 1;
var moveTot = 20;
var lives = 0;
var deadCount = false;
var resetUfoTo = -1000;
var ufoSpeed = 1.5;
var ufo = createImage("resources/ufo.png","Ufo",resetUfoTo,50,50,50);
var maxUfos = 10;
var ufos = 0;
var debre = [];
function setUp(notFull,continueShip){
    bulletsAr = [];
    bulletsAr2 = [];
    ships = [continueShip];
    var rows = 6;
    var inRow = 11;
    var size = 40;
    var gap = 15;
    var files = ["resources/e1.png","resources/e2.png","resources/e3.png","resources/e1.png","resources/e2.png","resources/e3.png"];
    var abc = files.length;
    var down = 7;
    for (y=50;y<(((size+gap)*(rows))+50);y+=size+gap) {
        abc--;
        down--;
        for (i=30;i<30+((size+gap)*inRow);i+=size+gap) {
            var ti = i;
            if (notFull) {
                ti = i;//-canvasSize2;
            }
            ships.push(createImage(files[abc],"ship1",ti,y,size,size));
            var num = parseInt(files[abc].substring(11,12));
            ships[ships.length-1].score = ((num*10))
        }
    }
    ship.destroyed = 0;
    prevX = 5000;
    prevY = 5000;
    prevX2 = 5000;
    prevY2 = 5000;
    prevX3 = 5000;
    prevY3 = 5000;
    shipDir = 1;
    bulletsLeft = 3;
    shootCount = 0;
    canShoot = false;
    multi = 0.35+((round-1)*0.2);
    if (!notFull) {
        ufos = 0;
        deadCount = false;
        round = 1;
        score = 0;
        ship.left= 50;
        ship.top= canvasSize-75;
        lives = 3;
        debre = [];
        for (xx=0;xx<3;xx++) {
            for (ab=0;ab<2;ab++) {
                for (a=0;a<5;a++) {
                    debre[debre.length+1] = [(xx*300)+100+(a*10),550-(a*5)+(ab*10),10,10]
                }
                for (a=0;a<5;a++) {
                    debre[debre.length+1] = [(xx*300)+150+(a*10),550-(a*-5)-20+(ab*10),10,10]
                }
            }
        }
    }
}

setUp();

function drawBackground(){
    var ctx = document.getElementById("myCanvas").getContext("2d");
    ctx.fillStyle = "#0c0c0c";
    ctx.fillRect(0,0,window.innerWidth,window.innerHeight);
}

var mL = false;
var mR = false;
var mU = false;
var mD = false;
var space = false;
var offScreen = -500;
var textY = offScreen;
var showing = false;


function drawRectangle(){
    var ctx = document.getElementById("myCanvas").getContext("2d");
    ctx.fillStyle="#FF0000";
    var draw = true;
    if (deadCount) {
        if (deadCount%8===0) {
            draw = false
        }
    }
    if (draw) {
        ctx.drawImage(ship,ship.left,ship.top,ship.width,ship.height);
    }
}

var textFlash = 0;

function drawLifes() {
    var ctx = document.getElementById("myCanvas").getContext("2d");
    for (i=0;i<lives;i++) {
        ctx.drawImage(ship,i*((ship.width/2)*1.1),canvasSize-(ship.height/2),ship.width/2,ship.height/2);
    }
}
var startX = -500;
var startX2 = canvasSize2+500;
var endX = canvasSize2/2;
var endX2 = canvasSize2/2;
var slideSpeed = 25;
function drawText() {
    var ctx = document.getElementById("myCanvas").getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.font = 30+"px Arial";
    ctx.textAlign = 'start';
    if (!gameOver) {
        ctx.fillText("Score: "+score+"    Round: "+round,0,22.5,400);
        ctx.font = 120+"px Arial";
        ctx.textAlign = 'left';
        ctx.fillStyle = "#ffffff";
        ctx.fillText("Round "+round+"!",textY,(canvasSize/2)+200,canvasSize2);//When you call a variable textY when it changes the x... oh well
        ctx.fillStyle = "#ffffff";
    } else {
        textY = offScreen;
        if (gameOver!=="You Win!") {
            ship.destroyed++;
            if (gameOver==="Menu") {
                ship.destroyed = 60;
            }
            ctx.globalAlpha = 1-(ship.destroyed/destroyCount);
            if (ship.destroyed>destroyCount) {
            } else {
                ctx.drawImage(explodeImage,ship.left,ship.top,ship.width,ship.height);
            }

        } else{
            ctx.drawImage(ship,ship.left,ship.top,ship.width,ship.height);
        }
        ctx.globalAlpha = 1;
        ctx.font = 120+"px Arial";
        ctx.textAlign = 'center';
        ctx.fillStyle = "#ffffff";
        if (gameOver!=="Menu") {
            ctx.font = 60+"px Arial";
            ctx.fillText(gameOver,canvasSize2/2,(canvasSize/2)-50,canvasSize2);
        } else {
            startX+=slideSpeed;
            startX2-=slideSpeed;
            if (startX>endX) {
                startX = endX;
            }
            if (startX2<endX2) {
                startX2 = endX2;
            }
            ctx.fillText("Space",startX,(canvasSize/2)-75,canvasSize2);
            ctx.fillStyle = "#00ff05";
            ctx.font = 120+"px ArialB";
            ctx.fillText("Invaders",startX2,(canvasSize/2)+75,canvasSize2);
        }
        ctx.fillStyle = "#ffffff";
        ctx.font = 30+"px Arial";
        ctx.textAlign = 'center';
        var showText = "Press enter to play again";
        if (gameOver==="Menu") {
            showText = "Press Enter To Start";
            if (startX+50<endX) {
                showText = "";
                textFlash = 0;
            }
        }
        textFlash++;
        if (textFlash>30&&textFlash<60) {
            showText = "";
        } else if (textFlash>=60) {
            textFlash = 0;
        }
        var add = 0;
        ctx.font = 30+"px Arial";
        ctx.textAlign = 'center';
        if (gameOver!=="Menu") {
            ctx.fillText("You made it to round "+round+" with a score of "+score+"!",canvasSize2/2,canvasSize/2,canvasSize2);
        } else {
            add = 100;
        }
        ctx.fillText(showText,canvasSize2/2,(canvasSize/2)+150+add,canvasSize2);
        //ctx.fillText(showText,canvasSize2/2,(canvasSize/2)+150+add,canvasSize2);
    }
}

function drawOldRect(){
    var ctx = document.getElementById("myCanvas").getContext("2d");
    ctx.fillStyle="#FF0000";
    ctx.globalAlpha = 0.5;
    var draw = true;
    if (deadCount) {
        if (deadCount%8===0) {
            draw = false
        }
    }
    if (draw) {
        ctx.drawImage(ship, prevX, prevY, ship.width, ship.height);
        ctx.drawImage(ship, prevX2, prevY2, ship.width, ship.height);
    }
    ctx.globalAlpha = 1;
}

function objectsCollide(x,y,x1,y1,xx,yy,xx1,yy1) {
    var sizeX = x1-x;
    var sizeY = y1-y;
    var corners = [[x,y],[x+sizeX,y],[x,y+sizeY],[x+sizeX,y+sizeY]];
    var collide = false;
    for (i=0;i<corners.length;i++) {
        var thisX = corners[i][0];//Second Object
        var thisY = corners[i][1];
        if (thisX>=xx&&thisY>=yy&&thisY<=yy1&&thisX<=xx1) {
            collide = true;
        }
    }
    return collide;
}
var load1 = createImage("resources/laser.png","Laser");
var load2 = createImage("resources/laser2.png","Laser2");
function fireLaser(isEnemy) {
    if (bulletsLeft>0&&!isEnemy&&isEnemy!==0) {
        bulletsLeft--;
        bulletsAr.push(createImage("resources/laser.png","Laser",ship.left+25-(5/2),ship.top,5,30));
    } else if (isEnemy||isEnemy===0) {
        bulletsAr2.push(createImage("resources/laser2.png","Laser",ships[isEnemy].left+(ships[isEnemy].width/2)-(5/2),ships[isEnemy].top+(ships[isEnemy].width/3),5,20));
    }
}
var addTomulti = 0.05;
var capMulti = 2.75;

function drawLasers() {
    var ctx = document.getElementById("myCanvas").getContext("2d");
    for (a=0;a<bulletsAr.length;a++) {
        if (bulletsAr[a]) {
            bulletsAr[a].top = bulletsAr[a].top-(6.5+((round-1)*0.3));
            ctx.drawImage(bulletsAr[a],bulletsAr[a].left,bulletsAr[a].top,bulletsAr[a].width,bulletsAr[a].height);
            if (bulletsAr[a].top<=-30) {
                bulletsLeft++;
                bulletsAr[a] = false;
            } else {
                for (b=0;b<ships.length;b++) {
                    if (ships[b]){
                        if (objectsCollide(bulletsAr[a].left,bulletsAr[a].top,bulletsAr[a].left+bulletsAr[a].width,bulletsAr[a].top+bulletsAr[a].height,ships[b].left,ships[b].top,ships[b].left+ships[b].width,ships[b].top+ships[b].height)&&!ships[b].destroyed) {
                            bulletsLeft++;
                            score+=ships[b].score;
                            ships[b].destroyed = 1;
                            bulletsAr[a] = false;
                            multi+=addTomulti;
                            if (multi>capMulti) {
                                multi = capMulti;
                            }
                        }
                    }
                }
            }
        }
    }
    var allGone = true;
    var onlyException = true;
    var exception = false;
    for (b=0;b<ships.length;b++) {
        if (ships[b]) {
            if (!ships[b].destroyed) {
                allGone = false;
                onlyException = false;
            } else if (ships[b].destroyed<60) {
                allGone = false;
                exception = true;
            }
        }
    }
    if (allGone) {
        round++;
        showing = true;
        setUp(true);
        if (round>5) {
            round = 5;
            gameOver = "You Win!";
            showing = false;
        }
    } else if (exception&&!allGone&&onlyException) {
        bulletsAr2 = [];
        bulletsAr = [];
    }
}
function drawLasers2() {
    var ctx = document.getElementById("myCanvas").getContext("2d");
    for (a=0;a<bulletsAr2.length;a++) {
        if (bulletsAr2[a]) {
            bulletsAr2[a].top = bulletsAr2[a].top+(1.5+((round-1)*0.5));
            ctx.drawImage(bulletsAr2[a],bulletsAr2[a].left,bulletsAr2[a].top,bulletsAr2[a].width,bulletsAr2[a].height);
            if (bulletsAr2[a].top>=canvasSize) {
                bulletsAr2[a] = false;
            } else {
                if (objectsCollide(bulletsAr2[a].left,bulletsAr2[a].top,bulletsAr2[a].left+bulletsAr2[a].width,bulletsAr2[a].top+bulletsAr2[a].height,ship.left,ship.top,ship.left+ship.width,ship.top+ship.height)&&!deadCount) {
                    lives--;
                    deadCount = 1;
                    if (lives<=0) {
                        gameOver = "You Got Destroyed!";
                        deadCount = false;
                    } else {
                        bulletsAr2 = [];
                    }
                }
            }
            //Check for bullet-bullet collision
            for (x=0;x<bulletsAr.length;x++) {
                if (bulletsAr[x]&&bulletsAr2[a]) {
                    if (objectsCollide(bulletsAr2[a].left,bulletsAr2[a].top,bulletsAr2[a].left+bulletsAr2[a].width,bulletsAr2[a].top+bulletsAr2[a].height,bulletsAr[x].left,bulletsAr[x].top,bulletsAr[x].left+bulletsAr[x].width,bulletsAr[x].top+bulletsAr[x].height)) {
                        bulletsAr[x] = false;
                        bulletsAr2[a] = false;
                        bulletsLeft++;
                    }
                }
            }
        }
    }
}
var destroyCount = 60;
var explodeImage = createImage("resources/explosion.png","explosion",0,0,0,0);

function drawUfo() {
    if (ufos<maxUfos) {
        var ctx = document.getElementById("myCanvas").getContext("2d");
        if (!ufo.destroyed) {
            ufo.top = 20;
            ufo.left=ufo.left+ufoSpeed;
            if (ufo.left>canvasSize2) {
                ufo.left = resetUfoTo;
                ufos++;
            }
            ctx.drawImage(ufo,ufo.left,ufo.top,ufo.width,ufo.height);
            //Check Collision
            for (a=0;a<bulletsAr.length;a++) {
                if (bulletsAr[a]) {
                    if (objectsCollide(bulletsAr[a].left,bulletsAr[a].top,bulletsAr[a].left+bulletsAr[a].width,bulletsAr[a].top+bulletsAr[a].height,ufo.left,ufo.top,ufo.left+ufo.width,ufo.top+ufo.height)&&!ufo.destroyed) {
                        ufo.destroyed = 1;
                        bulletsAr[a] = false;
                        bulletsLeft++;
                        score+=500;
                    }
                }
            }
        } else {
            ufo.destroyed++;
            ctx.globalAlpha = 1-(ufo.destroyed/destroyCount);
            if (ufo.destroyed>destroyCount) {
                ufo.destroyed = false;
                ufo.left = resetUfoTo;
                        ufos++;
            } else {
                ctx.drawImage(explodeImage,ufo.left,ufo.top,ufo.width,ufo.height);
                ctx.fillStyle = "#ffffff";
                ctx.font = 15+"px Arial";
                ctx.textAlign = 'center';
                var calc = 1;
                if (ships[a].destroyed>40) {
                    calc = 1-((ships[a].destroyed-40)/((destroyCount-40)))
                }
                if (calc>1) {
                    calc = 1;
                }
                ctx.globalAlpha = calc;
                ctx.fillText("500",ufo.left+(ufo.width/2),ufo.top+(ufo.height/2)+7.5)
            }
            ctx.globalAlpha = 1;
        }
    }
}

var enter = false;

var moveDown = false;
var moved = 0;
function drawShips(canMove) {
    var ctx = document.getElementById("myCanvas").getContext("2d");
    var canSwitch = true;
    var shootNum = false;//Make it impossible
    var possibleShots = [];
    if (canShoot) {
        canShoot = false;
        for (x=0;x<ships.length;x++) {
            if (ships[x]) {
                if (!ships[x].destroyed) {
                    var top = ships[x].top;
                    var isTop = true;
                    for (b=0;b<ships.length;b++) {
                        if (ships[b]) {
                            if (!ships[b].destroyed) {
                                if (ships[b].top>top&&ships[b].left===ships[x].left) {
                                    isTop = false;
                                }
                            }
                        }
                    }
                    if (isTop) {
                        possibleShots.push(x);
                    }
                }
            }
        }
        shootNum = possibleShots[Math.floor(Math.random()*possibleShots.length)];
    }

    for (a=0;a<ships.length;a++) {
        if (ships[a]) {
            if (!ships[a].destroyed) {
                if (ships[a].left>canvasSize2-10-ships[a].width&&shipDir>0) {
                    canSwitch = false;
                }
                if (ships[a].left<10&&shipDir<0) {
                    canSwitch = false;
                }
                if (ships[a].top>canvasSize-120) {
                    gameOver = "The ships reached the bottom";
                }
            }
        }
    }
        for (a=0;a<ships.length;a++) {
            if (ships[a]) {
                if (!ships[a].destroyed) {
                    if (!moveDown&&canMove) {
                        if (canSwitch) {
                            ships[a].left+=shipDir*multi;
                        }
                    } else if (canMove) {
                        ships[a].top+=multi;
                    }
                    ctx.drawImage(ships[a],ships[a].left,ships[a].top,ships[a].width,ships[a].height);
                } else {
                    ships[a].destroyed++;
                    var val = 0.75-(ships[a].destroyed/destroyCount);
                    if (val<0) {
                        val=0
                    }
                    ctx.globalAlpha = val;
                    if (ships[a].destroyed>destroyCount) {
                        ships[a] = false;
                    } else {
                        ctx.drawImage(explodeImage,ships[a].left,ships[a].top,ships[a].width,ships[a].height);
                        ctx.fillStyle = "#ffffff";
                        ctx.font = 15+"px Arial";
                        ctx.textAlign = 'center';
                        var calc = 1;
                        if (ships[a].destroyed>40) {
                            calc = 1-((ships[a].destroyed-40)/((destroyCount-40)))
                        }
                        if (calc>1) {
                            calc = 1;
                        }
                        ctx.globalAlpha = calc;
                        ctx.fillText(ships[a].score,ships[a].left+(ships[a].width/2),ships[a].top+(ships[a].height/2)+7.5)
                    }
                    ctx.globalAlpha = 1;
                }
            }
        }
        if (shootNum!==false) {//0 would be registered as false
            fireLaser(shootNum);
        }
        if (!canSwitch) {
            shipDir=shipDir*-1;
            moveDown = true;
        }
        if (moveDown) {
            moved+=multi;
            if (moved>=moveTot) {
                moveDown = false;
                moved = 0;
            }
        }

}
function debris() {
    var ctx = document.getElementById("myCanvas").getContext("2d");
    ctx.fillStyle = "#adadad";
    for (a=0;a<debre.length;a++) {
        if (debre[a]) {
            ctx.fillRect(debre[a][0],debre[a][1],debre[a][2],debre[a][3]);
            for (x=0;x<ships.length;x++) {
                if (ships[x]) {
                    if (!ships[x].destroyed) {
                        if (debre[a]) {
                            if (ships[x].top+ships[x].height>=debre[a][1]) {
                                debre[a] = false;
                            }
                        }
                    }
                }
            }
            for (y=0;y<bulletsAr.length;y++) {
                if (bulletsAr[y]) {
                    if (debre[a]) {
                        if (objectsCollide(bulletsAr[y].left,bulletsAr[y].top,bulletsAr[y].left+bulletsAr[y].width,bulletsAr[y].top+bulletsAr[y].height,debre[a][0],debre[a][1],debre[a][0]+debre[a][2],debre[a][1]+debre[a][3])) {
                            debre[a] = false;
                            bulletsAr[y] = false;
                            bulletsLeft++;
                        }
                    }
                }
            }
            for (y=0;y<bulletsAr2.length;y++) {
                if (bulletsAr2[y]) {
                    if (debre[a]) {
                        if (objectsCollide(bulletsAr2[y].left,bulletsAr2[y].top,bulletsAr2[y].left+bulletsAr2[y].width,bulletsAr2[y].top+bulletsAr2[y].height,debre[a][0],debre[a][1],debre[a][0]+debre[a][2],debre[a][1]+debre[a][3])) {
                            debre[a] = false;
                            bulletsAr2[y] = false;
                        }
                    }
                }
            }
        }
    }
}

var bulletDelay = false;

function animate(){
    a=requestAnimationFrame(animate);
    drawBackground();
    prevX3 = prevX2;
    prevY3 = prevY2;
    prevX2 = prevX;
    prevY2 = prevY;
    prevX = ship.left;
    prevY = ship.top;
    if (space) {
        space = false;
        if (!bulletDelay) {
            fireLaser();
        }
    }
    if (showing) {
        textY+=5;
        if (textY>canvasSize2) {
            textY = offScreen;
            showing = false;
        }
    }
    if (gameOver) {
        if (enter) {
            enter = false;
            gameOver = false;
            setUp();
            space = false;
            mL = false;
            mR = false;
            ufo.left = resetUfoTo;
        }
    } else {
        drawLifes();
        if (mL&&!mR) {
            moveLeft();
        } else if(mR&&!mL) {
            moveRight();
        } else {
            updateVelocity(false,true);
        }
        drawLasers();
        drawLasers2();
        if (deadCount) {
            deadCount++;
            if (deadCount>60*5) {//Alive Delay
                deadCount = false;
            }
        }
        drawOldRect();
        drawRectangle();
        drawUfo();
        shootCount++;
        drawShips(true);
        debris();
        var tMult = multi/2;
        if (tMult>1.75) {
            tMult = 1.75;
        }
        if (shootCount>=60/tMult) {
            canShoot = true;
            shootCount = 0;
        }
    }
        if (ship.left<=0) {
            ship.left = 0;
            velocity = -velocity/1.5;
            if (velocity<=0) {
                velocity = 0.5;
            }
        }
        if (ship.left>=canvasSize2-50) {
            ship.left = canvasSize2-50;
            velocity = -velocity/1.5;
            if (velocity>=canvasSize2-50) {
                velocity = -0.5;
            }
        }
        drawText();
}


function startAnimation() {
    animate();
}

var velocity = 0;
var velocityChange = 0.045;
var maxVelocity = 3;
function updateVelocity(b,slowDown) {
    if (slowDown) {
        if (velocity<0) {
            velocity+=velocityChange
        } else if (velocity>0) {
            velocity-=velocityChange
        }
        if (velocity<=velocityChange&&velocity>=(-velocityChange)) {
            velocity = 0;
        }
        ship.left = ship.left+velocity;
    } else if (b) {
        velocity+=velocityChange;
    } else {
        velocity-=velocityChange;
    }
    if (velocity<-maxVelocity) {
        velocity = -maxVelocity;
    }
    if (velocity>maxVelocity) {
        velocity = maxVelocity;
    }
}
function moveRight() {
    updateVelocity(true);
    ship.left=ship.left+velocity;
}
function moveLeft() {
    updateVelocity(false);
    ship.left=ship.left+velocity;
}
$(document).keydown(function(event){  //jQuery code to recognize a keydown event
    var keycode = (event.keyCode ? event.keyCode : event.which);

    if(keycode === 65)//a
    {
        //moveLeft()
        mL = true;
    }
    if(keycode === 68)//d
    {
        //moveRight()
        mR = true;
    }
    if(keycode === 87)//w
    {
        mU = true;
    }
    if(keycode === 83)//s
    {
        mD = true;
    }
});
$(document).keyup(function(event){  //jQuery code to recognize a keyup event
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if(keycode === 65)//a
    {
        mL = false;
    }
    if(keycode === 68)//d
    {
        mR = false;
    }
    if(keycode === 87)//w
    {
        mU = false;
    }
    if(keycode === 83)//s
    {
        mD = false;
    }
    if (keycode === 32) {//space
        space = true;
    }
    if (keycode === 13) {//enter
        if (gameOver) {
            enter = true;
        }
    }
    if (keycode === 77&&doShortcut) {//m round shortcut
        for (a=0;a<ships.length;a++) {
            ships[a] = false;
        }
    }
    if (keycode === 85&&doShortcut) {//u ufo shortcut
        ufo.left = 0;
    }
});
