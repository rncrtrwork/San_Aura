import { model, models, Schema, type Model, type Types } from 'mongoose';

export const PAGE_SECTION_TYPES = ['hero', 'richText', 'timeline', 'cta', 'gallery'] as const;
export const PAGE_PUBLISH_STATUSES = ['draft', 'published'] as const;

export type PageSectionType = (typeof PAGE_SECTION_TYPES)[number];
export type PagePublishStatus = (typeof PAGE_PUBLISH_STATUSES)[number];

export type HeroSectionContent = {
  imageRef: Types.ObjectId | null;
  eyebrow: string;
  heading: string;
  body: string;
};

export type RichTextSectionContent = {
  body: string;
};

export type TimelineItem = {
  year: string;
  title: string;
  description: string;
};

export type TimelineSectionContent = {
  sectionLabel: string;
  backgroundColor: string;
  layout: 'alternating' | 'stacked';
  showOnNavigation: boolean;
  items: TimelineItem[];
};

export type CtaSectionContent = {
  heading: string;
  body: string;
  buttonLabel: string;
  buttonUrl: string;
};

export type GallerySectionContent = {
  heading: string;
  albumRef: Types.ObjectId | null;
};

export type PageSection = {
  key: string;
  type: PageSectionType;
  active: boolean;
  hero: HeroSectionContent | null;
  richText: RichTextSectionContent | null;
  timeline: TimelineSectionContent | null;
  cta: CtaSectionContent | null;
  gallery: GallerySectionContent | null;
};

export type PageDocument = {
  slug: string;
  title: string;
  sections: PageSection[];
  navVisibility: boolean;
  navLabel: string;
  seoTitle: string;
  metaDescription: string;
  lastEditedAt: Date;
  publishStatus: PagePublishStatus;
  createdAt: Date;
  updatedAt: Date;
};

const heroSectionContentSchema = new Schema<HeroSectionContent>(
  {
    imageRef: { type: Schema.Types.ObjectId, ref: 'MediaAsset', default: null },
    eyebrow: { type: String, trim: true, maxlength: 120, default: '' },
    heading: { type: String, required: true, trim: true, maxlength: 200 },
    body: { type: String, maxlength: 3000, default: '' },
  },
  { _id: false },
);

const richTextSectionContentSchema = new Schema<RichTextSectionContent>(
  { body: { type: String, required: true, maxlength: 50000 } },
  { _id: false },
);

const timelineItemSchema = new Schema<TimelineItem>(
  {
    year: { type: String, required: true, trim: true, maxlength: 20 },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, maxlength: 5000 },
  },
  { _id: false },
);

const timelineSectionContentSchema = new Schema<TimelineSectionContent>(
  {
    sectionLabel: { type: String, trim: true, maxlength: 120, default: 'Our History' },
    backgroundColor: { type: String, trim: true, maxlength: 30, default: 'ivory' },
    layout: { type: String, enum: ['alternating', 'stacked'], default: 'alternating' },
    showOnNavigation: { type: Boolean, default: true },
    items: { type: [timelineItemSchema], default: [] },
  },
  { _id: false },
);

const ctaSectionContentSchema = new Schema<CtaSectionContent>(
  {
    heading: { type: String, required: true, trim: true, maxlength: 200 },
    body: { type: String, maxlength: 3000, default: '' },
    buttonLabel: { type: String, required: true, trim: true, maxlength: 80 },
    buttonUrl: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  { _id: false },
);

const gallerySectionContentSchema = new Schema<GallerySectionContent>(
  {
    heading: { type: String, trim: true, maxlength: 200, default: '' },
    albumRef: { type: Schema.Types.ObjectId, ref: 'Album', default: null },
  },
  { _id: false },
);

const pageSectionSchema = new Schema<PageSection>(
  {
    key: { type: String, required: true, trim: true, maxlength: 80 },
    type: { type: String, enum: PAGE_SECTION_TYPES, required: true },
    active: { type: Boolean, default: true },
    hero: { type: heroSectionContentSchema, default: null },
    richText: { type: richTextSectionContentSchema, default: null },
    timeline: { type: timelineSectionContentSchema, default: null },
    cta: { type: ctaSectionContentSchema, default: null },
    gallery: { type: gallerySectionContentSchema, default: null },
  },
  { _id: false },
);

const pageSchema = new Schema<PageDocument>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 160,
    },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    sections: { type: [pageSectionSchema], default: [] },
    navVisibility: { type: Boolean, default: true, index: true },
    navLabel: { type: String, trim: true, maxlength: 80, default: '' },
    seoTitle: { type: String, trim: true, maxlength: 60, default: '' },
    metaDescription: { type: String, trim: true, maxlength: 160, default: '' },
    lastEditedAt: { type: Date, required: true, default: Date.now },
    publishStatus: { type: String, enum: PAGE_PUBLISH_STATUSES, default: 'draft', index: true },
  },
  { timestamps: true },
);

pageSchema.pre('validate', function validatePageSections() {
  const keys = this.sections.map((section) => section.key);
  if (new Set(keys).size !== keys.length) {
    this.invalidate('sections', 'Section keys must be unique within a page');
  }

  for (const section of this.sections) {
    if (!section[section.type]) {
      this.invalidate(`sections.${section.key}`, `Section content is required for ${section.type}`);
    }
  }
});

export const Page =
  (models.Page as Model<PageDocument> | undefined) ?? model<PageDocument>('Page', pageSchema);
