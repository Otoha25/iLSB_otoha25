export type RuntimeMessage = {
    recipient: "repository";
    type: "requestRefresh";
} | {
    recipient: "repository";
    type: "requestExtractSelectedText";
    payload: string;
};

export function createRuntimeMessage(msg: RuntimeMessage) {
    return msg;
}