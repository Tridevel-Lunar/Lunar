export type KnowledgeEntry = {
  id: string;
  title: string;
  english: string;
  summary?: string;
  body: string[];
  /** Key into KNOWLEDGE_VISUALS registry (optional custom infographic / 3D). */
  visual?: string;
};
