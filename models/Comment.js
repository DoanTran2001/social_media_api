import mongoose from "mongoose";
const Schema = mongoose.Schema;


const CommentSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    subComments: [
      {
        author: {
          type: Schema.Types.ObjectId,
          ref: "User"
        },
        content: {
          type: String
        },
        createdAt: {
          type: Date
        }
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Comment", CommentSchema);
