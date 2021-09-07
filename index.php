<!DOCTYPE html>
<html lang="en">
  <head>
   <title>Multitimers</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">

    <!-- jQuery and Bootstrap  -->
    <script src="assets/js/vendors/HackTimer.min.js"></script>
    <script src="https://code.jquery.com/jquery-2.1.4.min.js"></script>
    <link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/font-awesome/5.13.1/css/all.min.css">
    <link rel="stylesheet" href="assets/css/index.css">

    <!-- Articulate JS -->
    <script src="assets/js/vendors/articulate.js/articulate.min.js"></script>

    <!-- Livequery -->
    <script src="//raw.githack.com/hazzik/livequery/master/src/jquery.livequery.js"></script>
    
</head>
    <body>
        <div class="container">
            <h1 id="title">Multiple Timers (Non-obtrusive)</h1>
            <div id="desc">
                <div class="author-line">
                    <span>By Weng Fei Fung</span>
                    <a href="https://www.linkedin.com/in/weng-fung/" target="_blank"><i class="fab fa-linkedin"></i></a>
                    <a href="https://github.com/Siphon880gh/" target="_blank"><i class="fab fa-github"></i></a>
                    <a href="https://www.youtube.com/channel/UCg1O9uttSv3ZBzd1iep25Ig/" target="_blank"><i class="fab fa-youtube"></i></a>
                </div>

                <p>Add as many countup timers as you want. You can turn the countup into an alarm. You can use a tap counter with each timer. Name the timers. Put the tab away in the background and it will still work. <a href="javascript:void(0);" onclick="$(this).next().toggleClass('hide');"><i class="fa fa-question"></i></a><span class="hide"> I coded the alarms to be non-obtrusive so that they do not continually beep until you're forced to interact with the alarm. A timer will stay red to let you know the alarm has elapsed. If you find that it's too non-obtrusive, you can have a timer beep multiple times, then announce a word or sentence.</span></p></div>

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
                    <div class="section-header">Timer</div>
                    <div class="title" contenteditable onblur="timers.updateTitle('__uid__', event)" onclick='document.execCommand("", false, null); if($(this).find(".fa-edit").length) $(this).text("");'>Title <span class="fa fa-edit"></span></div>
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
                                <span class="hh" contenteditable>00</span><span class="colon"></span><span class="mm" contenteditable>00</span><span class="colon"></span><span class="ss" contenteditable>00</span>
                                <span class="fa fa-bell hoverable" onclick='let $alarmSetter = $(this).prev(".target"); shorthandSetAlarm($alarmSetter);' style="font-size:1.75ch; vertical-align:top;"></span>
                            </td>
                        </tr>
                        <tr class="alarm-container">
                            <td colspan="2">
                                <span>Beep x</span>
                                <select class="beeps-number">
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                </select>
                            </td>
                        </tr>
                        <tr class="alarm-container">
                            <td colspan="2">
                                <span>Announce</span>
                                <input class="announce" type="text" placeholder="Words"/>
                            </td>
                        </tr>
                        </tbody>
                    </table>

                    <div class="timer-controls">
                        <button class="play-timer hoverable" data-role="none" type="button" onclick="playPause(event);"><i class="fa fa-play"></i></button>
                        <button class="repeat-timer hoverable" data-role="none" type="button" onclick="here(event).reset(); here(event).start()"><span class="fa fa-backward"/></button>
                        <button class="loop hoverable" data-role="none" type="button" onclick="$(this).toggleClass('active'); if($(this).hasClass('active')) { if($(this).parent().find('.fa-play').length) $(this).parent().find('.play-timer').click(); }"><span class="fa fa-history"/></button>
                    </div>
                    <hr/>

                    <div class="tap-counter-wrapper">
                        <div class="subsection-header">Tap Counter</div>
                        <div class="tap-counter-num" onclick='incrementCount(here(event).$time)'>0</div>
                        <div class="tap-counter-label" style="font-size:.75rem"></div>
                        <div class="tap-counter-controls">
                            <span class="fa fa-backward icon" onclick='$(this).parent().find(".tap-counter-num").text(0);'></span>
                            <span class="fa fa-edit icon" onclick='setTapCounterLabels(event)'></span>
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