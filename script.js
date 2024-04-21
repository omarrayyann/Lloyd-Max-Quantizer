var freq_list = [];  
var x = [];
var y = [];
var bits_per_pixel = 3;
var global_error = 0.0;
var global_image = null;  
var original_image = null;  
var global_width = 0;
var global_height = 0;

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
            global_height = img.height;
            global_width = img.width;
            ctx.drawImage(img, 0, 0);
            original_image = ctx.getImageData(0, 0, img.width, img.height);
            global_image = Array.from(original_image.data).map(element => parseFloat(element));
            freq_list = get_frequency_table()
            console.log(freq_list)
            initializeXY();
            update_original_histogram();
           
        };
        img.src = e.target.result;

        originalImage.src = e.target.result;
        originalImage.style.display = 'block';
    };

    if (file) {
        reader.readAsDataURL(file);
    }
});

function update_error() {

    var error = 0.0;
    var count = 0;
    
    for (let i = 0; i < global_image.length; i += 4) { 
        error += Math.pow(original_image.data[i + 0] - global_image[i + 0], 2) 
        error += Math.pow(original_image.data[i + 1] - global_image[i + 1], 2)
        error += Math.pow(original_image.data[i + 2] - global_image[i + 2], 2)
        count += 3
    }
    
    global_error = error/count;  
}


function get_frequency_table() {

    const freq = new Array(256).fill(0);
    for (let i = 0; i < global_image.length; i += 4) {
        freq[Math.round(global_image[i])]++;  
        freq[Math.round(global_image[i + 1])]++;
        freq[Math.round(global_image[i + 2])]++;
    }
    return freq;
}

function averageBetween(minVal, maxVal) {
    let sum = 0;
    let count = 0;
    minVal = Math.ceil(minVal)
    maxVal = Math.ceil(maxVal)
    for (var i = minVal; i < maxVal; i++) {
        sum = sum + freq_list[i] * i;
        count = count + freq_list[i];
    }
    if (count == 0){
        return 0;
    }
    return sum / count;
}


function initializeXY() {
    const numLevels = 2 ** bits_per_pixel;
    for (let i = 1; i < numLevels; i++) {
        x.push(i * (256 / numLevels));
    }
    // y.push(0)
    // for (let i = 0; i < numLevels-1; i++) {
    //     y.push(x[i]);
    // }
    // update();
    y = new Array(numLevels).fill(0);   
    update();
    // iterateY();
}


function iterateX() {
    for (let i = 0; i < x.length; i++) {
        x[i] = 0.5 * (y[i] + y[i+1]);
    }
    console.log("Iterate X completed: ", x);
    update();
}

function iterateY() {
    y[0] = averageBetween(0,x[0])
    y[y.length-1] = averageBetween(x[x.length-1],256)
    for (let i = 1; i < y.length-1; i++) {
        y[i] = averageBetween(x[i-1],x[i]);
    }
    console.log("Iterate Y completed: ", y);
    update();
}

function iterateXY() {
    console.log("Starting both X and Y iterations");
    iterateX();
    iterateY();
}


function quantize() {
    for (let i = 0; i < global_image.length; i += 4) {  
        global_image[i + 0] = quantizePixel(original_image.data[i + 0]);
        global_image[i + 1] = quantizePixel(original_image.data[i + 1]);
        global_image[i + 2] = quantizePixel(original_image.data[i + 2]);
    }
}

function quantizePixel(color){
    for (let j = 0; j < x.length ; j++) {
        if (color < x[j]) {
            return y[j];
        } 
        if (color == x[j]){
            return y[j+1]
        }
    }
    return y[y.length-1];
}





function update() {
    quantize(); 
    update_error();
    document.getElementById("error").innerText = "Error: " + global_error;
    var canvas = document.getElementById('modifiedImage');
    var ctx = canvas.getContext('2d');
    var image = new ImageData(new Uint8ClampedArray(global_image.map(element => Math.round(element))),global_width,global_height);
    ctx.putImageData(image, 0, 0);
    update_modified_histogram();
}


function update_original_histogram() {
  
        var indices = [...Array(256).keys()]; // Indices from 0 to 255, representing color intensities
        var trace1 = {
        x: indices,
        y:   freq_list,
        type: "bar",
        marker: {
            color: "rgba(12, 45, 87,1.0)", 
             line: {
              color:  "rgba(255, 100, 102, 1)", 
              width: 1
            }
          },
        opacity: 1.0
        };
        var data = [trace1];
        var layout = {
        bargap: 0.1, 
        barmode: 'group', 
        xaxis: {title: "Intensity Value"},
        yaxis: {title: "Frequency"},
        legend: {x: 0.1, y: 0.9},
        };
        Plotly.newPlot('original_histogram', data, layout);
    

}


function update_modified_histogram() {

    var indices = [...Array(256).keys()]; // Indices from 0 to 255, representing color intensities
    var frequency = get_frequency_table(); 
    var from = 0;
    var j = 0;
    var to = x[j];
    var count = 0
    var spread_freq = new Array(256).fill(0);   

    for (var m = 0; m<frequency.length+1; m++){
        if (to<=m || m>=255){
            if(m>=255){
                to = 256
            }
            for(var n = Math.ceil(from); n<Math.ceil(to); n++){
                spread_freq[n] = count;
            }
            count = 0;
            from = to;
            j++;
            to = x[j];
        }

        count = count + frequency[m];
    }


    var trace1 = {
    x: indices,
    y:  spread_freq,
    type: "bar",
    marker: {
        color: "rgba(12, 45, 87,1.0)", 
         line: {
          color:  "rgba(255, 100, 102, 1)", 
          width: 1
        }
      },
    opacity: 1.0
    };
    var data = [trace1];
    var layout = {
    bargap: 0.1, 
    barmode: 'group', 
    xaxis: {title: "Intensity Value"},
    yaxis: {title: "Frequency"},
    legend: {x: 0.1, y: 0.9},
    };
    Plotly.newPlot('modified_histogram', data, layout);
    
}