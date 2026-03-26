import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PinataService } from './pinata.service';
import { PinataController } from './pinata.controller';

@Module({
  imports: [ConfigModule],
  controllers: [PinataController],
  providers: [PinataService],
  exports: [PinataService],
})
export class PinataModule {}
