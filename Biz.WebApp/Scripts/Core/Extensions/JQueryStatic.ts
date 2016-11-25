﻿interface JQueryStatic {
    RegisterViewViewModel(selector: string,
        resolveViewType: () => any,
        resolveViewModelType: () => any);

    PromiseWith<T>(action: (deferred: JQueryDeferred<T>) => void): JQueryPromise<T>;

    GetLocalStorage<T>(key: string, defaultValue?: T): T;
    SetLocalStorage(key: string, value: any): void;

    GetSessionStorage<T>(key: string, defaultValue?: T): T;
    SetSessionStorage<T>(key: string, value: T): void;

    GetDomStorage<T>(key: string, defaultValue?: T): T;
    SetDomStorage<T>(key: string, value: T): void;
}

$.RegisterViewViewModel = function (selector: string, resolveViewType: () => any, resolveViewModelType: () => any) {

    $(selector).ready(function (e) {
        // other page
        if ($(selector).length === 0) return;

        let viewFactory = new DomBehind.Core.TypedFactory(resolveViewType());
        let viewModelFactory = new DomBehind.Core.TypedFactory(resolveViewModelType());

        let behavior = new DomBehind.Core.Data.ViewViewModelBindingBehavior();
        behavior.GetView = x => <DomBehind.Core.BizView>viewFactory.CreateInstance();
        behavior.GetViewModel = x => <DomBehind.Core.BizViewModel>viewModelFactory.CreateInstance();
        behavior.Element = $(selector);
        behavior.Ensure();
    });
};

$.PromiseWith = function (action: (deferred: JQueryDeferred<any>) => void) {
    var d = $.Deferred();
    action(d);
    return d.promise();
};
$.GetLocalStorage = function (key: string, defaultValue?: any) {
    if (!window.localStorage.getItem(key)) {
        return defaultValue;
    }
    return JSON.parse(window.localStorage.getItem(key));
};
$.SetLocalStorage = function (key: string, value: any) {
    window.localStorage.setItem(key, JSON.stringify(value));
};

$.GetSessionStorage = function (key: string, defaultValue?: any) {
    if (!window.sessionStorage.getItem(key)) {
        return defaultValue;
    }
    return JSON.parse(window.sessionStorage.getItem(key));
};
$.SetSessionStorage = function (key: string, value: any) {
    window.sessionStorage.setItem(key, JSON.stringify(value));
};

$.GetDomStorage = function (key: string, defaultValue?: any) {
    var value = $("body").find(`#DomStorage_${key}`).val();
    if (!value) {
        return defaultValue;
    }
    return JSON.parse(value);
};
$.SetDomStorage = function (key: string, value: any) {
    if ($("body").find(`#DomStorage_${key}`).length === 0) {
        $("<input>", {
            type: "hidden",
            id: `DomStorage_${key}`,
        }).appendTo("body");
    }
    $("body").find(`#DomStorage_${key}`).val(JSON.stringify(value));
};



interface JQuery {
    ValidityState(): ValidityState;
    HasError(): boolean;
    SetCustomError(errorMessage: string): void;
    ClearCustomError(): void;
    CheckValidity(allChildren?: boolean): void;

    Raise(event: DomBehind.Core.Data.IEventBuilder): void;
}

$.fn.ValidityState = function () {
    let me: any = this;
    let validity = me.validity;
    if (Object.IsNullOrUndefined(validity)) {
        $.each(me, (i, value) => {
            validity = value.validity;
            if (!Object.IsNullOrUndefined(validity)) {
                return false;
            }
        });
    }
    return validity;
};
$.fn.HasError = function () {
    let me: any = this;
    let validity = <ValidityState>me.ValidityState();
    return !validity.valid;
};
$.fn.SetCustomError = function (errorMessage: string) {
    let me: any = this;
    if (Object.IsNullOrUndefined(me.setCustomValidity)) {
        $.each(me, (i, value) => {
            if (!Object.IsNullOrUndefined(value.setCustomValidity)) {
                value.setCustomValidity(errorMessage);
                return false;
            }
        });
    } else {
        me.setCustomValidity(errorMessage);
    }
};
$.fn.ClearCustomError = function () {
    let me: any = this;
    me.SetCustomError("");
};

$.fn.CheckValidity = function () {
    let me: any = this;
    let result: boolean = true;
    if (Object.IsNullOrUndefined(me.checkValidity)) {
        $.each(me, (i, value) => {
            if (!Object.IsNullOrUndefined(value.checkValidity)) {
                result = value.checkValidity();
            }
        });
    } else {
        result = me.checkValidity();
    }
};

$.fn.Raise = function (event: DomBehind.Core.Data.IEventBuilder) {
    let me: any = this;
    me.trigger(event.EventName);
};