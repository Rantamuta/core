export = RoomManager;
/**
 * Keeps track of all the individual rooms in the game
 */
declare class RoomManager {
    rooms: Map<string, Room>;
    /**
     * @param {string} entityRef
     * @return {Room}
     */
    getRoom(entityRef: string): Room | undefined;
    /**
     * @param {Room} room
     */
    addRoom(room: Room): void;
    /**
     * @param {Room} room
     */
    removeRoom(room: Room): void;
}
import Room = require("./Room");
