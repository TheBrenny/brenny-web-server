// listen to events that are occuring on the page and collate them into some sort of minimal javascript.
// keep only a certain amount of events (ie 100 events total)


// ===== Config
const submitURL = "";
const dataPointCount = 200;

// ===== Global Vars (scoped to script)
const mousePosition = {
    x: 0,
    y: 0
};
const dataPoints = {
    mouse: [],
    keys: {}
};

function mouseMoveHandler(e) {
    mousePosition.x = e.clientX;
    mousePosition.y = e.clientY;
}

function captureData() {
    dataPoints.mouse.push(Object.assign({}, mousePosition));
    dataPoints.mouse = dataPoints.mouse.splice(-dataPointCount);

    console.log(dataPoints.mouse[0].x + "," + dataPoints.mouse[0].y + " | " + dataPoints.mouse[dataPoints.mouse.length - 1].x + "," + dataPoints.mouse[dataPoints.mouse.length - 1].y);
}

function submitData() {
    // this will be used to send the captured data to the server for processing and determination
}

setInterval(captureData, 50);
document.onmousemove = mouseMoveHandler;