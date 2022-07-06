import { Global, Module } from '@nestjs/common';

@Global()
@Module({
  providers: [
    {
      provide: 'default_KnexModuleConnectionToken',
      useValue: {},
    },
  ],
})
export class TestModule {}
