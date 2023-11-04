"use strict";

// load Google Visualization API
google.charts.load("current", { packages: ["line"] });

let chart;

function drawChart(chartElement) {
  return new Promise((resolve, reject) => {
    // gaps between theoretical & measured values
    let meGaps = [
      ...document.querySelectorAll(
        "#me-partiels>.input-tile>.input-note>p:nth-child(2)"
      ),
    ];
    meGaps = meGaps.map(
      (p) =>
        +p.innerText.replace(/Écart : |[+]|\/16/g, "").replace("aucun", "0")
    );

    // chart data
    let data = new google.visualization.DataTable();

    data.addColumn("string", "Partiels");
    data.addColumn("number", "Écart maximum");
    data.addColumn("number", "Écart mesuré");
    data.addColumn("number", "Écart minimum");

    data.addRows([
      ["Bourdon", 3, meGaps[0], -10],
      ["Fondamental", 6, meGaps[1], -6],
      ["Tierce mineure", 4, meGaps[2], -4],
      ["Quinte", 8, meGaps[3], -4],
      ["Nominal", 4, meGaps[4], -6],
    ]);

    let options = {
      chart: {
        title: "Écarts des partiels mesurés (1/16 de demi-ton)",
        subtitle: "avec application de la norme de Limbourg",
      },
      axes: {
        x: {
          0: { side: "top" },
        },
      },
      series: {
        0: { color: "#db4437" },
        1: { color: "#4285f4" },
        2: { color: "#f4b400" },
      },
    };

    chart = new google.charts.Line(document.getElementById(chartElement));

    google.visualization.events.addListener(chart, "ready", () => {
      resolve(chart);
    });

    chart.draw(data, google.charts.Line.convertOptions(options));
  });
}
