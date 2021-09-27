$(function initEventListeners() {
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
            timers.removeTimer(uid, event);
        });
    }); // livequery

    // - evL: Shorthand entry alarm time
    $('.fa-bell').livequery((i, el)=> {
        $(el).on('click', (event) => {
            const $eventEl = $(event.target);
            const uid = utility.getUIDfromEvent(event);
            const timerModel = timers[0][uid];

            // Set DOM
            const $alarmSetter = $eventEl.closest(".input"); 
            const totalSecs = shorthandSetAlarm($alarmSetter);

            // Set Model
            timerModel.alarm = totalSecs;
            timers.updatePersist();
            
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

    $('.alarm-times').livequery((i, el)=> {
        $(el).on('change', (event) => {
            const uid = utility.getUIDfromEvent(event);
            
            timers.updateAlarmTimes(uid, event);
        });
    }); // livequery
    
    $('.announce').livequery((i, el)=> {
        $(el).on('change', (event) => {
            timers.updateAnnounce(uid, event);
        });
    }); // livequery

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
            const uid = utility.getUIDfromEvent(event);
            timers.updateLoopTimer(uid, event);
        });
    }); // livequery

    $('.repeat-beep').livequery((i, el)=> {
        $(el).on('click', (event) => {
            const uid = utility.getUIDfromEvent(event);
            timers.updateRepeatBeep(uid, event);
        });
    }); // livequery

    $('.restart-time').livequery((i, el)=> {
        $(el).on('click', (event) => {
            const uid = utility.getUIDfromEvent(event);
            let timer = window.timers[0][uid];

            // Toggle DOM state to highlighted
            var $eventEl = $(event.target);

            // Restart model time state
            function restartTimeAtModel() {
                timer.current = 0;
                timer.elapsed = false;
            }

            // If you press restart timer at the exact time the second increases, it would have been overridden and ignored. Repeat 100ms after:
            restartTimeAtModel();
            setTimeout(restartTimeAtModel, 100);
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
            timer = timers[0][uid];
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
            const timer = timers[0][uid];
            $timer = utility.get$Timer(uid);
            var goalNumber = parseInt(prompt("🏁 Goal taps (Optional, eg. 6)?"));
            var oddLabel = prompt("1 Odd label (Optional)?");
            var evenLabel = prompt("2 Even label (Optional)?");

            goalNumber = !isNaN(parseInt(goalNumber))?parseInt(goalNumber):"";
            oddLabel = oddLabel?oddLabel:"";
            evenLabel = evenLabel?evenLabel:"";
            timers.updateTappingLabels(uid, timer, {
                goalNumber,
                oddLabel,
                evenLabel, 
            });
            $timer.find(".tap-goal").text(goalNumber);
        });
    }); // livequery


    $('.tap-goal').livequery((i, el)=> {
        $(el).on('click', (event) => {
            const $eventEl = $(event.target);
            $eventEl.prev().click();
            event.stopPropagation();
        });
    }); // livequery
    
});

$(function setPoller() {

    // Special setInterval is overriden with web worker that can track timer, beep, and announce as a background tab
    setInterval(()=>{
        // Running timers will increment timers
        for(uid in timers[0]) {
            const timer = timers[0][uid];
            if(timer.running) {
                // Updates model time
                timer.current++;

                if(timer.current>=timer.alarm && (timer.repeatBeep || !timer.elapsed) && timer.alarm!==0) { // Possibly obsolete concern: must be >= because it'd be missed if under another tab and you just opened the tab
                    if(timer.alarmTimes===1 && timer.alarmAnnounce.length===0) {
                        beep();
                    // } else if(!timer.elapsed) { // alarm with speech will always be only once
                    } else {
                        beepNThenWord(timer.alarmTimes, timer.alarmAnnounce)
                    }
                    timer.elapsed = true;
                }

                // Restarts time if loop on
                if(utility.isLooping(uid)) {
                    if(timer.current > timer.alarm) { // Do not use >= or it wont beep
                        timer.current = 0;
                        timer.elapsed = false;
                    }
        
                } // if in loop mode
            
            } // running timers only
        } // get timers only
    }, 1000);

    // Normal setInterval that can access DOM only runs when tab is active
    setInterval(()=>{
        // Running timers will update timer DOMs
        for(uid in timers[0]) {
            const timer = timers[0][uid];
            if(timer.running) {
                const uid = timer.uid;
                const $timer = utility.get$Timer(uid);

                // Update timemark
                let totalSecs = timer.current;
                const {hh, mm, ss} = utility.cvtTotalSecsToTimeComp(totalSecs);
                const $timemark = $timer.find(".timemark-container .output");

                const $hh = $timemark.find(".hh"), $mm = $timemark.find(".mm"), $ss = $timemark.find(".ss");
                $hh.text(hh);
                $mm.text(mm);
                $ss.text(ss);

                // Red timer element if time elapsed
                let alarmSecs = timer.alarm;
                if(alarmSecs!==0) {
                    if(totalSecs>=alarmSecs) { // Possibly obsolete concern: must be >= because it'd be missed if under another tab and you just opened the tab
                        if(!$timer.hasClass("red")) {
                            $timer.addClass("red");
                        }
                    } else {
                        if($timer.hasClass("red")) {
                            $timer.removeClass("red");
                        }
                    } // if out
                }
            } // running timers only
        } // get timers only
    }, 100);
})

/**
 * Timer object gets pushed to timers array
 * Variables current and goal are in seconds.
 */
class Timer {
    constructor() {
        const uid = Date.now() + "";
        const timer = {
            uid,
            alarm: 0,
            alarmTimes: 1,
            alarmAnnounce: "",
            title: "",
            elapsed: false, // prevents repeated beeps because we want non-obtrusive
            repeatBeep: false, // new option to want repeated beeps
            running: false,
            looping: false,
            current: 0,
            tapping: {
                goalNumber: "", // poss: "", <int>
                oddLabel: "",
                evenLabel: ""
            }
        }

        // Update model
        window.timers[0][uid] = timer;
        new $Timer(uid);
        window.timers.updatePersist();
    }
} // class Timer

/**
 * $Timer is DOM
 */
class $Timer {
    constructor(uid) {
        let template = $("template").html();
        template = template.replaceAll("__uid__", uid);
        let $timer = $(template);
        utility.$layout.append($timer);
        return $timer;
    }
}

$(function timerModelsAndHelpers() {

    /**
     * timers have methods and elements
     */
    window.timers = {
        updatePersist: function() {
            localStorage.setItem("multitimers__timers", JSON.stringify(window.timers[0]));
        },
        pauseTimer: function(uid, event) {
            this[0][uid].running = false;
            this.updatePersist();
        },
        resumeTimer: function(uid, event) {
            this[0][uid].running = true;
            this.updatePersist();
        },
        removeTimer: function(uid, event) {
            let timer = this[0][uid];
            let $timer = utility.get$Timer(uid);

            let title = $timer.find(".timer-title").text();
            title = (title.length&&title!=="Title ")?title:"<Untitled>";

            if(confirm(`You sure you want to remove timer ${title}?`)) {

                // Remove model and view
                delete timers[0][uid];
                $timer.remove();
            }
            
            event.stopPropagation();
            this.updatePersist();
        },

        updateTitle: function(uid, event) {
            let timer = this[0][uid];
            let $timer = utility.get$Timer(uid);

            let title = $timer.find(".timer-title").text();
            title = title.length?title:"<Untitled>";

            timer.title = title;

            event.stopPropagation();
            this.updatePersist();
        },

        updateAlarm: function(uid, event) {
            let timer = this[0][uid];
            let $timer = $(`[data-uid="${uid}"]`);

            let $alarm = $timer.find(".alarm-container");
            let secs = (parseInt($alarm.find(".hh").text())*60*60) + (parseInt($alarm.find(".mm").text())*60) + parseInt($alarm.find(".ss").text());
            timer.alarm = secs;

            event.stopPropagation();
            this.updatePersist();
        },

        updateAlarmTimes: function(uid, event) {
            let timer = this[0][uid];
            var $eventEl = $(event.target);
            timer.alarmTimes = parseInt($eventEl.val());

            event.stopPropagation();
            this.updatePersist();
        },

        updateAnnounce: function(uid, event) {
            let timer = this[0][uid];
            var $eventEl = $(event.target);
            timer.alarmAnnounce = $eventEl.val();

            event.stopPropagation();
            this.updatePersist();
        },

        updateLoopTimer: function(uid, event) {
            // Toggle DOM state to highlighted
            var $eventEl = $(event.target);
            $eventEl.toggleClass("active");

            // Toggle model looping state
            const timer = timers[0][uid];
            timer.looping = !timer.looping;

            event.stopPropagation();
            this.updatePersist();
        },

        updateRepeatBeep: function(uid, event) {
            let timer = this[0][uid];

            // Toggle DOM state to highlighted
            var $eventEl = $(event.target);
            $eventEl.toggleClass("active");

            // Toggle model looping state
            timer.repeatBeep = $eventEl.hasClass("active");

            event.stopPropagation();
            this.updatePersist();
        },
        updateTappingLabels: function(uid, event, context) {
            let {goalNumber, oddLabel, evenLabel} = context;
            let timer = this[0][uid];
            const $timer = utility.get$Timer(uid);
            
            timer.tapping.goalNumber = !isNaN(parseInt(goalNumber))?parseInt(goalNumber):"";
            timer.tapping.oddLabel = oddLabel?oddLabel:"";
            timer.tapping.evenLabel = evenLabel?evenLabel:"";

            this.updatePersist();
        },


        // The rest is a map of timer models
        0: {}
    }

})

/**
 * 
 * @function shorthandSetAlarm 
 * @param {jqueryDom} $alarmSetter points to a container of hh, mm, ss
 * @procedural sets DOM of alarm
 * @returns total secs
 */
function shorthandSetAlarm($alarmSetter) {
    let line = prompt("Enter your shorthand alarm (eg. 1h / 1h 3m / 1.5h / 1h 1m 1s / 120 secs / 2 hours / 2 mins).\n\nYou can add 'rep' if you want to restart the timer whenever the alarm is reached (eg. 1h rep):\n");
    if(line===null || line===undefined) return;

    // Make case insensitive
    line = line.toLowerCase();

    // Will be used
    const $timer = $alarmSetter.closest(".timer");
    const uid = $timer.attr("data-uid");
    const timer = timers[0][uid];

    // Repeat timer each time you reach alarm? The shorthand would have 'rep' 
    let isRepeatMode = line.includes("rep");
    if(isRepeatMode) {
        // Active loop timer button
        let $loopTimeBtn = $timer.find(".loop-timer");
        $loopTimeBtn.addClass("active");

        // Reflect timer looping on the model
        timer.looping = true;
    }

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

    const {hh, mm, ss} = utility.cvtTotalSecsToTimeComp(totalSecs);

    const $ss = $alarmSetter.find(".ss"),
        $mm = $alarmSetter.find(".mm"),
        $hh = $alarmSetter.find(".hh");

    $hh.text(hh);
    $mm.text(mm);
    $ss.text(ss);

    // Make sure timer starts if haven't after adding shorthand
    let isNotStarted = $timer.find(".fa-pause.hide").length>0;
    if(isNotStarted) {
        $timer.find(".fa-pause").removeClass("hide");
        $timer.find(".fa-play").addClass("hide");
        timer.running = true;
    }

    return totalSecs;

} // shorthandSetAlarm


// See if there were old timers from a previous session
$(function initPersist() {
    var timersExist = JSON.parse(localStorage.getItem("multitimers__timers"));
    if(timersExist) {
        window.timers[0] = timersExist;
        for(uid in timersExist) {
            const timer = timersExist[uid]

            // Countdowns to 0
            timer.elapsed = false;
            timer.running = false;
            timer.current = 0;

            // Restore DOM - Loop Time and Repeat Beep buttons
            const {looping, repeatBeep} = timer;
            const $timer = new $Timer(uid);
            
            if(looping) $timer.find(".loop-timer").addClass("active");
            if(repeatBeep) $timer.find(".repeat-beep").addClass("active");

            // Restore DOM - Alarm time
            let $alarm = $timer.find(".alarm-container");
            let {hh,mm,ss} = utility.cvtTotalSecsToTimeComp(timer.alarm);

            $alarm.find(".hh").text(hh);
            $alarm.find(".mm").text(mm);
            $alarm.find(".ss").text(ss);

            // Restore DOM - Title
            if(timer.title.length)
                $timer.find(".timer-title").text(timer.title);

            // Restore DOM - Announce text
            $alarm.find(".announce").val(timer.alarmAnnounce);

            // Restore DOM - Beep number
            $alarm.find(".alarm-times")[0].selectedIndex = timer.alarmTimes-1;

            // Restore tapping goal label
            let {goalNumber} = timer.tapping;
            $timer.find(".tap-goal").text(goalNumber);

        } // every timer

    } else {
        $("#create-new").click();
    }
});

/**
 * Utility for the other structures
 */
const utility = {
    $layout: $("main"),

    testMinimized: ()=> {
        function utter(word) {
            var a = new SpeechSynthesisUtterance(); 
            a.text = word; 
            speechSynthesis.speak(a);
        }

        let sentence = "Minimize and hear countdown 3 2 1 good";
        let words = sentence.split(" ");
        for(let i=0;i<words.length; i++) {
            let word = words[i];
            setTimeout(()=>{
                utter(word);
            }, i*1000);
        }
    },

    isLooping: (uid) => {
        const timer = timers[0][uid];
        return timer.looping;
    },

    // Convert total secs to hrs, mins, secs
    cvtTotalSecsToTimeComp: (totalSecs) => {
        let hrs = parseFloat(totalSecs/60/60);
        let mins = parseFloat((hrs - parseInt(hrs))*60);
        let secs = parseFloat((mins - parseInt(mins))*60);
        
        hrs = hrs>=1?Math.floor(hrs):0;
        mins = mins>=1?Math.floor(mins):0;
        secs = Math.round(secs);
        if(secs===60) {
            secs = 0;
            mins += 1;
        }
        
        let hh = (""+hrs).padStart(2, "0");
        let mm = (""+mins).padStart(2, "0");
        let ss = (""+secs).padStart(2, "0");
        
        // console.log( { hrs, mins, secs, hh, mm, ss })
        return { hrs, mins, secs, hh, mm, ss }
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