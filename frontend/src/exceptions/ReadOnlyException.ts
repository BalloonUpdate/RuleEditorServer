import BaseException from "./BaseException";

export default class ReadOnlyException extends BaseException {
    constructor() {
        super('The ReadOnly mode is current enabled, writing will always fall');
    }
}