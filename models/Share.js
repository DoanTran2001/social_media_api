import mongoose from "mongoose"
const Schema = mongoose.Schema

const ShareSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    require: true
  },
  postId: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
    require: true
  }
}, { timestamps: true})

export default mongoose.model('Share', ShareSchema)