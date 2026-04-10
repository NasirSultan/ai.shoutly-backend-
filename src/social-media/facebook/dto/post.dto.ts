export class CreatePostDto {
  pageId: string;
  title?: string;
  message?: string;
  imageUrl?: string;
    hashtags?: string[];
}