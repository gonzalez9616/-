/**
 * Created by Timothy D. Gonzalez
 * Started 4/3/19
 * Ended 5/ /19
 */

//Lazyness functions
function d(x) {//Get element
    return document.getElementById(x);
}
var alerts = 0;//Keep track
var als = [];
function al(x) {//Alert
    als.push([x.toString(),20,cW/2,100+(alerts*30)]);
    alerts++;
}
function alRead() {
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#000000";
    for (var a=0;a<als.length;a++) {
        drawText(als[a][0],als[a][1],als[a][2],als[a][3])
    }
    als = [];
}
//Constants
var backgroundColor = "#111111";
var fadeAmount = 0.025;
var camFrameCount = 6;
var charSize = 1;//Character size, 1=normal, 0.5=half, 2=double
var camTween = 0.1; //How much camera lerps forward (if start is 0 and end is 1, then camTween = 0.125 = result = 0.125)
var moveVel = 5;//Max Character speed
var moveAcel = 1;//Acceleration per frame
var jumpVel;//Max Jump Velocity startup()
var gravVel;//Max gravity velocity startup()
var gravAcel = 0.25;//Gravity Acceleration per frame
var buff = 0.3;//Pixel buffer to fix stuff
var cubeSizeDiv = 15;//Used for below in startup()
var cubeSize;
var spawnX;
var spawnY;
//These are not normal, used for fun and debugging
var splashScreen = true;
var infJump = false; //Makes debugging easier (and more fun)
//Object Values
var canvas = d("c");//Might be nil at startup, fixed in startup()
var ctx; //ctx for canvas, setup in startup()
var cW; //Canvas Width
var cH; //Canvas Height
var a; //Animation - stores current animation frame (if I want to end it for some reason)

//Integers / Floats
var topTextY = -100;
var bottomTextY = 1000;
var driftCam = 0;
var driftDir = true;
var dramaticEffectCount = 0;
var driftVelocity = 0;
var driftgA = 1;

var zeroCount = 0;
var consoleCount = 0;
var lastLevelX = 0;
//Bools
var gameStarted = false;
var gamePaused = false;
var pdb = false;
var pI = false;
var wI = false;
var sI = false;
var aI = false;
var dI = false;
var eI = false;
var enI = false;
var hasFallen = false;
var collisionSide = false;

//Arrays
var objs = [];
var texts = [];
var bullets = [];
var backgrounds = [];
var wires = [];
var connections = [];
var cam = [];
var levelData = [];

// /n represents new line, since fill text has no such command
var textData = ["Press A & D/nto move left & right","Press W/nor Space to Jump","Walk into cubes/nto pick them up","Press E/nto drop cubes","Some doors require multiple/ninputs to open","Cubes can act/n as shields"];

var level = 1;

var levels = [//Make making levels easier
    // P = full platform, L = left half, R = right half, C = Cube, G = Glass, ,=Next Row, B = Button, D = Door, - = Nothing, ' ' = Blank Room, E = Left facing Turret, Q = Right facing turret
    [                   //Level 1
    "P         CP," +
    "P          P," +
    "P          P," +
    "P          P," +
    "P          P," +
    "P          P," +
    "P          P," +
    "P          P," +
    "P          P," +
    "P          P," +
    "P          PPPPPPP," +
    "P          G     PP," +
    "P          G      P,"  +
    "P 0   1   2G 3    P," +
    "P                 -," +
    "P       L    B    D,"+
    "PPPPPPPPPPPPPPPPPPP",
        [ [ [1], 1, [[0.5,-5,-0.375]]       ]          ]  ], //button/activator connects to Door/item
    [                //Level 2
        "-P           P," +
        "-P           P," +
        "-P    C   C  P," +
        "-P           P," +
        "-P           P," +
        "-P           P," +
        "-P           P," +
        "-P           P," +
        "-P           P," +
        "-P           PPP," +
        "-P  4          P," +
        "               P,"  +
        "               P," +
        "     P         -," +
        "    P   BL  B  D,"+
        "PPPPPPPPPPPPPPPP",
        [ [ [1,2], 1, [[1.5,-7,-1.375],[1.5,-3,-1.375],[1.5,-6] ]       ]          ]  ], //button/activator connects to Door/item
    [                      //Level 3
        "-P            PPP," +
        "-P              P," +
        "-P              P," +
        "-P              -," +
        "-P B            D," +
        "-PPPL      PP  RP," +
        "-P             CP," +
        "-P    PP        P," +
        "-P              P," +
        "  PPP           P,"  +
        "        PP      P," +
        "      P         P," +
        "     P          P,"+
        "PPPPPPPPPP  PPPPP",
        [ [ [1], 1, [[-21.5,-15,22,2,-0.375] ]       ]          ]  ], //button/activator connects to Door/item
    [                      //Level 4
        "P  C          PPP," +
        "P               P," +
        "P 5             P," +
        "                P," +
        "               EP," +
        "PPPPPPPPPPP   RPP," +
        "P               P," +
        "PQ              P," +
        "PPL  PPPPPPPPPPPP," +
        "P               P," +
        "P               P," +
        "PPPPPPPPPPP     -," +
        "----------P  B  D,"+
        "----------PPPPPPP",
        [ [ [1], 1, [[0.5,-3,-0.375] ]       ]          ]  ], //button/activator connects to Door/item
    [                      //Level 5
        "-P G            P," +
        "-P G            P," +
        "-P G           EP," +
        "-P G   P    G  PP," +
        "-P G       EG   P," +
        "-P GP      PG   P," +
        "-P G        G   P," +
        "-P G   P   EG   P," +
        "-P G       PG   P," +
        "   GP       G   P," +
        "           EG   P," +
        "       P   PG   -," +
        "   C        GB  D,"+
        "PPPPPPPPPPPPPPPPP",
        [ [ [1], 1, [[0.5,-3,-0.375] ]       ]          ]  ], //button/activator connects to Door/item
    [                      //Level 6
        "-P              P," +
        "-P             EP," +
        "-P              P," +
        "-P             EP," +
        "-P              P," +
        "-P             EP," +
        "-P              P," +
        "-P             EP," +
        "-P              P," +
        "               EP," +
        "                P," +
        "                -," +
        "   CCCCB B B B  D,"+
        "PPPPPPPPPPPPPPL P",
        [ [ [1,2,3,4], 1, [[2.5,-9,-2.375],[2.5,-7,-2.375],[2.5,-5,-2.375],[2.5,-3,-2.375],[2.5] ]       ]          ]  ], //button/activator connects to Door/item
];

var createObj = function(src, title,x,y,w,h,a,z) {//Master function to create objects, tons of custom values
    var img   = new Image();
    img.src   = src;
    img.asrc = img.src;
    img.alt   = title;
    img.title = title;
    img.left = x;
    img.top = y;
    img.width = w;
    img.height = h;
    img.xv = 0;
    img.yv = 0;
    img.carrying = null;
    img.collision = true;
    img.anchored = a;
    img.aw = w;
    img.ah = h;
    img.dx = x;
    img.dy = y;
    img.reversed = false;
    img.revertCount = 3;
    img.zIndex = z;
    img.level = level;
    img.gA = 0;
    return img;
};


function drawLevelUsingLevelArray(s,offset) {//Take data array, and make a level. It makes making levels easier.
    var rows = s[0].split(",");
    rows.reverse();//Start from bottom
    //Ok, so how I want connections to work:
    //Basically, take the inputs (buttons) and if all of the inputs are pressed, then activate the output (door)
    var itemCount = 0;
    var activatorCount = 0;
    var curCLength = connections.length;
    for (var zz=0;zz<s[1].length;zz++) {
        connections.push([[false,false,false,false],false]);//Up to 4 and gate
        for (var ss=0;ss<s[1][zz][2].length;ss++) {
            var r = false;
            var lx = 0;
            var ly = 0;
            for (var sd=0;sd<s[1][zz][2][ss].length;sd++) {
                var v = s[1][zz][2][ss][sd]*cubeSize;
                if (r) {//Right
                    if (v<0) {
                        wires.push([[zz+curCLength,ss,level,0],lx+v,ly,-v+(cubeSize/4),cubeSize/4]);
                        lx = lx+v;
                    } else {
                        wires.push([[zz+curCLength,ss,level,0],lx,ly,v+(cubeSize/4),cubeSize/4]);
                        lx = lx+v;
                    }
                } else {//Down
                    if (v<0) {
                        wires.push([[zz+curCLength,ss,level,0],lx,ly,cubeSize/4,v]);
                        ly = ly+v;
                        if (sd===0) {
                            ly-=(cubeSize/8);
                        }
                    } else {
                        wires.push([[zz+curCLength,ss,level,0],lx,ly,cubeSize/4,v]);
                        ly = ly+v;
                        if (sd===0) {
                            ly-=(cubeSize/8);
                        }
                    }
                }
                r = !r;
            }
        }
    }
    for (var b=0;b<rows.length;b++) {
        for (var i=0;i<rows[b].length;i++) {
            var d = 1;
            var obj = rows[b].substring(i,i+1).toLowerCase();
            if (obj==="p") {//Regular Platform
                d = 0;
                objs.push(createObj("resources/block.png","Platform",i*cubeSize + offset,cH-(b+1)*cubeSize, cubeSize, cubeSize,true,3));
            } else if (obj==="l") {//Left Platform
                objs.push(createObj("resources/block.png","Platform",i*cubeSize + offset,cH-(b+1)*cubeSize,cubeSize/2,cubeSize,true,3));
            }else if (obj==="r") {//Right Platform
                objs.push(createObj("resources/block.png","Platform",(i+0.5)*cubeSize + offset,cH-(b+1)*cubeSize,cubeSize/2,cubeSize,true,3));
            } else if (obj==="g") {//Glass Centered Platform
                objs.push(createObj("resources/glass.png","Platform",i*cubeSize + offset + (cubeSize/4),cH-(b+1)*cubeSize,cubeSize/2,cubeSize,true,3));
            }  else if (obj==="c") {//Cube
                var cube = createObj("resources/cube.png","Cube",(i*cubeSize)+1 + offset,(cH-(b+1)*cubeSize)+1,cubeSize-2,cubeSize-2,false,4);
                cube.orx = (i*cubeSize)+1 + offset;
                cube.ory = (cH-(b+1)*cubeSize)+1;
                objs.push(cube);
            } else if (obj==="b") {//Button
                activatorCount++;
                var objj = createObj("resources/button.png","Button",(i*cubeSize) + offset,(cH-(b+1)*cubeSize)+(cubeSize/2),cubeSize,cubeSize/2,true,1);
                objj.top = objj.top+(objj.height/2);
                objs.push(objj);
                for (var z = 0;z<s[1].length;z++) {
                    for (var x = 0;x<s[1][z][0].length;x++) {
                        if (activatorCount===s[1][z][0][x]) {
                            if (!connections[z+curCLength][0][x]) {
                                connections[z+curCLength][0][x] = objj;
                            }
                        }
                    }
                }
            } else if (obj==="d") {//Level Door
                d = 2;
                itemCount++;
                var item = createObj("resources/door.png","Door",(i*cubeSize)+(cubeSize/4) + offset,(cH-(b+1)*cubeSize)-cubeSize,cubeSize/2,cubeSize*2,true,4);
                objs.push(item);
                for (var z = 0;z<s[1].length;z++) {
                    if (itemCount===s[1][z][1]) {
                        if (!connections[z+curCLength][1]) {
                            connections[z+curCLength] = [connections[z+curCLength][0],item]
                        }
                    }
                }
            }  else if (obj==="e") {//Enemy facing left
                var items = createObj("resources/enemy.png","Enemy",(i*cubeSize) + offset,(cH-(b+1)*cubeSize)-(cubeSize/2), cubeSize,cubeSize*1.5,true,4);
                objs.push(items);
            }   else if (obj==="q") {//Enemy facing right
                var itemss = createObj("resources/revenemy.png","Enemy",(i*cubeSize) + offset,(cH-(b+1)*cubeSize)-(cubeSize/2), cubeSize,cubeSize*1.5,true,4);
                itemss.reversed = true;
                objs.push(itemss);
            } else {
                d=0;
                if (obj===" ") {
                    d = 1;
                } else if (parseInt(obj)||obj==="0") {
                    d = 1;
                    texts.push([textData[parseInt(obj)],(i*cubeSize) + offset,cH-(b+1)*cubeSize,0]);
                }
            }
            if (d===1) {
                backgrounds.push([[level,0],i*cubeSize + offset, cH-(b+1)*cubeSize, cubeSize, cubeSize]);
            } else if (d===2) {
                backgrounds.push([[level,0],i*cubeSize + offset, cH-((b+1)*cubeSize)-cubeSize, (cubeSize/2), cubeSize*2]);
                backgrounds.push([[level+1,0],(i+0.5)*cubeSize + offset, cH-((b+1)*cubeSize)-cubeSize, (cubeSize/2), cubeSize*2]);
            }
        }
    }
}

function startLevel(l,o) {//Creates level l with a offset of o
    if (levels[level-1]) {
        drawLevelUsingLevelArray(levels[l-1],o);
        levelData.push([lastLevelX,false]);
    } else {
        driftgA = 1;
        gameStarted = false;
        splashScreen = "End";
    }
}

function startGame() {//Starts game, creates character
    var char = createObj("resources/char.png","Player",spawnX,spawnY,(cubeSize*charSize)-1,((cubeSize*2)*charSize)-1,false,2);
    char.revertCount = -1;
    char.animImgs = ["no load",createObj("resources/char.png"),createObj("resources/charwalk1.png"),createObj("resources/charwalk2.png"),createObj("resources/revchar.png"),createObj("resources/revcharwalk1.png"),createObj("resources/revcharwalk2.png")];
    char.loadedImg = 1;
    objs.push(char);
    for (var le = 1; le<level; le++) {
        levelData.push([0,false]);
    }
    startLevel(level,0);
}
function startup() {//Runs on startup of program, configures values
    objs = [];
    wires = [];
    backgrounds = [];
    canvas = document.getElementById("c");
    //Note: Need 3/2 ratio for width/height. Numbers must also be even (no decimals from /2)
    canvas.height = Math.floor((window.innerHeight-20)/2)*2;
    canvas.width = Math.floor((canvas.height*(3/2))/2)*2; //Gets width of the window
    cW = canvas.width;
    cH = canvas.height;
    cam = [];
    cam.x = cW/2;
    cam.sx = cam.x;
    cam.y = 0;
    cam.sx = cW/2;
    cam.fx = cW/2;
    cam.incrx = 0;
    cam.sector = 0;
    cubeSizeDiv = 20;
    cubeSize = Math.floor(cW/cubeSizeDiv/2)*2;//Even cube size scaled to canvas size
    jumpVel = cubeSize/7;
    gravVel = jumpVel*3;
    spawnX = cubeSize*2;
    spawnY = cubeSize;
    ctx = canvas.getContext("2d");
    startGame();

    topTextY = -cubeSize*4;
    bottomTextY = cH;

    animate()
}
function userDeath() {//User death animation
    var c = objs[0];
    if (c.revertCount===-1) {
        c.death = [];
        c.gA = 1;
        c.ox = c.left;
        c.oy = c.top;
        c.startedEndAn1 = false;
        for (var x=-1;x<=1;x+=0.15) {
            for (var y=-1;y<=0.5;y+=0.15) {
                c.death.push([c.left+(c.width/2),c.top+(c.height),x,y,Math.random(),1])
            }
        }
    }
    var an1done = false;
    for (var z=0;z<c.death.length;z++) {
        c.death[z][5]-=0.025;
        c.death[z][4]-=0.025;
        if (c.death[z][4]<0) {
            c.death[z][4]=0;
        }
        if (c.death[z][5]<0) {
            c.death[z][5] = 0;
            an1done = true;
            if (!c.startedEndAn1) {
                c.startedEndAn1 = true;
                c.gA = 0;
            }
        }
        c.death[z][0]+=c.death[z][2]*(1+(Math.floor(c.death[z][4]*2.5)));
        c.death[z][1]+=c.death[z][3]*(1+(Math.floor(c.death[z][4]*2.5)));
        ctx.fillStyle = "#ff0000";
        ctx.globalAlpha = c.death[z][5];
        ctx.fillRect(c.death[z][0]- (cam.x - (cW / 2)),c.death[z][1] - cam.y,cubeSize/5,cubeSize/5)
    }
    c.hide = true;
    c.anchored = true;
    c.collision = false;
    c.revertCount = c.revertCount+1;
    c.dc = c.carrying;
    if (an1done) {
        c.hide = false;
        c.left+=(spawnX-c.left)*0.125;
        c.top+=(spawnY-c.top)*0.125;
        if (Math.abs(spawnX-c.left)<=2&&Math.abs(spawnY-c.top)<=2) {
            c.left = spawnX;
            c.top = spawnY;
        }
        c.dx = c.left;
        c.dy = c.top;
        c.gA+=0.035;
        if (c.gA>1) {
            c.gA = 1;
        }
    }
    if (c.revertCount>85) {
        bullets = [];
        c.hide = false;
        c.collision = true;
        if (c.carrying) {
            c.carrying.collision = true;
            c.carrying = null;
        }
        c.anchored = false;
        c.revertCount = -1;
        c.left = spawnX;
        c.top = spawnY;
        c.dx = c.left;
        c.dy = c.top;
    }
}
function userMovement() {//Processes user's input and converts it into a velocity
    var char = objs[0];
    if (char.revertCount<=-1) {
        var addX = 0;//Goal x velocity
        if (aI) {
            addX = addX-moveVel;
        }
        if (dI) {
            addX = addX+moveVel;
        }
        var newXV = char.xv;
        if (char.xv>addX) {
            newXV = newXV-moveAcel;
            if (newXV<addX) {
                newXV = addX;
            }
        } else {
            newXV = newXV+moveAcel;
            if (newXV>addX) {
                newXV = addX;
            }
        }
        char.xv = newXV;
        if (char.yv===0) {
            zeroCount+=1;
        }
        if (!wI) {
            consoleCount = 0;
        }
        if (char.yv>0||zeroCount>1) {
            hasFallen = true;
        }
        if (wI&&(char.yv===0||(consoleCount===0&&infJump))&&(hasFallen||infJump)) {
            if (char.yv !== 0) {
                consoleCount = 1;
            }
            char.yv = -jumpVel;
            hasFallen = false;
            zeroCount = 0;
        }
        if (char.xv>0) {
            char.reversed = false;
        } else if (char.xv<0) {
            char.reversed = true;
        }
    } else {
        char.xv = 0;
        char.yv = 0;
    }
}
function cornersInCorners(obj1,obj2) {//Detects if 2 objects' corners intersect with each other
    var corners = [[0,0],[0,1],[1,1],[1,0],[0.5,0],[0,0.5],[1,0.5],[0.5,1]];
    for (a=0;a<corners.length;a++) {
        var centerx = obj1.left;
        var centery = obj1.top;
        var cornerx = centerx+(corners[a][0]*(obj1.width));
        var cornery = centery+(corners[a][1]*(obj1.height));
        //Have corners, now we need the obj2 poss
        var sx = obj2.left;
        var sy = obj2.top;
        var ex = sx+(obj2.width);
        var ey = sy+(obj2.height);
        //Now we compare
        if (cornerx>=sx&&cornerx<=ex && cornery>sy&&cornery<ey) {
            return true;
        }
    }
    return false;
}
function objsCollide(obj1,obj2) {//Detects if two objects are colliding using method cornersInCorners
    if (cornersInCorners(obj1,obj2)) {
        return true
    }
    return cornersInCorners(obj2, obj1);
}

function doPhysics() {//Main Physics loop. This runs calculations too figure out how to respond when objects are colliding, depending on their properties and object values.

    var newObjs = [];//We want to unload objects off the screen, so put objects on-screen in here

    for (var x = 0; x < objs.length; x++) {//Loop through objects
        var t = objs[x];
        if (t) {
            if (t.left+t.width+cubeSize>=cam.x-(cW/2)) {//Object is on-screen
                newObjs.push(t);//Keep the object till the next frame
            }

            if (t.title === "Cube") {//Cube physics
                t.xv = t.xv * 0.95;//Simulates friction
                if (t.top >= cH + cubeSize * 2 || objs[0].revertCount>-1) {//Respawns cube if off the map or player dies
                    if (objs[0].revertCount<=-1) {
                        t.xv = 0;
                        t.yv = 0;
                        t.left = t.orx;
                        t.dx = t.left;
                        t.top = t.ory;
                        t.dy = t.top;
                        t.collision = true;
                        t.anchored = true;
                    } else {
                        t.xv = 0;
                        t.yv = 0;
                        t.left+=(t.orx-t.left)*0.125;
                        t.top+=(t.ory-t.top)*0.125;
                        t.dx = t.left;
                        t.dy = t.top;
                        t.collision = false;
                        t.anchored = true;
                        if (Math.abs(t.orx-t.left)<=10) {
                            t.collision = true;
                            t.anchored = false;
                        }
                    }
                }
            }

            //Gravity calculation
            var newYv = t.yv;
            newYv = newYv + gravAcel;//Increases velocity
            if (newYv > gravVel) {//Stops increasing at max velocity
                newYv = gravVel;
            }
            if (!t.anchored && objs[x].collision) {//If the object is collidable and not anchored, apply gravity
                t.yv = newYv;
            }

            //Keep Current Velocities
            t.left += t.xv;
            t.dx += t.xv;
            t.top += t.yv;
            t.dy += t.yv;

            //Run object collisions
            if (objs[x].collision) {//Only run if the object is collidable
                var leftFig = false;
                for (var y = 0; y < objs.length; y++) {
                    if (objs[y]) {
                        if (y !== x && objs[y].collision) {
                            var t2 = objs[y];
                            if (t.title === "Player" || (t.anchored === false && (t2.title !== "Player"))) { //If the player is colliding with something, or another object like it is colliding with something other than the player
                                if (!leftFig) {//We don't want to factor the left velocity when offsetting for the upward velocity
                                    t.left -= t.xv;
                                }
                                if (objsCollide(t, t2, 1)) {//The object's y velocity is the problem
                                    //Now we need to handle reversing the movement, so it appears that the player just stopped when they for example hit a wall
                                    //Handle up/down collision first
                                    if (t.yv !== 0) {//Only way to collide with top/bottom of object
                                        if (t.top + t.height > t2.top) {
                                            //if ((t.left + t.width > t2.left + 5 && t.left < t2.left + t2.width - 5) || (t.top + t.height < t2.top) || t.yv > 0) {
                                            if (!(t.top + t.height >= t2.top + (t2.height / 2))) {
                                                if (t.yv >= 0) {//Positive y velocity = falling
                                                    t.top = t2.top - t.height - buff;
                                                    t.dy = t2.top - t.height;
                                                    t.yv = 0;
                                                    if (x === 0) {
                                                        hasFallen = true;
                                                    }
                                                    if (t2.title === "Button") {
                                                        //t2.height = t2.ah/2;
                                                        //t2.top = t2.dy+(t2.height);
                                                        t2.src = "resources/buttonpressed.png";
                                                        t2.revertCount = 3;
                                                    }
                                                }
                                            } else {
                                                //Second condition prevents:
                                                // _
                                                //|_|
                                                //| |
                                                //|_|
                                                //Box being judges as hitting the bottom when top is above, causing bugs
                                                if (t.yv <= 0 && t.top >= t2.top) {//Negative y velocity = going up
                                                    if (t2.title === "Cube" && t.title === "Player") {
                                                        if ((t2.top + t2.height >= t.top && t2.yv > 1) || t2.yv > 10) {
                                                            userDeath();
                                                        }
                                                    }
                                                    t.top = t2.top + t2.height + buff;
                                                    t.dy = t2.top + t2.height;
                                                    t.yv = 0;
                                                }
                                            }
                                            //}
                                        }
                                    }
                                }

                                if (!leftFig) {
                                    t.left += t.xv;
                                }
                                if (objsCollide(t, t2, 2)) {//The oject's x velocity is the problem
                                    if (t.left + t.width > t2.left) {
                                        if (t2.title === "Cube" && t.title === "Player" && t2.yv > 10) {//If cube is hitting the player
                                            userDeath();
                                        } else {
                                            if (t2.title === "Cube" && t.title === "Player" && t.carrying === null) {//Pickup cube if not at a terminal velocity and hands are empty
                                                t.carrying = t2;
                                                t2.collision = false;
                                            } else {//Offset calculations
                                                leftFig = true;//We did the math for the x velocity
                                                if (t.left + t.width >= t2.left + (t2.width / 2)) {//Right collision, so offset based off of that
                                                    t.left = t2.left + t2.width + (buff);
                                                    t.dx = t2.left + t2.width;
                                                    if (t2.top < t.top + t.height - 1) {//Prevent glitching under the map (very weird case)
                                                        t.xv = 0;
                                                    }
                                                    collisionSide = true;
                                                } else {//Left collision, so offset based off of that
                                                    t.left = t2.left - t.width - (buff);
                                                    t.dx = t2.left - t.width;
                                                    t.xv = 0;
                                                    collisionSide = true;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    objs = newObjs; //Unload old objects
}

function animate() {
    a = requestAnimationFrame(animate);
    ctx.globalAlpha = 1;
    alerts = 0;
    if (!gamePaused) {
        background();
        if (!gameStarted) {//Splash Screen with animation
            if (!splashScreen) {
                gameStarted = true;
            }

            dramaticEffectCount++;

            if (dramaticEffectCount > 40) {
                topTextY += (((cH / 2) - (cubeSize * 4)) - topTextY) * 0.05;
                bottomTextY += (((cH / 2)) - bottomTextY) * 0.05;
                var camGoal = -cubeSize / 2;
                var addd = -0.5;
                if (driftDir) {
                    camGoal = -camGoal;
                    addd = addd * -1;
                    if (driftVelocity >= addd) {
                        driftVelocity = addd;
                    }
                } else {
                    if (driftVelocity <= addd) {
                        driftVelocity = addd;
                    }
                }
                driftVelocity += (addd * 0.05);
                driftCam += driftVelocity;
                if (Math.abs(driftCam - camGoal) <= 1) {
                    driftDir = !driftDir;
                }
                if (driftgA < 1) {
                    driftgA = Math.max(driftgA - 0.01, 0);
                } else if (enI) {
                    driftgA = 0.99;
                }

                if (driftgA <= 0) {
                    if (splashScreen !== "End") {
                        gameStarted = true;
                    } else {
                        window.location.reload();
                    }
                }

                ctx.globalAlpha = driftgA;
                var b = cubeSize / 8;
                if (splashScreen !== "End") {
                    ctx.fillStyle = "#000000";
                    drawText("The", cubeSize * 4, driftCam + (cW / 2), topTextY);//Black background
                    drawText("Test", cubeSize * 4, driftCam + (cW / 2), bottomTextY);
                    drawText("Press Enter To Start", cubeSize, driftCam + (cW / 2), bottomTextY + (cubeSize * 5));
                    ctx.fillStyle = "#bbbbbb";
                    drawText("The", cubeSize * 4, driftCam + (cW / 2), topTextY + b);//White front text (Create 3D effect)
                    drawText("Test", cubeSize * 4, driftCam + (cW / 2), bottomTextY + b);
                    drawText("Press Enter To Start", cubeSize, driftCam + (cW / 2), bottomTextY + (cubeSize * 5) + b);
                } else {
                    ctx.fillStyle = "#000000";
                    drawText("You", cubeSize * 4, driftCam + (cW / 2), topTextY);//Black background
                    drawText("Escaped!", cubeSize * 4, driftCam + (cW / 2), bottomTextY);
                    drawText("Press Enter To Play Again!", cubeSize, driftCam + (cW / 2), bottomTextY + (cubeSize * 5));
                    ctx.fillStyle = "#bbbbbb";
                    drawText("You", cubeSize * 4, driftCam + (cW / 2), topTextY + b);//White front text (Create 3D effect)
                    drawText("Escaped!", cubeSize * 4, driftCam + (cW / 2), bottomTextY + b);
                    drawText("Press Enter To Play Again!", cubeSize, driftCam + (cW / 2), bottomTextY + (cubeSize * 5) + b);

                }
            }

        } else if (gameStarted) {//No splash screen
            userMovement();//Setup velocity for character based on movement
            //Level Loading
            if (!levelData[level - 1]) {//If this level has yet to be loaded, load it
                startLevel(level, lastLevelX);
            }

            //Object Physics
            doPhysics();

            //Camera
            var char = objs[0];
            var newSector = 0;
            for (var sect = 0; sect < levelData.length; sect++) {
                if (char.left > levelData[sect][0]) {
                    newSector = sect;
                }
            }
            if (!cam.xcount) {
                cam.xcount = 0;
            }
            if (newSector !== cam.sector) {//New sector
                if (cam.xcount > camFrameCount) {
                    cam.sector = newSector;
                    cam.xcount = 0;
                    //We have just entered a new level, cue get rid of stuff thing
                    if (char.carrying) {
                        char.carrying.top = cH + cubeSize;
                        char.carrying.collision = true;
                        char.carrying.anchored = false;
                    }
                    char.carrying = null;
                    spawnX = levelData[cam.sector][0] + (cubeSize * 2) + 1;
                } else {
                    cam.xcount = cam.xcount + 1;
                }
            }

            cam.fx = ((levelData[cam.sector][0]) + (0.5 * cW));

            if (cam.fx < (cW / 2)) {
                cam.fx = cW / 2;
            }
            //We want to move cam.x to cam.fx
            //Start = cam.sx (actually, cam.x because we update every frame and want to slow down nicely), Finish = cam.fx
            //Since javascript has no lerp function (that I know of), we implement one ourselves
            var moveAmt = cam.fx - cam.x; //Amount to move
            var add = camTween * moveAmt;
            cam.sx = cam.sx + add;
            cam.x = Math.floor(cam.sx);

            cam.xoff = -(cam.x - (cW / 2));
            cam.yoff = -cam.y;

            //CCarrying Objects
            var c = char.carrying;
            if (c && char.revertCount < 0) {
                c.left = char.left + (char.width);
                if (char.reversed) {
                    c.left = char.left - (c.width);
                }
                c.dx = c.left;
                c.top = (char.top + (char.height / 2) - (c.height / 2));
                c.dy = c.top;
                if (eI) {
                    c.left = char.left + char.width + (cubeSize / 8);
                    if (char.reversed) {
                        c.left = char.left - (cubeSize / 8) - (c.width);
                    }
                    var noCollision = true;
                    for (var a = 0; a < objs.length; a++) {
                        if (objs[a] !== c && objs[a] !== char) {
                            if (objs[a].collision) {
                                if (objsCollide(c, objs[a])) {
                                    noCollision = false;
                                    break;
                                }
                            }
                        }
                    }
                    c.left = c.dx;
                    if (noCollision) {
                        char.width = char.aw;
                        c.left = char.left + char.width + (cubeSize / 8);
                        if (char.reversed) {
                            c.left = char.left - (cubeSize / 8) - (c.width);
                        }
                        c.dx = c.left;
                        c.xv = char.xv * 1.5;
                        c.yv = char.yv * 1.5;
                        c.collision = true;
                        char.carrying = null;
                    }
                }
            }

            //Connections
            for (var z = 0; z < connections.length; z++) {
                var tt = connections[z];
                if (tt[0] && tt[1]) {
                    var isOpen = true;
                    for (var a = 0; a < tt[0].length; a++) {
                        if (tt[0][a]) {
                            if (tt[0][a].src === tt[0][a].asrc) {
                                isOpen = false;
                            }
                        }
                    }
                    var randomBool = (tt[1].title !== "Door" || (cam.sector < tt[1].level));
                    if (isOpen && randomBool) {
                        if (tt[1].title === "Door") {
                            tt[1].collision = false;
                            tt[1].src = "resources/opendoor.png";
                            if (level === tt[1].level) {
                                level++;
                                lastLevelX = Math.floor((tt[1].left + tt[1].width) / cubeSize) * cubeSize;
                            }
                        }
                    } else {
                        if (tt[1].title === "Door") {
                            tt[1].collision = true;
                            tt[1].src = "resources/door.png";
                            if (level === tt[1].level + 1 && !(isOpen && !randomBool)) {
                                level--;
                            }
                        }
                    }
                }
            }

            //Draw objects
            var layers = [[], [], [], [], [], [], []];
            for (var x = 0; x < objs.length; x++) {//Now configure them
                var t = objs[x];
                if (t) {
                    if (!t.hide) {
                        if (t.title === "Player") {
                            if (!t.ssrc) {
                                t.ssrc = "char";
                                t.srccnt = 0;
                            }
                            //Orientation
                            if (t.reversed) {
                                if (t.xv !== 0 && zeroCount > 1) {
                                    if (t.srccnt <= 0) {
                                        t.srccnt = 5;
                                        if (t.ssrc === "char" || t.ssrc === "2") {
                                            t.loadedImg = 5;
                                            t.ssrc = "1"
                                        } else {
                                            t.loadedImg = 6;
                                            t.ssrc = "2"
                                        }
                                    } else {
                                        t.srccnt--;
                                    }
                                } else {
                                    t.loadedImg = 4;
                                    t.ssrc = "char";
                                    t.srccnt = 0;
                                }
                            } else {
                                if (t.xv !== 0 && zeroCount > 1) {
                                    if (t.srccnt <= 0) {
                                        t.srccnt = 5;
                                        if (t.ssrc === "char" || t.ssrc === "2") {
                                            t.loadedImg = 2;
                                            t.ssrc = "1"
                                        } else {
                                            t.loadedImg = 3;
                                            t.ssrc = "2"
                                        }
                                    } else {
                                        t.srccnt--;
                                    }
                                } else {
                                    t.loadedImg = 1;
                                    t.ssrc = "char";
                                    t.srccnt = 0;
                                }
                            }
                        } else if (t.title === "Button") {
                            if (t.revertCount <= 0) {
                                t.src = t.asrc;
                                t.revertCount = 3;
                            } else {
                                t.revertCount -= 1;
                            }
                        } else if (t.title === "Enemy") {
                            if (!t.shootCount && t.shootCount !== 0) {
                                t.shootCount = 60 / 3;
                            }
                            if (t.shootCount <= 0) {
                                if ((char.top + (char.height / 2) >= t.top && char.top <= t.top + t.height && !t.reversed && char.left <= t.left) || (char.top + (char.height / 2) >= t.top && char.top <= t.top + t.height && t.reversed && char.left >= t.left)) {
                                    t.shootCount = 60 / 3;
                                    //Shoot
                                    var shot = [];
                                    shot.left = t.left;
                                    shot.top = t.top + (t.height / 2) - (cubeSize / 8 / 2);
                                    shot.width = cubeSize;
                                    shot.height = cubeSize / 8;
                                    shot.xv = -cubeSize / 8;
                                    if (t.reversed) {
                                        shot.xv = shot.xv * -1;
                                    }
                                    shot.gA = 1;
                                    bullets.push(shot);
                                }
                            }
                            {
                                t.shootCount--;
                            }
                        }
                        layers[t.zIndex].push(t);
                    }
                }
            }

            for (var l = 0; l < backgrounds.length; l++) {//Draw backgrounds
                var t = backgrounds[l];
                if (t[0][0] > level) {
                    t[0][1] = t[0][1] - fadeAmount;
                    if (t[0][1] < 0) {
                        t[0][1] = 0;
                    }
                } else {
                    t[0][1] = t[0][1] + fadeAmount;
                    if (t[0][1] > 1) {
                        t[0][1] = 1;
                    }
                }
                ctx.globalAlpha = t[0][1];
                ctx.fillStyle = "#cccccc";
                ctx.fillRect(t[1] + cam.xoff, t[2] + cam.yoff, t[3], t[4]);
            }


            //Drawing Text (Tutorial Stuff)
            for (var l = 0; l < texts.length; l++) {//Draw text
                var txts = texts[l][0].split("/n"); //Split by our custom newline separator
                var xSize = (cubeSize * 0.5) / txts.length;
                var xLoc = texts[l][1] + (cubeSize / 2);
                var dist = Math.abs(char.left + (char.width / 2) - xLoc);
                if (dist <= cubeSize * 2) {
                    texts[l][3] = Math.min(1, texts[l][3] + 0.05)
                } else {
                    texts[l][3] = Math.max(0, texts[l][3] - 0.05)
                }
                ctx.fillStyle = "#000000";
                ctx.globalAlpha = texts[l][3];
                for (var x = 0; x < txts.length; x++) {
                    drawText(txts[x], xSize, xLoc + cam.xoff, texts[l][2] + (x * xSize) + cam.yoff);
                }
            }

            var newBullets = [];

            for (var l = 0; l < bullets.length; l++) {//Draw bullets
                if (bullets[l]) {
                    if (!bullets[l].used) {
                        bullets[l].left += bullets[l].xv;
                    }
                    for (var x = 0; x < objs.length; x++) {
                        if (objs[x] && bullets[l]) {
                            if (!bullets[l].used && objs[x].title !== "Enemy" && objs[x].title !== "EnemyBullet") {
                                if (objsCollide(objs[x], bullets[l]) && !objs[x].hide) {
                                    bullets[l].used = true;
                                    if (objs[x].title === "Player") {
                                        userDeath();
                                    }
                                }
                            }
                        }
                    }
                    if (bullets[l]) {
                        if (!bullets[l].used && bullets[l].left <= cam.x - (cW / 2) - (cubeSize * 10)) {
                            bullets[l].used = true;
                        }
                    }
                    if (bullets[l].used) {
                        bullets[l].gA -= 0.15;
                        if (bullets[l].gA <= 0) {
                            bullets[l] = false;
                        }
                    }
                    if (bullets[l]) {
                        ctx.globalAlpha = bullets[l].gA;
                        ctx.fillStyle = "#ff0000";
                        ctx.fillRect(bullets[l].left + cam.xoff, bullets[l].top + cam.yoff, bullets[l].width, bullets[l].height);
                        newBullets.push(bullets[l]);
                    }
                }
            }

            bullets = newBullets;

            for (var l = 0; l < layers.length; l++) {//Draw layers
                for (var x = 0; x < layers[l].length; x++) {
                    var t = layers[l][x];
                    if (t.level > level) {
                        t.gA = t.gA - fadeAmount;
                        if (t.gA < 0) {
                            t.gA = 0;
                        }
                    } else {
                        t.gA = t.gA + fadeAmount;
                        if (t.gA > 1) {
                            t.gA = 1;
                        }
                    }
                    ctx.globalAlpha = t.gA;
                    var img = t;
                    if (t.loadedImg) {
                        img = t.animImgs[t.loadedImg];
                    }
                    ctx.drawImage(img, t.dx - (cam.x - (cW / 2)), t.dy - cam.y, t.aw, t.ah);
                }
            }


            for (var l = 0; l < wires.length; l++) {//Draw wires
                var t = wires[l];
                if (connections[t[0][0]]) {
                    var t2 = connections[t[0][0]][1];
                    var mainObj = connections[t[0][0]][0][t[0][1]];
                    if (!mainObj) {
                        mainObj = connections[t[0][0]][1]
                    }
                    if (t2 && mainObj) {//Work back from the door, wire goes from door to item
                        if (t[0][2] > level) {
                            t[0][3] = t[0][3] - fadeAmount;
                            if (t[0][3] < 0) {
                                t[0][3] = 0;
                            }
                        } else {
                            t[0][3] = t[0][3] + fadeAmount;
                            if (t[0][3] > 1) {
                                t[0][3] = 1;
                            }
                        }
                        ctx.globalAlpha = t[0][3];
                        if (mainObj.src === mainObj.asrc) {
                            ctx.fillStyle = "#000000";
                        } else {
                            ctx.fillStyle = "#00aaff";
                        }
                        ctx.fillRect((t2.left + (t2.width / 2) - (cubeSize / 4 / 2)) + t[1] - (cam.x - (cW / 2)), t2.top + t2.height + t[2] - cam.y, t[3], t[4]);
                    }
                }
            }


            //User death
            if (objs[0].revertCount > -1) {//Continue death animation after first frame if the player is dieing
                userDeath();
            } else if (objs[0].top + objs[0].height + 10 > cH) {
                userDeath()
            }
        }
    }
    //Game pausing
    if (pI) {
        if (!pdb) {
            pdb = true;
            gamePaused = !gamePaused;
            if (gamePaused) {
                ctx.globalAlpha = 1;
                ctx.fillStyle = "#ffffff";
                ctx.strokeStyle = "#000000";
                ctx.lineWidth = cubeSize/10;
                drawText("Game Currently Paused",cubeSize,cW/2,cubeSize,true);
            }
        }
    } else {
        pdb = false;
    }
    //al("Working!");
    alRead(); //Show custom alerts for debugging
}
function background() {//Draw the background to cover up old drawings
    ctx.fillStyle=backgroundColor;
    ctx.strokeStyle=backgroundColor;
    ctx.fillRect(0,0,cW,cH);
}
function drawText(txt,size,x,y,stroke) {//Draw text txt with size size at x,y
    ctx.font = size+"px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    if (stroke) {
        ctx.strokeText(txt,x,y);
    }
    ctx.fillText(txt, x,y);
}
//User Inputs
$(document).keydown(function(event){  //jQuery code to recognize a keydown event
    var keycode = (event.keyCode ? event.keyCode : event.which);

    if(keycode === 65)//a
    {
        aI = true;
    }
    if(keycode === 68)//d
    {
        dI = true;
    }
    if(keycode === 87)//w
    {
        wI = true;
    }
    if(keycode === 83)//s
    {
        sI = true;
    }
    if(keycode === 69)//e
    {
        eI = true;
    }
    if(keycode === 80)//p
    {
        pI = true;
    }
    if (keycode === 32) {//space
        wI = true;
    }
    if (keycode === 13) {//enter
        enI = true;
    }
});
$(document).keyup(function(event){  //jQuery code to recognize a keyup event
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if(keycode === 65)//a
    {
        aI = false;
    }
    if(keycode === 68)//d
    {
        dI = false;
    }
    if(keycode === 87)//w
    {
        wI = false;
    }
    if(keycode === 83)//s
    {
        sI = false;
    }
    if(keycode === 69)//e
    {
        eI = false;
    }
    if(keycode === 80)//p
    {
        pI = false;
    }
    if (keycode === 32) {//space
        wI = false;
    }
    if (keycode === 13) {//enter
        enI = false;
    }
});
//alert("Code works");