﻿namespace App.ContactUs {
    $.RegisterViewViewModel("#ContactUsView", () => ContactUsView, () => ContactUsViewModel);
    export class ContactUsView
        extends DomBehind.Core.BizView {

        public BuildBinding(): void {
            var builder = this.CreateBindingBuilder<ContactUsViewModel>();

            builder.Element("#ContactUsName")
                .Binding(DomBehind.Core.UIElement.ValueProperty, x => x.Name)
                .Required();

            builder.Element("#ContactUsEmail")
                .Binding(DomBehind.Core.UIElement.ValueProperty, x => x.Email)
                .Required();

            builder.Element("#ContactUsMessage")
                .Binding(DomBehind.Core.UIElement.ValueProperty, x => x.Message)
                .Required();

            builder.Element("#ContactUsButton").InputType(DomBehind.Core.InputType.Submit)
                .BindingAction(DomBehind.Core.UIElement.ClickEvent, x => x.ContactUs());
        }

        public OnReceiveNotificationMessage(sender: any, e: any) {

        }
    }
}