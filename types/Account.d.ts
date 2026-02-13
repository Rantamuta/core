export = Account;
/**
 * Representation of a player's account
 *
 * @property {string} username
 * @property {Array<string>} characters List of character names in this account
 * @property {string} password Hashed password
 * @property {boolean} banned Whether this account is banned or not
 */
declare class Account {
    /**
     * @param {Object} data Account save data
     */
    constructor(data: AccountData);
    username: string;
    characters: Array<string>;
    password: string;
    banned: boolean;
    deleted: boolean;
    metadata: string;
    /**
     * @return {string}
     */
    getUsername(): string;
    /**
     * @param {string} username
     */
    addCharacter(username: string): void;
    /**
     * @param {string} name
     * @return {boolean}
     */
    hasCharacter(name: string): boolean;
    /**
     * @param {string} name Delete one of the chars
     */
    deleteCharacter(name: string): void;
    /**
     * @param {string} name Removes the deletion of one of the chars
     */
    undeleteCharacter(name: string): void;
    /**
     * @param {string} password Unhashed password. Is hashed inside this function
     */
    setPassword(pass: string): void;
    /**
     * @param {string} pass Unhashed password to check against account's password
     * @return {boolean}
     */
    checkPassword(pass: string): boolean;
    /**
     * @param {function} callback after-save callback
     */
    save(callback: Function): void;
    /**
     * Set this account to banned
      There is no unban because this can just be done by manually editing the account file
     */
    ban(): void;
    /**
     * Set this account to deleted
     There is no undelete because this can just be done by manually editing the account file
     */
    deleteAccount(): void;
    /**
     * @private
     * @param {string} pass
     * @return {string} Hashed password
     */
    private _hashPassword;
    /**
     * Gather data from account object that will be persisted to disk
     *
     * @return {Object}
     */
    serialize(): AccountData;
}

interface AccountData {
    username: string;
    characters: Array<string>;
    password: string;
    banned: boolean;
    deleted: boolean;
    metadata: string;
}