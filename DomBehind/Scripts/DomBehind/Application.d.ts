declare namespace DomBehind {
    abstract class Application {
        static readonly Current: Application;
        private static _app;
        static Resolve(): void;
        protected OnBrowserBack(): void;
        SafeAction(func: Function, context?: any, ...args: any[]): any;
        abstract UnhandledException(error: any): void;
        readonly DefaultActionPolicy: Data.ActionPolicy[];
        readonly Navigator: Navigation.INavigator;
        private _navigator;
    }
}
