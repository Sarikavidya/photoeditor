$(function() {

    $('.img-area')
        .on('dragover', (e) => {
            e.preventDefault();
        })
        .on('drop', (e) => {
            e.preventDefault();
            var files = e.originalEvent.dataTransfer.files;
            if (files.length > 0) {
                var reader = new FileReader();
                reader.onload = (e) => {
                    $("#initial-image")
                        .load(() => {
                            $("#default-drag-area").addClass("invisible");
                            $("#imageProcessed").removeClass("invisible");
                            drawInitialImage();
                        })
                        .attr("src", e.target.result);
                };
                reader.readAsDataURL(files[0]);
            }
        });

    $("#linkDownload").click((e) => {
        clearEventsDraw();
        if ($('#imageProcessed').hasClass("invisible")) {
            e.preventDefault();
        } else {
            var imageUrl = $("#imageProcessed")[0].toDataURL("image/png").replace("image/png", "image/octet-stream");
            $("#linkDownload").attr("href", imageUrl);
        }
    })

    $('#resolutionModal').on('show.bs.modal', (e) => {
        if ($('#imageProcessed').hasClass("invisible")) {
            $("#modifyResolution").addClass("invisible");
            $("#uploadPictureError").removeClass("invisible");
        } else {
            $("#uploadPictureError").addClass("invisible");
            $("#modifyResolution").removeClass("invisible");
            var canvas = $("#imageProcessed")[0];

            $("#width-size").val(canvas.width);
            $("#height-size").val(canvas.height);

            var ratio = canvas.width / canvas.height
            $("#width-size").keyup((e) => {
                if ($("#checkbox-img-ratio").is(":checked")) {
                    $("#height-size").val($("#width-size")[0].value / ratio)
                }
            })
            $("#height-size").keyup(() => {
                if ($("#checkbox-img-ratio").is(":checked")) {
                    $("#width-size").val($("#height-size")[0].value * ratio)
                }
            })

            $("#saveResolution").click(() => {
                var context = canvas.getContext("2d");
                var image = new Image;
                image.src = canvas.toDataURL("image/png");
                canvas.width = $("#width-size").val();
                canvas.height = $("#height-size").val();
                image.onload = () => {
                    context.drawImage(image, 0, 0, canvas.width, canvas.height);
                };
                $('#resolutionModal').modal('hide');
            })
        }
        clearEventsDraw();
    })

    $("#undoButton").click(() => {
        clearEventsDraw();
        drawInitialImage();
    })

    $("#cropButton").click(() => {
        clearEventsDraw();

        var canvas = $("#imageProcessed")[0];
        var context = canvas.getContext("2d");
        var position = $("#imageProcessed").offset();

        var started = false;
        var image;

        var x = 0;
        var y = 0;
        var sx = 0;
        var sy = 0;
        var width = 500;
        var height = 700;

        $("#imageProcessed")
            .mousedown((event) => {
                started = true;
                sx = event.pageX;
                sy = event.pageY;
                x = sx - position.left;
                y = sy - position.top;
                image = new Image;
                image.src = canvas.toDataURL("image/png");
            })
            .mousemove((event) => {
                if (started) {
                    var x1 = Math.min(event.pageX - position.left, x);
                    var y1 = Math.min(event.pageY - position.top, y);
                    width = Math.abs(event.pageX - position.left - x1);
                    height = Math.abs(event.pageY - position.top - y1);

                    redrawCurrentImage(image);

                    if (!width || !height) {
                        return;
                    }
                    context.strokeRect(x1 - 1, y1 - 1, width + 2, height + 2);
                }
            })
            .mouseup((event) => {
                started = false;
                width = event.pageX - sx;
                height = event.pageY - sy;

                var image = new Image;
                image.src = canvas.toDataURL("image/png");
                image.onload = () => {
                    context.clearRect(0, 0, canvas.width, canvas.height);
                    canvas.width = width;
                    canvas.height = height;
                    context.drawImage(image, x, y, width, height, 0, 0, width, height);
                    $("#imageProcessed").unbind("mousedown");
                    $("#imageProcessed").unbind("mouseup");
                    $("#imageProcessed").unbind("mousemove");
                };
            });
    })

    $("#penDraw").click(() => {
        clearEventsDraw();

        var started = false;
        var canvas = $("#imageProcessed")[0];
        var context = canvas.getContext("2d");

        $("#imageProcessed")
            .mousedown((event) => {
                context.beginPath();
                context.moveTo(event.offsetX, event.offsetY);
                started = true;
            })
            .mousemove((event) => {
                if (started) {
                    context.lineTo(event.offsetX, event.offsetY);
                    context.stroke();
                }
            })
            .mouseup((event) => {
                if (started) {
                    started = false;
                }
            });
    })

    $("#lineDraw").click(() => {
        clearEventsDraw();

        var started = false;
        var canvas = $("#imageProcessed")[0];
        var context = canvas.getContext("2d");
        var position = $("#imageProcessed").offset();
        var image;
        var x = 0;
        var y = 0;


        $("#imageProcessed")
            .mousedown((event) => {
                x = event.pageX - position.left;
                y = event.pageY - position.top;
                started = true;
                image = new Image;
                image.src = canvas.toDataURL("image/png");
            })
            .mousemove((event) => {
                if (started) {
                    redrawCurrentImage(image);
                    context.beginPath();
                    context.moveTo(x, y);
                    context.lineTo(event.pageX - position.left, event.pageY - position.top);
                    context.stroke();
                    context.closePath();
                }
            })
            .mouseup((event) => {
                if (started) {
                    started = false;
                }
            });
    })

    $("#rectangleDraw").click(() => {
        clearEventsDraw();

        var started = false;
        var canvas = $("#imageProcessed")[0];
        var context = canvas.getContext("2d");
        var position = $("#imageProcessed").offset();
        var image;
        var x = 0;
        var y = 0;
        var width = 0;
        var height = 0;


        $("#imageProcessed")
            .mousedown((event) => {
                x = event.pageX - position.left;
                y = event.pageY - position.top;
                started = true;
                image = new Image;
                image.src = canvas.toDataURL("image/png");
            })
            .mousemove((event) => {
                if (started) {
                    x = Math.min(event.pageX - position.left, x);
                    y = Math.min(event.pageY - position.top, y);
                    width = Math.abs(event.pageX - position.left - x);
                    height = Math.abs(event.pageY - position.top - y);

                    redrawCurrentImage(image);

                    if (!width || !height) {
                        return;
                    }
                    context.strokeRect(x, y, width, height);
                }
            })
            .mouseup((event) => {
                if (started) {
                    started = false;
                }
            });
    })

    $("#circleDraw").click(() => {
        clearEventsDraw();

        var started = false;
        var canvas = $("#imageProcessed")[0];
        var context = canvas.getContext("2d");
        var position = $("#imageProcessed").offset();
        var image;
        var startX = 0;
        var startY = 0;


        $("#imageProcessed")
            .mousedown((event) => {
                startX = event.pageX - position.left;
                startY = event.pageY - position.top;
                started = true;
                image = new Image;
                image.src = canvas.toDataURL("image/png");
            })
            .mousemove((event) => {
                if (started) {
                    redrawCurrentImage(image);

                    var x = event.pageX - position.left;
                    var y = event.pageY - position.top;

                    context.beginPath();
                    context.moveTo(startX, startY + (y - startY) / 2);
                    context.bezierCurveTo(startX, startY, x, startY, x, startY + (y - startY) / 2);
                    context.bezierCurveTo(x, y, startX, y, startX, startY + (y - startY) / 2);
                    context.closePath();
                    context.stroke();

                }
            })
            .mouseup((event) => {
                if (started) {
                    started = false;
                }
            });
    })


    $("#grayscale").click((event) => {
        var canvas = $("#imageProcessed")[0];
        var context = canvas.getContext("2d");
        let imageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
        let pixels = imageData.data;
        for (let i = 0; i < pixels.length; i += 4)
            pixels[i] = pixels[i + 1] = pixels[i + 2] = Math.round((pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3);
        context.putImageData(imageData, 0, 0);
    })

    $("#threshold").click((event) => {
        var canvas = $("#imageProcessed")[0];
        var context = canvas.getContext("2d");
        let imageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
        let pixels = imageData.data;
        for (let i = 0; i < pixels.length; i += 4) {
            var r = pixels[i],
                g = pixels[i + 1],
                b = pixels[i + 2];
            var v = (0.2126 * r + 0.7152 * g + 0.0722 * b >= 180) ? 255 : 0;
            pixels[i] = pixels[i + 1] = pixels[i + 2] = v
        }
        context.putImageData(imageData, 0, 0);
    })


    $("#sephia").click((event) => {
        var canvas = $("#imageProcessed")[0];
        var context = canvas.getContext("2d");
        let imageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
        let pixels = imageData.data;
        for (var i = 0; i < pixels.length; i += 4) {
            var r = pixels[i],
                g = pixels[i + 1],
                b = pixels[i + 2];
            pixels[i] = (r * .393) + (g * .769) + (b * .189)
            pixels[i + 1] = (r * .349) + (g * .686) + (b * .168)
            pixels[i + 2] = (r * .272) + (g * .534) + (b * .131)
        }
        context.putImageData(imageData, 0, 0);
    })

    $("#invert").click((event) => {
        var canvas = $("#imageProcessed")[0];
        var context = canvas.getContext("2d");
        let imageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
        let pixels = imageData.data;
        for (var i = 0; i < pixels.length; i += 4) {
            var r = pixels[i],
                g = pixels[i + 1],
                b = pixels[i + 2];
            pixels[i] = 255 - r;
            pixels[i + 1] = 255 - g;
            pixels[i + 2] = 255 - b;
        }
        context.putImageData(imageData, 0, 0);
    })

});

function drawInitialImage() {
    var canvas = $("#imageProcessed")[0];
    var context = canvas.getContext("2d");
    var image = document.getElementById("initial-image");
    canvas.width = image.width;
    canvas.height = image.height;
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
}

function redrawCurrentImage(image) {
    var canvas = $("#imageProcessed")[0];
    var context = canvas.getContext("2d");
    canvas.width = image.width;
    canvas.height = image.height;
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
}



function clearEventsDraw() {
    $("#imageProcessed").unbind("mousedown");
    $("#imageProcessed").unbind("mouseup");
    $("#imageProcessed").unbind("mousemove");
}