export const SignatureTimesConfig = [
  {
    id: "solvbtc",
    freeSignatures: 2,
    requiredMinSignatures: 3,
    maxSignatureCount: 4
  },
  {
    id: "solvbtc.m",
    freeSignatures: 1,
    requiredMinSignatures: 3,
    maxSignatureCount: 4
  },
  {
    id: "solvbtc.b",
    freeSignatures: 2,
    requiredMinSignatures: 3,
    maxSignatureCount: 4
  },
  {
    id: "mbtc",
    freeSignatures: 1,
    requiredMinSignatures: 2,
    maxSignatureCount: 3,
  },
  {
    id: "merlin",
    freeSignatures: 1,
    requiredMinSignatures: 2,
    maxSignatureCount: 3
  },
  {
    id: "pump",
    freeSignatures: 0,
    requiredMinSignatures: 2,
    maxSignatureCount: 3
  },
  {
    id: "pumpbtc",
    freeSignatures: 0,
    requiredMinSignatures: 2,
    maxSignatureCount: 3
  },
  {
    id: "neox",
    freeSignatures: 2,
    requiredMinSignatures: 3,
    maxSignatureCount: 4
  },
  {
    id: "bedrock",
    freeSignatures: 1,
    requiredMinSignatures: 3,
    maxSignatureCount: 4
  },
  {
    id: "b2",
    freeSignatures: 0,
    requiredMinSignatures: 2,
    maxSignatureCount: 3
  },
  {
    id: "exsat",
    freeSignatures: 2,
    requiredMinSignatures: 3,
    maxSignatureCount: 4
  },
  {
    id: "taker",
    freeSignatures: 2,
    requiredMinSignatures: 3,
    maxSignatureCount: 4
  },
  {
    id: "rooch",
    freeSignatures: 2,
    requiredMinSignatures: 3,
    maxSignatureCount: 4
  },
  {
    id: "merl",
    freeSignatures: 1,
    requiredMinSignatures: 2,
    maxSignatureCount: 3
  },
  {
    id: "stbtc",
    freeSignatures: 2,
    requiredMinSignatures: 3,
    maxSignatureCount: 4
  },
  {
    id: "wusd",
    freeSignatures: 2,
    requiredMinSignatures: 3,
    maxSignatureCount: 4
  },
  {
    id: "duck",
    freeSignatures: 2,
    requiredMinSignatures: 3,
    maxSignatureCount: 4
  },
  {
    id: "memecore",
    freeSignatures: 2,
    requiredMinSignatures: 3,
    maxSignatureCount: 4
  },
  {
    id: "m",
    freeSignatures: 2,
    requiredMinSignatures: 3,
    maxSignatureCount: 4
  },
  {
    id: "avalon",
    freeSignatures: 2,
    requiredMinSignatures: 3,
    maxSignatureCount: 4
  },
  {
    id: "ubtc",
    freeSignatures: 0,
    requiredMinSignatures: 2,
    maxSignatureCount: 3
  },
];

export const getSignatureTimesConfig = (channelId) => {
  return SignatureTimesConfig.find(c => c.id === channelId)
};
