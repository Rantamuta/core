export = EventUtil;
/**
 * Helper methods for colored output during input-events
 */
declare class EventUtil {
    /**
     * Generate a function for writing colored output to a socket
     * @param {net.Socket} socket
     * @return {function (string)}
     */
    static genWrite(socket: import("node:net").Socket): (arg0: string) => boolean;
    /**
     * Generate a function for writing colored output to a socket with a newline
     * @param {net.Socket} socket
     * @return {function (string)}
     */
    static genSay(socket: import("node:net").Socket): (arg0: string) => boolean;
}
