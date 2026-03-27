import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PinataService } from './pinata.service';
import { PinataController } from './pinata.controller';
import { BlockchainModule } from '../blockchain/blockchain.module';

@Module({
  imports: [ConfigModule, BlockchainModule],
  controllers: [PinataController],
  providers: [PinataService],
  exports: [PinataService],
})
export class PinataModule {}
