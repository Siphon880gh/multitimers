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

    $('.loop-timer').livequery((i, el)=> {
        $(el).on('click', (event) => {
            // Toggle DOM state to highlighted
            var $eventEl = $(event.target);
            $eventEl.toggleClass("active");

            // Toggle model looping state
            const uid = utility.getUIDfromEvent(event);
            const timer = timers[uid];
            timer.looping = !timer.looping;
        });
    }); // livequery

    $('.reset-timer').livequery((i, el)=> {
        $(el).on('click', (event) => {
            // Reset model time state
            const uid = utility.getUIDfromEvent(event);
            const timer = timers[uid];
            timer.current = 0;
        });
    }); // livequery

    $('.tap-counter-num').livequery((i, el)=> {
        $(el).on('click', (event) => {
            // Increment tap count on DOM (no need for modeling)
            const $tapCounter = $(event.target);
            let tapCount = parseInt($tapCounter.text());
            let nextTapCount = tapCount+1;
            $tapCounter.text(nextTapCount);

            // Even / Odd labeling if appropriate
            const uid = utility.getUIDfromEvent(event);
            $timer = utility.get$Timer(uid);
            timer = timers[uid];
            if(nextTapCount%2==0) {
                $timer.find(".tap-counter-label").text(timer.tapping.evenLabel);
            } else {
                $timer.find(".tap-counter-label").text(timer.tapping.oddLabel);
            }
        });
    }); // livequery

    $('.restart-tap-counter').livequery((i, el)=> {
        $(el).on('click', (event) => {
            const $tapCounter = $(event.target).closest(".tap-counter-section").find(".tap-counter-num");
            $tapCounter.text("0");
        });
    }); // livequery

    $('.alt-label-tap-counter').livequery((i, el)=> {
        $(el).on('click', (event) => {
            const uid = utility.getUIDfromEvent(event);
            const timer = timers[uid];
            const $timer = utility.get$Timer(uid);
            var goalLabelResponse = parseInt(prompt("🏁 Goal taps (Optional) eg. 6?"));
            var oddLabelResponse = prompt("1 Odd label (Optional)?");
            var evenLabelResponse = prompt("2 Even label (Optional)?");
            $timer.find(".tap-goal").text(goalLabelResponse?"/"+goalLabelResponse:"");
            timer.tapping.evenLabel = evenLabelResponse?evenLabelResponse:"";
            timer.tapping.oddLabel = oddLabelResponse?oddLabelResponse:"";
        });
    }); // livequery

    function setTapCounterLabels(event) {
        var instance = here(event);

    }
    

    // Special setInterval is overriden with web worker that can track timer, beep, and announce as a background tab
    setInterval(()=>{
        // Running timers will increment timers
        for(key in timers) {
            if(typeof timers[key].running!=="undefined" && timers[key].running) {
                // Updates model time
                const timer = timers[key];
                const uid = timer.uid;
                timer.current++;

                // Restarts time if loop on
                if(utility.isLooping(uid)) {
                    if(timer.current > timer.alarm) { // Do not use >= or it wont beep
                        timer.current = 0;
                    }
        
                } // if in loop mode
            }
        }
    }, 1000);

    // Normal setInterval that can access DOM only runs when tab is active
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
                // console.log({hrs,mins,secs});
                
                $hh.text(hrs<10?`0${hrs}`:hrs);
                $mm.text(mins<10?`0${mins}`:mins);
                $ss.text(secs<10?`0${secs}`:secs);

                // Red timer element if time elapsed
                let alarmSecs = timer.alarm;
                if(totalSecs>=alarmSecs) { // Possibly obsolete concern: must be >= because it'd be missed if under another tab and you just opened the tab
                    if(!$timer.hasClass("red")) {
                        $timer.addClass("red");
                    }
                } else {
                    if($timer.hasClass("red")) {
                        $timer.removeClass("red");
                    }
                } // if out
            } // running timers
        } // filter out timers model
    }, 100);

    $("#create-new").click();
});

/**
 * Utility for the other structures
 */
const utility = {
    $layout: $("main"),

    isLooping: (uid) => {
        const timer = timers[uid];
        return timer.looping;
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
            looping: false,
            current: 0,
            alarm: 0,
            tapping: {
                evenLabel: "",
                oddLabel: ""
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