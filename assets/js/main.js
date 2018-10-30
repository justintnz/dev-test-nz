$("#upload-file").on("change", function(event) {
    var filename = this.value;
    var filename = (filename.length < 32) ? filename : ".." + filename.slice(-30);
    $("#upload-name").text(filename);
    $("#message").html("");

});


$('#btn-upload').on("click", function(event) {
    event.preventDefault();
    uploadFiles();
    return false;
});


function uploadFiles() {
    input = $('#upload-file')[0].files;

    console.log(input);
    if (input) {
        for (i = 0; i < input.length; i++) {
            if (input[i].size > 20000000) {
                reject("File '" + input[i].name + "' is too large");
                continue;
            }

            if (input[i].size < 100) {
                reject("File '" + input[i].name + "' is too small");
                continue;
            }

            var reader = new FileReader();
            var filename = input[i].name;
            //Gen a key to update progress status
            var fileId = Date.now() + '-' + Math.floor((Math.random() * 1000) + 1);
            reader.onload = function(event) {
                // theFile = event.target.result;
                theFile = myencrypt(event.target.result);
                if (theFile == "") {
                    //encrypting failed.
                    return;
                }
                var $data = {
                    'title': filename,
                    'file': theFile,
                    'time': Date.now(),
                    'id': fileId,
                    'postkey': $('#postkey').val()
                };
                var date = new Date().toLocaleDateString();
                $('#rowhead').after('<div class="row" id=' + fileId + '><div class="col-2 datetime">' + date + '</div>' +
                    '<div class = "col-4 filename">' + filename + ' </div> ' +
                    '<div class = "col" ><div class = "progress red" ><span>&nbsp;</span></div></div></div>');
                // console.log($data);

                $.ajax({
                    xhr: function() {
                        var xhr = new window.XMLHttpRequest();
                        xhr.upload.addEventListener("progress", function(evt) {
                            if (evt.lengthComputable) {
                                var percentComplete = evt.loaded / evt.total;
                                percentComplete = parseInt(percentComplete * 100);
                                updateProgress(fileId, percentComplete, "progress");
                                console.log(fileId, percentComplete);
                                if (percentComplete === 100) {}
                            }
                        }, false);
                        return xhr;
                    },
                    type: 'POST',
                    url: 'post.php',
                    data: $data,
                    success: function(response) {
                        console.log("success:" + response);
                    },
                    error: function(response) {
                        updateProgress(fileId, 100, "failed");
                        console.log("error:" + response);
                    },
                });
            };

            reader.readAsDataURL(input[i]);
        }

    }
    $('#upload-file').val(null);
    $("#upload-name").text("select a file");
}



function updateProgress(fid, percentage, status) {
    switch (status) {
        case "failed":
            $('#' + fid + ' .progress > span').css('width', '100%');
            $('#' + fid + ' .progress ').addClass('red');
            $('#' + fid + ' .progress ').removeClass('green');
            break;

        case "progress":
        default:
            $('#' + fid + ' .progress > span').css('width', percentage + '%');
            if (percentage >= 100) {
                $('#' + fid + ' .progress ').removeClass('red');
                $('#' + fid + ' .progress ').addClass('green');
            }
    }

}

function reject(message) {
    $('#message').html(message);
}

function myencrypt(message) {
    if ($('#password').val().length < 6) {
        reject("password must be equal or more than 6 characters");
        return "";
    }
    var data = CryptoJS.AES.encrypt(message, $('#password').val());

    // console.log(message, data);
    return 'data:text/plain;base64,' + data;
}