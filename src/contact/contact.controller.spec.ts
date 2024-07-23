import { Test, TestingModule } from '@nestjs/testing';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';
import { CreateContactDto, UpdateContactDto } from './dto';
import { UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '@app/prisma/prisma.service';

describe('ContactController', () => {
  let controller: ContactController;
  let service: ContactService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContactController],
      providers: [
        {
          provide: ContactService,
          useValue: {
            createContact: jest.fn(),
            getAllContacts: jest.fn(),
            getContactById: jest.fn(),
            updateContact: jest.fn(),
            deleteContact: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {}, // Mock PrismaService
        },
      ],
    }).compile();

    controller = module.get<ContactController>(ContactController);
    service = module.get<ContactService>(ContactService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createContact', () => {
    it('should create a contact', async () => {
      const createContactDto: CreateContactDto = {
        fullname: 'John Doe',

        phonenumber: '1234567890',
        companyName: 'Company Name',
      };
      const req = { user: { userId: 'user123' } };

      await controller.createContact(req as any, createContactDto);

      expect(service.createContact).toHaveBeenCalledWith(
        'user123',
        createContactDto,
      );
    });

    it('should throw UnauthorizedException if user is not authenticated', async () => {
      const createContactDto: CreateContactDto = {
        fullname: 'John Doe',

        phonenumber: '1234567890',
        companyName: 'Company Name',
      };
      const req = { user: undefined };

      await expect(
        controller.createContact(req as any, createContactDto),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getAllContacts', () => {
    it('should get all contacts for a user', async () => {
      const req = { user: { userId: 'user123' } };

      await controller.getAllContacts(req as any);

      expect(service.getAllContacts).toHaveBeenCalledWith('user123');
    });
  });

  describe('getContactById', () => {
    it('should get a contact by id', async () => {
      const req = { user: { id: 'user123' } };
      const contactId = 'contact123';

      await controller.getContactById(req as any, contactId);

      expect(service.getContactById).toHaveBeenCalledWith('user123', contactId);
    });
  });

  describe('updateContact', () => {
    it('should update a contact', async () => {
      const updateContactDto: UpdateContactDto = {
        fullname: 'Jane Doe',
        phonenumber: '9876543210',
        companyName: 'Updated Company Name',
      };
      const req = { user: { userId: 'user123' } };
      const contactId = 'contact123';

      await controller.updateContact(req as any, contactId, updateContactDto);

      expect(service.updateContact).toHaveBeenCalledWith(
        'user123',
        contactId,
        updateContactDto,
      );
    });
  });

  describe('deleteContact', () => {
    it('should delete a contact', async () => {
      const req = { user: { userId: 'user123' } };
      const contactId = 'contact123';

      await controller.deleteContact(req as any, contactId);

      expect(service.deleteContact).toHaveBeenCalledWith('user123', contactId);
    });
  });
});
