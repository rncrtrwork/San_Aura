import { model, models, Schema, type Model, type Types } from 'mongoose';

export type AlbumDocument = {
  name: string;
  slug: string;
  parentRef: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
};

const albumSchema = new Schema<AlbumDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, trim: true, lowercase: true, maxlength: 120 },
    parentRef: { type: Schema.Types.ObjectId, ref: 'Album', default: null, index: true },
  },
  { timestamps: true },
);

albumSchema.index({ parentRef: 1, slug: 1 }, { unique: true });

export const Album =
  (models.Album as Model<AlbumDocument> | undefined) ?? model<AlbumDocument>('Album', albumSchema);
