var dropletCount = 0
const RAINDROP_RANGE = 250;
var SCREEN_CENTER;
var BAR_LENGTH = 1541
const raindropOffset = {x:0,y:0}

var mouse_pos = {x:0,y:0}
var gameInterval;

function init() {
    SCREEN_CENTER = {
        x:window.innerWidth / 2,
        y:window.innerHeight / 2
    }
}
// var audio = new Audio("resources/one bar.mp3");
// setTimeout(()=>{
//     console.log(audio.duration)
// },1000)
function startGame() {
    var audio = new Audio("resources/i am the rain.mp3");
    audio.play();
    createRaindropOrDoubleDrop()
    tenBarInterval()
    gameInterval = setInterval(tenBarInterval,10 * BAR_LENGTH)
}
function stopGame() {
    clearInterval(gameInterval);
}
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
    var interval = setInterval(()=>{
        func();
        repeats++;
        if (repeats == n) {
            clearInterval(interval)
        }
    },length);
}
// Creates either one or two raindrops.
function createRaindropOrDoubleDrop({
    start_x,
    start_y,
    end_x,
    end_y,
    chance = {normal:90,double:50}
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
// Creates a cluster of n raindrops around a given x,y
function createRaindropCluster({
    x = SCREEN_CENTER.x + randIntCircular(250),
    y = SCREEN_CENTER.y + randIntCircular(250),
    n = 8,
    size = (randInt(3) + 1) * 100,
    length = BAR_LENGTH
} = {}) {
    var repeats = 0;
    var interval = setInterval(()=>{
        var angle = 360 / n * repeats;
        var start = angleTranslate(x,y,size,angle)
        createRaindrop({
            start_x:start.x,
            start_y:start.y,
            end_x:x + randIntCircular(50),
            end_y:y + randIntCircular(50)
        })
        repeats++;
        if (repeats == n) {
            clearInterval(interval)
        }
    },length/n);
}
// Creates a raindrop
function createRaindrop({
    start_x = SCREEN_CENTER.x + randIntCircular(500),
    start_y = SCREEN_CENTER.y + randIntCircular(500),
    end_x = SCREEN_CENTER.x + randIntCircular(250),
    end_y = SCREEN_CENTER.y + randIntCircular(250)
}={}) {
    var elem = document.createElement("div");
    elem.classList.add("droplet")
    elem.id = `droplet${dropletCount++}`;
    elem.style = ` 
        --start-x:${start_x}px;
        --start-y:${start_y}px;
        --end-x:${end_x}px;
        --end-y:${end_y}px;
        z-index:${100000 - dropletCount}
    `;
    
    document.getElementById("Raindrops").appendChild(elem);
}
// Destroy an existing raindrop elem 
function destroyDrop(elem) {
    elem.parentElement.removeChild(elem);
}

document.addEventListener("keypress",(e)=>{
    var key = e.code;
    var elem = document.elementFromPoint(mouse_pos.x, mouse_pos.y);

    if (key == "Space") {
        createRaindrop();
    }
    if (key == "KeyZ") {
        createRaindropCluster();
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
    if (key == "KeyW" | key == "KeyE") {
        if (elem.classList.contains("droplet")) {
            destroyDrop(elem);
        }
    }
})
document.addEventListener("mousemove",(e)=>{
    mouse_pos.x = e.clientX;
    mouse_pos.y = e.clientY;
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