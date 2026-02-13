/**
 * Minimal socket surface used by Broadcast at runtime.
 */
export interface SocketLike {
    writable?: boolean;
    _prompted?: boolean;
    write(data: string): boolean | void;
    command?(name: string): void;
}

/**
 * A possible broadcast recipient.
 */
export interface BroadcastTarget {
    socket?: SocketLike;
}

/**
 * Any object that can provide broadcast targets.
 */
export interface Broadcastable<TTarget extends BroadcastTarget = BroadcastTarget> {
    getBroadcastTargets(): ReadonlyArray<TTarget>;
}
