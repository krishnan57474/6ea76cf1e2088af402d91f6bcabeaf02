(function () {
    "use strict";

    function messageAction(data) {
        switch (data.action) {
            case "dial": {
                if (!data.number || (/[^0-9]/).test(data.number)) {
                    break;
                }

                cordova.InAppBrowser.open(
                    "tel:" + data.number,
                    "_system"
                );

                navigator.app.exitApp();

                break;
            }

            case "whatsapp": {
                if (!data.number || (/[^0-9]/).test(data.number)) {
                    break;
                }

                cordova.InAppBrowser.open(
                    "whatsapp://send?phone=" + data.number,
                    "_system"
                );

                navigator.app.exitApp();

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

    function getAppUrl() {
        var url = atob("aHR0cHM6Ly9oYXl1c3MuY29tLw=="),
        previousUrl;

        try {
            previousUrl = localStorage.getItem("previousUrl");

            if (previousUrl && previousUrl.indexOf(url) === 0) {
                url = previousUrl;
            }
        } catch (e) {}

        return url;
    }

    function init() {
        var url = getAppUrl(),
        iawin = cordova.InAppBrowser.open(url, "_blank", "location=no,clearcache=yes,zoom=no,footer=no"),
        error = false;

        new Message(iawin);

        iawin.addEventListener("loadstart", function (e) {
            try {
                if (e.url.indexOf("https") === 0) {
                    localStorage.setItem("previousUrl", e.url);
                }
            } catch (e) {}
        });

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
