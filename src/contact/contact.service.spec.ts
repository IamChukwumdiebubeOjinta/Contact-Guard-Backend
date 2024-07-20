// src/contact/contact.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ContactService } from './contact.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('ContactService', () => {
  let service: ContactService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContactService, PrismaService],
    }).compile();

    service = module.get<ContactService>(ContactService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new contact', async () => {
    const contact = {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '1234567890',
      userId: '1',
    };
    prisma.contact.create = jest.fn().mockReturnValue(contact);

    const result = await service.createContact(
      '1',
      'John',
      'Doe',
      '1234567890',
    );
    expect(result).toEqual(contact);
  });

  it('should update a contact', async () => {
    const contact = {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '1234567890',
    };
    prisma.contact.update = jest.fn().mockReturnValue(contact);

    const result = await service.updateContact(
      '1',
      'John',
      'Doe',
      '1234567890',
    );
    expect(result).toEqual(contact);
  });
});
