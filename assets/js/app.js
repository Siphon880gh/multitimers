// Create one timer at start
$(function() {
    $("#create-new").livequery( (i, el)=>{
        $(el).on("click", ()=>{
            new Timer();
        })
    });
    $("#create-new").click();
});

// <button id="create-new" onclick='initNewTimeTiles();' style="font-size:1.17rem;">

/**
 * Utility for the other structures
 */
const utility = {
    $layout: $("main"),
    cancelEnter: (event) => {
        if(event.keyCode===13) { 
            event.stopPropagation(); 
            event.preventDefault(); 
        }
    }
}

/**
 * Timer object gets pushed to timers array
 * Variables current and goal are in seconds.
 */
class Timer {
    constructor() {
        const uid = Date.now() + "";
        const timer = {
            uid,
            label: "",
            running: false,
            current: 0,
            alarm: 0,
            tapping: {
                evenLabel: "",
                oddLabel: "",
                current: 0
            }
        }

        // Update model
        window.timers[uid] = timer;
        new $Timer(uid);
    }
} // class Timer

/**
 * $Timer is DOM
 */
class $Timer {
    constructor(uid) {
        let template = $("template").html();
        template = template.replaceAll("__uid__", uid);
        utility.$layout.append(template);
    }
}

/**
 * timers have methods and elements
 */
window.timers = {
    updateAlarm: function(uid, event) {
        let timer = this[uid];
        let $timer = $(`[data-uid="${uid}"]`);

        let $alarm = $timer.find(".alarm-container");
        let secs = (parseInt($alarm.find(".hh").text())*60*60) + (parseInt($alarm.find(".mm").text())*60) + parseInt($alarm.find(".ss").text());
        timer.alarm = secs;

        event.stopPropagation();
    },

    remove: function(uid, event) {
        let timer = this[uid];
        let $timer = $(`[data-uid="${uid}"]`);
        let title = $timer.find(".title").text();
        title = title.length?title:"<Untitled>";

        if(confirm(`You sure you want to remove timer ${title}?`)) {


            // Remove model and view
            delete timers[uid];
            $timer.remove();
        }
        
        event.stopPropagation();
    }

    // The rest is a map
}

var newStopWatch = function( $time ) {
    this.$time = $time;
    this.evenLabel = "";
    this.oddLabel = "";

    $time.data("o", this);

    // Private vars
    var startAt = 0; // Time of last start / resume. (0 if not running)
    var lapTime = 0; // Time on the clock when last stopped in milliseconds

    // Public methods
    // Start or resume
    this.start = function() {
        var $timeTile = this.$time;

        startAt = startAt ? startAt : now();
        this.renderUpdate();
        window.document.title = "Multitimers";
    };

    // Stop or pause
    this.stop = function() {
        // If running, update elapsed time otherwise keep it
        lapTime = startAt ? lapTime + now() - startAt : lapTime;
        startAt = 0; // Paused

        window.document.title = "Multitimers";
    };

    // Reset
    this.reset = function() {
        this.stop();
        lapTime = startAt = 0;
        this.update();
        $time.removeClass("red");
        window.document.title = "Multitimers";
    };

// Duration
this.time = function() {
    return lapTime + (startAt ? now() - startAt : 0); 
};

// Update
this.update = function() {
    var $timemark = $time.find(".timemark"),
        $target = $time.find(".target");
        
    var hh=$target.find(".hh").text(),
            mm=$target.find(".mm").text(),
        ss=$target.find(".ss").text();
        
    //console.log(mm);
    
    var secs = Math.floor( this.time() / 1000 ),
            targetSecs = 0;
        
        targetSecs += parseInt(ss)? parseInt(ss):0;
        targetSecs += Math.floor(parseInt(hh)? parseInt(hh)*3600:0);
        targetSecs += Math.floor(parseInt(mm)?parseInt(mm)*60:0);
        
    // console.log("targetSecs: " + targetSecs);
    if(targetSecs!==0 && secs>=targetSecs) { // must be >= because it'd be missed if under another tab and you just opened the tab
        if(!$time.hasClass("red")) {
            beep();
            $time.addClass("red");
            window.document.title = "** Multitimers **";

            // Loop mode
            if($time.find(".loop.active").length) {
                console.log("Looping");
                this.stop();
                setTimeout(()=>{
                    incrementCount( $time );
    
                    this.reset();
                    this.start();
                }, 100);
    
            } // if in loop mode
        } // if not alarmed yet
    }

    $timemark.html( formatTime(this.time()) );
} // update

this.renderUpdate = function() {
    this.update();
    if (startAt !== 0) {
    requestAnimationFrame(this.renderUpdate);
    }
}.bind(this); // used as callback, need to retain this reference by binding
};

function here(event) {
        var $clicked = $(event.target),
            obj = $clicked.closest('[data-o]').data('o');
        
    return obj;
}

function incrementCount($time) {
    instance = $time.data("o");
    $counter = $time.find(".tap-counter-num");
    counter = parseInt($counter.text());
    counter++;
    $counter.text(counter);
    $label = $time.find(".tap-counter-label");
    if(counter%2===0) {
        if(instance.evenLabel.length)
            $label.text(instance.evenLabel);
        else if(instance.evenLabel.length + instance.oddLabel.length > 0) {
            $label.html("<span style='color:white'>_</span>"); // To keep same height, whitespace
        } else {
            $label.html("");
        }

    } else { // ^ even
        if(instance.oddLabel.length)
            $label.text(instance.oddLabel);
        else if(instance.evenLabel.length + instance.oddLabel.length > 0) {
            $label.html("<span style='color:white'>_</span>"); // To keep same height
        } else {
            $label.html("");
        }

    } // ^ odd
} // incrementCount

// function initNewTimeTiles() {
// $("[data-init]").each( (i,el)=> { 
//     var $el = $(el);
//     (new newStopWatch($el)).update();
//     $el.removeAttr("data-init");
// });
// }

function setTapCounterLabels(event) {
    var instance = here(event);
    var evenLabelPrompt = prompt("Even label?");
    var oddLabelPrompt = prompt("Odd label?");
    instance.evenLabel = evenLabelPrompt?evenLabelPrompt:"";
    instance.oddLabel = oddLabelPrompt?oddLabelPrompt:"";
}

function now() {
return (new Date()).getTime(); 
}

function pad(num, size) {
var s = "0000" + num;
return s.substr(s.length - size);
}

function formatTime(time) {
var h = m = s = ms = 0;
var newTime = '';
h = Math.floor( time / (60 * 60 * 1000) );
time = time % (60 * 60 * 1000);
m = Math.floor( time / (60 * 1000) );
time = time % (60 * 1000);
s = Math.floor( time / 1000 );
// ms = time % 1000;

// newTime = pad(h, 2) + ':' + pad(m, 2) + ':' + pad(s, 2) + ':' + pad(ms, 3);
newTime = pad(h, 2) + ':' + pad(m, 2) + ':' + pad(s, 2);
return newTime;
}

function validate(event) {
    var $el = $(event.target),
        entered = $el.html(),
        digits = "";

    for(let i=0; i<entered.length; i++) {
        let char = entered[i];
        let digit = parseInt(char);
        if(!isNaN(digit)) {
            digits += `${digit}`;
        }
    }

    if(digits.length===0)
        digits = "00";
    else if(digits.length===1)
        digits = '0' + digits;
    else if(digits.length>2) {
        var last = digits.length-1;
        var lastSecondTo = last-1;
        digits = digits[lastSecondTo] + digits[last];
    }
    if(parseInt(digits)>59)
        digits="00";

    $el.html(digits);
} // validate

function replay(event) {
    var $timeTile = this.$time;
    $timeTile.find(".fa-backward").click();
    $timeTile.find(".fa-play").click();
}
function shorthandSetAlarm($alarmSetter) {
    var line = prompt("Enter your shorthand alarm (eg. 1h / 1h 3m / 1.5h):");
    if(line===null || line===undefined) return;
    line = line.replace(" ", "");
    var mins = 0, hrs = 0, secs = 0;
    var totalHrs = 0;
    
    var match = null;

    match = line.match(/([0-9\.]*?)h/);
    if(match!==null) {
        totalHrs += parseFloat(match[1]);
    }

    match = line.match(/([0-9\.]*?)m/);
    if(match!==null) {
        totalHrs += parseFloat(match[1])/60;
    }

    match = line.match(/([0-9\.]*?)s/);
    if(match!==null) {
        totalHrs += parseFloat(match[1])/3600;
    }

    hrs = parseInt(totalHrs);
    mins = parseInt((totalHrs - parseInt(totalHrs))*60);
    secs = ( ((totalHrs - parseInt(totalHrs))*60) - parseInt((totalHrs - parseInt(totalHrs))*60) )*60;
    secs = parseInt(secs);

    var $ss = $alarmSetter.find(".ss"),
        $mm = $alarmSetter.find(".mm"),
        $hh = $alarmSetter.find(".hh");

    $ss.text(secs<10?`0${secs}`:secs);
    $mm.text(mins<10?`0${mins}`:mins);
    $hh.text(hrs<10?`0${hrs}`:hrs);

} // shorthandSetAlarm

function removeThisTimer(event) {
    let $timer = $(event.target);
    let title = $timer.closest('.time-tile').find('.subtitle').text();
    if( confirm(`Remove this timer? ${title}`)  )
        $timer.closest('.time-tile').remove();
} // removeThisTimer

function playPause(event) {
    $time = $(event.target).closest(".time-tile");
    var isPlayMode = $time.find(".fa-play").length>0; // play vs pause mode
    if(isPlayMode) {
        $time.data("o").start();
        $time.find(".fa-play").removeClass("fa-play").addClass("fa-pause");
    } else {
        $time.data("o").stop();
        $time.find(".fa-pause").removeClass("fa-pause").addClass("fa-play");
    }
} // playPause

function help() {
    if($("#desc-1").hasClass("hide")) {
        $("#desc-1").removeClass("hide");
        $("#desc-2").addClass("hide");
    } else {
        $("#desc-2").removeClass("hide");
        $("#desc-1").addClass("hide");
    }
}