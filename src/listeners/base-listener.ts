export interface Listener {
    registerMemberAdd(fun: Function): void;
    registerMemberRemove(fun: Function): void;
    registerMessageUpdate(fun: Function): void;
    registerMessageCreate(fun: Function): void;
}