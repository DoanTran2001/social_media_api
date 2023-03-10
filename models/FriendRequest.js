import mongoose from "mongoose";
const Schema = mongoose.Schema;

const FriendRequest = new Schema({
  requester: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending'
  }
})

export default mongoose.model("FriendRequest", FriendRequest)