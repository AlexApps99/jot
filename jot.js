"use strict";

const canvas = document.getElementById("canvas");
const cp = document.getElementById("cp");
const dot = document.getElementById("dot");
const ctx = canvas.getContext("2d", {
  alpha: false
});
ctx.strokeStyle = "white";
ctx.lineWidth = 4;
const ocanvas = document.createElement("canvas");
const octx = ocanvas.getContext("2d", {
  alpha: false,
  desynchronized: true,
});
let last_event = null;

cp.onchange = () => {
  ctx.strokeStyle = cp.value;
};

function oSmaller(x, y) {
  return ocanvas.width < x || ocanvas.height < y;
}

function modeOfDrawing(e) {
  if ((e.buttons & 2) === 2) {
    ctx.strokeStyle = "black";
    return true;
  } else if ((e.buttons & 1) === 1) {
    cp.onchange();
    return true;
  } else {
    return false;
  }
}

// TODO scale on center
// TODO panning
window.onload = window.onresize = () => {
  if (oSmaller(window.innerWidth, window.innerHeight)) {
    let bigim = octx.getImageData(0, 0, ocanvas.width, ocanvas.height);
    if (ocanvas.width < window.innerWidth) ocanvas.width = window.innerWidth;
    if (ocanvas.height < window.innerHeight) ocanvas.height = window.innerHeight;
    octx.putImageData(bigim, 0, 0);
  }
  let im = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let sSt = ctx.strokeStyle;
  let w = ctx.lineWidth;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  octx.putImageData(im, 0, 0);
  im = octx.getImageData(0, 0, canvas.width, canvas.height);
  ctx.putImageData(im, 0, 0);
  ctx.strokeStyle = sSt;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = w;
};

canvas.onmousedown = e => {
  if (!modeOfDrawing(e)) {
    last_event = null;
    return;
  }

  let im = ctx.getImageData(0, 0, canvas.width, canvas.height);
  octx.putImageData(im, 0, 0);

  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
  last_event = e;
};

canvas.onmousemove = e => {
  dot.style.left = (e.clientX - dot.offsetWidth / 2).toString() + "px";
  dot.style.top = (e.clientY - dot.offsetHeight / 2).toString() + "px";
  if (e.buttons === 0) {
    last_event = null;
  } else if (last_event != null) {
    ctx.beginPath();
    ctx.moveTo(last_event.offsetX, last_event.offsetY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    last_event = e;
  }
};

canvas.onmouseup = e => {
  if (last_event != null) {
    ctx.beginPath();
    ctx.moveTo(last_event.offsetX, last_event.offsetY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    last_event = null;
  }
};

canvas.onwheel = e => {
  if (e.deltaMode == e.DOM_DELTA_PIXEL) {
    ctx.lineWidth -= 0.1 * e.deltaY;
    dot.style.width = ctx.lineWidth.toString() + "px";
    dot.style.height = ctx.lineWidth.toString() + "px";
    dot.style.left = (e.clientX - dot.offsetWidth / 2).toString() + "px";
    dot.style.top = (e.clientY - dot.offsetHeight / 2).toString() + "px";
  }
};

document.onkeydown = e => {
  if (e.ctrlKey && e.key === "s") {
    let link = document.createElement("a");
    link.download = "jot.png";
    link.href = canvas.toDataURL("image/png");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    e.preventDefault();
    return false;
  } else if (e.ctrlKey && e.key === "z") {
    let im = octx.getImageData(0, 0, canvas.width, canvas.height);
    ctx.putImageData(im, 0, 0);
  }
};

canvas.oncontextmenu = e => e.preventDefault();
