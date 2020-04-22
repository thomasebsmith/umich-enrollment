(function(global) {
  var isDark = (typeof global.matchMedia) === "function" &&
               global.matchMedia("(prefers-color-scheme: dark)").matches;
  if (isDark) {
    global.Chart.defaults.global.defaultFontColor = "#bbb";
  }
  var timeComparator = function(a, b) {
    if (a.t < b.t) {
      return -1;
    }
    if (b.t < a.t) {
      return 1;
    }
    return 0;
  };
  var chartsElement = global.document.body;
  var dataByTerm = global.Object.create(null);

  var getClassTitle = function(classID) {
    return classID.replace(/^([A-Z]+)([0-9]+)([0-9]{3})$/g, "$1 $2");
  };
  var getData = function(term, callback) {
    term = (term + "").replace(/[^a-z0-9_]/g, "")
    if (dataByTerm[term]) {
      callback(dataByTerm[term]);
    }
    else {
      var path = "./data/" + term + ".json";
      var req = new global.XMLHttpRequest();
      req.open("GET", path, true);
      req.responseType = "json";
      req.addEventListener("load", function() {
        dataByTerm[term] = req.response;
        callback(req.response);
      });
      req.addEventListener("error", function() {
        callback(undefined, new Error("Unable to find data for term " + term));
      });
      req.send();
    }
  };
  var preloadData = function(term, callback) {
    getData(term, function(_, error) {
      callback(error);
    });
  };

  var dataPoint = function(data) {
    var lecSeats = 0;
    var otherSeats = 0;
    var lecWaitlist = 0;
    var otherWaitlist = 0;
    var hasLec = false;
    var hasOther = false;
    for (var i = 0; i < data.sections.length; ++i) {
      var section = data.sections[i].name;
      if (section.lastIndexOf("(LEC)") === section.length - "(LEC)".length) {
        lecSeats += data.sections[i].seats | 0;
        lecWaitlist += data.sections[i].waitlist | 0;
        hasLec = true;
      }
      else {
        otherSeats += data.sections[i].seats | 0;
        otherWaitlist += data.sections[i].waitlist | 0;
        hasOther = true;
      }
    }
    if (hasLec && !hasOther) {
      return {
        seats: lecSeats,
        waitlist: lecWaitlist
      };
    }
    if (hasOther && !hasLec) {
      return {
        seats: otherSeats,
        waitlist: otherWaitlist
      };
    }
    return {
      seats: Math.min(lecSeats, otherSeats),
      waitlist: Math.max(lecWaitlist, otherWaitlist)
    };
  };
  var reformatData = function(data) {
    var seats = [];
    var waitlist = [];
    for (var t in data) {
      if (data.hasOwnProperty(t)) {
        var seatsAndWaitlist = dataPoint(data[t]);
        seats.push({
          t: t,
          y: seatsAndWaitlist.seats
        });
        waitlist.push({
          t: t,
          y: seatsAndWaitlist.waitlist
        });
      }
    }
    seats.sort(timeComparator);
    waitlist.sort(timeComparator);
    return {
      seats: seats,
      waitlist: waitlist
    };
  };
  var chartForData = function(classID, data, ctx) {
    var chart = new global.Chart(ctx, {
      type: "line",
      data: {
        datasets: [
          {
            label: "Open seats",
            data: data.seats,
            borderColor: isDark ? "#48f" : "blue",
            fill: false,
            lineTension: 0
          },
          {
            label: "Waitlist",
            data: data.waitlist,
            borderColor: isDark ? "#f22" : "red",
            fill: false,
            lineTension: 0
          }
        ]
      },
      options: {
        scales: {
          xAxes: [{
            type: "time",
            time: {
              unit: "day"
            },
            gridLines: {
              color: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"
            }
          }],
          yAxes: [{
            ticks: {
              min: 0
            },
            gridLines: {
              color: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"
            }
          }]
        },
        title: {
          display: true,
          fontSize: 24,
          text: getClassTitle(classID)
        },
        tooltips: {
          backgroundColor: isDark ? "rgba(63, 63, 63, 0.8)" :
                                    "rgba(0, 0, 0, 0.8)",
          titleFontColor: isDark ? "#ddd" : "#fff",
          callbacks: {
            title: function(tooltipItem, data) {
              return (new global.Date(tooltipItem[0].label)).toLocaleString();
            }
          }
        }
      }
    });
    return chart;
  };
  var latestRegistrationRange = function(data) {
    var time = null;
    var timeIndex = null;
    var beforeTime = null;
    for (var i = data.seats.length - 1; i >= 0; --i) {
      if (data.seats[i].y <= 0) {
        time = new Date(data.seats[i].t);
        timeIndex = i;
      }
    }
    if (timeIndex !== null && timeIndex !== 0) {
      beforeTime = new Date(data.seats[timeIndex - 1].t);
    }
    return [beforeTime, time];
  };
  var addChart = function(term, classID, callback) {
    if (callback === undefined) {
      callback = function() {};
    }
    getData(term, function(data, error) {
      if (error) {
        return callback(undefined, error);
      }
      var dataEl = global.document.createElement("div");
      var canvasEl = global.document.createElement("canvas");
      dataEl.appendChild(canvasEl);
      chartsElement.appendChild(dataEl);
      var thisData = reformatData(data[classID]);
      var dates = latestRegistrationRange(thisData);
      var text;
      if (dates[1] === null) {
        text = "There are open seats in this class!";
      }
      else {
        text = "This class ran out of open seats ";
        if (dates[0] === null) {
          text += "before " + dates[1].toLocaleDateString() + " at ";
          text += dates[1].toLocaleTimeString() + ".";
        }
        else if (dates[0].toLocaleDateString() ===
                 dates[1].toLocaleDateString()) {
          text += "on " + dates[0].toLocaleDateString() + " between ";
          text += dates[0].toLocaleTimeString() + " and ";
          text += dates[1].toLocaleTimeString() + ".";
        }
        else {
          text += "between " + dates[0].toLocaleDateString() + " at ";
          text += dates[0].toLocaleTimeString() + " and ";
          text += dates[1].toLocaleDateString() + " at ";
          text += dates[1].toLocaleTimeString() + ".";
        }
      }
      var datesEl = global.document.createElement("p");
      datesEl.classList.add("no-seats-left");
      datesEl.textContent = text;
      dataEl.appendChild(datesEl);
      callback(chartForData(classID, thisData, canvasEl.getContext("2d")));
    });
  };
  var setChartsElement = function(el) {
    chartsElement = el;
  };
  var getClasses = function(term, callback) {
    getData(term, function(data, error) {
      if (error !== undefined) {
        return callback(undefined, error);
      }
      callback(Object.keys(data));
    });
  };

  global.data = {
    addChart: addChart,
    getClasses: getClasses,
    getClassTitle: getClassTitle,
    getData: getData,
    preloadData: preloadData,
    setChartsElement: setChartsElement
  };
})(window);
