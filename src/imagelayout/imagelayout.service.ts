import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
const ImageKit = require('imagekit');
import fetch from 'node-fetch';
import sharp from 'sharp';
import { LayoutDto } from './layout.dto';

@Injectable()
export class ImagelayoutService {
  private prisma = new PrismaClient();
  private imagekit: any;

  constructor() {
    this.imagekit = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY || '',
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || '',
    });
  }

  async createLayout(dto: LayoutDto): Promise<{ originalUrl: string; imageWithTextUrl: string }> {
    try {
      if (!dto.title || !dto.description) {
        throw new BadRequestException('Title and description are required');
      }

      const availableImages = await this.prisma.image.findMany({
        where: { text: false },
        select: { id: true, file: true }
      });

      if (!availableImages.length) {
        throw new NotFoundException('No available images found');
      }

      const randomImage = availableImages[Math.floor(Math.random() * availableImages.length)];

      if (!randomImage.file || randomImage.file.trim() === '') {
        throw new BadRequestException('Image file is empty');
      }

      let imageUrl: string;

      if (randomImage.file.startsWith('http://') || randomImage.file.startsWith('https://')) {
        imageUrl = randomImage.file;
      } else {
        const baseUrl = process.env.IMAGEKIT_URL_ENDPOINT || 'http://localhost:3000';
        const filePath = randomImage.file.startsWith('/') ? randomImage.file : `/${randomImage.file}`;
        imageUrl = `${baseUrl}${filePath}`;
      }

      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new BadRequestException('Failed to fetch image');
      }
      const imageBuffer = await response.arrayBuffer();

      const image = sharp(Buffer.from(imageBuffer));
      const metadata = await image.metadata();
      const width = metadata.width || 800;
      const height = metadata.height || 600;

      const titleFontSize = Math.floor(width / 15);
      const descFontSize = Math.floor(width / 25);
      const titleY = height * 0.4;
      const descY = height * 0.55;

      const svgOverlay = `
        <svg width="${width}" height="${height}">
          <rect width="${width}" height="${height}" fill="black" opacity="0.4"/>
          
          <text 
            x="50%" 
            y="${titleY}" 
            font-family="Arial, sans-serif" 
            font-size="${titleFontSize}" 
            font-weight="bold"
            fill="white" 
            text-anchor="middle"
            stroke="black"
            stroke-width="3"
          >${this.escapeXml(dto.title)}</text>
          
          <text 
            x="50%" 
            y="${descY}" 
            font-family="Arial, sans-serif" 
            font-size="${descFontSize}" 
            fill="white" 
            text-anchor="middle"
            stroke="black"
            stroke-width="2"
          >${this.escapeXml(dto.description)}</text>
        </svg>
      `;

      const logoUrl = 'https://cdn.vectorstock.com/i/1000v/44/02/circle-logo-vector-41774402.jpg';
      const logoSize = Math.floor(width / 6);
      const logoMargin = Math.floor(width / 40);
      const logoBuffer = await this.getCircleLogoBuffer(logoUrl, logoSize);

      const outputBuffer = await sharp(Buffer.from(imageBuffer))
        .composite([
          { input: logoBuffer, top: logoMargin, left: logoMargin },
          { input: Buffer.from(svgOverlay), top: 0, left: 0 }
        ])
        .jpeg({ quality: 90 })
        .toBuffer();

      const uploadResponse: any = await this.imagekit.upload({
        file: outputBuffer.toString('base64'),
        fileName: `layout-${Date.now()}.jpg`,
        folder: '/layouts',
        useUniqueFileName: true,
      });

      await this.markImageAsUsed(randomImage.id);

      return {
        originalUrl: imageUrl,
        imageWithTextUrl: uploadResponse.url
      };

    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Layout creation error:', error);
      throw new BadRequestException('Failed to create layout: ' + error.message);
    }
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  private async markImageAsUsed(imageId: string): Promise<void> {
    try {
      await this.prisma.image.update({
        where: { id: imageId },
        data: { text: true }
      });
    } catch (error) {
      console.error('Failed to update image:', error);
    }
  }

  private async getCircleLogoBuffer(url: string, size: number): Promise<Buffer> {
    const res = await fetch(url);
    const buf = Buffer.from(await res.arrayBuffer());
    const resized = await sharp(buf).resize(size, size).toBuffer();
    const circle = Buffer.from(
      `<svg width="${size}" height="${size}">
        <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="white"/>
      </svg>`
    );
    const masked = await sharp(resized).composite([{ input: circle, blend: 'dest-in' }]).png().toBuffer();
    return masked;
  }
}
