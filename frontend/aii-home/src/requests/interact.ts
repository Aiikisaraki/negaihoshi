import apiClient from './api';

export interface LikeCountResp { count: number }
export interface CommentsListResp { comments: Array<{ id: number; content_id: number; is_post: boolean; user_id: number; content: string; ctime: number }> }

export const interactApi = {
  like: (contentId: number, isPost: boolean) => apiClient.post('/interact/like', { content_id: contentId, is_post: isPost }) as Promise<{ code: number; message: string; data: { liked: boolean; count: number } }>,
  unlike: (contentId: number, isPost: boolean) => apiClient.delete('/interact/like', { data: { content_id: contentId, is_post: isPost } }) as Promise<{ code: number; message: string; data: { liked: boolean; count: number } }>,
  likeCount: (contentId: number, isPost: boolean) => apiClient.get(`/interact/likes/count?content_id=${contentId}&is_post=${isPost}`) as Promise<{ code: number; message: string; data: LikeCountResp }>,
  isLiked: (contentId: number, isPost: boolean) => apiClient.get(`/interact/likes/is-liked?content_id=${contentId}&is_post=${isPost}`) as Promise<{ code: number; message: string; data: { liked: boolean } }>,

  addComment: (contentId: number, isPost: boolean, content: string) => apiClient.post('/interact/comment', { content_id: contentId, is_post: isPost, content }),
  listComments: (contentId: number, isPost: boolean, page: number = 1, size: number = 20) => apiClient.get(`/interact/comments?content_id=${contentId}&is_post=${isPost}&page=${page}&size=${size}`) as Promise<{ code: number; message: string; data: CommentsListResp }>,

  follow: (followeeId: number) => apiClient.post('/interact/follow', { followee_id: followeeId }),
  unfollow: (followeeId: number) => apiClient.delete('/interact/follow', { data: { followee_id: followeeId } }),
  countFollowers: (userId: number) => apiClient.get(`/interact/followers/count?user_id=${userId}`) as Promise<{ code: number; message: string; data: { count: number } }>,
  countFollowing: (userId: number) => apiClient.get(`/interact/following/count?user_id=${userId}`) as Promise<{ code: number; message: string; data: { count: number } }>,
};
