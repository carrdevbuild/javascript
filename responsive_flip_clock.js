jQuery(function($){

    // https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/String/repeat
    if (!String.prototype.repeat) {
        String.prototype.repeat = function(count) {
            'use strict';
            if (this == null) {
                throw new TypeError('can\'t convert ' + this + ' to object');
            }
            var str = '' + this;
            count = +count;
            if (count != count) {
                count = 0;
            }
            if (count < 0) {
                throw new RangeError('repeat count must be non-negative');
            }
            if (count == Infinity) {
                throw new RangeError('repeat count must be less than infinity');
            }
            count = Math.floor(count);
            if (str.length == 0 || count == 0) {
                return '';
            }
            // ÐžÐ±ÐµÑÐ¿ÐµÑ‡ÐµÐ½Ð¸Ðµ Ñ‚Ð¾Ð³Ð¾, Ñ‡Ñ‚Ð¾ count ÑÐ²Ð»ÑÐµÑ‚ÑÑ 31-Ð±Ð¸Ñ‚Ð½Ñ‹Ð¼ Ñ†ÐµÐ»Ñ‹Ð¼ Ñ‡Ð¸ÑÐ»Ð¾Ð¼, Ð¿Ð¾Ð·Ð²Ð¾Ð»ÑÐµÑ‚ Ð½Ð°Ð¼ Ð·Ð½Ð°Ñ‡Ð¸Ñ‚ÐµÐ»ÑŒÐ½Ð¾
            // ÑÐ¾Ð¿Ñ‚Ð¸Ð¼Ð¸Ð·Ð¸Ñ€Ð¾Ð²Ð°Ñ‚ÑŒ Ð³Ð»Ð°Ð²Ð½ÑƒÑŽ Ñ‡Ð°ÑÑ‚ÑŒ Ñ„ÑƒÐ½ÐºÑ†Ð¸Ð¸. Ð’Ð¿Ñ€Ð¾Ñ‡ÐµÐ¼, Ð±Ð¾Ð»ÑŒÑˆÐ¸Ð½ÑÑ‚Ð²Ð¾ ÑÐ¾Ð²Ñ€ÐµÐ¼ÐµÐ½Ð½Ñ‹Ñ… (Ð½Ð° Ð°Ð²Ð³ÑƒÑÑ‚
            // 2014 Ð³Ð¾Ð´Ð°) Ð±Ñ€Ð°ÑƒÐ·ÐµÑ€Ð¾Ð² Ð½Ðµ Ð¾Ð±Ñ€Ð°Ð±Ð°Ñ‚Ñ‹Ð²Ð°ÑŽÑ‚ ÑÑ‚Ñ€Ð¾ÐºÐ¸, Ð´Ð»Ð¸Ð½Ð½ÐµÐµ 1 << 28 ÑÐ¸Ð¼Ð²Ð¾Ð»Ð¾Ð², Ñ‚Ð°Ðº Ñ‡Ñ‚Ð¾:
            if (str.length * count >= 1 << 28) {
                throw new RangeError('repeat count must not overflow maximum string size');
            }
            var rpt = '';
            for (var i = 0; i < count; i++) {
                rpt += str;
            }
            return rpt;
        }
    }

    // https://github.com/uxitten/polyfill/blob/master/string.polyfill.js
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart
    if (!String.prototype.padStart) {
        String.prototype.padStart = function padStart(targetLength,padString) {
            targetLength = targetLength>>0; //truncate if number or convert non-number to 0;
            padString = String((typeof padString !== 'undefined' ? padString : ' '));
            if (this.length > targetLength) {
                return String(this);
            }
            else {
                targetLength = targetLength-this.length;
                if (targetLength > padString.length) {
                    padString += padString.repeat(targetLength/padString.length); //append to original to ensure we are longer than needed
                }
                return padString.slice(0,targetLength) + String(this);
            }
        };
    }

    $.fn.flipper = function(action, options) {
        var $flipper = $(this);
        var action = action || 'init';
        var settings = $.extend({
            // defaults.
            datetime: $flipper.data('datetime') || '0000-00-00T00:00:00',
            template: $flipper.data('template') || 'ddd:HH:ii:ss',
            labels: $flipper.data('labels') || 'Days|Hours|Minutes|Seconds',
            preload: true
        }, options );
        if(action === 'init'){
            if($flipper.hasClass('flipper-initialized')){
                console.warn('Flipper already initialized.');
                return;
            }
            $flipper.addClass( "flipper-initialized" );

            var templateParts = settings.template.split('|');
            var labelsArray = settings.labels.split('|');
            var n;

            templateParts.forEach(function(part, index){
                if(index > 0){
                    $flipper.append('<div class="flipper-group flipper-delimiter">:</div>');
                }
                $flipper.append('<div class="flipper-group flipper-' + part + '"></div>');
                var $part = $flipper.find('.flipper-group.flipper-' + part);
                if(typeof labelsArray[index] !== 'undefined'){
                    $part.append('<label>' + labelsArray[index] + '</label>');
                }
                if(part === 'dd' || part === 'ddd' || part === 'HH' || part === 'ii' || part === 'ss'){
                    $part.append('<div class="flipper-digit reverse"></div>');
                    $part.append('<div class="flipper-delimiter"></div>');
                    $part.append('<div class="flipper-digit reverse"></div>');
                    if(part === 'ddd'){
                        $part.append('<div class="flipper-delimiter"></div>');
                        $part.append('<div class="flipper-digit reverse"></div>');
                    }
                }
                if(part === 'dd' || part === 'ddd'){
                    for(n = 0; n <= 9; n++){
                        $part.find('.flipper-digit:eq(0)').append('<div class="digit-face">' + n + '</div>');
                        $part.find('.flipper-digit:eq(1)').append('<div class="digit-face">' + n + '</div>');
                        if(part === 'ddd'){
                            $part.find('.flipper-digit:eq(2)').append('<div class="digit-face">' + n + '</div>');
                        }
                    }
                }
                if(part === 'HH'){
                    for(n = 0; n <= 2; n++){
                        $part.find('.flipper-digit:eq(0)').append('<div class="digit-face">' + n + '</div>');
                    }
                    for(n = 0; n <= 9; n++){
                        $part.find('.flipper-digit:eq(1)').append('<div class="digit-face">' + n + '</div>');
                    }
                }
                if(part === 'ii' || part === 'ss'){
                    for(n = 0; n <= 5; n++){
                        $part.find('.flipper-digit:eq(0)').append('<div class="digit-face">' + n + '</div>');
                    }
                    for(n = 0; n <= 9; n++){
                        $part.find('.flipper-digit:eq(1)').append('<div class="digit-face">' + n + '</div>');
                    }
                }
            });

            setFlipperZero($flipper);
            if(settings.preload){
                setFlipperDate($flipper, settings.datetime);
            }
            addAppearance($flipper);

            setTimeout(function () {
                setInterval(function(){
                    animateFlipperDate($flipper, settings.datetime);
                }, 1000);
            }, 100);


            upsizeToParent($flipper, 1000);
            $(window).on("resize", function(){
                upsizeToParent($flipper, 1000);
            });
        }

        var flipTime = 400;
        var $body = $('body');

        function flipDigit($digit){
            if($digit.hasClass('r')){
                setTimeout(function(){
                    flipDigit($digit);
                }, flipTime + 1);
                return;
            }
            $digit.addClass('r');
            var $currentTop = $digit.find('.digit-top');
            var $currentTop2 = $digit.find('.digit-top2');
            var $currentBottom = $digit.find('.digit-bottom');
            var $activeDigit = $digit.find('.digit-face.active');
            var $firstDigit = $digit.find('.digit-face:first');
            var $prevDigit = $activeDigit.prev('.digit-face');
            var $nextDigit = $activeDigit.next('.digit-face');
            var $lastDigit = $digit.find('.digit-face:last');
            if($digit.hasClass('reverse')){
                var $next = $prevDigit.length ? $prevDigit : $lastDigit;
            }
            else {
                var $next = $nextDigit.length ? $nextDigit : $firstDigit;
            }
            var current = parseInt($currentTop.html());
            var next = $next.html();
            $digit.find('.digit-next').html(next);
            $digit.find('.digit-face').removeClass('active');
            $next.addClass('active');
            $currentTop.addClass('r');
            $currentTop2.addClass('r');
            $currentBottom.addClass('r');
            if(next.toString() === $digit.attr('data-value')){
                $digit.removeAttr('data-value');
            }
            setTimeout(function(){
                $currentTop.html(next).hide();
                $currentTop2.html(next);
                setTimeout(function(){
                    $currentTop2.html(next);
                    $currentBottom.html(next);
                    $currentTop.removeClass('r').show();
                    $currentTop2.removeClass('r');
                    $currentBottom.removeClass('r');
                    $digit.removeClass('r');
                }, flipTime/2);
            }, flipTime/2);
        }

        function upsizeToParent($flipper, maxFontSize) {
            var parentWidth;
            var flipperWidth;
            var fontSize = maxFontSize;
            var i = 0;
            var minFontSize = 0;
            $flipper.css('font-size', fontSize + 'px');
            while(i < 20){
                i++;
                parentWidth = $flipper.innerWidth();
                $flipper.css('width', '9999px');
                flipperWidth = 0;
                $flipper.find('.flipper-group').each(function(){
                    var w = parseFloat($(this).outerWidth());
                    flipperWidth += w;
                });
                if((parentWidth - flipperWidth) < 10 && (parentWidth - flipperWidth) > 0){
                    $flipper.css('width', '');
                    return;
                }
                if(flipperWidth > parentWidth){
                    maxFontSize = fontSize < maxFontSize ? fontSize: maxFontSize;
                }
                else {
                    minFontSize = fontSize > minFontSize ? fontSize : minFontSize;
                }
                fontSize = (maxFontSize + minFontSize) / 2;
                $flipper.css('width', '');
                $flipper.css('font-size', fontSize + 'px');
            }
        }

        function setDigitValue(digitIndex, value){
            var $flipper = $('.flipper');
            var $digit = $flipper.find('.flipper-digit:eq(' + digitIndex + ')');
            var currentValue = getDigitValue($digit);
            if(currentValue.toString() === value.toString()){
                return; // has same value, do nothing
            }
            $digit.attr('data-value', value);
        }

        setInterval(function(){
            var $flipper = $('.flipper');
            $flipper.find('.flipper-digit[data-value]').each(function(){
                var $digit = $(this);
                if($digit.find('.active').html() === $digit.attr('data-value')){
                    return; //
                }
                if(!$digit.is('.r')){
                    flipDigit($digit);
                }
            });
        }, flipTime / 4);

        function setFlipperZero($flipper){
            $flipper.find('.flipper-dd').find('.flipper-digit:eq(0) .digit-face:contains(0)').addClass('active');
            $flipper.find('.flipper-dd').find('.flipper-digit:eq(1) .digit-face:contains(0)').addClass('active');
            $flipper.find('.flipper-ddd').find('.flipper-digit:eq(0) .digit-face:contains(0)').addClass('active');
            $flipper.find('.flipper-ddd').find('.flipper-digit:eq(1) .digit-face:contains(0)').addClass('active');
            $flipper.find('.flipper-ddd').find('.flipper-digit:eq(2) .digit-face:contains(0)').addClass('active');
            $flipper.find('.flipper-HH').find('.flipper-digit:eq(0) .digit-face:contains(0)').addClass('active');
            $flipper.find('.flipper-HH').find('.flipper-digit:eq(1) .digit-face:contains(0)').addClass('active');
            $flipper.find('.flipper-ii').find('.flipper-digit:eq(0) .digit-face:contains(0)').addClass('active');
            $flipper.find('.flipper-ii').find('.flipper-digit:eq(1) .digit-face:contains(0)').addClass('active');
            $flipper.find('.flipper-ss').find('.flipper-digit:eq(0) .digit-face:contains(0)').addClass('active');
            $flipper.find('.flipper-ss').find('.flipper-digit:eq(1) .digit-face:contains(0)').addClass('active');
        }

        function formatFlipperDate(dateStr) {
            var a=dateStr.split(" ");
            var d=a[0].split("-");
            var t=a[1].split(":");
            var date = new Date(d[0],(d[1]-1),d[2],t[0],t[1],t[2]);
            return date;
        }

        function setFlipperDate($flipper, dateString){
            var now = Date.now();
            var timestamp = Date.parse(formatFlipperDate(dateString));
            var remainder = (timestamp - now) / 1000;
            var days = Math.floor(remainder / 60 / 60 / 24);
            remainder -= days * 60 * 60 * 24;
            var hours = Math.floor(remainder / 60 / 60);
            remainder -= hours * 60 * 60;
            var minutes = Math.floor(remainder / 60);
            remainder -= minutes * 60;
            var seconds = Math.floor(remainder);

            var days_str = days.toString().padStart(3, '0');
            var hours_str = hours.toString().padStart(2, '0');
            var minutes_str = minutes.toString().padStart(2, '0');
            var seconds_str = seconds.toString().padStart(2, '0');

            $flipper.find('.flipper-dd').find('.flipper-digit:eq(0) .digit-face:contains(' + days_str[1] + ')').addClass('active');
            $flipper.find('.flipper-dd').find('.flipper-digit:eq(1) .digit-face:contains(' + days_str[2] + ')').addClass('active');
            $flipper.find('.flipper-ddd').find('.flipper-digit:eq(0) .digit-face:contains(' + days_str[0] + ')').addClass('active');
            $flipper.find('.flipper-ddd').find('.flipper-digit:eq(1) .digit-face:contains(' + days_str[1] + ')').addClass('active');
            $flipper.find('.flipper-ddd').find('.flipper-digit:eq(2) .digit-face:contains(' + days_str[2] + ')').addClass('active');
            $flipper.find('.flipper-HH').find('.flipper-digit:eq(0) .digit-face:contains(' + hours_str[0] + ')').addClass('active');
            $flipper.find('.flipper-HH').find('.flipper-digit:eq(1) .digit-face:contains(' + hours_str[1] + ')').addClass('active');
            $flipper.find('.flipper-ii').find('.flipper-digit:eq(0) .digit-face:contains(' + minutes_str[0] + ')').addClass('active');
            $flipper.find('.flipper-ii').find('.flipper-digit:eq(1) .digit-face:contains(' + minutes_str[1] + ')').addClass('active');
            $flipper.find('.flipper-ss').find('.flipper-digit:eq(0) .digit-face:contains(' + seconds_str[0] + ')').addClass('active');
            $flipper.find('.flipper-ss').find('.flipper-digit:eq(1) .digit-face:contains(' + seconds_str[1] + ')').addClass('active');
        }

        function addAppearance($flipper){
            $flipper.find('.flipper-digit').each(function(){
                var value = $(this).find('.digit-face.active').html();
                $(this).prepend('<div class="digit-top">' + value + '</div>');
                $(this).prepend('<div class="digit-top2">' + value + '</div>');
                $(this).prepend('<div class="digit-bottom">' + value + '</div>');
                $(this).prepend('<div class="digit-next"></div>');
            });
        }

        function animateFlipperDate($flipper, dateString){
          
            if(!$flipper.is(':visible')){
              $flipper.addClass('flipper-invisible');
              return;
            }
          
            if($flipper.hasClass('flipper-invisible')){
              $flipper.removeClass('flipper-invisible');
              upsizeToParent($flipper, 1000);
            }
          
            var now = Date.now();

            var timestamp = Date.parse(formatFlipperDate(dateString));

            var remainder = (timestamp - now) / 1000;
            var days = Math.floor(remainder / 60 / 60 / 24);
            remainder -= days * 60 * 60 * 24;
            var hours = Math.floor(remainder / 60 / 60);
            remainder -= hours * 60 * 60;
            var minutes = Math.floor(remainder / 60);
            remainder -= minutes * 60;
            var seconds = Math.floor(remainder);

            var days_str = days.toString().padStart(3, '0');
            var hours_str = hours.toString().padStart(2, '0');
            var minutes_str = minutes.toString().padStart(2, '0');
            var seconds_str = seconds.toString().padStart(2, '0');

            $flipper.find('.flipper-dd').find('.flipper-digit:eq(0)').attr('data-value', days_str[1]);
            $flipper.find('.flipper-dd').find('.flipper-digit:eq(1)').attr('data-value', days_str[2]);
            $flipper.find('.flipper-ddd').find('.flipper-digit:eq(0)').attr('data-value', days_str[0]);
            $flipper.find('.flipper-ddd').find('.flipper-digit:eq(1)').attr('data-value', days_str[1]);
            $flipper.find('.flipper-ddd').find('.flipper-digit:eq(2)').attr('data-value', days_str[2]);
            $flipper.find('.flipper-HH').find('.flipper-digit:eq(0)').attr('data-value', hours_str[0]);
            $flipper.find('.flipper-HH').find('.flipper-digit:eq(1)').attr('data-value', hours_str[1]);
            $flipper.find('.flipper-ii').find('.flipper-digit:eq(0)').attr('data-value', minutes_str[0]);
            $flipper.find('.flipper-ii').find('.flipper-digit:eq(1)').attr('data-value', minutes_str[1]);
            $flipper.find('.flipper-ss').find('.flipper-digit:eq(0)').attr('data-value', seconds_str[0]);
            $flipper.find('.flipper-ss').find('.flipper-digit:eq(1)').attr('data-value', seconds_str[1]);
        }
    };

});
