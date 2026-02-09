"use strict";

// global variable used to set the note finder target
let G_NOTE_FINDER_TARGET;

function thPartielsValues(updatedInputName) {
  const thFrequencies = Array.apply(
    null,
    document.querySelectorAll(
      "#th-partiels>.input-tile>.input-frequency>input",
    ),
  );
  const [bourdon, fondamental, tierceMineure, quinte, nominal] = thFrequencies;

  // get the currently updated input DOM object
  const updatedInput = document.getElementById(
    "th-" + updatedInputName + "-frequency",
  );

  if (
    updatedInput.value == null ||
    updatedInput.value === 0 ||
    getNoteFromFrequency(updatedInput.value.valueOf()) === "Erreur"
  ) {
    // hide measured values inputs
    document.getElementById("me-partiels").style.display = "none";
    document.getElementById("me-partiels-placeholder").style.display = "flex";

    // clear all theoretical frequencies except the updated one
    thFrequencies.forEach((element) => {
      if (
        element.getAttribute("id") ===
        "th-" + updatedInputName + "-frequency"
      ) {
        return;
      }
      element.value = "";
    });

    // clear all theoretical notes values
    document
      .querySelectorAll("#th-partiels>.input-tile>.input-note>p")
      .forEach((element) => (element.innerText = "Note :"));
  } else {
    // show measured values inputs
    document.getElementById("me-partiels").style.display = "flex";
    document.getElementById("me-partiels-placeholder").style.display = "none";

    // logic for updating theoretical frequencies depending on the updated one
    let updatedInputs = new Array(4).fill(false);

    switch (updatedInputName) {
      case "bourdon":
        fondamental.value = Math.round((bourdon.value / 0.5) * 100) / 100;
        updatedInputs[0] = true;
        break;
      case "tierce-mineure":
        fondamental.value =
          Math.round((tierceMineure.value / Math.pow(2, 3 / 12)) * 100) / 100;
        updatedInputs[1] = true;
        break;
      case "quinte":
        fondamental.value =
          Math.round((quinte.value / Math.pow(2, 7 / 12)) * 100) / 100;
        updatedInputs[2] = true;
        break;
      case "nominal":
        fondamental.value = Math.round((nominal.value / 2) * 100) / 100;
        updatedInputs[3] = true;
        break;
      default:
        break;
    }

    if (!updatedInputs[0]) {
      bourdon.value = Math.round(fondamental.value * 0.5 * 100) / 100;
    }
    if (!updatedInputs[1]) {
      tierceMineure.value =
        Math.round(fondamental.value * Math.pow(2, 3 / 12) * 100) / 100;
    }
    if (!updatedInputs[2]) {
      quinte.value =
        Math.round(fondamental.value * Math.pow(2, 7 / 12) * 100) / 100;
    }
    if (!updatedInputs[3]) {
      nominal.value = Math.round(fondamental.value * 2 * 100) / 100;
    }

    // update all theoretical notes values
    const thNotes = Array.apply(
      null,
      document.querySelectorAll("#th-partiels>.input-tile>.input-note>p"),
    );
    for (let i = 0; i < thNotes.length; i++) {
      thNotes[i].innerHTML =
        "Note : " +
        getNoteFromFrequency(
          thFrequencies[i].value.valueOf(),
          getBaseNote(),
          getNoteSystem(),
        );
    }
  }
}

function mePartielsValues() {
  const thFrequencies = [
    ...document.querySelectorAll(
      "#th-partiels>.input-tile>.input-frequency>input",
    ),
  ].map((input) => +input.value);
  const meFrequencies = [
    ...document.querySelectorAll(
      "#me-partiels>.input-tile>.input-frequency>input",
    ),
  ].map((input) => +input.value);
  const meNotes = [
    ...document.querySelectorAll(
      "#me-partiels>.input-tile>.input-note>p:nth-child(1)",
    ),
  ].map((p) => p.getAttribute("id"));
  const meGaps = [
    ...document.querySelectorAll(
      "#me-partiels>.input-tile>.input-note>p:nth-child(2)",
    ),
  ].map((p) => p.getAttribute("id"));

  for (let i = 0; i < thFrequencies.length; i++) {
    setMePartielsValues(
      thFrequencies[i],
      meFrequencies[i],
      meNotes[i],
      meGaps[i],
    );
  }

  function setMePartielsValues(
    thFrequency,
    meFrequency,
    meNoteName,
    meGapName,
  ) {
    const fsGap = getFrequenciesSemitoneGap(thFrequency, meFrequency);
    let meNote = document.getElementById(meNoteName);
    let meGap = document.getElementById(meGapName);
    if (meFrequency == null || meFrequency == 0) {
      meNote.innerText = "Note :";
      meGap.innerText = "Écart :";
    } else {
      if (getMePartielsNotes() == "absolute") {
        meNote.innerHTML =
          "Note : " +
          getNoteFromFrequency(meFrequency, getBaseNote(), getNoteSystem());
      } else {
        meNote.innerHTML =
          "Note : " + getRelativeMeNote(thFrequency, meFrequency);
      }
      if (fsGap < 0) {
        meGap.innerText = "Écart : " + fsGap + "/16";
      } else if (fsGap > 0) {
        meGap.innerText = "Écart : +" + fsGap + "/16";
      } else {
        meGap.innerText = "Écart : aucun";
      }
    }
  }
}

// returns the note from a frequency
function getNoteFromFrequency(
  frequency,
  base,
  system,
  noteFinder = 0,
  semitoneGap = 0,
) {
  let frequencyIterator = base;
  const notesNamingSystems = {
    latin: {
      notes: [
        "do",
        "do♯",
        "ré",
        "ré♯",
        "mi",
        "fa",
        "fa♯",
        "sol",
        "sol♯",
        "la",
        "la♯",
        "si",
      ],
      octaveIterator: 3,
    },
    "latin-old": {
      notes: [
        "ut",
        "ut♯",
        "ré",
        "ré♯",
        "mi",
        "fa",
        "fa♯",
        "sol",
        "sol♯",
        "la",
        "la♯",
        "si",
      ],
      octaveIterator: 3,
    },
    english: {
      notes: ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"],
      octaveIterator: 4,
    },
    german: {
      notes: ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "H"],
      octaveIterator: 4,
    },
  };
  const notes =
    notesNamingSystems[system]?.notes ?? notesNamingSystems["latin"].notes;
  let octaveIterator =
    notesNamingSystems[system]?.octaveIterator ??
    notesNamingSystems["latin"].octaveIterator;
  let noteIterator = 9;
  let semitoneIterator = 16;
  let iterator = 0;
  let upperNoteFinder = false;

  if (
    frequency > frequencyIterator &&
    frequency >= 63.77 &&
    frequency <= 7449.71
  ) {
    while (frequency > frequencyIterator) {
      iterator++;

      // increase frequency by 1 semitone
      frequencyIterator = base * Math.pow(2, iterator / 192);

      // semitone loop
      if (semitoneIterator == 16) {
        semitoneIterator = 0;
      }

      // note loop & octave increase
      if (noteIterator == 11 && semitoneIterator == 8) {
        noteIterator = 0;
        octaveIterator++;
      } else if (semitoneIterator == 8) {
        noteIterator++;
      }

      semitoneIterator++;
    }

    // compare the note frequency with the upper and lower frequencies and change semitone, note & octave if needed
    if (
      frequencyIterator - frequency >=
      frequency - base * Math.pow(2, (iterator - 1) / 192)
    ) {
      if (semitoneIterator == 9 && noteIterator == 0) {
        noteIterator = 11;
        octaveIterator--;
      } else if (semitoneIterator == 9) {
        noteIterator--;
      }
      semitoneIterator--;
    }
    upperNoteFinder = true;
  } else if (
    frequency < frequencyIterator &&
    frequency >= 63.77 &&
    frequency <= 7449.71
  ) {
    while (frequency < frequencyIterator) {
      iterator--;

      // decrease frequency by 1 semitone
      frequencyIterator = base * Math.pow(2, iterator / 192);

      // semitone loop
      if (semitoneIterator == 0) {
        semitoneIterator = 16;
      }

      // note loop & octave decrease
      if (noteIterator == 0 && semitoneIterator == 9) {
        noteIterator = 11;
        octaveIterator--;
      } else if (semitoneIterator == 9) {
        noteIterator--;
      }

      semitoneIterator--;
    }

    // compare the note frequency with the upper and lower frequencies and change semitone, note & octave if needed
    if (
      frequency - frequencyIterator >=
      base * Math.pow(2, (iterator + 1) / 192) - frequency
    ) {
      if (semitoneIterator == 8 && noteIterator == 11) {
        noteIterator = 0;
        octaveIterator++;
      } else if (semitoneIterator == 8) {
        noteIterator++;
      }
      semitoneIterator++;
    }
  }

  // note finder
  if (noteFinder == 1) {
    let frequency1 = frequencyIterator;
    let frequency2 = base * Math.pow(2, (iterator + 1) / 192);
    if (upperNoteFinder || iterator == 0) {
      iterator += 16;
    }

    if (iterator != 0 && iterator % 16) {
      const remainder1 = iterator % 16;
      frequency1 = base * Math.pow(2, (iterator - remainder1 - 16) / 192);
    }

    if (frequency < frequency1 && upperNoteFinder) {
      frequency1 = base * Math.pow(2, (iterator - 32) / 192);
      iterator -= 16;
    }

    if (iterator + 1 != 0 && (iterator + 1) % 16) {
      const remainder2 = (iterator + 1) % 16;
      frequency2 = base * Math.pow(2, (iterator + 1 - remainder2) / 192);
    }

    return [frequency1, frequency2];
  }

  if (semitoneIterator > 8) {
    semitoneIterator -= 16;
  }

  // semitone gap
  if (semitoneGap == 1) {
    return (
      (octaveIterator * 12 +
        noteIterator -
        (notesNamingSystems[system].octaveIterator * 12 + 9)) *
        16 +
      semitoneIterator
    );
  }

  // if latin note system selected, return note in italic
  if (system == "latin" || system == "latin-old") {
    if (frequency < 63.77 || frequency > 7449.71) {
      return "Erreur";
    } else if (semitoneIterator == 0 || frequency == base) {
      return (
        "<i>" + notes[noteIterator] + "</i>".concat(octaveIterator, " parfait")
      );
    } else if (semitoneIterator > 0) {
      return (
        "<i>" +
        notes[noteIterator] +
        "</i>".concat(octaveIterator, " (+", semitoneIterator, "/16)")
      );
    } else {
      return (
        "<i>" +
        notes[noteIterator] +
        "</i>".concat(octaveIterator, " (", semitoneIterator, "/16)")
      );
    }
  } else {
    if (frequency < 63.77 || frequency > 7449.71) {
      return "Erreur";
    } else if (semitoneIterator == 0 || frequency == base) {
      return notes[noteIterator].concat(octaveIterator, " parfait");
    } else if (semitoneIterator > 0) {
      return notes[noteIterator].concat(
        octaveIterator,
        " (+",
        semitoneIterator,
        "/16)",
      );
    } else {
      return notes[noteIterator].concat(
        octaveIterator,
        " (",
        semitoneIterator,
        "/16)",
      );
    }
  }
}

function getFrequenciesSemitoneGap(thFrequency, meFrequency) {
  if (
    getNoteFromFrequency(thFrequency) === "Erreur" ||
    getNoteFromFrequency(meFrequency) === "Erreur"
  ) {
    return 0;
  }

  return (
    getNoteFromFrequency(meFrequency, getBaseNote(), getNoteSystem(), 0, 1) -
    getNoteFromFrequency(thFrequency, getBaseNote(), getNoteSystem(), 0, 1)
  );
}

function getRelativeMeNote(thFrequency, meFrequency) {
  if (
    getNoteFromFrequency(thFrequency) === "Erreur" ||
    getNoteFromFrequency(meFrequency) === "Erreur"
  ) {
    return "Erreur";
  }

  // get theoretical reference note
  const thNote = getNoteFromFrequency(
    thFrequency,
    getBaseNote(),
    getNoteSystem(),
  );

  const thFrequencyIterator = getFrequenciesSemitoneGap(
    getBaseNote(),
    thFrequency,
  );
  const meFrequencyIterator = getFrequenciesSemitoneGap(
    getBaseNote(),
    meFrequency,
  );
  const iteratorsGap = meFrequencyIterator - thFrequencyIterator;

  if (iteratorsGap == 0 || thNote === "Erreur") {
    return thNote;
  } else if (thNote.split(" ")[1] == "parfait") {
    if (iteratorsGap > 0) {
      return thNote.split(" ")[0].concat(" (+" + iteratorsGap + "/16)");
    } else {
      return thNote.split(" ")[0].concat(" (" + iteratorsGap + "/16)");
    }
  } else {
    const thNotePrecision = +thNote
      .split(" ")[1]
      .split("/")[0]
      .replace("(", "")
      .replace("+", "");
    if (thNotePrecision + iteratorsGap == 0) {
      return thNote.split(" ")[0].concat(" parfait");
    } else if (thNotePrecision + iteratorsGap > 0) {
      return thNote
        .split(" ")[0]
        .concat(" (+" + (thNotePrecision + iteratorsGap) + "/16)");
    } else {
      return thNote
        .split(" ")[0]
        .concat(" (" + (thNotePrecision + iteratorsGap) + "/16)");
    }
  }
}

function setNoteFinderValues() {
  const meNoteFinder = document.getElementById(
    "note-finder-measured-frequency",
  );
  const previousFrequency = document.getElementById(
    "note-finder-previous-frequency",
  );
  const previousNote = document.getElementById("note-finder-previous-note");
  const nextFrequency = document.getElementById("note-finder-next-frequency");
  const nextNote = document.getElementById("note-finder-next-note");
  const closestNote = document.getElementById("note-finder-closest");
  const buttonPrevious = document.getElementById("note-finder-send-previous");
  const buttonNext = document.getElementById("note-finder-send-next");

  // reset view if frequency is out of range
  if (meNoteFinder.value < 67.25 || meNoteFinder.value > 7039.99) {
    closestNote.innerText = "Fréquence non valide";
    previousFrequency.innerText = "Non renseignée";
    previousNote.innerText = "?";
    nextFrequency.innerText = "Non renseignée";
    nextNote.innerText = "?";
    // disable buttons
    buttonPrevious.disabled = true;
    buttonPrevious.setAttribute("style", "cursor: not-allowed !important");
    buttonNext.disabled = true;
    buttonNext.setAttribute("style", "cursor: not-allowed !important");
    return;
  }

  const noteFinderTable = getNoteFromFrequency(
    meNoteFinder.value,
    getBaseNote(),
    getNoteSystem(),
    1,
  );
  const previous = noteFinderTable[0];
  const next = noteFinderTable[1];

  previousFrequency.innerText = Number(previous).toFixed(2) + " Hz";
  nextFrequency.innerText = Number(next).toFixed(2) + " Hz";

  previousNote.innerHTML = getNoteFromFrequency(
    previous,
    getBaseNote(),
    getNoteSystem(),
  );
  nextNote.innerHTML = getNoteFromFrequency(
    next,
    getBaseNote(),
    getNoteSystem(),
  );

  if (
    meNoteFinder.value - Number(previous) <
    Number(next) - meNoteFinder.value
  ) {
    closestNote.innerText = "Note + proche : ◀ précédente";
  } else if (
    meNoteFinder.value - Number(previous) >
    Number(next) - meNoteFinder.value
  ) {
    closestNote.innerText = "Note + proche : suivante ▶";
  } else {
    closestNote.innerText = "Note + proche : aucune";
  }

  // enable buttons
  buttonPrevious.disabled = false;
  buttonPrevious.setAttribute("style", "cursor: pointer !important");
  buttonNext.disabled = false;
  buttonNext.setAttribute("style", "cursor: pointer !important");
}

function setNoteFinderValuesPopup(target) {
  let calculated = "Vide";
  const measured = document.getElementById(
    "note-finder-measured-frequency",
  ).value;
  switch (target) {
    case "previous":
      calculated = document.getElementById(
        "note-finder-previous-frequency",
      ).innerText;
      G_NOTE_FINDER_TARGET = "previous";
      break;
    case "next":
      calculated = document.getElementById(
        "note-finder-next-frequency",
      ).innerText;
      G_NOTE_FINDER_TARGET = "next";
      break;
    default:
      break;
  }
  document.getElementById("calculated-note-finder-select").innerText =
    calculated;
  document.getElementById("measured-note-finder-select").innerText =
    measured + " Hz";
}

function sendNoteFinderValues() {
  const partielsSelect = document.getElementById("note-finder-select").value;
  let calculated = 0;
  const measured = document.getElementById(
    "note-finder-measured-frequency",
  ).value;
  switch (G_NOTE_FINDER_TARGET) {
    case "previous":
      calculated = document
        .getElementById("note-finder-previous-frequency")
        .innerText.slice(0, -3)
        .trim();
      break;
    case "next":
      calculated = document
        .getElementById("note-finder-next-frequency")
        .innerText.slice(0, -3)
        .trim();
    default:
      break;
  }
  // define the theoretical partial
  document.getElementById("th-" + partielsSelect + "-frequency").value =
    calculated;
  // calculate all other theoretical partials
  thPartielsValues(partielsSelect);
  // define the measured partial
  document.getElementById("me-" + partielsSelect + "-frequency").value =
    measured;
  // refresh measured partials
  mePartielsValues();
  hidePopups();
}

function getDynamicFileName(fileExtension) {
  let currentDate = new Date();
  let fileName =
    "Audiobell." +
    getBaseNote() +
    "Hz." +
    currentDate.getFullYear() +
    String(currentDate.getMonth() + 1).padStart(2, "0") +
    String(currentDate.getDate()).padStart(2, "0") +
    "." +
    String(currentDate.getHours()).padStart(2, "0") +
    String(currentDate.getMinutes()).padStart(2, "0") +
    String(currentDate.getSeconds()).padStart(2, "0") +
    String(currentDate.getMilliseconds()).padStart(3, "0") +
    "." +
    fileExtension;
  return fileName;
}

function downloadResultsCsv() {
  // theoretical frequencies
  let thFrequencies = ["Fréquence théorique (Hz)"];
  thFrequencies.push(
    ...[
      ...document.querySelectorAll(
        "#th-partiels>.input-tile>.input-frequency>input",
      ),
    ].map((input) => +input.value),
  );
  // theoretical notes
  let thNotes = ["Note théorique"];
  thNotes.push(
    ...[
      ...document.querySelectorAll(
        "#th-partiels>.input-tile>.input-note>p:nth-child(1)",
      ),
    ].map((p) => p.innerText.replace("Note : ", "")),
  );
  // measured frequencies
  let meFrequencies = ["Fréquence mesurée (Hz)"];
  meFrequencies.push(
    ...[
      ...document.querySelectorAll(
        "#me-partiels>.input-tile>.input-frequency>input",
      ),
    ].map((input) => +input.value),
  );
  // measured notes
  let meNotes = ["Note mesurée"];
  meNotes.push(
    ...[
      ...document.querySelectorAll(
        "#me-partiels>.input-tile>.input-note>p:nth-child(1)",
      ),
    ].map((p) => p.innerText.replace("Note : ", "")),
  );
  // gaps between theoretical & measured values
  let meGaps = ["Écart (1/16 demi-ton)"];
  meGaps.push(
    ...[
      ...document.querySelectorAll(
        "#me-partiels>.input-tile>.input-note>p:nth-child(2)",
      ),
    ].map((p) => p.innerText.replace("Écart : ", "")),
  );

  const csvData = [
    ["", "Bourdon", "Fondamental", "Tierce mineure", "Quinte", "Nominal"],
    thFrequencies,
    thNotes,
    meFrequencies,
    meNotes,
    meGaps,
    [],
    ["Généré avec Audiobell version " + getAudiobellVersionNumber()],
  ];

  let csvContent =
    "data:text/csv;charset=utf-8," +
    csvData.map((data) => data.join(";")).join("\n");
  let csvEncodedUri = encodeURI(csvContent);
  let csvLink = document.createElement("a");
  csvLink.href = csvEncodedUri;
  csvLink.download = getDynamicFileName("csv");
  // download file
  csvLink.click();
}

function downloadResultsImage() {
  // light/dark mode support
  const bgColor = isDarkModeEnabled() ? "#1b1b1b" : "lightsteelblue";
  // replace spaces with non-breaking spaces in titles to prevent rendering issues
  Array.from(document.getElementsByClassName("partiels-title")).forEach(
    (element) => (element.innerHTML = element.innerHTML.replace(" ", "&nbsp;")),
  );
  // remove the number type attribute from all inputs to prevent empty values when rendering in Firefox
  Array.from(document.getElementsByTagName("input")).forEach((element) =>
    element.setAttribute("type", ""),
  );
  html2canvas(document.querySelector("#content"), {
    backgroundColor: bgColor,
    windowWidth: "1168",
    windowHeight: "0",
    removeContainer: "true",
  }).then((canvas) => {
    let imageLink = document.createElement("a");
    imageLink.href = canvas.toDataURL();
    imageLink.download = getDynamicFileName("png");
    imageLink.click();
    // rollback non-breaking spaces to original spaces
    Array.from(document.getElementsByClassName("partiels-title")).forEach(
      (element) =>
        (element.innerHTML = element.innerHTML.replace("&nbsp;", " ")),
    );
    // reset all input type attributes back to number
    Array.from(document.getElementsByTagName("input")).forEach((element) =>
      element.setAttribute("type", "number"),
    );
  });
}

function downloadResults() {
  if (isDataInvalid()) {
    hidePopups();
    setTimeout(function () {
      showPopup("data-error-popup");
    }, 0);
    return;
  }
  if (getDownloadResultsFormat() === "image") {
    downloadResultsImage();
  } else {
    downloadResultsCsv();
  }
  hidePopups();
}

function getDownloadResultsFormat() {
  if (isDataInvalid()) {
    hidePopups();
    showPopup("data-error-popup");
    return;
  }
  const downloadResultsFormat = document
    .getElementById("dl-results-format")
    .value.valueOf();
  let downloadResultsDescription = document.getElementById(
    "dl-results-description",
  );
  switch (downloadResultsFormat) {
    case "image":
      downloadResultsDescription.innerText =
        "Ce format sauvegarde les résultats comme affichés sur la page.";
      break;
    default:
      downloadResultsDescription.innerText =
        "Ce format sauvegarde les résultats dans un fichier exploitable par un logiciel tableur.";
      break;
  }
  return downloadResultsFormat;
}

function getDownloadChartRatio() {
  const downloadChartRatio = document
    .getElementById("dl-partiels-chart-ratio")
    .value.valueOf();
  let ratioPreview = document.getElementById("ratio-preview");
  switch (downloadChartRatio) {
    case "4.3":
      ratioPreview.style.width = "8rem";
      ratioPreview.style.height = "6rem";
      break;
    case "3.4":
      ratioPreview.style.width = "6rem";
      ratioPreview.style.height = "8rem";
      break;
    case "16.9":
      ratioPreview.style.width = "10.67rem";
      ratioPreview.style.height = "6rem";
      break;
    case "9.16":
      ratioPreview.style.width = "6rem";
      ratioPreview.style.height = "10.67rem";
      break;
    default:
      ratioPreview.style.width = "6rem";
      ratioPreview.style.height = "6rem";
      break;
  }
  return downloadChartRatio;
}

function downloadChart() {
  document.getElementById("hidden-partiels-chart").style.display = "block";
  const ratioValues = {
    1.1: {
      w: 1024,
      h: 1024,
    },
    4.3: {
      w: 1280,
      h: 960,
    },
    3.4: {
      w: 960,
      h: 1280,
    },
    16.9: {
      w: 1600,
      h: 900,
    },
    9.16: {
      w: 900,
      h: 1600,
    },
  };
  let selectedRatio = getDownloadChartRatio();
  let chartCanvas = document.createElement("canvas");
  chartCanvas.width = ratioValues[selectedRatio].w;
  chartCanvas.height = ratioValues[selectedRatio].h;
  document.getElementById("hidden-partiels-chart").style.width =
    ratioValues[selectedRatio].w + "px";
  document.getElementById("hidden-partiels-chart").style.height =
    ratioValues[selectedRatio].h + "px";
  chartCanvas.style.display = "none";
  let chartContext = chartCanvas.getContext("2d");
  drawChart("hidden-partiels-chart").then((chart) => {
    let chartSvg = document
      .getElementById("hidden-partiels-chart")
      .getElementsByTagName("svg")[0];

    if (chartSvg) {
      let chartXml = new XMLSerializer().serializeToString(chartSvg);
      let DOMURL = self.URL || self.webkitURL || self;
      let chartBlob = new Blob([chartXml], {
        type: "image/svg+xml;charset=utf-8",
      });
      let chartUrl = DOMURL.createObjectURL(chartBlob);
      let chartImage = new Image();
      chartImage.onload = function () {
        chartContext.drawImage(chartImage, 0, 0);
        DOMURL.revokeObjectURL(chartUrl);
        let chartDataUrl = chartCanvas.toDataURL("image/png");
        let chartLink = document.createElement("a");
        chartLink.href = chartDataUrl;
        chartLink.download = getDynamicFileName("png");
        chartLink.click();
        document.getElementById("hidden-partiels-chart").style.display = "none";
      };
      chartImage.src = chartUrl;
    } else {
      console.error("Chart not found");
    }
  });
}

function disableBackground() {
  // remove background opacity
  document.getElementsByTagName("header")[0].style.filter = "opacity(0)";
  document.getElementById("content").style.filter = "opacity(0)";
  document.getElementsByTagName("footer")[0].style.filter = "opacity(0)";
  // disable any interaction with the background
  document.getElementsByTagName("header")[0].style.pointerEvents = "none";
  document.getElementsByTagName("header")[0].style.userSelect = "none";
  document.getElementById("content").style.pointerEvents = "none";
  document.getElementById("content").style.userSelect = "none";
  document.getElementsByTagName("footer")[0].style.pointerEvents = "none";
  document.getElementsByTagName("footer")[0].style.userSelect = "none";
  // disable the page overflow
  document.body.style.overflow = "hidden";
}

function enableBackground() {
  // remove all background filters
  document.getElementsByTagName("header")[0].style.filter = "none";
  document.getElementById("content").style.filter = "none";
  document.getElementsByTagName("footer")[0].style.filter = "none";
  // enable interactions with the background
  document.getElementsByTagName("header")[0].style.pointerEvents = "auto";
  document.getElementsByTagName("header")[0].style.userSelect = "auto";
  document.getElementById("content").style.pointerEvents = "auto";
  document.getElementById("content").style.userSelect = "auto";
  document.getElementsByTagName("footer")[0].style.pointerEvents = "auto";
  document.getElementsByTagName("footer")[0].style.userSelect = "auto";
  // enable the page overflow
  document.body.style.overflow = "visible";
}

function showPartielsChart() {
  hidePopups();
  if (isDataInvalid()) {
    showPopup("data-error-popup");
  } else {
    disableBackground();
    // draw the chart
    drawChart("partiels-chart");
    // show the chart
    document.getElementById("partiels-chart").style.opacity = "100%";
    document.getElementById("partiels-chart").style.zIndex = "1";
    document.getElementById("partiels-chart-events").style.opacity = "100%";
    document.getElementById("partiels-chart-events").style.zIndex = "1";
    Array.from(document.getElementsByClassName("partiels-chart-event")).forEach(
      (element) => (element.style.opacity = "100%"),
    );
    Array.from(document.getElementsByClassName("partiels-chart-event")).forEach(
      (element) => (element.style.zIndex = "1"),
    );
  }
}

function closePartielsChart() {
  enableBackground();
  // hide the chart
  document.getElementById("partiels-chart").style.opacity = "0%";
  document.getElementById("partiels-chart").style.zIndex = "-1";
  document.getElementById("partiels-chart-events").style.opacity = "0%";
  document.getElementById("partiels-chart-events").style.zIndex = "-1";
}

function isDataInvalid() {
  // all notes
  const notes = [
    ...document.querySelectorAll(".input-note>p:nth-child(1)"),
  ].map((p) => p.innerText.replace("Note : ", ""));
  return notes.some((note) => note === "Erreur" || note === "Note :");
}

function isDarkModeEnabled() {
  return (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

// resize chart only when showed & add cool down to limit CPU load
let resizeTimer;
window.addEventListener("resize", function () {
  this.clearTimeout(resizeTimer);
  resizeTimer = this.setTimeout(function () {
    if (document.getElementById("partiels-chart").style.zIndex == "1") {
      drawChart("partiels-chart");
    }
  }, 500);
});

function getAudiobellVersionNumber() {
  const audiobellVersion = "1.1.0";
  return audiobellVersion;
}

function footerUpdate() {
  document.getElementById("footer-title").innerHTML +=
    "&nbsp;" + getAudiobellVersionNumber();
}

function showPopup(popupId) {
  closePartielsChart();
  disableBackground();
  // show the popup
  document.getElementById(popupId).style.display = "flex";
}

function hidePopups() {
  enableBackground();
  // hide the popups
  Array.from(document.getElementsByClassName("popup")).forEach(
    (element) => (element.style.display = "none"),
  );
}

function toggleMenu() {
  document
    .getElementsByClassName("toggle-menu")[0]
    .classList.toggle("toggle-menu-hidden");
  // change button content
  let toggleButton = document.getElementById("toggle-menu-button");
  if (toggleButton.innerText == "Réduire ▲") {
    toggleButton.innerText = "Paramètres ▼";
    window.scrollTo(0, 0);
  } else {
    toggleButton.innerText = "Réduire ▲";
  }
}

function getBaseNote() {
  let baseNote = document.getElementById("base-note-select").value;
  return (baseNote * 100) / 100;
}

function getNoteSystem() {
  let noteSystem = document.getElementById("note-system-select").value;
  return noteSystem.valueOf();
}

function getMePartielsNotes() {
  let mePartielsNotes = document.getElementById(
    "me-partiels-notes-select",
  ).value;
  return mePartielsNotes.valueOf();
}

module.exports = { getNoteFromFrequency };
