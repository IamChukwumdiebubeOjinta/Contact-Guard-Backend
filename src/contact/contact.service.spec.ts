import { Test, TestingModule } from '@nestjs/testing';
import { ContactService } from './contact.service';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  BadRequestException,
  // InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateContactDto, UpdateContactDto } from './dto';
import { Prisma } from '@prisma/client';

jest.mock('@app/prisma/prisma.service');

describe('ContactService', () => {
  let service: ContactService;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContactService, PrismaService],
    }).compile();

    service = module.get<ContactService>(ContactService);
    prismaService = module.get(PrismaService) as jest.Mocked<PrismaService>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createContact', () => {
    it('should create a contact', async () => {
      const createContactDto: CreateContactDto = {
        fullname: 'John Doe',

        phonenumber: '1234567890',
        companyName: 'Company Name',
      };
      const userId = 'user123';

      prismaService.contact.create = jest
        .fn()
        .mockResolvedValue({ id: 'contact123', ...createContactDto, userId });

      const result = await service.createContact(userId, createContactDto);

      expect(result).toEqual({ id: 'contact123', ...createContactDto, userId });
      expect(prismaService.contact.create).toHaveBeenCalledWith({
        data: { ...createContactDto, userId },
      });
    });

    it('should throw BadRequestException if contact already exists', async () => {
      const createContactDto: CreateContactDto = {
        fullname: 'John Doe',

        phonenumber: '1234567890',
        companyName: 'Company Name',
      };
      const userId = 'user123';

      prismaService.contact.create = jest.fn().mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('', {
          code: 'P2002',
          clientVersion: '',
        }),
      );

      await expect(
        service.createContact(userId, createContactDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getAllContacts', () => {
    it('should return all contacts for a user', async () => {
      const userId = 'user123';
      const mockContacts = [
        {
          id: 'contact1',
          fullname: 'John Doe',

          phonenumber: '1234567890',
          companyName: 'Company Name',
          userId,
        },
        {
          id: 'contact2',
          fullname: null,
          companyName: 'jane productions',
          phonenumber: '0987654321',
          userId,
        },
      ];

      prismaService.contact.findMany = jest
        .fn()
        .mockResolvedValue(mockContacts);

      const result = await service.getAllContacts(userId);

      expect(result).toEqual([
        mockContacts[0],
        { ...mockContacts[1], fullname: 'Unknown' },
      ]);
      expect(prismaService.contact.findMany).toHaveBeenCalledWith({
        where: { userId },
      });
    });
  });

  describe('getContactById', () => {
    it('should return a contact by id', async () => {
      const userId = 'user123';
      const contactId = 'contact123';
      const mockContact = {
        id: contactId,
        fullname: 'John Doe',

        phonenumber: '1234567890',
        companyName: 'Company Name',
        userId,
      };

      prismaService.contact.findFirst = jest
        .fn()
        .mockResolvedValue(mockContact);

      const result = await service.getContactById(userId, contactId);

      expect(result).toEqual(mockContact);
      expect(prismaService.contact.findFirst).toHaveBeenCalledWith({
        where: { id: contactId, userId },
      });
    });

    it('should throw NotFoundException if contact is not found', async () => {
      const userId = 'user123';
      const contactId = 'nonexistent';

      prismaService.contact.findFirst = jest.fn().mockResolvedValue(null);

      await expect(service.getContactById(userId, contactId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateContact', () => {
    it('should update a contact', async () => {
      const userId = 'user123';
      const contactId = 'contact123';
      const updateContactDto: UpdateContactDto = {
        fullname: 'Jane Doe',
        phonenumber: '+2345678900896', // Add the required phonenumber field
        companyName: 'Example Corp', // Optional field
      };
      const updatedContact = {
        id: contactId,
        ...updateContactDto,
        email: 'jane@example.com',
        userId,
      };

      prismaService.contact.update = jest
        .fn()
        .mockResolvedValue(updatedContact);

      const result = await service.updateContact(
        userId,
        contactId,
        updateContactDto,
      );

      expect(result).toEqual(updatedContact);
      expect(prismaService.contact.update).toHaveBeenCalledWith({
        where: { id: contactId, userId },
        data: updateContactDto,
      });
    });

    it('should throw NotFoundException if contact is not found', async () => {
      const userId = 'user123';
      const contactId = 'nonexistent';
      const updateContactDto: UpdateContactDto = {
        fullname: 'Jane Doe',
        phonenumber: '+2345678900896', // Add the required phonenumber field
        companyName: 'Example Corp', // Optional field
      };

      prismaService.contact.update = jest.fn().mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('', {
          code: 'P2025',
          clientVersion: '',
        }),
      );

      await expect(
        service.updateContact(userId, contactId, updateContactDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteContact', () => {
    it('should delete a contact', async () => {
      const userId = 'user123';
      const contactId = 'contact123';

      prismaService.contact.delete = jest.fn().mockResolvedValue(undefined);

      await service.deleteContact(userId, contactId);

      expect(prismaService.contact.delete).toHaveBeenCalledWith({
        where: { id: contactId, userId },
      });
    });

    it('should throw NotFoundException if contact is not found', async () => {
      const userId = 'user123';
      const contactId = 'nonexistent';

      prismaService.contact.delete = jest.fn().mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('', {
          code: 'P2025',
          clientVersion: '',
        }),
      );

      await expect(service.deleteContact(userId, contactId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
