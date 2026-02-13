export = RoleAudience;
declare class RoleAudience extends ChannelAudience {
    constructor(options: RoleAudienceOptions);
    minRole: number;
    getBroadcastTargets(): ReturnType<ChannelAudience["getBroadcastTargets"]>;
}
import ChannelAudience = require("./ChannelAudience");
type RoleAudienceOptions = {
    minRole: number;
    [key: string]: unknown;
};
