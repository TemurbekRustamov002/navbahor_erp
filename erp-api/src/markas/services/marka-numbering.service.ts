import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProductType, MarkaDepartment, SexType } from '@prisma/client';

@Injectable()
export class MarkaNumberingService {
  constructor(private prisma: PrismaService) {}

  /**
   * Keyingi marka raqamini olish
   * Arrali sex: 1-200
   * Valikli sex: 201-400  
   * Lint/Siklon/Uluk: 1, 2, 3... (ketma-ket)
   */
  async getNextMarkaNumber(productType: ProductType, department: MarkaDepartment): Promise<number> {
    if (productType === ProductType.TOLA) {
      return this.getTolaNextNumber(department);
    } else {
      return this.getUniversalNextNumber(productType);
    }
  }

  /**
   * TOLA uchun: Arrali (1-200) va Valikli (201-400)
   */
  private async getTolaNextNumber(department: MarkaDepartment): Promise<number> {
    let minNumber: number;
    let maxNumber: number;

    if (department === MarkaDepartment.ARRALI_SEX) {
      minNumber = 1;
      maxNumber = 200;
    } else if (department === MarkaDepartment.VALIKLI_SEX) {
      minNumber = 201;
      maxNumber = 400;
    } else {
      throw new Error(`Invalid department ${department} for TOLA product type`);
    }

    // Eng katta raqamni topish
    const lastMarka = await this.prisma.marka.findFirst({
      where: {
        productType: ProductType.TOLA,
        department,
        number: {
          gte: minNumber,
          lte: maxNumber
        }
      },
      orderBy: { number: 'desc' }
    });

    const nextNumber = lastMarka ? lastMarka.number + 1 : minNumber;

    if (nextNumber > maxNumber) {
      throw new Error(`${department} uchun marka raqamlari tugab qoldi. Maksimal: ${maxNumber}`);
    }

    return nextNumber;
  }

  /**
   * LINT, SIKLON, ULUK uchun ketma-ket numeratsiya
   */
  private async getUniversalNextNumber(productType: ProductType): Promise<number> {
    // Barcha LINT, SIKLON, ULUK markalarini birgalikda hisoblash
    const lastMarka = await this.prisma.marka.findFirst({
      where: {
        productType: {
          in: [ProductType.LINT, ProductType.SIKLON, ProductType.ULUK]
        },
        department: MarkaDepartment.UNIVERSAL
      },
      orderBy: { number: 'desc' }
    });

    return lastMarka ? lastMarka.number + 1 : 1;
  }

  /**
   * Marka raqami mavjudligini tekshirish
   */
  async isMarkaNumberExists(number: number, department: MarkaDepartment): Promise<boolean> {
    const count = await this.prisma.marka.count({
      where: { number, department }
    });
    return count > 0;
  }

  /**
   * Bo'lim va mahsulot turiga qarab department aniqlash
   */
  static getDepartment(productType: ProductType, sex?: SexType): MarkaDepartment {
    if (productType === ProductType.TOLA) {
      if (sex === SexType.ARRALI) return MarkaDepartment.ARRALI_SEX;
      if (sex === SexType.VALIKLI) return MarkaDepartment.VALIKLI_SEX;
      throw new Error('TOLA uchun sex majburiy');
    }
    
    return MarkaDepartment.UNIVERSAL;
  }

  /**
   * Marka almashish sabablarini tekshirish
   */
  async shouldSwitchMarka(currentMarka: any, newToyData: any): Promise<string | null> {
    // 220 ta toy to'ldi
    if (currentMarka.used >= currentMarka.capacity) {
      return 'capacity_full';
    }

    // PTM o'zgargan
    if (newToyData.ptm && newToyData.ptm !== currentMarka.ptm) {
      return 'ptm_changed';
    }

    // Seleksion navi o'zgargan
    if (newToyData.selection && newToyData.selection !== currentMarka.selection) {
      return 'selection_changed';
    }

    // Terim turi o'zgargan
    if (newToyData.pickingType && newToyData.pickingType !== currentMarka.pickingType) {
      return 'picking_changed';
    }

    return null;
  }
}