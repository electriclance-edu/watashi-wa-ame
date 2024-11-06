var dropletCount = 0
const RAINDROP_RANGE = 250;
var SCREEN_CENTER;
var BAR_LENGTH = 1500
const raindropOffset = {x:0,y:0}

var mouse_pos = {x:0,y:0}
var gameInterval;

var music; // Holds the current song playing for any functions to access.
var currentQuarterBar; // Holds the current quarter bar. Updated by attemptPlay() in normal mode.

var gameStartMS;
var timings = [];

function init() {
    SCREEN_CENTER = {
        x:window.innerWidth / 2,
        y:window.innerHeight / 2
    }
    var onclick = ()=>{
        document.removeEventListener("mousedown", onclick, true);
        intro();
    }
    document.addEventListener("mousedown", onclick, true);
}
function intro() {
    music = new Audio("resources/i_am_the_rain_intro.mp3");
    music.loop = true;
    music.play();
    var rain = new Audio("resources/rain_ambience.mp3");
    rain.loop = true;
    rain.volume = 0.1;
    rain.play();

    var dialog = document.getElementById("Dialog");
    typewrite(dialog,"i am the rain...");

    setTimeout(()=>{
        var gamemode = document.getElementById("Gamemode1");
        var desc = document.getElementById("GamemodeDesc1");
        typewrite(desc,"normal mode. protect her for the duration of her song.",10)
        appear(gamemode);
        var ping = new Audio("resources/c.mp3");
        ping.play();
    },2000);
    setTimeout(()=>{
        var gamemode = document.getElementById("Gamemode2");
        var desc = document.getElementById("GamemodeDesc2");
        typewrite(desc,"endless downpour. how long can you protect her?",10);
        appear(gamemode)
        var ping = new Audio("resources/c.mp3");
        ping.play();
    },2500);
    // setTimeout(()=>{
    //     var gamemode = document.getElementById("Gamemode3");
    //     var desc = document.getElementById("GamemodeDesc3");
    //     typewrite(desc,"debug. behavior inconsistent.",10);
    //     appear(gamemode)
    //     var ping = new Audio("resources/c.mp3");
    //     ping.play();
    // },3000);
}
function startGame(gamemode) {
    gameStartMS = Date.now();
    if (gamemode == "normal") {
        var ping = new Audio("resources/e.mp3");
        ping.play();
        music.pause();
        music = new Audio("resources/i_am_the_rain.mp3");
        music.loop = false;
        music.play();
        currentQuarterBar = -4;
        gameInterval = accurateInterval(attemptPlay,BAR_LENGTH/4)
    } else if (gamemode == "endless") {
        alert("work in progress")
    } else {
        var ping = new Audio("resources/e.mp3");
        ping.play();
        music.pause();
        music = new Audio("resources/sixty_four_bars.mp3");
        music.loop = false;
        music.play();
        gameInterval = accurateInterval(debug_createFixed,BAR_LENGTH)
        gameInterval = accurateInterval(debug_createSmallRaindrop,BAR_LENGTH/4)
    }
    document.getElementById("Gamemode1").classList.add("state-fade");
    document.getElementById("Gamemode2").classList.add("state-fade");
    document.getElementById("Gamemode3").classList.add("state-fade");
}
function stopGame() {
    gameInterval.cancel()
}
// For normal mode
function attemptPlay() {
    console.log("hii",currentQuarterBar);
    attemptPlayAt(currentQuarterBar++);
}
function attemptPlayAt(time) {
    if (song.hasOwnProperty(time)) {
        var type = song[time];
        if (type == "drop") {
            createRaindrop()
        }
    }
}

// For endless mode
function tenBarInterval() {

    repeatIntervalN(()=>{
        decision = randChoice({
            // "half_drop":80,
            // "one_drop":80,
            // "two_drops":40,
            "four_drops":20,
            // "cluster":10,
        });
        if (decision == "half_drop") {
            createRaindropOrDoubleDrop()
        }
        if (decision == "one_drop") {
            repeatIntervalN(createRaindropOrDoubleDrop,BAR_LENGTH,2)
        } else if (decision == "two_drops") {
            repeatIntervalN(createRaindropOrDoubleDrop,BAR_LENGTH/2,4)
        } else if (decision == "four_drops") {
            repeatIntervalN(createRaindropOrDoubleDrop,BAR_LENGTH/4,8)
        } else if (decision == "cluster") {
            repeatIntervalN(createRaindropCluster,BAR_LENGTH,2)
        }
    },BAR_LENGTH*2,5)
}
function repeatIntervalN(func,length,n) {
    var repeats = 0;
    var interval = accurateInterval(()=>{
        func(repeats);
        repeats++;
        if (repeats == n) {
            interval.cancel()
        }
    },length);
}
// Creates either one or two raindrops.
function createRaindropOrDoubleDrop({
    start_x,
    start_y,
    end_x,
    end_y,
    chance = {normal:90,double:0}
}={}) {
    var decision = randChoice(chance)
    if (decision == "double") {
        console.log("double")
        createRaindrop(arguments)
        createRaindrop(arguments)
    } else {
        createRaindrop(arguments)
    }
}
function createLineDeluge({
        time = BAR_LENGTH*3   
}={}) {
    indiv_length = time / 4
    setTimeout(() => createRaindropLine({
        side:"up",
        directions: Array(4).fill().map(() => "type-down")
    }), indiv_length * 0);
    setTimeout(() => createRaindropLine({
        side:"right",
        directions: Array(4).fill().map(() => "type-left")
    }), indiv_length * 1);
    setTimeout(() => createRaindropLine({
        side:"down",
        directions: Array(4).fill().map(() => "type-up")
    }), indiv_length * 2);
    setTimeout(() => createRaindropLine({
        side:"left",
        directions: Array(4).fill().map(() => "type-right")
    }), indiv_length * 3);
}
function createRaindropLine({
        side = randomDirection(),
        directions = Array(4).fill().map(() => "type-" + randomDirection()),
        length = BAR_LENGTH
}={}) {
    const MARGIN = 10;
    var angle = {
        "up":0,
        "right":90,
        "down":-180,
        "left":270
    }[side];
    var point = {
        "up":{x:0 + MARGIN,y:0 + MARGIN},
        "right":{x:100 - MARGIN,y:0 + MARGIN},
        "down":{x:100 - MARGIN,y:100 - MARGIN},
        "left":{x:0 + MARGIN,y:100 - MARGIN}
    }[side]

    const drops = directions.length
    repeatIntervalN((repeats)=>{
        var spawnAt = angleTranslate(
            point.x,
            point.y,
            (100 - 2 * MARGIN) / (drops - 1) * repeats,
            angle,
        )
        createRaindrop({
            start_x:spawnAt.x,
            start_y:spawnAt.y,
            end_x:50 + randIntCircular(2),
            end_y:50 + randIntCircular(2),
            direction:directions[repeats]
        })
    },length / drops,drops)
}
// Returns a random key from the given dict based on its value,
// which is interpreted as the random weight of selecting that key.
// dict must be an object whose values are all positive numbers.
// EX: The dict {"hi":1,"hello":2} would roughly return "hi" 1 times out of 3, and "hello" 2 times out of 3.
function randChoice(dict) {
    var keys = Object.keys(dict);
    var vals = Object.values(dict);
    var max = vals.reduce((a,b) => a + b, 0)
    var decision = randInt(max - 1);
    var subsum = 0;
    for (var i = 0; i < vals.length; i++) {
        subsum += vals[i]
        if (decision < subsum) {
            return keys[i]
        }
    }
    console.warn("randChoice(dict): Unexpected behavior, never selected a choice in the given dict:",dict);
    return keys[0]
}
// Returns a random direction.
function randomDirection() {
    return randElem(["up","right","down","left"])
}
// Returns a random integer from 0 to max.
function randInt(max) {
    return Math.floor(Math.random() * (max + 1));
}
// Returns a random integer from -max to max.
function randIntCircular(max) {
    return Math.round(Math.random() * max) * randSign();
}
// Returns either -1 or 1.
function randSign() {
    return randInt(1) == 1 ? 1 : -1;
}
// Returns a random elem from a given arr.
function randElem(arr) {
    return arr[randInt(arr.length - 1)];
}
// Creates a cluster of n raindrops around a given x,y
function createRaindropCluster({
    x = 50 + randIntCircular(3),
    y = 50 + randIntCircular(3),
    n = 8,
    size = randInt(10)+25,
    length = BAR_LENGTH
} = {}) {
    var repeats = 0;
    var selectedDirection = "type-" + randomDirection()
    var interval = accurateInterval(()=>{
        var angle = 360 / n * repeats;
        var start = angleTranslate(x,y,size,angle)
        createRaindrop({
            start_x:start.x,
            start_y:start.y,
            end_x:50,
            end_y:50,
            direction:selectedDirection
        })
        repeats++;
        if (repeats == n) {
            interval.cancel()
        }
    },length/n);
}
var direction2 = 400
var lastTime = Date.now()
function debug_createFixed() { 
    console.log("OFFSET:",Date.now() - lastTime - BAR_LENGTH)
    lastTime = Date.now()
    direction2 *= -1
    createRaindrop({
        start_x:SCREEN_CENTER.x,
        start_y:SCREEN_CENTER.y + direction,
        end_x:SCREEN_CENTER.x,
        end_y:SCREEN_CENTER.y + direction
    })
}
var direction = 200
function debug_createSmallRaindrop() {
    direction *= -1
    createRaindrop({
        start_x:SCREEN_CENTER.x + direction,
        start_y:SCREEN_CENTER.y + direction,
        end_x:SCREEN_CENTER.x + direction,
        end_y:SCREEN_CENTER.y + direction,
        drop_length:750,
        start_size:100
    })
}
// Creates a raindrop
function createRaindrop({
        start_x = 50 + randIntCircular(40),
        start_y = 50 + randIntCircular(40),
        end_x = 50 + randIntCircular(40),
        end_y = 50 + randIntCircular(40),
        drop_length = 2000,
        direction = "type-" + randomDirection()
}={}) {
    var elem = document.createElement("div");
    elem.classList.add("droplet")
    elem.id = `droplet${dropletCount++}`;
    elem.style = ` 
        --start-x:${start_x}vh;
        --start-y:${start_y}vh;
        --end-x:${end_x}vh;
        --end-y:${end_y}vh;
        --DROP_LENGTH:${drop_length}ms;
        z-index:${100000 - dropletCount};
    `;
    
    elem.classList.add(direction)
    
    document.getElementById("Raindrops").appendChild(elem);
}
// Destroy an existing raindrop elem 
function destroyDrop(elem) {
    var ping = new Audio("resources/sfx/1-success.mp3");
    ping.volume = 0.7;
    ping.play();
    elem.classList.add("state-destroy");
    setTimeout(() => elem.parentNode.removeChild(elem), 200);
    elem.classList.add("ignore")
}
function misdirectDrop(elem) {
    var ping = new Audio("resources/sfx/1-misdirect.mp3");
    ping.volume = 0.3;
    ping.play();
    elem.classList.add("state-misdirect");
    elem.classList.add("ignore")
}
function spawnRipple({
        x = 0,
        y = 0,
        color = "var(--c-bg_)",
        endingSize = 30
}={}) {
    var ripple = document.createElement("div");
    ripple.classList.add("effect-ripple");
    ripple.style = `
        --x:${x}px;
        --y:${y}px;
        --color:${color};
        --ending-size:${endingSize}vh;
    `;
    document.getElementById("Ripples").appendChild(ripple);
    setTimeout(() => ripple.parentNode.removeChild(ripple),1000);
}

document.addEventListener("keypress",(e)=>{
    var key = e.code;
    var elem = document.elementFromPoint(mouse_pos.x, mouse_pos.y);

    if (key == "Space") {
        spawnRipple({
            x:mouse_pos.x,
            y:mouse_pos.y
        });
        // changePolarity();
        // timings.push(Date.now() - gameStartMS)
        // createRaindrop();
    }
    if (key == "KeyZ") {
        createRaindrop();

    }
    if (key == "KeyC") {
        // timings.push(currentQuarterBar);
        createRaindropCluster();
        // createSmallRaindrop();
    }
    if (key == "KeyX") {
        createRaindropCluster({
            x:SCREEN_CENTER.x,
            y:SCREEN_CENTER.y,
            n:4,
            size:100,
            length:BAR_LENGTH
        });
        setTimeout(()=>{
            createRaindropCluster({
                x:SCREEN_CENTER.x,
                y:SCREEN_CENTER.y,
                n:8,
                size:200,
                length:BAR_LENGTH
            });
        },BAR_LENGTH);
        setTimeout(()=>{
            createRaindropCluster({
                x:SCREEN_CENTER.x,
                y:SCREEN_CENTER.y,
                n:16,
                size:300,
                length:BAR_LENGTH*2
            });
        },BAR_LENGTH*2);
        setTimeout(()=>{
            createRaindropCluster({
                x:SCREEN_CENTER.x,
                y:SCREEN_CENTER.y,
                n:32,
                size:400,
                length:BAR_LENGTH*2
            });
        },BAR_LENGTH*4);
    }
    if (elem.classList.contains("ignore")) return;
    if (elem.classList.contains("droplet") && ["KeyW","KeyA","KeyS","KeyD"].includes(key)) {
        var valid = [
            elem.classList.contains("type-up") && key == "KeyW",
            elem.classList.contains("type-left") && key == "KeyA",
            elem.classList.contains("type-down") && key == "KeyS",
            elem.classList.contains("type-right") && key == "KeyD"
        ]
        if (valid.some((b) => b)) {
            destroyDrop(elem);
            spawnRipple({
                x:mouse_pos.x,
                y:mouse_pos.y
            });
        } else {
            misdirectDrop(elem);
        }
    }
})
document.addEventListener("mousemove",(e)=>{
    mouse_pos.x = e.clientX;
    mouse_pos.y = e.clientY;
    var cursor = document.getElementById("cursor");
    cursor.style.setProperty("--x",mouse_pos.x + "px");
    cursor.style.setProperty("--y",mouse_pos.y + "px");
})

function angleTranslate(x,y,length,angle) {
    return {
        x:x + length * Math.cos(degToRad(angle)),
        y:y + length * Math.sin(degToRad(angle))
    }
}
function degToRad(deg) {
  return deg * (Math.PI/180);
}
function typewrite(elem, text, speed = 75) {
    elem.innerHTML = "";
    chars = 0;
    for (index in text) {
        var charElem = document.createElement("span");
        charElem.classList.add("typewritChar");
        charElem.innerHTML = text[index];
        charElem.style = `
            --index:${index};
            --speed:${speed}ms;
        `
        elem.appendChild(charElem);
    }
}
function appear(elem) {
    elem.classList.add("state-appear")
}

// https://gist.github.com/AlexJWayne/1d99b3cd81d610ac7351
function accurateInterval(fn, time) {
    var cancel, nextAt, timeout, wrapper, _ref;
    nextAt = new Date().getTime() + time;
    timeout = null;
    wrapper = function() {
        nextAt += time;
        timeout = setTimeout(wrapper, nextAt - new Date().getTime());
        return fn();
    };
    cancel = function() {
        return clearTimeout(timeout);
    };
    timeout = setTimeout(wrapper, nextAt - new Date().getTime());
    return {
        cancel: cancel
    };
};



// function debug_processTimings() {
//     var timings = [
//         0,
//         3495,
//         6480,
//         7799,
//         10911,
//         13887,
//         16671,
//         17639,
//         18439,
//         22736,
//         24216,
//         25791,
//         27151,
//         28839,
//         29534,
//         30286,
//         31823,
//         34767,
//         35462,
//         36199,
//         37759,
//         39191,
//         40783,
//         41471,
//         42207,
//         43719,
//         45145,
//         58774,
//         59447,
//         60231,
//         60999,
//         61790
//     ]
//     var processed = [];
//     for (var i = 1; i < timings.length; i++) {
//         processed.push(timings[i] - timings[i-1]);
//     }
//     return processed;
// }
// var audio = new Audio("resources/one bar.mp3");
// setTimeout(()=>{
//     console.log(audio.duration)
// },1000)