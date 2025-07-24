export const FREE_LP_ADDRESSES = [
  '0x666d6b8a44d226150ca9058beebafe0e3ac065a2'
]

export const FREE_SIG_1 = '0x0014eb4ac6dd1473b258d088e6ef214b2bcdc53c'
export const FREE_SIG_2 = '0x9e498dd03c5e984c105e83221aa911dec4844db5'

export const SignatureTimesConfig = [
  {
    id: "solvbtc",
    freeSignatures: 2,
    requiredMinSignatures: 3,
    maxSignatureCount: 4,
    signAddresses: [FREE_SIG_1, FREE_SIG_2, '0x32369c32113d6a85d4b71faa40ddd048187dce79', '0xcd6d31668524598755b81a2cee068ae2ea6979b9'],
    chatId: '-4177551452',
  },
  {
    id: "solvbtc.m",
    freeSignatures: 1,
    requiredMinSignatures: 3,
    maxSignatureCount: 4,
    chatId: '-4177551452',
    signAddresses: [FREE_SIG_1, '0x32369c32113d6a85d4b71faa40ddd048187dce79', '0xcd6d31668524598755b81a2cee068ae2ea6979b9', '0xde498b6179500eb95d48a47f315e473a39cbc1aa'],
  },
  {
    id: "solvbtc.b",
    freeSignatures: 2,
    requiredMinSignatures: 3,
    maxSignatureCount: 4,
    chatId: '-4177551452',
    signAddresses: [FREE_SIG_1, FREE_SIG_2, '0x32369c32113d6a85d4b71faa40ddd048187dce79', '0xcd6d31668524598755b81a2cee068ae2ea6979b9'],
  },
  {
    id: "mbtc",
    freeSignatures: 1,
    requiredMinSignatures: 2,
    maxSignatureCount: 3,
    signAddresses: [FREE_SIG_1, '0x4d9eb5be0ae58d5a6c32a816702d89af8ae7a096', '0xb16c8fbf12a56b391dd248543affc0ca0c02c3a5'],
    chatId: '-4138337624'
  },
  {
    id: "merlin",
    freeSignatures: 1,
    requiredMinSignatures: 2,
    maxSignatureCount: 3,
    signAddresses: [FREE_SIG_1, '0x4d9eb5be0ae58d5a6c32a816702d89af8ae7a096', '0xb16c8fbf12a56b391dd248543affc0ca0c02c3a5'],
    chatId: '-4138337624'
  },
  {
    id: "pump",
    freeSignatures: 1,
    requiredMinSignatures: 2,
    maxSignatureCount: 3,
    signAddresses: [FREE_SIG_2, '0xbfce4653cc71bfd6293faca6bad988e8d72f0497', '0xc9c5bd2ecf73d6975b567337aaf0134cc962722e'],
    chatId: '-4237721398'
  },
  {
    id: "pumpbtc",
    freeSignatures: 0,
    requiredMinSignatures: 2,
    maxSignatureCount: 3,
    signAddresses: ['0x62fe55a5a59a0382aa16388077105771bd327a68', '0x48c2c935363339dabb53a14f9626a8426e1ac162', '0x9dbc04ade3be3aefdb4aecdb451942e41ae841a2'],
    chatId: '-4237721398'
  },
  {
    id: "neox",
    freeSignatures: 2,
    requiredMinSignatures: 3,
    maxSignatureCount: 4,
    signAddresses: [FREE_SIG_1, FREE_SIG_2, '0x4bd2cd70e77cd71fd79a4d0c5a63d88ba4fc2675', '0xb4daa52e4074931c4f297a5ab65a31f2678386bb'],
    chatId: '-4556632259'
  },
  {
    id: "bedrock",
    freeSignatures: 1,
    requiredMinSignatures: 3,
    maxSignatureCount: 4,
    signAddresses: [FREE_SIG_2, '0xde9a5ab522959091d07d022d4c8922b63d9ada0c', '0xa5ed5aa26d95a11c33e2a3650a2c9dc6ca00375c', '0xda084147eee60866c5487e1f7464a5b1c559bc03'],
    chatId: '-4744097890'
  },
  {
    id: "unibtc",
    freeSignatures: 1,
    requiredMinSignatures: 3,
    maxSignatureCount: 4,
    signAddresses: [FREE_SIG_2, '0xde9a5ab522959091d07d022d4c8922b63d9ada0c', '0xa5ed5aa26d95a11c33e2a3650a2c9dc6ca00375c', '0xda084147eee60866c5487e1f7464a5b1c559bc03'],
    chatId: '-4744097890'
  },
  {
    id: "b2",
    freeSignatures: 0,
    requiredMinSignatures: 2,
    maxSignatureCount: 3,
    signAddresses: ['0xf860b08ca3ee77c6c9ef5a08aa7636aa37963153', '0x8f3c6735152074e4ce2b31bba8b48f128998d76d', '0xc7f261b3660ce3d052f27a55f8c81dc67d841ed2'],
    chatId: "-4106885870"
  },
  {
    id: "exsat",
    freeSignatures: 2,
    requiredMinSignatures: 3,
    maxSignatureCount: 4,
    signAddresses: [FREE_SIG_1, FREE_SIG_2, '0x74f3a237e2b70552c865b030eecdf2764b547fcc', '0x1ad81526616c01cb3da22497f1a8dac2ea67b5dc'],
    chatId: '-4752628954'
  },
  {
    id: "taker",
    freeSignatures: 2,
    requiredMinSignatures: 3,
    maxSignatureCount: 4,
    signAddresses: [FREE_SIG_1, FREE_SIG_2, '0x294d04731908d5d1c3fdd0b1d752905472e667bb', '0xcb7762b41379cca8c5cc3213f3ef9d000afbe3ae'],
    chatId: '-4609352134',
  },
  {
    id: "taker-evm",
    freeSignatures: 2,
    requiredMinSignatures: 3,
    maxSignatureCount: 4,
    signAddresses: [FREE_SIG_1, FREE_SIG_2, '0x294d04731908d5d1c3fdd0b1d752905472e667bb', '0xcb7762b41379cca8c5cc3213f3ef9d000afbe3ae'],
    chatId: '-4609352134',
  },
  {
    id: "fbtc",
    freeSignatures: 2,
    requiredMinSignatures: 3,
    maxSignatureCount: 4,
    signAddresses: [FREE_SIG_1, FREE_SIG_2, '0x57d6a3de4ee808a3162c541c7d089e006f3969aa', '0x3b47b6a52e2c5bd4ca23ef7295af7c435e63fc92']
  },
  {
    id: "rooch",
    freeSignatures: 2,
    requiredMinSignatures: 3,
    maxSignatureCount: 4,
    signAddresses: [FREE_SIG_1, FREE_SIG_2, '0xdea32f54823e9feedaf17fe113e817735d3e87e0', '0xcdecac75c4fbb33c47510c1c1e70c8e88b7b597a'],
    chatId: '-4609258594'
  },
  {
    id: "merl",
    freeSignatures: 1,
    requiredMinSignatures: 2,
    maxSignatureCount: 3,
    signAddresses: [FREE_SIG_1, '0x4d9eb5be0ae58d5a6c32a816702d89af8ae7a096', '0xb16c8fbf12a56b391dd248543affc0ca0c02c3a5'],
    chatId: '-4138337624'
  },
  {
    id: "stbtc",
    freeSignatures: 2,
    requiredMinSignatures: 3,
    maxSignatureCount: 4,
    signAddresses: [FREE_SIG_1, FREE_SIG_2, '0xedfc71674bf71b680b02ca4fa6e96e4503f6f076', '0x85583012c0a6b3926841ca9e6802b6a585af4f13']
  },
  {
    id: "wusd",
    freeSignatures: 2,
    requiredMinSignatures: 3,
    maxSignatureCount: 4,
    signAddresses: [FREE_SIG_1, FREE_SIG_2, '0xfeb3f9d152088d1d2e94b0d1e4f1911b72d4f25c', '0xf507c0e7298017384ec6d20f6e8365915251ebdd'],
  },
  {
    id: "duck",
    freeSignatures: 2,
    requiredMinSignatures: 3,
    maxSignatureCount: 4,
    signAddresses: [FREE_SIG_1, FREE_SIG_2, '0x6c318392621c9dab12c052a3e1d3b2f00b082301', '0x70b9c40dfb04f4036fc2b98065e9eb6e9ac38266'],
    chatId: '-4605099572'
  },
  {
    id: "memecore",
    freeSignatures: 2,
    requiredMinSignatures: 3,
    maxSignatureCount: 4,
    signAddresses: [FREE_SIG_1, FREE_SIG_2, '0xe486bf9858f8b995d4bde291c43eb35d94546764', '0xa031e792e26193a3a16c16993b611ff5b3bbdc8f'],
    chatId: '-4886127651'
  },
  {
    id: "m",
    freeSignatures: 2,
    requiredMinSignatures: 3,
    maxSignatureCount: 4,
    signAddresses: [FREE_SIG_1, FREE_SIG_2, '0xe486bf9858f8b995d4bde291c43eb35d94546764', '0xa031e792e26193a3a16c16993b611ff5b3bbdc8f'],
    chatId: '-4886127651'
  },
  {
    id: "avalon",
    freeSignatures: 2,
    requiredMinSignatures: 3,
    maxSignatureCount: 4,
    signAddresses: [FREE_SIG_1, FREE_SIG_2, '0x57d6a3de4ee808a3162c541c7d089e006f3969aa', '0x3b47b6a52e2c5bd4ca23ef7295af7c435e63fc92'],
    chatId: '-4695271255'
  },
  {
    id: "ubtc",
    freeSignatures: 0,
    requiredMinSignatures: 2,
    maxSignatureCount: 3,
    signAddresses: ['0xf860b08ca3ee77c6c9ef5a08aa7636aa37963153', '0x8f3c6735152074e4ce2b31bba8b48f128998d76d', '0xc7f261b3660ce3d052f27a55f8c81dc67d841ed2'],
    chatId: "-4106885870"
  },
];

export const getSignatureTimesConfig = (channelId) => {
  return SignatureTimesConfig.find(c => c.id === channelId)
};
