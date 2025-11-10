import { Schema, model } from "mongoose";

const likeSchema = new Schema({
  // 좋아요를 누른 사용자 ID
  liker_id: {
    type: String,
    required: true,
    ref: 'User',
    description: "좋아요를 누른 사용자 ID"
  },
  // 좋아요를 받은 사용자 ID (프로필 소유자)
  target_id: {
    type: String,
    required: true,
    ref: 'User',
    description: "좋아요를 받은 사용자 ID"
  },
  // 좋아요 상태 (true: 좋아요, false: 취소)
  isLiked: {
    type: Boolean,
    default: true,
    description: "좋아요 상태"
  },
  // 좋아요 누른 시간
  likedAt: {
    type: Date,
    default: Date.now,
    description: "좋아요 누른 시간"
  }
}, {
  timestamps: true,
  collection: 'likes'
});

// 인덱스 설정 (성능 최적화)
likeSchema.index({ liker_id: 1, target_id: 1 }, { unique: true }); // 한 사용자가 같은 대상에게 한 번만 좋아요 가능
likeSchema.index({ target_id: 1 }); // 특정 사용자의 좋아요 수 조회 최적화
likeSchema.index({ isLiked: 1 }); // 활성 좋아요만 조회 최적화

// 특정 사용자의 좋아요 수 조회
likeSchema.statics.getLikeCount = async function(targetId) {
  const count = await this.countDocuments({
    target_id: targetId,
    isLiked: true
  });
  return count;
};

// 특정 사용자가 특정 대상에게 좋아요를 눌렀는지 확인
likeSchema.statics.hasLiked = async function(likerId, targetId) {
  const like = await this.findOne({
    liker_id: likerId,
    target_id: targetId
  });
  return like ? like.isLiked : false;
};

// 좋아요 토글 (좋아요/취소)
likeSchema.statics.toggleLike = async function(likerId, targetId) {
  const existingLike = await this.findOne({
    liker_id: likerId,
    target_id: targetId
  });

  if (existingLike) {
    // 이미 좋아요가 있는 경우 토글
    existingLike.isLiked = !existingLike.isLiked;
    existingLike.likedAt = new Date();
    await existingLike.save();
    return existingLike.isLiked;
  } else {
    // 새로운 좋아요 생성
    const newLike = new this({
      liker_id: likerId,
      target_id: targetId,
      isLiked: true
    });
    await newLike.save();
    return true;
  }
};

export default model("Like", likeSchema);
