(function(global) {
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
      var path = "/data/" + term + ".json";
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
    for (var i = 0; i < data.sections.length; ++i) {
      var section = data.sections[i].name;
      if (section.lastIndexOf("(LEC)") === section.length - "(LEC)".length) {
        lecSeats += data.sections[i].seats | 0;
        lecWaitlist += data.sections[i].waitlist | 0;
      }
      else {
        otherSeats += data.sections[i].seats | 0;
        otherWaitlist += data.sections[i].waitlist | 0;
      }
    }
    return {
      seats: Math.min(lecSeats, otherSeats),
      waitlist: Math.max(lecWaitlist, otherWaitlist)
    };
  };
  var chartForData = function(classID, data, ctx) {
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
    var timeComparator = function(a, b) {
      if (a.t < b.t) {
        return -1;
      }
      if (b.t < a.t) {
        return 1;
      }
      return 0;
    };
    seats.sort(timeComparator);
    waitlist.sort(timeComparator);
    var chart = new global.Chart(ctx, {
      type: "line",
      data: {
        datasets: [
          {
            label: "Open seats",
            data: seats,
            borderColor: "blue",
            fill: false,
            lineTension: 0
          },
          {
            label: "Waitlist",
            data: waitlist,
            borderColor: "red",
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
            }
          }],
          yAxes: [{
            ticks: {
              min: 0
            }
          }]
        },
        title: {
          display: true,
          fontSize: 24,
          text: getClassTitle(classID)
        },
        tooltips: {
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
  var addChart = function(term, classID, callback) {
    if (callback === undefined) {
      callback = function() {};
    }
    getData(term, function(data, error) {
      if (error) {
        return callback(undefined, error);
      }
      var canvasEl = global.document.createElement("canvas");
      chartsElement.appendChild(canvasEl);
      callback(chartForData(classID, data[classID], canvasEl.getContext("2d")));
    });
  };
  var setChartsElement = function(el) {
    chartsElement = el;
  };

  global.data = {
    addChart: addChart,
    getData: getData,
    preloadData: preloadData,
    setChartsElement: setChartsElement
  };
})(window);
