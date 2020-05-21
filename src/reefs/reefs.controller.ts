import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { ReefDto } from './interfaces/reef.dto';

@Controller('reefs')
export class ReefsController {
    @Get()
    getReefs() {
        return 'we get all reefs';
    }

    @Post()
    create(@Body() reefDto: ReefDto) {
        return reefDto;
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return `we get the reef with the id ${id}`;
    }

    @Put(':id')
    update(@Param('id') id: string) {
        return `we update the reef with the id ${id}`;
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return `we delete the reef with the id ${id}`;
    }
}