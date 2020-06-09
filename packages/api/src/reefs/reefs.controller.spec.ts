import { Test, TestingModule } from '@nestjs/testing';
import { ReefsController } from './reefs.controller';
import { ReefRepository } from './reefs.repository';

describe('Reefs Controller', () => {
  let controller: ReefsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      // Mock version of ReefRepository - it will inject the `useValue` as the service in the controller, so you can add
      // mock implementations there.
      providers: [{ provide: ReefRepository, useValue: {} }],
      // You could also provide it the real ReefRepository, but then you'll also have to take care of providing *its*
      // dependencies too (e.g. with an `imports` block.
      // providers: [ReefRepository],
      controllers: [ReefsController],
    }).compile();

    controller = module.get<ReefsController>(ReefsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
