export interface SeoResponse {
  titles: string[];
  description: string;
  hashtags: string[];
  tags: string[];
  thumbnailTexts: string[];
  hooks: string[];
  shortTitle: string;
  relatedQueries: string[];
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}