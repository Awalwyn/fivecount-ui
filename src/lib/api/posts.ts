import { apiCall, isDemoMode } from './client';

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

// Mock posts for demo mode
const MOCK_POSTS: Post[] = [
  {
    id: 'post-1',
    athleteId: 'athlete-1',
    content: 'Just finished an incredible training session! Working on my Yurchenko double pike and it\'s finally clicking. Can\'t wait to compete this at Nationals! 🤸‍♀️',
    postType: 'REGULAR',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
    author: {
      id: 'athlete-1',
      firstName: 'Sarah',
      lastName: 'Chen',
      profilePictureUrl: undefined,
    },
  },
  {
    id: 'post-2',
    athleteId: 'athlete-2',
    content: 'New personal best on floor! All that hard work is paying off.',
    postType: 'SCORE_TILE',
    meetReference: 'Winter Classic|2024-01-15',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    author: {
      id: 'athlete-2',
      firstName: 'Marcus',
      lastName: 'Williams',
      profilePictureUrl: undefined,
    },
  },
  {
    id: 'post-3',
    athleteId: 'athlete-3',
    content: 'So grateful to announce my commitment to Stanford Gymnastics! Thank you to everyone who supported me on this journey. Cardinal forever! ❤️',
    postType: 'REGULAR',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    author: {
      id: 'athlete-3',
      firstName: 'Emma',
      lastName: 'Rodriguez',
      profilePictureUrl: undefined,
    },
  },
  {
    id: 'post-4',
    athleteId: 'athlete-4',
    content: 'Check out this new dismount I\'ve been working on! Coach says it\'s competition ready 💪',
    videoUrl: 'https://example.com/video.mp4',
    postType: 'REGULAR',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
    author: {
      id: 'athlete-4',
      firstName: 'Jordan',
      lastName: 'Kim',
      profilePictureUrl: undefined,
    },
  },
  {
    id: 'post-5',
    athleteId: 'athlete-5',
    content: 'State Championships here we come! The team is looking strong heading into the final week of prep.',
    postType: 'REGULAR',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    author: {
      id: 'athlete-5',
      firstName: 'Tyler',
      lastName: 'Martinez',
      profilePictureUrl: undefined,
    },
  },
  {
    id: 'post-6',
    athleteId: 'athlete-1',
    content: 'Great showing at Regionals! Scored a 9.825 on vault - my highest ever in competition!',
    postType: 'SCORE_TILE',
    meetReference: 'Regional Championships|2024-01-20',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(), // 1.5 days ago
    author: {
      id: 'athlete-1',
      firstName: 'Sarah',
      lastName: 'Chen',
      profilePictureUrl: undefined,
    },
  },
];

// Authenticated endpoints
export async function createPost(data: CreatePostData): Promise<Post> {
  if (isDemoMode()) {
    const newPost: Post = {
      id: `post-${Date.now()}`,
      athleteId: 'demo-user-123',
      ...data,
      createdAt: new Date().toISOString(),
      author: {
        id: 'demo-user-123',
        firstName: 'Alex',
        lastName: 'Johnson',
      },
    };
    return newPost;
  }
  return apiCall<Post>('/posts', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deletePost(postId: string): Promise<void> {
  if (isDemoMode()) {
    console.log('[Demo Mode] Delete post:', postId);
    return;
  }
  return apiCall<void>(`/posts/${postId}`, {
    method: 'DELETE',
  });
}

export async function getMyPosts(userId: string): Promise<Post[]> {
  if (isDemoMode()) {
    return MOCK_POSTS.filter(p => p.athleteId === 'demo-user-123');
  }
  const data = await apiCall<any>(`/users/${userId}/posts`, {
    method: 'GET',
  });
  // Backend returns paginated response, extract content array
  return data.content || [];
}

// Public endpoints
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function getAthletePosts(athleteId: string): Promise<Post[]> {
  if (isDemoMode()) {
    return MOCK_POSTS.filter(p => p.athleteId === athleteId);
  }
  if (!API_BASE_URL) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL is not defined');
  }
  const response = await fetch(`${API_BASE_URL}/api/users/${athleteId}/posts`);
  if (!response.ok) {
    throw new Error(`Failed to fetch athlete posts: ${response.statusText}`);
  }
  const data = await response.json();
  // Backend returns paginated response, extract content array
  return data.content || [];
}

export async function getFeedPosts(): Promise<Post[]> {
  if (isDemoMode()) {
    return MOCK_POSTS;
  }
  if (!API_BASE_URL) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL is not defined');
  }
  const response = await fetch(`${API_BASE_URL}/api/feed`);
  if (!response.ok) {
    throw new Error(`Failed to fetch feed: ${response.statusText}`);
  }
  const data = await response.json();
  // Backend returns paginated response, extract content array
  return data.content || [];
}
