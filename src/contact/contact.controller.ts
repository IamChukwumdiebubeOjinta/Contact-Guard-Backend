import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateContactDto, UpdateContactDto } from './dto';
import { ContactService } from './contact.service';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';

@ApiTags('Contacts')
@Controller('contact')
@UseGuards(JwtAuthGuard)
export class ContactController {
  constructor(private contactService: ContactService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new contact' })
  @ApiResponse({
    status: 201,
    description: 'The contact has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  async createContact(
    @Req() req: Request,
    @Body() createContactDto: CreateContactDto,
  ) {
    if (!req.user) {
      throw new UnauthorizedException('User not authenticated');
    }

    const userId = req.user['id'];
    return this.contactService.createContact(userId, createContactDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all contacts' })
  @ApiResponse({
    status: 200,
    description: 'Return all contacts',
  })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  async getAllContacts(@Req() req: Request) {
    const userId = req.user['id'];
    return this.contactService.getAllContacts(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get all contacts for a user' })
  @ApiResponse({
    status: 200,
    description: 'Return all contacts for the specified user.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  async getContactById(@Req() req: Request, @Param('id') id: string) {
    const userId = req.user['id'];
    return this.contactService.getContactById(userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a contact by ID' })
  @ApiResponse({
    status: 200,
    description: 'The contact has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Contact not found.' })
  async updateContact(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updateContactDto: UpdateContactDto,
  ) {
    const userId = req.user['id'];
    return this.contactService.updateContact(userId, id, updateContactDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a contact by ID' })
  @ApiResponse({
    status: 200,
    description: 'The contact has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Contact not found.' })
  async deleteContact(@Req() req: Request, @Param('id') id: string) {
    const userId = req.user['id'];
    await this.contactService.deleteContact(userId, id);
    return { message: 'Contact deleted successfully' };
  }
}
