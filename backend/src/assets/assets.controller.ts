import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AssetsService } from './assets.service';

@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post(':userId')
  create(@Param('userId') userId: string, @Body() createAssetDto: any) {
    return this.assetsService.create(userId, createAssetDto);
  }

  @Get(':userId')
  findAll(@Param('userId') userId: string) {
    return this.assetsService.findAll(userId);
  }

  @Get(':userId/:assetId/history')
  getHistory(
    @Param('userId') userId: string, 
    @Param('assetId') assetId: string
  ) {
    return this.assetsService.getAssetHistory(userId, assetId);
  }

  @Get(':userId/summary') // Yeni Endpoint
  getSummary(@Param('userId') userId: string) {
    return this.assetsService.getNetWorthSummary(userId);
  }
}