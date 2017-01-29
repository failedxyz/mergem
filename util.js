var tint = function (img, col) {
    if (col === undefined) return img;
    var canvas = document.createElement('canvas');
    canvas.height = img.height;
    canvas.width = img.width;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    var w = img.width,
        h = img.height;
    if (!w || !h) return img;
    var imgdata = ctx.getImageData(0, 0, w, h);
    var rgba = imgdata.data;
    for (var px = 0, ct = w * h * 4; px < ct; px += 4) {
        rgba[px] *= col[0] / 255;
        rgba[px + 1] *= col[1] / 255;
        rgba[px + 2] *= col[2] / 255;
    }
    ctx.putImageData(imgdata, 0, 0);
    return canvas;
};