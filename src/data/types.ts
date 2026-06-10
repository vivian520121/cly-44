export interface Poem {
  id: number;
  title: string;
  author: string;
  dynasty: string;
  content: string[];
  tags?: string[];
}
