(function () {
    "use strict";

    function messageAction(data) {
        switch (data.action) {
            case "dial": {
                if (!data.number || !(/[^0-9]/).test(data.number)) {
                    break;
                }

                cordova.InAppBrowser.open(
                    "tel:" + data.number,
                    "_system"
                );

                break;
            }
        }
    }

    var Message = (function () {
        function Message(iawin) {
            var obj = this;

            iawin.addEventListener("message", function (e) {
                if (e.type !== "message" || !e.data || !e.data.action) {
                    return;
                }

                obj.action(e.data);
            });
        }

        Message.prototype = {
            action: messageAction
        };

        return Message;
    }());

    function init() {
        var url = atob("aHR0cHM6Ly9oYXl1c3MuY29tLw=="),
        iawin = cordova.InAppBrowser.open(url, "_blank", "location=no,clearcache=yes,zoom=no,footer=no"),
        error = false;

        new Message(iawin);

        iawin.addEventListener("loaderror", function () {
            error = true;
            navigator.splashscreen.show();
            iawin.close();
        });

        iawin.addEventListener("exit", function () {
            navigator.splashscreen.show();

            if (!error) {
                navigator.notification.confirm("Confirm close", function (exit) {
                    if (exit === 1) {
                        navigator.app.exitApp();
                    } else {
                        location.reload();
                    }
                }, "Confirm");
            } else {
                document.querySelector("#error").classList.remove("hide");
            }

            navigator.splashscreen.hide();
        });
    }

    init();
}());
