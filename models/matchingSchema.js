import { Schema, model } from "mongoose";

const matchingSchema = new Schema({
  // Primary Key는 MongoDB의 기본 ObjectId 사용
  user_id: { 
    type: String, 
    required: true,
    ref: 'User',
    description: "매칭 요청한 회원 ID"
  },
  name: { 
    type: String, 
    required: true,
    description: "회원 이름"
  },
  target_id: { 
    type: String, 
    required: true,
    ref: 'User',
    description: "매칭 받은 회원 ID"
  },
  status: { 
    type: Number, 
    enum: [0, 1, 2, 3], 
    required: true,
    default: 0,
    description: "0: 매칭중, 1: 매칭완료, 2: 매칭거절, 3: 매칭취소"
  },
  // 매칭 방향성 구분
  direction: {
    type: String,
    enum: ['request', 'response'],
    required: true,
    description: "request: 매칭 요청, response: 매칭 응답"
  },
  // 상대방의 매칭 상태 (양방향 확인용)
  partner_status: {
    type: Number,
    enum: [0, 1, 2, 3],
    description: "상대방의 매칭 상태"
  },
  // 매칭 요청 시간
  requestedAt: {
    type: Date,
    default: Date.now,
    description: "매칭 요청 시간"
  },
  // 매칭 응답 시간 (수락/거절 시)
  respondedAt: {
    type: Date,
    description: "매칭 응답 시간"
  },
  // 매칭 완료 시간
  completedAt: {
    type: Date,
    description: "매칭 완료 시간"
  }
}, {
  timestamps: true,
  collection: 'matching'
});

matchingSchema.index({ user_id: 1 });
matchingSchema.index({ target_id: 1 });
matchingSchema.index({ status: 1 });
matchingSchema.index({ user_id: 1, target_id: 1 }, { unique: true }); // 중복 매칭 방지

// 매칭 상태 확인 메서드들
matchingSchema.statics.getMatchingStatus = async function(userId, targetId) {
  const matching = await this.findOne({ 
    user_id: userId, 
    target_id: targetId 
  });
  return matching ? matching.status : null;
};

// 친구 리스트 조회 (양방향 매칭완료된 사용자들)
matchingSchema.statics.getFriendsList = async function(userId) {
  const friends = await this.find({
    $or: [
      { user_id: userId, status: 1, partner_status: 1 },
      { target_id: userId, status: 1, partner_status: 1 }
    ]
  }).populate('user_id target_id', 'user_id name profile_img');
  
  return friends;
};

// 매칭 요청 상태 확인
matchingSchema.statics.getPendingRequests = async function(userId) {
  return await this.find({
    target_id: userId,
    status: 0,
    direction: 'request'
  }).populate('user_id', 'user_id name profile_img');
};

// 매칭 응답 대기 상태 확인
matchingSchema.statics.getPendingResponses = async function(userId) {
  return await this.find({
    user_id: userId,
    status: 0,
    direction: 'request'
  }).populate('target_id', 'user_id name profile_img');
};

export default model("Matching", matchingSchema);
