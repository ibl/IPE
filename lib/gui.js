/**
 * IPE Toolbox GUI
 * Depends on: tcga.js
 */
/*jshint jquery:true browser:true */
/*global IPE:false, ganglion:false */
$(document).ready(function () {
    "use strict";

    var moduleList, shareUrl;

 // The URL module loader.
    (function (el) {
        var input, button;
        input = el.querySelector("input");
        button = el.querySelector("button");
        button.addEventListener("click", function (ev) {
            var url;
            ev.preventDefault();
            url = input.value;
            $(button).button("loading");
            IPE.loadScript({
                scripts: [input.value],
                trackEvent: {
                    category: "Module",
                    action: "URL"
                }
            }, function (err) {
                $(button).button("reset");
                if (err) {
                    IPE.ui.toast.error("An error occurred when loading module \"" + input.value + "\".");
                } else {
                    url = input.value;
                    IPE.ui.toast.success("Module " + url + " was successfully loaded.");
                    input.value = "";
                }
            });
        });
    }(document.getElementById("url-module-loader")));

 // Promoted modules.
    (function (el) {
        if (!el) {
            return;
        }
        el.addEventListener("click", function (ev) {
            var url;
            ev.preventDefault();
            url = ev.target.href;
            IPE.loadScript({
                scripts: [url],
                trackEvent: {
                    category: "Module",
                    action: "Promotion"
                }
            }, function (err) {
                if (err) {
                    IPE.ui.toast.error("Oops, something went wrong! Please try some other module.");
                }
            });
        });
    }(document.getElementById("promoted-module")));

 // List of registered modules.
    moduleList = (function (el) {
        var empty;
        empty = true;
        return {
            add: function (modules) {
                var list;
                if (typeof modules !== "string" && Array.isArray(modules) === false) {
                    throw new Error("Please provide a modules parameter (string or [string]).");
                }
                if (typeof modules === "string") {
                    modules = [modules];
                }
                list = $("ul", el);
                modules.forEach(function (module) {
                    list.append(
                        $("<li></li>").append(
                            $("<a></a>").attr("href", module).attr("target", "_blank").text(module)
                        )
                    );
                });
                if (empty === true) {
                 // I don't know why I cannot chain fadeOut with fadeIn here.
                    $("p", el).hide();
                    list.fadeIn(100);
                    empty = false;
                }
            }
        };
    }(document.getElementById("registered-modules")));

    shareUrl = (function (el) {
        var input, button;
        input = $("input[name='url']", el);
        button = $("input[type='submit']", el);
        $(el).submit(function (ev) {
            ev.preventDefault();
         // Select content of textbox.
            input.select();
         // Write current selection into clipboard.
            document.execCommand("copy");
        });
        $(button).click(function (ev) {
            $(this).submit();
        });
        return {
            update: function () {
                input.val("http://ibl.github.io/IPE/" + window.location.search);
            }
        };
    }(document.getElementById("share-modules")));

    ganglion.registry.subscribe(function (modules) {
     // Keep the module list up-to-date.
        moduleList.add(modules);
     // Keep the URL in the share box up-to-date.
        shareUrl.update();
    });

 // The omnibox module loader.
    (function () {
        ganglion.registry.list(function (err, modules) {
            var trackEvent;
            if (modules.length > 0) {
             // Determine whether to track event or not.
                if (window.location.search.indexOf("trackEvent=false") !== -1) {
                    trackEvent = false;
                } else {
                    trackEvent = {
                        category: "Module",
                        action: "Omnibox"
                    };
                }
             // Load modules.
                IPE.loadScript({
                    scripts: modules,
                    trackEvent: trackEvent,
                    registerModules: false
                }, function (err, loadedScripts) {
                    if (err !== null) {
                        IPE.ui.toast.error("An error occurred when loading the registered modules.");
                    }
                });
             // Add modules to the list of registered modules.
                moduleList.add(modules);
            }
         // Add modules to the URL in the share box.
            shareUrl.update();
        });
    }());

 // Open tab that is mentioned in the fragment part of the URL.
    if (window.location.hash !== "") {
        $(".nav a[data-toggle='tab'][href='" + window.location.hash + "']").tab("show");
    }

 // Write tab changes into the fragment part of the URL.
    $(".nav a[data-toggle='tab']").on("show", function (e) {
        window.location.hash = e.target.href.split("#")[1];
    });

});
