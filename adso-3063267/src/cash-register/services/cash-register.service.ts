import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CashRegister } from '../entities/cash-register.entity';
import { CashMovement } from '../entities/cash-movement.entity';
import {
    OpenCashRegisterDto,
    CloseCashRegisterDto,
    CreateCashMovementDto,
} from '../dtos/cash-register.dto';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class CashRegisterService {
    constructor(
        @InjectRepository(CashRegister) private cashRegisterRepo: Repository<CashRegister>,
        @InjectRepository(CashMovement) private cashMovementRepo: Repository<CashMovement>,
    ) {}

    async findAll() {
        return this.cashRegisterRepo.find({
            relations: ['openedBy', 'closedBy', 'movements'],
            order: { openedAt: 'DESC' },
        });
    }

    async findOne(id: number) {
        const cashRegister = await this.cashRegisterRepo.findOne({
            where: { id },
            relations: ['openedBy', 'closedBy', 'movements', 'movements.user'],
        });
        if (!cashRegister) {
            throw new NotFoundException(`Cash Register #${id} not found`);
        }
        return cashRegister;
    }

    async findCurrentOpen() {
        const openRegister = await this.cashRegisterRepo.findOne({
            where: { status: 'open' },
            relations: ['openedBy', 'movements', 'movements.user'],
        });
        if (!openRegister) {
            throw new NotFoundException('No hay caja abierta actualmente');
        }
        return openRegister;
    }

    async open(dto: OpenCashRegisterDto, user: User) {
        // Verificar que no haya otra caja abierta
        const existingOpen = await this.cashRegisterRepo.findOne({
            where: { status: 'open' },
        });
        if (existingOpen) {
            throw new BadRequestException('Ya hay una caja abierta. Ciérrela antes de abrir otra.');
        }

        const cashRegister = this.cashRegisterRepo.create({
            openingAmount: dto.openingAmount,
            notes: dto.notes,
            openedBy: user,
            status: 'open',
        });
        return this.cashRegisterRepo.save(cashRegister);
    }

    async close(dto: CloseCashRegisterDto, user: User) {
        const cashRegister = await this.cashRegisterRepo.findOne({
            where: { status: 'open' },
            relations: ['movements'],
        });
        if (!cashRegister) {
            throw new NotFoundException('No hay caja abierta para cerrar');
        }

        // Calcular monto esperado: apertura + ingresos - egresos
        let totalIncome = 0;
        let totalExpense = 0;
        for (const movement of cashRegister.movements) {
            if (movement.type === 'income') {
                totalIncome += Number(movement.amount);
            } else {
                totalExpense += Number(movement.amount);
            }
        }

        const expectedAmount = Number(cashRegister.openingAmount) + totalIncome - totalExpense;

        cashRegister.closingAmount = dto.closingAmount;
        cashRegister.expectedAmount = expectedAmount;
        cashRegister.difference = Number(dto.closingAmount) - expectedAmount;
        cashRegister.status = 'closed';
        cashRegister.closedAt = new Date();
        cashRegister.closedBy = user;
        if (dto.notes) {
            cashRegister.notes = cashRegister.notes
                ? `${cashRegister.notes} | Cierre: ${dto.notes}`
                : `Cierre: ${dto.notes}`;
        }

        return this.cashRegisterRepo.save(cashRegister);
    }

    async addMovement(dto: CreateCashMovementDto, user: User) {
        const cashRegister = await this.cashRegisterRepo.findOne({
            where: { status: 'open' },
        });
        if (!cashRegister) {
            throw new BadRequestException('No hay caja abierta. Abra una caja primero.');
        }

        const movement = this.cashMovementRepo.create({
            ...dto,
            cashRegister,
            user,
        });
        return this.cashMovementRepo.save(movement);
    }

    async addSaleMovement(amount: number, invoiceNumber: string, user: User) {
        const cashRegister = await this.cashRegisterRepo.findOne({
            where: { status: 'open' },
        });
        if (!cashRegister) {
            return; // Si no hay caja abierta, no registrar movimiento (ventas con tarjeta por ejemplo)
        }

        const movement = this.cashMovementRepo.create({
            type: 'income',
            amount,
            reason: `Venta factura ${invoiceNumber}`,
            cashRegister,
            user,
        });
        return this.cashMovementRepo.save(movement);
    }
}
