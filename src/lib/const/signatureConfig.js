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
    id: "unibtc",
    freeSignatures: 0,
    requiredMinSignatures: 2,
  },
  {
    id: "bedrock",
    freeSignatures: 2,
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
  // {
  //   id: "merl", // TODO:
  //   freeSignatures: 1,
  //   requiredMinSignatures: 3,
  // },
  // {
  //   id: "stbtc", // TODO:
  //   freeSignatures: 2,
  //   requiredMinSignatures: 3,
  // },
  // {
  //   id: "wusd", // TODO:
  //   freeSignatures: 2,
  //   requiredMinSignatures: 3,
  // },
  // {
  //   id: "duck", // TODO:
  //   freeSignatures: 2,
  //   requiredMinSignatures: 3,
  // },
  // {
  //   id: "bitlayer", // TODO:
  //   freeSignatures: 2,
  //   requiredMinSignatures: 3,
  // },
  // {
  //   id: "bevm", // TODO:
  //   freeSignatures: 2,
  //   requiredMinSignatures: 3,
  // },
];

export const getSignatureTimesConfig = (channelId) => {
  return SignatureTimesConfig.find(c => c.id === channelId)
};
