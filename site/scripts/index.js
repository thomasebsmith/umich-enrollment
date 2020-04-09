var termSelectEl = document.getElementById("term-select");
var addClassSectionEl = document.getElementById("add-class-section");
var classSelectEl = document.getElementById("class-select");
var addClassButtonEl = document.getElementById("add-class-button");
var chartsEl = document.getElementById("charts");

var selectedTerm = "f_20_2310";
termSelectEl.selectedIndex = 1;

var loadTerm = function(term) {
  // Clear all current charts
  chartsEl.textContent = "";
  // Fix the class select element
  classSelectEl.textContent = "";
  var el = document.createElement("option");
  el.setAttribute("value", "");
  el.textContent = "-- Choose a class --";
  classSelectEl.appendChild(el);
  if (term === "") {
    addClassSectionEl.classList.add("hidden");
  }
  else {
    addClassSectionEl.classList.remove("hidden");
    data.getClasses(term, function(classes, error) {
      if (error === undefined) {
        // Add <option>s for all classes
        classes.sort();
        for (var i = 0; i < classes.length; ++i) {
          var el = document.createElement("option");
          el.setAttribute("value", classes[i]);
          el.textContent = data.getClassTitle(classes[i]);
          classSelectEl.appendChild(el);
        }
      }
    });
  }
};

termSelectEl.addEventListener("change", function(event) {
  // If a different term is selected,
  if (selectedTerm != termSelectEl.value) {
    selectedTerm = termSelectEl.value;
    // Load classes and chart data for the selected term
    loadTerm(selectedTerm);
  }
});

addClassButtonEl.addEventListener("click", function(event) {
  if (selectedTerm !== "" && classSelectEl.value !== "") {
    data.addChart(selectedTerm, classSelectEl.value);
  }
});

loadTerm(selectedTerm);

data.setChartsElement(chartsEl);
