export = AreaFloor;
/**
 * IF you absolutely need to iterate over a floor in a tight (nested) loop you
 * should use the low/high properties like so.
 *
 * ```javascript
 * const floor = area.map.get(2);
 * for (let x = floor.lowX; x <= floor.highX; x++) {
 *  for (let y = floor.lowY; y <= floor.highY; y++) {
 *    const room = floor.getRoom(x, y);
 *
 *    if (!room) {
 *      continue;
 *    }
 *  }
 * }
 * ```
 *
 * Note the `<=` to avoid fenceposting the loop
 *
 * @property {number} lowX The lowest x value
 * @property {number} highX The highest x value
 * @property {number} lowY The lowest y value
 * @property {number} highY The highest y value
 * @property {number} z This floor's z index
 */
declare class AreaFloor {
    constructor(z: number);
    z: number;
    lowX: number;
    highX: number;
    lowY: number;
    highY: number;
    map: Room[][];
    addRoom(x: number, y: number, room: Room): void;
    /**
     * @return {Room|boolean}
     */
    getRoom(x: number, y: number): Room | undefined;
    removeRoom(x: number, y: number): void;
}
import Room = require("./Room");
