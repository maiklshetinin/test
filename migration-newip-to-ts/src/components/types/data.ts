type Source = {
    id: string;
    name: string;
  }
  
  export interface IData {
    author:  string;
    content: string;
    description: string;
    publishedAt: string;
    source: Source;
    title: string;
    url: string;
    urlToImage: string;
  }