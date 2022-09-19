const sPath = "./static/data/samples.json";

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json(sPath).then((data) => {
    var sampleNames = data.names;

    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    var firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

// Initialize the dashboard
init();

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildMetadata(newSample);
  buildCharts(newSample);
  
}

// Demographics Panel 
function buildMetadata(sample) {
  d3.json(sPath).then((data) => {
    var metadata = data.metadata;
    // Filter the data for the object with the desired sample number
    var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    var result = resultArray[0];
    // Use d3 to select the panel with id of `#sample-metadata`
    var PANEL = d3.select("#sample-metadata");

    // Clear any existing metadata
    PANEL.html("");

    // Use `Object.entries` to add each key and value pair to the panel
    Object.entries(result).forEach(([key, value]) => {
      PANEL.append("h6").text(`${key.toUpperCase()}: ${value}`);
    });

  });
}

function buildCharts(sample) {
  // Load and retrieve the samples.json file 
  d3.json(sPath).then((data) => {
 
    let samples = data.samples;

    // Filter the samples for the object with the desired sample number.
    let resultsArray = samples.filter(sampleObj => sampleObj.id == sample);

    let meta = data.metadata;

    let metaArray = meta.filter(metaObj => metaObj.id == sample);

    // First results of the arrays
    let result = resultsArray[0];
    let metadataResult = metaArray[0];

    // Washing frequency.
    let wfrequency = metadataResult.wfreq;
    
    let otu_ids = result.otu_ids;
    let otu_labels = result.otu_labels;
    let sample_values = result.sample_values;

    // Yticks for the bar chart.

    var yticks = otu_ids.slice(0,10).map(otuID => `OTU ${otuID}` ).reverse();

    // Trace for the bar graph 
    var barData = [{
      y: yticks,
      x: sample_values.slice(0,10).reverse(),
      text: otu_labels.slice(0,10).reverse(),
      type: "bar",
      orientation: "h" 
    }];

    // Layout for the bar chart. 
    var barLayout = {
      title: `Top Ten Bacteria Cultures found in Sample ${sample}`,
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)'
    };
   
    Plotly.newPlot("bar", barData, barLayout);

    // Trace for the bubble chart
    var bubbleData = [{
      x: otu_ids,
      y: sample_values,
      text: otu_labels,
      mode: 'markers',
      markers: {
        size: sample_values,
        color: otu_ids,
        colorscale: 'Jet'
        }
      }];

    var bubbleLayout = {
      title: "Bacteria Cultures per Sample",
      showlegend: false,
      xaxis: {title: 'OTU ID'},
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)'
    };

    Plotly.newPlot("bubble", bubbleData, bubbleLayout);
  
    // Trace for the gauge chart.
    var gaugeData = [{
      value: wfrequency,
      type: "indicator",
      mode: "gauge+number",
      title: { text:"Belly Button Wash Frequency", font: {size: 24}},
      gauge: {
        axis: { range: [null, 10] },
        bar: {color: "black"},
        borderwidth: 2,
        steps: [
          { range: [0, 2], color: "red" },
          { range: [2, 4], color: "orange" },
          { range: [4, 6], color: "yellow" },
          { range: [6, 8], color: "lightgreen" },
          { range: [8, 10], color: "green" }
        ]}
  }];
 
    var gaugeLayout = { 
      width: 600,
      height: 450,
      margin: { t: 25, l:25, r:25 },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)'
    };

    Plotly.newPlot("gauge", gaugeData, gaugeLayout);
  
  });
}
