(function(global) {
  var chartsElement = global.document.body;
  var dataByTerm = global.Object.create(null);

  var getData = function(term, callback) {
    term = (term + "").replace(/[^a-z0-9_]/g, "")
    if (dataByTerm.hasOwnProperty(term)) {
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
  var chartForData = function(data, ctx) {
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
    var chart = new global.Chart(ctx, {
      type: "line",
      data: {
        datasets: [
          seats,
          waitlist
        ]
      },
      options: {
        scales: {
          xAxes: [
            { type: "time" },
            { type: "time" }
          ]
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
      callback(chartForData(data[classID], canvasEl.getContext("2d")));
    });
  };
  var setChartsElement = function(el) {
    chartsElement = el;
  };

  global.data = {
    addChart: addChart,
    getData: getData,
    setChartsElement: setChartsElement
  };
})(window);
