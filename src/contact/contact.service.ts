import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateContactDto, UpdateContactDto } from './dto';
import { Contact, Prisma } from '@prisma/client';

@Injectable()
export class ContactService {
  constructor(private readonly prisma: PrismaService) {}

  async createContact(
    userId: string,
    createContactDto: CreateContactDto,
  ): Promise<Contact> {
    try {
      return await this.prisma.contact.create({
        data: {
          ...createContactDto,
          userId,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException(
            'A contact with this phone number or email already exists',
          );
        }
      }
      throw error;
    }
  }

  async getAllContacts(userId: string): Promise<Contact[]> {
    return this.prisma.contact.findMany({
      where: { userId },
    });
  }

  async getContactById(userId: string, contactId: string): Promise<Contact> {
    const contact = await this.prisma.contact.findFirst({
      where: { id: contactId, userId },
    });

    if (!contact) {
      throw new NotFoundException(`Contact with ID ${contactId} not found`);
    }

    return contact;
  }

  async updateContact(
    userId: string,
    contactId: string,
    updateContactDto: UpdateContactDto,
  ): Promise<Contact> {
    try {
      return await this.prisma.contact.update({
        where: { id: contactId, userId },
        data: updateContactDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Contact with ID ${contactId} not found`);
        }
        if (error.code === 'P2002') {
          throw new BadRequestException(
            'A contact with this phone number or email already exists',
          );
        }
      }
      throw error;
    }
  }

  async deleteContact(userId: string, contactId: string): Promise<void> {
    try {
      await this.prisma.contact.delete({
        where: { id: contactId, userId },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Contact with ID ${contactId} not found`);
        }
      }
      throw error;
    }
  }
}
