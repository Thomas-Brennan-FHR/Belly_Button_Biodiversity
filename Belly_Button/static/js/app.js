function buildMetadata(sample) {

  console.log(sample);

  metadata=d3.select("#sample-metadata");

  metadata.html("");

  var url = `/metadata/${sample}`;
  
  d3.json(url).then(function(response) {

    Object.entries(response).forEach(function ([key, value]) { 
        var row = metadata.append("p");
        row.text(`${key}: ${value}`);
    })



//gauge
    var level = (response.WFREQ);

    // Trig to calc meter point
    var degrees = 180 - level*20,
        radius = .5;
    var radians = degrees * Math.PI / 180;
    var x = radius * Math.cos(radians);
    var y = radius * Math.sin(radians);

    // Path: may have to change to create a better triangle
    var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
        pathX = String(x),
        space = ' ',
        pathY = String(y),
        pathEnd = ' Z';
    var path = mainPath.concat(pathX,space,pathY,pathEnd);

    var data = [{ type: 'scatter',
      x: [0], y:[0],
        marker: {size: 28, color:'850000'},
        showlegend: false,
        name: 'times',
        text: level,
        hoverinfo: 'text+name'},
      { values: [10,10,10,10,10,10,10,10,10,90],
      rotation: 90,
      text: ['8-9','7-8','6-7','5-6','4-5','3-4','2-3','1-2','0-1',""],
      textinfo: 'text',
      textposition:'inside',
      marker: {colors:[1,2,3,4,5,6,7,8,9,'rgba(255, 255, 255, 0)']},
      hoverinfo: 'skip',
      hole: .5,
      type: 'pie',
      showlegend: false
    }];

    var layout = {
      shapes:[{
          type: 'path',
          path: path,
          fillcolor: '850000',
          line: {
            color: '850000'
          }
        }],
      title: "Belly Button Washing Frequency",
      height: 500,
      width: 500,
      xaxis: {zeroline:false, showticklabels:false,
                showgrid: false, range: [-1, 1]},
      yaxis: {zeroline:false, showticklabels:false,
                showgrid: false, range: [-1, 1]}
    };

    Plotly.newPlot('gauge', data, layout);







});


}

function buildCharts(sample) {

    var url = `/samples/${sample}`;
  
    d3.json(url).then(function(response) {
      
      console.log(response);

      var data = [{
                      values: response.sample_values.slice(0, 10),
                      labels: response.otu_ids.slice(0, 10),
                      hovertext: response.otu_labels.slice(0, 10),
                      hoverinfo: 'hovertext',
                      type: 'pie'}];
    
      Plotly.newPlot("pie", data);


      var trace1 = {
        x: response.otu_ids,
        y: response.sample_values,
        text: response.otu_labels,
        mode: 'markers',
        
        marker: {
          colorscale: 'Jet',
          sizemode: 'area',
          sizeref: .1,
          color: response.otu_ids,
          size: response.sample_values
        }
      };
      
      var data = [trace1];
      
      var layout = {
        xaxis: {title: "OTU ID"}
      };
      
      Plotly.newPlot('bubble', data, layout);


    });


}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();
