# Free Tunnel v2

The upgraded **Free Tunnel v2** introduces a new architecture enabling the deployment and management of multiple **Atomic-Lock-Mint/Atomic-Burn-Mint** tunnels via the **FreeTunnelHub**. This design ensures a decentralized and secure approach to manage multi-party operations in cross-chain transactions, while maintaining flexibility and upgradability.


## Key Components

### FreeTunnelHub Contract

A smart contract deployed on each blockchain with the same contract address across chains. It serves as:
- A factory contract to open new tunnels.
- An entry point to process cross-chain requests.
  
### TunnelBoringMachine (TBM) Contract

A storage contract for the bytecode of **TunnelContract**. FreeTunnelHub uses TBM to open new tunnels or upgrade existing tunnels. When a new version of TunnelContract is released, a new TunnelBoringMachine contract should be deployed as the new TBM used in FreeTunnelHub.

### TunnelContract

The contract that implements the core **Atomic-Lock-Mint** and **Atomic-Burn-Mint** logic.

- Projects can open their own tunnel under a chosen **tunnel name**.
- On each blockchain, only one TunnelContract with the same name can be deployed via FreeTunnelHub.
- TunnelContract instances with the same tunnel name across different blockchains are interconnected, enabling Atomic-Lock-Mint and Atomic-Burn-Mint operations.
- Tunnels with different names are independent of one another.

As an upgradeable contract, TunnelContract instances can be upgraded to the latest version when a new TBM is deployed.


## Role Distribution

To ensure secure operations under the trustless assumption, we separate the management of FreeTunnelHub and individual tunnels.

### Manager or FreeTunnelHub

- Owns the `owner` permissions for the FreeTunnelHub contract.
- Deploys and upgrades FreeTunnelHub and TunnelBoringMachine contracts.
  
### Manager of each Tunnel

- Owns the `admin` permissions for some TunnelContracts (on different blockchains) of a specific tunnel.
- The operation of existing tunnels and their permissions are entirely independent of FreeTunnelHub and TunnelBoringMachine contracts.
- Tunnels with different names operate independently of each other, ensuring modularity and security across projects.

Each tunnel manager should review the code of FreeTunnelHub and TunnelBoringMachine before opening a tunnel. Once opened, the tunnel’s operation is fully under the control of its `admin` and unaffected by FreeTunnelHub or TBM changes.

After a TBM update, each tunnel `admin` should independently verify the new code and initiate TunnelContract upgrades.

![](./diagrams/multichain_structure.svg)


## Workflow

### Preparation

On each blockchain, the FreeTunnelHub manager should deploy:

- The **FreeTunnelHub** contract.
- The initial **TunnelBoringMachine** contract.

### Opening a Tunnel

1. The tunnel manager needs to request a signature from the FreeTunnelHub manager, authorizing their `admin` address to deploy a TunnelContract with a specific tunnel name.
2. This signature can be used across multiple chains to deploy TunnelContract instances with the same name. Such design can prevent unauthorized parties from deploying tunnels with the same name on other chains before the tunnel manager does.

### Upgrading a Tunnel

1. If a new TunnelContract version is released, the FreeTunnelHub manager will deploy an updated TunnelBoringMachine contract and updates the FreeTunnelHub reference to it.
2. Each tunnel manager should reviews the updated TBM code.
3. Uses the `admin` address to call `upgradeTunnel` on their TunnelContract to complete the upgrade.

The FreeTunnelHub manager cannot directly affect the operation of existing tunnels by upgrading TunnelContract instances. Each tunnel’s upgrade requires explicit action by its own `admin`.
