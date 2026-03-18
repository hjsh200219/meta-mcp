import { z } from 'zod';

export const CreateAdCreativeSchema = {
  ad_account_id: z.string().describe('Ad account ID'),
  name: z.string().describe('Creative name'),
  instagram_actor_id: z.string().describe('Instagram account ID'),
  page_id: z.string().describe('Facebook page ID'),
  image_url: z.string().url().optional().describe('Image URL for image ad'),
  video_id: z.string().optional().describe('Video ID for video ad'),
  message: z.string().describe('Ad message/caption'),
  link: z.string().url().optional().describe('Link URL'),
  call_to_action: z
    .object({
      type: z.string(),
      value: z.record(z.string(), z.unknown()).optional(),
    })
    .optional()
    .describe('Call to action'),
};

export const GetAdCreativeSchema = {
  creative_id: z.string().describe('Creative ID'),
};
