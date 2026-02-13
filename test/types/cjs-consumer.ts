import Ranvier = require("../..");

const RanvierViaRequire: typeof Ranvier = require("../..");

const broadcastTarget: Ranvier.BroadcastTarget = {
  socket: {
    writable: true,
    write: (_data: string) => true,
  },
};

const broadcastable: Ranvier.Broadcastable = {
  getBroadcastTargets() {
    return [broadcastTarget];
  },
};

declare const player: InstanceType<typeof Ranvier.Player>;
Ranvier.Broadcast.prompt(player);

void Ranvier.Account;
void Ranvier.GameServer;
void Ranvier.CommandType.COMMAND;
void Ranvier.Util.isIterable;
void RanvierViaRequire;
void broadcastable;
