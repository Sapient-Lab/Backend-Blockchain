import { Test, TestingModule } from '@nestjs/testing';
import { PinataController } from './pinata.controller';
import { PinataService } from './pinata.service';

describe('PinataController', () => {
  let controller: PinataController;
  let service: PinataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PinataController],
      providers: [
        {
          provide: PinataService,
          useValue: {
            uploadFile: jest.fn(),
            uploadJson: jest.fn(),
            getFile: jest.fn(),
            getJson: jest.fn(),
            listFiles: jest.fn(),
            deleteFile: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PinataController>(PinataController);
    service = module.get<PinataService>(PinataService);
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });
});
