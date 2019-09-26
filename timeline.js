/**
 * @description Load calendar with provided data
 * @param {label: string, date: string, id: any, iconClass: string, customClass: string} data
 * @param {showEmptyDates: boolean, iconClasses: any} options
 */
$.fn.loadTimeline = function(data, options) {
  const { showEmptyDates, iconClasses } = options;

  const dataToOrder = data;
  let orderedData = [];
  let arr = [];

  if (showEmptyDates) {
    // Verify wich months and years have data
    dataToOrder.forEach(elem => {
      const monthAndYear = moment(elem.date, "DD/MM/YYYY").format("MM/YYYY");
      if (!arr.some(elem => monthAndYear === elem)) arr.push(monthAndYear);
    });

    // Add everydays of months and years with data
    arr.forEach(monthAndYear => {
      const momentD = moment(`01/${monthAndYear}`, "DD/MM/YYYY");
      const days = momentD.daysInMonth();
      let day = 1;
      Array.from({ length: days }, () => {
        const rightDate = momentD.format("DD/MM/YYYY");
        orderedData.push({ date: rightDate });
        day++;
        momentD.date(day);
      });
    });
  }

  if (dataToOrder.length > 1)
    orderedData = showEmptyDates ? getDate(data) : quickSort(data);
  else {
    orderedData = dataToOrder;
    orderedData[0].date = toBrasilianDate(orderedData[0].date);
    // Check if there's a specific icon to the data or search for a icon if not
    if (iconClasses) {
      orderedData[0].iconClass = orderedData[0].iconClass
        ? orderedData[0].iconClass
        : getIcon(orderedData[0].iconId);
    }
  }

  // Clears the box before add another
  $(this).empty();

  $(this).attr("class", "timeline-box");

  $(this).append(
    '<div class="line-timeline"></div><ul class="father-box" style="transform: translateX(0px);"></ul>'
  );

  // Add incoming array data to the timeline
  for (let item of orderedData) {
    const { label, date, iconClass, customClass, id } = item;

    if (label) {
      $(this).find(".father-box").append(`
        <li class="data-box${customClass ? ` ${customClass}` : ""}" ${
        iconClass ? "" : 'style="margin-top: 15px;"'
      } ${id ? `id="${id}"` : ""}>
          <span class="data">
          ${
            iconClass
              ? `<span class="${iconClass}" aria-hidden="true"></span><br />`
              : ""
          }
            <b>${label}</b>
          </span>
          <div class="vertical-line"></div>
          <div class="ball"></div>
          <p class="find-date">${date}</p>
        </li>
      `);
    } else if (!label && showEmptyDates) {
      $(this)
        .find(".father-box")
        .append(
          `<li class="empty-day-box""><span class="empty-day${
            isFirstDay(date) ? " empty-first-day" : ""
          }"></span>
        <span class="find-date date hide-date">${date}</span></li>`
        );
    }
  }

  // Handle events
  $(this).turnoffEvents();

  dragEvents(orderedData, this);
  if (showEmptyDates) {
    showHideDatesOnHover(this);
  }

  function isFirstDay(date) {
    const momentDate = moment(date, "DD/MM/YYYY");
    return momentDate.date() === 1;
  }

  /**
   * @description Order array with an quicksort
   * @param {any[]} array
   */
  function quickSort(array) {
    let smaller = [];
    let larger = [];
    if (array.length <= 1) return array;

    // Edit the data and put in an ordered array
    array[0].date = toBrasilianDate(array[0].date);
    // Check if there's a specific icon to the data or search for a icon if not
    if (iconClasses) {
      array[0].iconClass = array[0].iconClass
        ? array[0].iconClass
        : getIcon(array[0].iconId);
    }
    const momentDate1 = moment(array[0].date, "DD-MM-YYYY");
    for (let i = 1; i < array.length; i++) {
      const momentDate2 = moment(array[i].date, "DD-MM-YYYY");
      // Edit the data and put in an ordered array
      array[i].date = toBrasilianDate(array[i].date);
      // Check if there's a specific icon to the data or search for a icon if not
      if (iconClasses) {
        array[i].iconClass = array[i].iconClass
          ? array[i].iconClass
          : getIcon(array[i].iconId);
      }
      if (momentDate2.isAfter(momentDate1)) {
        larger.push(array[i]);
      }
      if (momentDate2.isSameOrBefore(momentDate1)) {
        smaller.push(array[i]);
      }
    }
    return quickSort(smaller).concat(array[0], quickSort(larger));
  }

  /**
   * @description get date array if this is to show emptyDates
   * @param {any[]} array
   */
  function getDate(array) {
    array.forEach(elem => {
      const find = orderedData.findIndex(searchElem => {
        const momentDate = moment(elem.date, "DD-MM-YYYY");
        const formatedDate = momentDate.format("DD/MM/YYYY");
        return searchElem.date === formatedDate;
      });
      orderedData[find] = elem.label;
      // Edit the data and put in an ordered array
      orderedData[find].date = toBrasilianDate(orderedData[find].date);
      // Check if there's a specific icon to the data or search for a icon if not
      if (iconClasses) {
        orderedData[find].iconClass = orderedData[find].iconClass
          ? orderedData[find].iconClass
          : getIcon(orderedData[find].iconId);
      }
    });
    return orderedData;
  }

  /**
   * @description Change the current date to brasilian format
   * @param {string} date
   */
  function toBrasilianDate(date) {
    return moment(date, "DD-MM-YYYY").format("DD/MM/YYYY");
  }

  /**
   * @description Get correspondent icon to an item
   * @param {string} label
   * @returns class of icon
   */
  function getIcon(iconId) {
    return iconClasses[iconId];
  }

  /** @description Start Drag events */
  function dragEvents(orderedData, context) {
    // Total width of scroll box
    let scrollContentWidth = 0;
    orderedData.forEach((_, i) => {
      const width = context.find(".father-box li").get(i).scrollWidth;
      scrollContentWidth += width;
    });

    // handlers of events
    /**@type {boolean} */
    let canDrag;
    /**@type {number} */
    let lastX = 0;

    context.on({
      mousemove: e => {
        if (canDrag) {
          // get actual width of the box if it's resized and decrement in the max drag width
          const canMove =
            scrollContentWidth - Math.floor($(context).width() * 0.65);
          const maxDragWidth = canMove >= 0 ? canMove : 0;

          const style = context.find(".father-box").attr("style");
          const actualPositionX = Number(style.replace(/\D/g, ""));

          if (!lastX) lastX = e.pageX;

          const movedValue = Math.abs(lastX) - e.pageX;
          let finalPositionX = Math.abs(actualPositionX + movedValue);
          lastX = e.pageX;

          if (actualPositionX + movedValue <= 0) finalPositionX = 0;
          if (actualPositionX + movedValue >= maxDragWidth)
            finalPositionX = maxDragWidth;

          context
            .find(".father-box")
            .attr("style", `transform: translate(-${finalPositionX}px)`);
        }
      },
      mousedown: e => {
        lastX = e.pageX;
        canDrag = true;
        $(".timeline-box").attr("style", "cursor: grabbing");
      },
      mouseup: _ => {
        canDrag = false;
        $(".timeline-box").attr("style", "cursor: grab");
      },
      mouseleave: _ => {
        canDrag = false;
      }
    });
  }

  /** @description Start show and hide data animation events */
  function showHideDatesOnHover(context) {
    context.find(".empty-day-box").mouseover(function() {
      $(this)
        .find(".date")
        .attr("class", "date show-date");
    });
    context.find(".empty-day-box").mouseleave(function() {
      $(this)
        .find(".date")
        .attr("class", "date hide-date");
    });
  }
};

/**@description Turnoff all events of the timeline */
$.fn.turnoffEvents = function() {
  $(this).off();
};

/**
 * @description Go to a especific date (the date that's loaded)
 * @param {string} date
 */
$.fn.goToDate = function(date) {
  let widthUntilDate = 0;
  $(this)
    .find("li")
    .find(".find-date")
    .each(i => {
      const { innerText, scrollWidth } = $(this)
        .find("li")
        .find(".find-date")
        .get(i);
      if (innerText !== date) {
        widthUntilDate += scrollWidth + 18;
      } else {
        $(this)
          .find(".father-box")
          .attr("style", `transform: translate(-${widthUntilDate}px)`);
        return;
      }
    });
};
