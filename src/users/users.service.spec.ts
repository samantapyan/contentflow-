import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: { user: { create: jest.Mock; findUnique: jest.Mock } };

  beforeEach(async () => {
    prisma = { user: { create: jest.fn(), findUnique: jest.fn() } };

    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(UsersService);
  });

  describe('create', () => {
    it('hashes the password before persisting', async () => {
      prisma.user.create.mockImplementation(({ data }) =>
        Promise.resolve({
          id: '1',
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      );

      await service.create({ email: 'a@b.com', password: 'password123' });

      const passedData = prisma.user.create.mock.calls[0][0].data;
      expect(passedData.passwordHash).not.toBe('password123');
      expect(bcrypt.compareSync('password123', passedData.passwordHash)).toBe(
        true,
      );
    });

    it('throws ConflictException on duplicate email (P2002)', async () => {
      prisma.user.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('duplicate', {
          code: 'P2002',
          clientVersion: 'x',
        }),
      );

      await expect(
        service.create({ email: 'a@b.com', password: 'password123' }),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('findById', () => {
    it('throws NotFoundException when the user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.findById('missing')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});
