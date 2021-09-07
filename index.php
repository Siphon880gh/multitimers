<!DOCTYPE html>
<html lang="en">
  <head>
   <title>Multitimers</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">

    <!-- jQuery and Bootstrap  -->
    <script src="assets/js/vendors/HackTimer.min.js"></script>
    <script src="https://code.jquery.com/jquery-2.1.4.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
    <link rel="stylesheet" href="assets/css/index.css">

    <!-- Articulate JS -->
    <script src="assets/js/vendors/articulate.js/articulate.min.js"></script>

    <!-- Livequery -->
    <script src="//raw.githack.com/hazzik/livequery/master/src/jquery.livequery.js"></script>
    
</head>
    <body>
        <div class="container">
            <h3 id="title">Multiple Timers (Non-obtrusive)</h3>
            <div id="desc-1"><small><b>By Weng Fei Fung</b>. <a class="fa fa-question" href="javascript:void();" onclick="help()"></a></small></div>
            <div class="hide" id="desc-2"><p><small id="desc"><b>By Weng Fei Fung</b>. You can have as many alarms as you want. These alarms are designed to be non-obtrusive so that they do not continually beep until you're forced to interact with the alarm. An alarm will beep only once and stay in the background with the timer turning red. Once you address the alarm by stopping or restarting the timer, the red color disappears. So you are not interrupted with your tasks, yet there's a short audio and an obvious visual cue that an alarm is reached. You can name each alarm so you are reminded what that alarm is for.</p><p>There are other ways to use this tool. You can click a tap counter to increase its number if the activity makes sense to have a counting part, such as exercising when you do a workout set followed by a rest period. You can have the tap counter automatically count up and restart the timer each time the time is reached, when you turn on loop mode <span class="fa fa-history"></span>, such as for casual gaming where you have timed tasks that can be repeated. Please note, this window must be on the screen for a beep and red color, so you may want to resize the window to some corner of your screen.</small> <a class="fa fa-question" href="javascript:void();" onclick="help()"></a></p></div>

            <hr id="main-hr" />
            <div class="spacer-v"></div>
            <aside>	
                <button id="create-new">
                    <span class="fa fa-plus">&nbsp;New Timer</span>
                </button>
            </aside>

            <main></main>

            <template>
                <div data-uid="__uid__" class="time-tile timer" data-o data-init style="position:relative;">
                    <h4 class="title" contenteditable onclick='document.execCommand("", false, null); if($(this).find(".fa-edit").length) $(this).text("");'>Title <span class="fa fa-edit"></span></h4>
                    <button class="remove-timer" data-role="none" type="button" onclick="timers.remove('__uid__', event);"><span class="fa fa-close"></button>
                    <table>
                        <tbody>
                        <tr>
                            <td>Countup:</td>
                            <td><span class="timemark">00:00:00</span></td>
                        </tr>
                        <tr class="alarm-container">
                            <td class="label">Alarm:</td>
                            <td class="input">
                                <span class="hh" onblur="timers.updateAlarm('__uid__', event)" onkeydown="utility.cancelEnter(event)" contenteditable>00</span><span class="colon"></span><span class="mm" onblur="timers.updateAlarm('__uid__', event)" onkeydown="utility.cancelEnter(event)" contenteditable>00</span><span class="colon"></span><span class="ss" onblur="timers.updateAlarm('__uid__', event)" onkeydown="utility.cancelEnter(event)" contenteditable>00</span>
                                <span class="fa fa-bell hoverable" onclick='let $alarmSetter = $(this).prev(".target"); shorthandSetAlarm($alarmSetter);' style="font-size:1.75ch; vertical-align:top;"></span>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                    <div class="text-center">

                        <button class="play-timer hoverable" data-role="none" type="button" onclick="playPause(event);"><i class="fa fa-play"></i></button>
                        <button class="repeat-timer hoverable" data-role="none" type="button" onclick="here(event).reset(); here(event).start()"><span class="fa fa-backward"/></button>
                        <button class="loop hoverable" data-role="none" type="button" onclick="$(this).toggleClass('active'); if($(this).hasClass('active')) { if($(this).parent().find('.fa-play').length) $(this).parent().find('.play-timer').click(); }"><span class="fa fa-history"/></button>
                        <hr/>
                        <div class="tap-counter-wrapper">
                            <span style="text-align:left; font-weight:550;">Tap Counter:</span><br/>
                            <span class="fa fa-backward icon" onclick='$(this).parent().find(".tap-counter-num").text(0);'></span>
                            <span class="fa fa-edit icon" onclick='setTapCounterLabels(event)'></span>
                            <br/>
                            <div class="tap-counter-num" onclick='incrementCount(here(event).$time)'>0</div>
                            <div class="tap-counter-label" style="font-size:.75rem"></div>
                        </div>
                    </div>
                </div>
            </template>
        </div> <!-- /.container -->

        <script src="assets/js/beep.js"></script>
        <script src="assets/js/app.js?v=<?php echo time(); ?>"></script>
        <script>
            // setInterval(()=>{
            //     beep();
            //     console.log("Beeped")
            // }, 2000);

        </script>
    </body>
</html>