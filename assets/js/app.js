// Create one timer at start
$(function() {
    // Event listeners (evL)
    // - evL: Create new button
    $("#create-new").livequery( (i, el)=>{
        $(el).on("click", ()=>{
            new Timer();
        })
    });

    // - evL: Title editing update and visual logic of clearing the edit icon
    $(".timer-title").livequery( (i, el)=> {
        $(el).on("blur", (event) => {
            const uid = utility.getUIDfromEvent(event);
            timers.updateTitle(uid, event)

        }).on("click", (event)=>{
            document.execCommand("", false, null); 
            const $titleEl = $(event.target);
            if($titleEl.find(".fa-edit").length) $titleEl.text("");
        });

    });

    // - evL: Remove alarm
    $('.remove-timer').livequery((i, el)=> {
        $(el).on('click', (event) => {
            const uid = utility.getUIDfromEvent(event);
            timers.removeAlarm(uid, event);
        });
    }); // livequery

    // - evL: Shorthand entry alarm time
    $('.fa-bell').livequery((i, el)=> {
        $(el).on('click', (event) => {
            const $eventEl = $(event.target);
            const uid = utility.getUIDfromEvent(event);
            const timerModel = timers[uid];

            // Set DOM
            const $alarmSetter = $eventEl.closest(".input"); 
            const totalSecs = shorthandSetAlarm($alarmSetter);

            // Set Model
            timerModel.alarm = totalSecs;
            
        });
    }); // livequery

    // - evL: Update alarms, and don't let "Enter" mess up contenteditable layout
    $(".timer .alarm-container .hh, .timer .alarm-container .mm, .timer .alarm-container .ss").livequery( (i, el)=> {
        $(el).on("blur", (event) => {
            const uid = utility.getUIDfromEvent(event);
            timers.updateAlarm(uid, event);

        }).on("keydown", (event)=>{
            utility.cancelEnter(event)
        });
    });

    // - evL: Play/Pause
    $('.fa-play').livequery((i, el)=> {
        $(el).on('click', (event) => {
            var $eventEl = $(event.target);
            const uid = utility.getUIDfromEvent(event);

            // Toggle DOM
            $eventEl.addClass("hide");
            $eventEl.next().removeClass("hide");

            timers.resumeTimer(uid, event);
        });
    }); // livequery

    $('.fa-pause').livequery((i, el)=> {
        $(el).on('click', (event) => {
            var $eventEl = $(event.target);
            const uid = utility.getUIDfromEvent(event);

            // Toggle DOM
            $eventEl.addClass("hide");
            $eventEl.prev().removeClass("hide");

            timers.pauseTimer(uid, event);
        });
    }); // livequery

    setInterval(()=>{
        // Running timers will increment timers
        for(key in timers) {
            if(typeof timers[key].running!=="undefined" && timers[key].running) {
                const uid = timers[key].uid;
                timers[key].current++;
            }
        }
    }, 1000);


    setInterval(()=>{
        // Running timers will update timer DOMs
        for(key in timers) {
            if(typeof timers[key].running!=="undefined" && timers[key].running) {
                const timer = timers[key];
                const uid = timer.uid;
                const $timer = utility.get$Timer(uid);

                // Update timemark
                let totalSecs = timer.current;
                const {hrs, mins, secs} = utility.cvtTotalSecsToTimeComp(totalSecs);
                const $timemark = $timer.find(".timemark-container .output");
                const $hh = $timemark.find(".hh"), $mm = $timemark.find(".mm"), $ss = $timemark.find(".ss");
                
                $hh.text(hrs<10?`0${hrs}`:hrs);
                $mm.text(mins<10?`0${mins}`:mins);
                $ss.text(secs<10?`0${secs}`:secs);

                // Red timer element if time elapsed
                let alarmSecs = timer.alarm;
                if(totalSecs!==0 && totalSecs>=alarmSecs) { // Possibly obsolete concern: must be >= because it'd be missed if under another tab and you just opened the tab
                    if(!$timer.hasClass("red")) {
                        $timer.addClass("red");
                    } // if not alarmed yet
                }
                
            }
        }
    }, 100);

    $("#create-new").click();
});

/**
 * Utility for the other structures
 */
const utility = {
    $layout: $("main"),

    isLooper: (uid) => {
        const $timer = this.get$Timer(uid);
        return $timer.find(".loop.active").length>0;
    },

    // convert total secs to hrs, mins, secs
    cvtTotalSecsToTimeComp: (totalSecs) => {
        var mins = 0, hrs = 0, secs = 0;
        hrs = parseFloat(totalSecs/60/60);
        mins = parseFloat((hrs - parseInt(hrs))*60);
        secs = parseFloat((mins - parseInt(mins))*60);
        // console.log({totalSecs, hrs, mins, secs}); //
        hrs = Math.round(hrs);
        mins = Math.round(mins);
        secs = Math.round(secs);
        // console.log({totalSecs, hrs, mins, secs}); //
        
        return { hrs, mins, secs }
    },
    get$Timer: (uid) => {
        return $(`[data-uid="${uid}"]`);
    },
    cancelEnter: (event) => {
        if(event.keyCode===13) { 
            event.stopPropagation(); 
            event.preventDefault(); 
        }
    },
    getUIDfromEvent: (event)=> {
        return $(event.target).closest('[data-uid]').attr('data-uid');
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
            title: "",
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
    pauseTimer: function(uid, event) {
        this[uid].running = false;
    },
    resumeTimer: function(uid, event) {
        this[uid].running = true;
    },
    removeAlarm: function(uid, event) {
        let timer = this[uid];
        let $timer = utility.get$Timer(uid);

        let title = $timer.find(".title").text();
        title = title.length?title:"<Untitled>";

        if(confirm(`You sure you want to remove timer ${title}?`)) {

            // Remove model and view
            delete timers[uid];
            $timer.remove();
        }
        
        event.stopPropagation();
    },

    updateTitle: function(uid, event) {
        let timer = this[uid];
        let $timer = utility.get$Timer(uid);

        let title = $timer.find(".timer-title").text();
        title = title.length?title:"<Untitled>";

        timer.title = title;

        event.stopPropagation();
    },

    updateAlarm: function(uid, event) {
        let timer = this[uid];
        let $timer = $(`[data-uid="${uid}"]`);

        let $alarm = $timer.find(".alarm-container");
        let secs = (parseInt($alarm.find(".hh").text())*60*60) + (parseInt($alarm.find(".mm").text())*60) + parseInt($alarm.find(".ss").text());
        timer.alarm = secs;

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
/**
 * 
 * @function shorthandSetAlarm 
 * @param {jqueryDom} $alarmSetter points to a container of hh, mm, ss
 * @procedural sets DOM of alarm
 * @returns total secs
 */
function shorthandSetAlarm($alarmSetter) {
    let line = prompt("Enter your shorthand alarm (eg. 1h / 1h 3m / 1.5h):");
    if(line===null || line===undefined) return;
    line = line.toLowerCase();
    line = line.replaceAll("hours", "h").replaceAll("hour", "h").replaceAll("hr", "h").replaceAll("h", "h,");
    line = line.replaceAll("mins", "m").replaceAll("min", "m").replaceAll("m", "m,");
    line = line.replaceAll("secs", "s").replaceAll("sec", "s").replaceAll("s", "s,");
    let phrases = line.split(",");
 
    // You want the total hours so you can have shorthands like 120m be changed to 2 hours
    var totalSecs = 0;
    for(var i = 0; i < phrases.length; i++) {
        let subject = phrases[i];
        if(subject.indexOf("h")>-1)
            totalSecs += parseFloat(subject) * 60 * 60;
        else if(subject.indexOf("m")>-1)
            totalSecs += parseFloat(subject) * 60;
        else if(subject.indexOf("s")>-1)
            totalSecs += parseFloat(subject);
    }

    const {hrs, mins, secs} = utility.cvtTotalSecsToTimeComp(totalSecs);

    const $ss = $alarmSetter.find(".ss"),
        $mm = $alarmSetter.find(".mm"),
        $hh = $alarmSetter.find(".hh");

    $hh.text(hrs<10?`0${hrs}`:hrs);
    $mm.text(mins<10?`0${mins}`:mins);
    $ss.text(secs<10?`0${secs}`:secs);

    return totalSecs;

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