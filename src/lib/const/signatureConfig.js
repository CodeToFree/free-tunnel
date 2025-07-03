export const SignatureTimesConfig = [
  {
    id: "solvbtc",
    freeSignatures: 2,
    requiredMinSignatures: 3,
    chat_id: '-4875991412'
  },
  {
    id: "solvbtc.m",
    freeSignatures: 1,
    requiredMinSignatures: 3,
  },
  {
    id: "solvbtc.b",
    freeSignatures: 2,
    requiredMinSignatures: 3,
  },
  {
    id: "mbtc",
    freeSignatures: 1,
    requiredMinSignatures: 2,
  },
  {
    id: "merlin",
    freeSignatures: 1,
    requiredMinSignatures: 2,
  },
  {
    id: "pump",
    freeSignatures: 0,
    requiredMinSignatures: 2,
  },
  {
    id: "pumpbtc",
    freeSignatures: 0,
    requiredMinSignatures: 2,
    chat_id: '-4875991412'
  },
  {
    id: "neox",
    freeSignatures: 2,
    requiredMinSignatures: 3,
  },
  {
    id: "bedrock",
    freeSignatures: 1,
    requiredMinSignatures: 3,
  },
  {
    id: "b2",
    freeSignatures: 0,
    requiredMinSignatures: 2,
  },
  {
    id: "exsat",
    freeSignatures: 2,
    requiredMinSignatures: 3,
  },
  {
    id: "taker",
    freeSignatures: 2,
    requiredMinSignatures: 3,
  },
  {
    id: "rooch",
    freeSignatures: 2,
    requiredMinSignatures: 3,
  },
  {
    id: "merl",
    freeSignatures: 1,
    requiredMinSignatures: 3,
  },
  {
    id: "stbtc",
    freeSignatures: 2,
    requiredMinSignatures: 3,
  },
  {
    id: "wusd",
    freeSignatures: 2,
    requiredMinSignatures: 3,
  },
  {
    id: "duck",
    freeSignatures: 2,
    requiredMinSignatures: 3,
  },
  {
    id: "memecore",
    freeSignatures: 2,
    requiredMinSignatures: 3,
  },
  {
    id: "m",
    freeSignatures: 2,
    requiredMinSignatures: 3,
  },
  {
    id: "avalon",
    freeSignatures: 2,
    requiredMinSignatures: 3,
  },
  {
    id: "ubtc",
    freeSignatures: 0,
    requiredMinSignatures: 2,
  },
];

export const getSignatureTimesConfig = (channelId) => {
  return SignatureTimesConfig.find(c => c.id === channelId)
};
