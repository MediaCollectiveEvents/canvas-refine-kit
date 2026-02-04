export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt?: string;
  body: string;
  keywordIds?: string[];
}

export interface BlogFile {
  posts: BlogPost[];
}
