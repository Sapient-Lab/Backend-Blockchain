import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import NftABI from './NftABI.json';

@Injectable()
export class BlockchainService implements OnModuleInit {
  private readonly logger = new Logger(BlockchainService.name);

  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private contract: ethers.Contract;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const rpcUrl = this.configService.get<string>('RPC_URL');
    const privateKey = this.configService.get<string>('PRIVATE_KEY');
    const contractAddress = this.configService.get<string>('CONTRACT_ADDRESS');

    if (!rpcUrl) {
      throw new Error('RPC_URL no está configurado en las variables de entorno');
    }
    if (!privateKey) {
      throw new Error(
        'PRIVATE_KEY no está configurado en las variables de entorno',
      );
    }
    if (!contractAddress) {
      throw new Error(
        'CONTRACT_ADDRESS no está configurado en las variables de entorno',
      );
    }

    // 1️⃣ Provider: conexión HTTP a la blockchain vía RPC
    this.provider = new ethers.JsonRpcProvider(rpcUrl);

    // 2️⃣ Wallet auto-custodia: firma transacciones con la clave privada
    this.wallet = new ethers.Wallet(privateKey, this.provider);

    // 3️⃣ Instancia del contrato NFT vinculada al wallet firmante
    this.contract = new ethers.Contract(contractAddress, NftABI, this.wallet);

    this.logger.log(
      `✅ Blockchain service inicializado. Wallet: ${this.wallet.address}`,
    );
  }

  /**
   * Retorna la dirección pública de la wallet auto-custodia
   */
  getWalletAddress(): string {
    return this.wallet.address;
  }

  /**
   * Retorna el balance de la wallet en STT (token nativo de Somnia)
   */
  async getWalletBalance(): Promise<{ balance: string; balanceWei: string }> {
    const raw = await this.provider.getBalance(this.wallet.address);
    return {
      balance: ethers.formatEther(raw),
      balanceWei: raw.toString(),
    };
  }

  /**
   * Acuña un NFT en el contrato.
   * La dirección receptora es la misma wallet auto-custodia.
   * @param uri - URI de los metadatos (public_url devuelto por upload-json)
   */
  async safeMint(uri: string): Promise<{
    success: boolean;
    tokenId: string;
    transactionHash: string;
    blockNumber: number;
    gasUsed: string;
    to: string;
    uri: string;
  }> {
    const toAddress = this.wallet.address;

    this.logger.log(`🎨 Iniciando safeMint → to: ${toAddress}, uri: ${uri}`);

    const tx: ethers.ContractTransactionResponse =
      await this.contract.safeMint(toAddress, uri);

    this.logger.log(`📡 Transacción enviada: ${tx.hash}`);

    const receipt = await tx.wait();

    if (!receipt) {
      throw new Error('No se recibió confirmación de la transacción');
    }

    // Extraer tokenId del evento Transfer emitido por el contrato
    let tokenId = 'N/A';
    try {
      const transferEvent = receipt.logs
        .map((log) => {
          try {
            return this.contract.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .find((parsed) => parsed?.name === 'Transfer');

      if (transferEvent) {
        tokenId = transferEvent.args[2].toString();
      }
    } catch {
      // Si no se puede parsear el evento, dejamos 'N/A'
    }

    this.logger.log(
      `✅ NFT minteado. TokenId: ${tokenId}, Block: ${receipt.blockNumber}`,
    );

    return {
      success: true,
      tokenId,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      to: toAddress,
      uri,
    };
  }

  /**
   * Obtiene la URI de metadatos de un token
   * @param tokenId - ID del token
   */
  async getTokenURI(tokenId: number): Promise<string> {
    return await this.contract.tokenURI(tokenId);
  }
}
