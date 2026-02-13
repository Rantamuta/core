export = TransportStream;
/**
 * Base class for anything that should be sending or receiving data from the player
 */
declare class TransportStream extends EventEmitter {
    constructor(options?: EventEmitter.EventEmitterOptions);
    get readable(): boolean;
    get writable(): boolean;
    write(): void;
    /**
     * A subtype-safe way to execute commands on a specific type of stream that invalid types will ignore. For given input
     * for command (example, `"someCommand"` ill look for a method called `executeSomeCommand` on the `TransportStream`
     * @param {string} command
     * @param {...*} args
     * @return {*}
     */
    // Command handlers are user-defined methods; return type is intentionally unknown.
    command(command: string, ...args: unknown[]): unknown;
    address(): null;
    end(): void;
    setEncoding(): void;
    pause(): void;
    resume(): void;
    destroy(): void;
    /**
     * Attach a socket to this stream
     * @param {*} socket
     */
    attach(socket: CloseListenable): void;
    socket: CloseListenable;
}
import EventEmitter = require("node:events");
type CloseListenable = {
    // Close event payload differs by socket implementation and is ignored here.
    on(event: "close", listener: (_: unknown) => void): void;
};
