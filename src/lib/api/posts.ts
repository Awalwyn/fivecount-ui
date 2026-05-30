import { apiCall } from './client';

export type PostType = 'REGULAR' | 'SCORE_TILE';

export interface PostAuthor {
  id: string;
  firstName: string;
  lastName: string;
  profilePictureUrl?: string;
}

export interface Post {
  id: string;
  athleteId: string;
  content?: string;
  imageUrl?: string;
  videoUrl?: string;
  postType: PostType;
  meetReference?: string; // "meetName|meetDate"
  createdAt: string;
  author?: PostAuthor;
}

export interface CreatePostData {
  content?: string;
  imageUrl?: string;
  videoUrl?: string;
  postType: PostType;
  meetReference?: string;
}

// Authenticated endpoints
export async function createPost(data: CreatePostData): Promise<Post> {
  return apiCall<Post>('/posts', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deletePost(postId: string): Promise<void> {
  return apiCall<void>(`/posts/${postId}`, {
    method: 'DELETE',
  });
}

export async function getMyPosts(userId: string): Promise<Post[]> {
  const data = await apiCall<any>(`/users/${userId}/posts`, {
    method: 'GET',
  });
  // Backend returns paginated response, extract content array
  return data.content || [];
}

// Public endpoints
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL is not defined');
}

export async function getAthletePosts(athleteId: string): Promise<Post[]> {
  const response = await fetch(`${API_BASE_URL}/api/users/${athleteId}/posts`);
  if (!response.ok) {
    throw new Error(`Failed to fetch athlete posts: ${response.statusText}`);
  }
  const data = await response.json();
  // Backend returns paginated response, extract content array
  return data.content || [];
}

export async function getFeedPosts(): Promise<Post[]> {
  const response = await fetch(`${API_BASE_URL}/api/feed`);
  if (!response.ok) {
    throw new Error(`Failed to fetch feed: ${response.statusText}`);
  }
  const data = await response.json();
  // Backend returns paginated response, extract content array
  return data.content || [];
}
