var global_image_float = null;  // This will store the pixel data globally
var freq_list = {};  
var x_global = {};
var y_global = {};
var bits_per_pixel = 7;
var global_error = 0.0;
var per_channel = false
var global_original = null;  // This will store the pixel data globally
var global_image_float_float = null;  // This will store the pixel data globally
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
            freq_list = {
                'all':[],
                "red":[],
                "green":[],
                "blue":[],
            };  
            x_global = {
                'all':[],
                "red":[],
                "green":[],
                "blue":[],
            };
            y_global = {
                'all':[],
                "red":[],
                "green":[],
                "blue":[],
            };
            modifiedCanvas.width = img.width;
            modifiedCanvas.height = img.height;
            global_height = img.height;
            global_width = img.width;
            ctx.drawImage(img, 0, 0);
            global_image = ctx.getImageData(0, 0, img.width, img.height);
            global_original = ctx.getImageData(0, 0, img.width, img.height);
            float_copy();
            update_frequency_table(); 
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

function float_copy(){
    global_image_float = Array.from(global_image.data).map(element => parseFloat(element));
}

function update_error() {

    var error = 0.0;
    var count = 0;
    
    for (let i = 0; i < global_image_float.length; i += 4) { 
        error += Math.pow(global_image_float[i] - global_original.data[i], 2) 
        error += Math.pow(global_image_float[i + 1] - global_original.data[i + 1], 2)
        error += Math.pow(global_image_float[i + 2] - global_original.data[i + 2], 2)
        count += 3
    }
    
    global_error = error/count;  
}

function update_original_histogram(freq) {
    if(per_channel==true){
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
    } else{
        var indices = [...Array(256).keys()]; // Indices from 0 to 255, representing color intensities
        var trace1 = {
        x: indices,
        y:  freq["all"],
        type: "bar",
        marker: {
            color: 'rgba(255, 255, 255, 0.7)', // Red with some transparency
            line: {
            color: 'black',
            width: 1
            }
        },
        opacity: 0.7
        };
        var data = [trace1];
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
}


function update_modified_histogram() {

    

    if(per_channel==true){
        var indices = [...Array(256).keys()]; // Indices from 0 to 255, representing color intensities
        var trace1 = {
        x: indices,
        y:  freq_list["red"],
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
        y:  freq_list["green"],
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
        y:  freq_list["red"],
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
        Plotly.newPlot('modified_histogram', data, layout);
    } else{

        
        // var indices = [...Array(256).keys()]
        // var j = 0;
        // var from = 0;
        // var to = x[j]
        // var spread_freq = new Array(numLevels).fill(0);   

        // for(var i = 0; i<freq_list["all"].length; i++){
        //     if (i>=to){
        //         j++;
        //         from = to;
        //         to = x[j] 
        //     }
        //     if (freq_list["all"]){
        //         for(var n = from; n<to; n++){
        //             spread_freq[n] += freq_list[]
        //         }
        //      }
        // }

        var trace1 = {
        x: indices,
        y:  freq_list["all"],
        type: "bar",
        marker: {
            color: 'rgba(255, 255, 255, 0.7)', // Red with some transparency
            line: {
            color: 'black',
            width: 1
            }
        },
        opacity: 0.7
        };
        var data = [trace1];
        var layout = {
        bargap: 0.1, 
        barmode: 'group', // Changed to 'group' to separate the bars for clarity
        //   title: "Color Frequency Distribution Per Channel",
        xaxis: {title: "Intensity Value"},
        yaxis: {title: "Frequency"},
        legend: {x: 0.1, y: 0.9},
        };
        Plotly.newPlot('modified_histogram', data, layout);
    }
}

function update_frequency_table() {
    const freq_r = new Array(256).fill(0);
    const freq_g = new Array(256).fill(0);
    const freq_b = new Array(256).fill(0);
    const freq_all = new Array(256).fill(0);
    for (let i = 0; i < global_image_float.length; i += 4) {
        freq_r[global_image_float[i]]++;     // R
        freq_g[global_image_float[i + 1]]++; // G
        freq_b[global_image_float[i + 2]]++; // B
        
        freq_all[global_image_float[i]]++;     // R
        freq_all[global_image_float[i + 1]]++; // G
        freq_all[global_image_float[i + 2]]++; // B
    }
    freq_list = {
        "red":freq_r,
        "green":freq_g,
        "blue":freq_b,
        "all":freq_all,
    };
}

function initializeXY() {
    const numLevels = 2 ** bits_per_pixel;
    for (let i = 1; i < numLevels; i++) {
        x_global["all"].push(i * (256 / numLevels));
    }
    y_global["all"] = new Array(numLevels).fill(0);   
    y_global["all"][0] = (0+x_global["all"][0])/2
    for (let i = 1; i < numLevels-1; i++) {
        y_global["all"][i] = (x_global["all"][i-1]+x_global["all"][i])/2
    }
    y_global["all"][numLevels-1] = (255+x_global["all"][x_global["all"].length-1])/2;
    update();
}

function update() {
    quantize(); 
    // update_frequency_table()
    update_error();
    document.getElementById("error").innerText = "Error: " + global_error;
    var canvas = document.getElementById('modifiedImage');
    var ctx = canvas.getContext('2d');
    var image = new ImageData(new Uint8ClampedArray(global_image_float.map(element => Math.round(element))),global_width,global_height);
    ctx.putImageData(image, 0, 0);
}

function quantize() {
    for (let i = 0; i < global_image_float.length; i += 4) {  // Iterate over each pixel
        // Apply quantization to each color channel independently
        global_image_float[i] = quantizePixel(global_image_float[i], x_global, y_global); // Red channel
        global_image_float[i + 1] = quantizePixel(global_image_float[i + 1], x_global, y_global); // Green channel
        global_image_float[i + 2] = quantizePixel(global_image_float[i + 2], x_global, y_global); // Blue channel
    }
}

function quantizePixel(color, x, y) {
    for (let j = 0; j < x["all"].length ; j++) {
        if (color < x["all"][j]) {
            return y["all"][j];  // Return the new color value from y array
        }
    }
    return y["all"][y["all"].length-1];
}

function averageBetween(minVal, maxVal, freq_list) {
    let sum = 0;
    let count = 0;
    minVal = Math.floor(minVal)
    for (let i = minVal; i < maxVal; i++) {
        sum += freq_list[i] * i;
        count += freq_list[i];
    }
    // if (count == 0){
    //     if(bits_per_pixel>=8){
    //         return minVal;
    //     } else {
    //         return 0;
    //     }
    // }
    return sum / count;
}

function sumOfDifferences(arr1, arr2) {

    // Calculate the sum of differences
    return arr1.reduce((acc, currentValue, index) => {
        return acc + Math.abs(currentValue - arr2[index]);
    }, 0);
}


function iterateX() {
    for (let i = 0; i < x_global["all"].length; i++) {
        x_global["all"][i] = ((y_global["all"][i] + y_global["all"][i+1]) / 2);
    }
    console.log("Iterate X completed: ", x_global["all"]);
    update();
}

function iterateY() {

    for (let i = 0; i < y_global["all"].length; i++) {
        if(i==0){
            y_global["all"][i] = (averageBetween(0, x_global["all"][i], freq_list["all"]));
            continue;
        }
        if(i+1==y_global["all"].length){
            y_global["all"][i] = (averageBetween(x_global["all"][i-1], 256, freq_list["all"]));
            continue;
        }
        y_global["all"][i] = averageBetween(x_global["all"][i-1],x_global["all"][i], freq_list["all"]);
    }

    console.log("Iterate Y completed: ", y_global["all"]);
    update()
}

function iterateXY() {
    console.log("Starting both X and Y iterations");
    iterateX();
    iterateY();
}
