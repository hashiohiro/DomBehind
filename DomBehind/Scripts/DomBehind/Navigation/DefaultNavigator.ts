﻿namespace DomBehind.Navigation {
    const OnModalCloseEventName: string = "ModalClose";
    const ReferenceCountKey: string = "ReferenceCountKey";

    export class DefaultNavigator implements INavigator {

        public NewWindow(uri: string, target?: string, style?: string): Window {
            if (!String.IsNullOrWhiteSpace(uri) && uri !== "about:blank") {
                uri = $.AbsoluteUri(uri);
            }
            return window.open(uri, target, style);
        }

        public Move(uri: string);
        public Move(uri: string, historyBack: boolean);
        public Move(uri: any, historyBack?: any) {
            uri = $.AbsoluteUri(uri);

            if (location.href === uri) return;

            if (historyBack) {
                location.href = uri;
            } else {
                location.replace(uri);
            }
        }

        public Reload(forcedReload?: boolean) {
            location.reload(forcedReload);
        }

        protected DefaultSetting: IModalHelperSettings = {
            FadeInDuration: 100,
            FadeOutDuration: 100,
            AllowCloseByClickOverlay: true,
            ShowCloseButton: true,
            ShowHeader: true,
            StartupLocation: ModalStartupLocation.CenterScreen,
            StartupLocationTop: null,
            StartupLocationLeft: null
        };

        public ShowModal(arg: any, option?: IModalHelperSettings): JQueryPromise<any> {

            let setting: IModalHelperSettings = $.extend(true, this.DefaultSetting, option);;
            let overlay = $("<div>", {
                class: "modal-overlay",
            });

            overlay.css("z-index", $.GenerateZIndex());
            $("body").css("overflow", "hidden");

            overlay
                .appendTo("body")
                .fadeIn(setting.FadeInDuration, () => {
                    $.SetDomStorage(ReferenceCountKey,
                        $.GetDomStorage(ReferenceCountKey, 0) + 1);
                });


            var container: JQuery;
            if (typeof arg === "string") {
                var ex: Exception;
                var ajax = $.ajax({
                    url: $.AbsoluteUri(arg),
                    async: false,
                    type: "GET",
                    cache: false,
                    error: (xhr, status, error) => {
                        ex = new AjaxException(xhr, status, error)
                    },
                });

                if (ex) throw ex;

                var html = ajax.responseText;
                container = $(html);
            } else {
                container = arg;
            }

            container.find(".close").on("click", (e, args) => {
                $(e.target).trigger(OnModalCloseEventName, args);
                // e.data.trigger(OnModalCloseEventName, args);
            });

            if (!setting.ShowCloseButton) {
                container.find(".close").hide();
            }

            if (setting.StartupLocation === ModalStartupLocation.Manual) {
                if (Object.IsNullOrUndefined(setting.StartupLocationTop) &&
                    Object.IsNullOrUndefined(setting.StartupLocationLeft)) {

                    var buffCount = $.GetDomStorage(ReferenceCountKey, 0) + 1;
                    container.find(".modal-dialog")
                        .css("top", `${-50 + (buffCount * 5)}%`)
                        .css("left", `${-25 + (buffCount * 5)}%`);
                } else {
                    container.find(".modal-dialog")
                        .css("top", setting.StartupLocationTop)
                        .css("left", setting.StartupLocationLeft);
                }
            }


            //// domに追加
            //overlay.append(container);

            let modal = container.find(".modal-dialog");
            // use jquery ui
            if (modal.draggable) {
                modal.draggable({
                    handle: ".modal-header",
                    cursor: "move",
                });
            }

            if (setting.Width) {
                modal.css("width", setting.Width);
            }
            if (setting.Height) {
                modal.css("height", setting.Height);
            }
            if (!setting.ShowHeader) {
                container.find(".modal-header").hide();
                container.find(".modal-body").css("height", "100%");
            }

            if (setting.AllowCloseByClickOverlay) {
                overlay.click(overlay, e => {
                    $(e.target).trigger(OnModalCloseEventName);
                    // e.data.trigger(OnModalCloseEventName);
                });
                container.click(e => {
                    e.stopPropagation();
                });
            }

            let d = $.Deferred();
            overlay.off(OnModalCloseEventName);
            overlay.on(OnModalCloseEventName, { me: overlay, option: setting, target: container }, (e, args) => {

                var eventObj = $.Event('modalClosing');
                var modalBody = e.data.target.find(".modal-body");
                $(modalBody.children()[0]).trigger(eventObj);
                if (eventObj.result === false) {
                    d.reject();
                    return;
                }

                d.resolve(args);
                var eventOption = e.data.option as IModalHelperSettings;
                var me = e.data.me;
                me.off(OnModalCloseEventName);
                me.fadeOut(eventOption.FadeOutDuration, () => {
                    me.remove();
                    $.SetDomStorage(ReferenceCountKey,
                        $.GetDomStorage(ReferenceCountKey, 0) - 1);
                    if ($.GetDomStorage(ReferenceCountKey, 0) === 0) {
                        $("body").css("overflow", "auto");
                    }
                });
            });

            // domに追加
            overlay.append(container);
            container.hide().show(0);

            return d.promise();
        }
    }
}
