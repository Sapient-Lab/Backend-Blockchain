import { Test, TestingModule } from '@nestjs/testing';
import { PinataService } from './pinata.service';
import { ConfigService } from '@nestjs/config';

describe('PinataService', () => {
  let service: PinataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PinataService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'PINATA_JWT') return 'test_jwt_token';
              if (key === 'GATEWAY_URL') return 'https://test.gateway.url';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<PinataService>(PinataService);
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });
});
