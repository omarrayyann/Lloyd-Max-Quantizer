let globalImageData = null;  // This will store the pixel data globally
let freqTable = [];          // Frequency table for color values
let x = [];                  // Thresholds
let y = [];                  // Output levels
let bitsPerPixel = 5;

document.getElementById('imageInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const originalImage = document.getElementById('originalImage');
        const modifiedCanvas = document.getElementById('modifiedImage');
        const ctx = modifiedCanvas.getContext('2d');
        const img = new Image();

        img.onload = function() {
            modifiedCanvas.width = img.width;
            modifiedCanvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            globalImageData = ctx.getImageData(0, 0, img.width, img.height);  // Retrieve and store pixel data
            freq_list = createFrequencyTable(globalImageData); 
            update_original_histogram(freq_list)
            initializeXY();  // Initialize x and y values for quantization
        };
        img.src = e.target.result;

        originalImage.src = e.target.result;
        originalImage.style.display = 'block';
    };

    if (file) {
        reader.readAsDataURL(file);
    }
});


function update_original_histogram(freq) {
    var indices = [...Array(256).keys()]; // Indices from 0 to 255, representing color intensities
    var trace1 = {
      x: indices,
      y:  freq["red"],
      type: "bar",
      name: 'Red Channel',
      marker: {
        color: 'rgba(255, 0, 0, 0.7)', // Red with some transparency
        line: {
          color: 'darkred',
          width: 1
        }
      },
      opacity: 0.7
    };

    var trace2 = {
      x: indices,
      y:  freq["green"],
      type: "bar",
      name: 'Green Channel',
      marker: {
        color: 'rgba(0, 255, 0, 0.7)', // Green with some transparency
        line: {
          color: 'darkgreen',
          width: 1
        }
      },
      opacity: 0.7
    };

    var trace3 = {
      x: indices,
      y:  freq["red"],
      type: "bar",
      name: 'Blue Channel',
      marker: {
        color: 'rgba(0, 0, 255, 0.7)', // Blue with some transparency
        line: {
          color: 'darkblue',
          width: 1
        }
      },
      opacity: 0.7
    };

    var data = [trace1, trace2, trace3];
    var layout = {
      bargap: 0.1, 
      barmode: 'group', // Changed to 'group' to separate the bars for clarity
    //   title: "Color Frequency Distribution Per Channel",
      xaxis: {title: "Intensity Value"},
      yaxis: {title: "Frequency"},
      legend: {x: 0.1, y: 0.9},
    };
    Plotly.newPlot('original_histogram', data, layout);
}


function createFrequencyTable(imageData) {
    const freq_r = new Array(256).fill(0);
    const freq_g = new Array(256).fill(0);
    const freq_b = new Array(256).fill(0);
    const freq_all = new Array(256).fill(0);
    for (let i = 0; i < imageData.data.length; i += 4) {
        freq_r[imageData.data[i]]++;     // R
        freq_g[imageData.data[i + 1]]++; // G
        freq_b[imageData.data[i + 2]]++; // B
        
        freq_all[imageData.data[i]]++;     // R
        freq_all[imageData.data[i + 1]]++; // G
        freq_all[imageData.data[i + 2]]++; // B
    }
    return {
        "red":freq_r,
        "green":freq_g,
        "blue":freq_b,
        "all":freq_all,
    };
}

function initializeXY() {
    const numLevels = 2 ** bitsPerPixel;
    for (let i = 1; i < numLevels; i++) {
        x.push(i * (256 / numLevels));
    }
    y = new Array(numLevels).fill(0);


}

function updateCanvas() {
    const canvas = document.getElementById('modifiedImage');
    const ctx = canvas.getContext('2d');
    if (globalImageData) {
        const quantizedData = quantize(globalImageData);  // Apply quantization
        ctx.putImageData(quantizedData, 0, 0);  // Redraw the modified image
    }
}

function quantize(imageData) {
    let data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {  // Iterate over each pixel
        // Apply quantization to each color channel independently
        data[i] = quantizePixel(data[i], x, y);     // Red channel
        data[i + 1] = quantizePixel(data[i + 1], x, y); // Green channel
        data[i + 2] = quantizePixel(data[i + 2], x, y); // Blue channel
        // Alpha channel data[i + 3] is usually left as is unless specific processing is required
    }
    return imageData;
}

function quantizePixel(color, x, y) {
    for (let j = 0; j < x.length ; j++) {
        if (color <= x[j]) {
            return y[j];  // Return the new color value from y array
        }
    }
    return y[y.length-1];
}


function averageBetween(minVal, maxVal, freqTable) {
    let sum = 0;
    let count = 0;
    for (let i = Math.floor(minVal); i <= Math.ceil(maxVal); i++) {
        sum += freqTable[i] * i;
        count += freqTable[i];
    }
    return count > 0 ? (sum / count) : 0; // Avoid division by zero
}

function iterateX() {
    for (let i = 0; i < x.length; i++) {
        x[i] = ((y[i] + y[i+1]) / 2);
    }
    console.log("Iterate X completed: ", x);
    updateCanvas(); // Assuming you have a function to update the canvas
}

function iterateY() {
    for (let i = 0; i < y.length; i++) {
        if(i==0){
            console.log("more than or equal to " + 0 + " less than " + x[i]);
            y[i] = averageBetween(0, x[i], freqTable);
            continue;
        }
        if(i+1==y.length){
            console.log("more than or equal to " + x[i-1] + " less than " + 999);
            y[i] = averageBetween(x[i-1], 255, freqTable);
            continue;
        }
        console.log("more than or equal to " + x[i-1] + " less than " + x[i]);
        y[i] = averageBetween(x[i-1],x[i], freqTable);
    }
    console.log("Iterate Y completed: ", y);
    updateCanvas(); // Update the canvas to reflect new Y values
}

function iterateXY() {
    console.log("Starting both X and Y iterations");
    iterateY();
    iterateX();
    updateCanvas(); // Assuming you have a function to update the canvas
}
