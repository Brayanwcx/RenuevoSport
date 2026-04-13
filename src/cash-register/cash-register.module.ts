import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CashRegister } from './entities/cash-register.entity';
import { CashMovement } from './entities/cash-movement.entity';
import { CashRegisterService } from './services/cash-register.service';
import { CashRegisterController } from './controllers/cash-register.controller';

@Module({
    imports: [TypeOrmModule.forFeature([CashRegister, CashMovement])],
    controllers: [CashRegisterController],
    providers: [CashRegisterService],
    exports: [CashRegisterService],
})
export class CashRegisterModule {}
