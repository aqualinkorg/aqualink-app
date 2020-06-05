import { Test, TestingModule } from '@nestjs/testing';
import { ReefsController } from './reefs.controller';

describe('Reefs Controller', () => {
  let controller: ReefsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReefsController],
    }).compile();

    controller = module.get<ReefsController>(ReefsController);
  });

  // it('should be defined', () => {
  //   expect(controller).toBeDefined();
  // });
});
