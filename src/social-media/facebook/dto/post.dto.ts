export class CreatePostDto {
  pageId: string;
  title?: string;
  message?: string;
  imageUrl?: string;
    hashtags?: string[];
}


export class DirectPostDto {
  userId: string
  message: string
  title?: string
  imageUrl?: string
  hashtags?: string[]
}