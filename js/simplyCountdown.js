(function (exports) {
  "use strict";

  let extend = function (output) {
    let obj;
    let out = output || {};

    for (let i = 1; i < arguments.length; i += 1) {
      obj = arguments[i];
      const keys = Object.keys(obj);

      if (keys.length) {
        for (let i2 = 0; i2 < keys.length; i2 += 1) {
          let key = keys[i2];

          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            if (typeof obj[key] === "object") {
              extend(out[key], obj[key]);
            } else {
              out[key] = obj[key];
            }
          }
        }
      }
    }

    return out;
  };

  let isIterableElement = (val) => {
    return val !== null && Symbol.iterator in Object(val);
  };

  let createCountdownElt = (countdown, parameters, typeClass) => {
    let sectionTag = document.createElement("div");
    let amountTag = document.createElement("span");
    let wordTag = document.createElement("span");
    let innerSectionTag = document.createElement("div");

    innerSectionTag.appendChild(amountTag);
    innerSectionTag.appendChild(wordTag);
    sectionTag.appendChild(innerSectionTag);

    sectionTag.classList.add(parameters.sectionClass);
    sectionTag.classList.add(typeClass);
    amountTag.classList.add(parameters.amountClass);
    wordTag.classList.add(parameters.wordClass);

    countdown.appendChild(sectionTag);

    return {
      full: sectionTag,
      amount: amountTag,
      word: wordTag,
    };
  };

  let createElements = (parameters, countdown) => {
    let spanTag;

    if (!parameters.inline) {
      return {
        days: createCountdownElt(countdown, parameters, "simply-days-section"),
        hours: createCountdownElt(
          countdown,
          parameters,
          "simply-hours-section"
        ),
        minutes: createCountdownElt(
          countdown,
          parameters,
          "simply-minutes-section"
        ),
        seconds: createCountdownElt(
          countdown,
          parameters,
          "simply-seconds-section"
        ),
      };
    }

    spanTag = document.createElement("span");
    spanTag.classList.add(parameters.inlineClass);
    return spanTag;
  };

  exports.simplyCountdown = (elt, args) => {
    const eltProto = Object.getPrototypeOf(elt);
    let parameters = extend(
      {
        year: 2024,
        month: 8,
        day: 9,
        hours: 0,
        minutes: 0,
        seconds: 0,
        words: {
          days: { singular: "day", plural: "days" },
          hours: { singular: "hour", plural: "hours" },
          minutes: { singular: "minute", plural: "minutes" },
          seconds: { singular: "second", plural: "seconds" },
        },
        plural: true,
        inline: false,
        enableUtc: false,
        onEnd: () => {},
        refresh: 1000,
        inlineClass: "simply-countdown-inline",
        sectionClass: "simply-section",
        amountClass: "simply-amount",
        wordClass: "simply-word",
        zeroPad: false,
        countUp: false,
      },
      args
    );
    let interval;
    let targetDate;
    let targetTmpDate;
    let now;
    let nowUtc;
    let secondsLeft;
    let days;
    let hours;
    let minutes;
    let seconds;
    let cd;

    if (eltProto === String.prototype) {
      cd = document.querySelectorAll(elt);
    } else {
      cd = elt;
    }

    targetTmpDate = new Date(
      parameters.year,
      parameters.month - 1,
      parameters.day,
      parameters.hours,
      parameters.minutes,
      parameters.seconds
    );

    if (parameters.enableUtc) {
      targetDate = new Date(
        targetTmpDate.getUTCFullYear(),
        targetTmpDate.getUTCMonth(),
        targetTmpDate.getUTCDate(),
        targetTmpDate.getUTCHours(),
        targetTmpDate.getUTCMinutes(),
        targetTmpDate.getUTCSeconds()
      );
    } else {
      targetDate = targetTmpDate;
    }

    let runCountdown = (theCountdown) => {
      let countdown = theCountdown;
      let fullCountDown = createElements(parameters, countdown);
      let refresh;

      refresh = function () {
        let dayWord;
        let hourWord;
        let minuteWord;
        let secondWord;

        let updateDisplayDate = () => {
          days = parseInt(secondsLeft / 86400, 10);
          secondsLeft %= 86400;

          hours = parseInt(secondsLeft / 3600, 10);
          secondsLeft %= 3600;

          minutes = parseInt(secondsLeft / 60, 10);
          seconds = parseInt(secondsLeft % 60, 10);
        };

        now = new Date();
        if (parameters.enableUtc) {
          nowUtc = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            now.getHours(),
            now.getMinutes(),
            now.getSeconds()
          );
          secondsLeft = (targetDate - nowUtc.getTime()) / 1000;
        } else {
          secondsLeft = (targetDate - now.getTime()) / 1000;
        }

        if (secondsLeft > 0) {
          updateDisplayDate();
        } else if (parameters.countUp) {
          secondsLeft = (now.getTime() - targetDate) / 1000;
          updateDisplayDate();
        } else {
          days = 0;
          hours = 0;
          minutes = 0;
          seconds = 0;
          window.clearInterval(interval);
          parameters.onEnd();
        }

        if (parameters.plural) {
          dayWord =
            days > 1
              ? parameters.words.days.plural
              : parameters.words.days.singular;

          hourWord =
            hours > 1
              ? parameters.words.hours.plural
              : parameters.words.hours.singular;

          minuteWord =
            minutes > 1
              ? parameters.words.minutes.plural
              : parameters.words.minutes.singular;

          secondWord =
            seconds > 1
              ? parameters.words.seconds.plural
              : parameters.words.seconds.singular;
        } else {
          dayWord = parameters.words.days.singular;
          hourWord = parameters.words.hours.singular;
          minuteWord = parameters.words.minutes.singular;
          secondWord = parameters.words.seconds.singular;
        }

        if (parameters.inline) {
          countdown.innerHTML =
            `${days} ${dayWord}, ` +
            `${hours} ${hourWord}, ` +
            `${minutes} ${minuteWord}, ` +
            `${seconds} ${secondWord}.`;
        } else {
          fullCountDown.days.amount.textContent =
            (parameters.zeroPad && days.toString().length < 2 ? "0" : "") +
            days;
          fullCountDown.days.word.textContent = dayWord;

          fullCountDown.hours.amount.textContent =
            (parameters.zeroPad && hours.toString().length < 2 ? "0" : "") +
            hours;
          fullCountDown.hours.word.textContent = hourWord;

          fullCountDown.minutes.amount.textContent =
            (parameters.zeroPad && minutes.toString().length < 2 ? "0" : "") +
            minutes;
          fullCountDown.minutes.word.textContent = minuteWord;

          fullCountDown.seconds.amount.textContent =
            (parameters.zeroPad && seconds.toString().length < 2 ? "0" : "") +
            seconds;
          fullCountDown.seconds.word.textContent = secondWord;
        }
      };

      refresh();
      interval = window.setInterval(refresh, parameters.refresh);
    };

    if (!isIterableElement(cd)) {
      runCountdown(cd);
    } else {
      Array.prototype.forEach.call(cd, (cdElt) => {
        runCountdown(cdElt);
      });
    }
  };
})(window);

if (window.jQuery) {
  (function ($, simplyCountdown) {
    "use strict";

    function simplyCountdownify(el, options) {
      simplyCountdown(el, options);
    }

    $.fn.simplyCountdown = function (options) {
      return simplyCountdownify(this.selector, options);
    };
  })(jQuery, simplyCountdown);
}
