import { Schema, model } from "mongoose";
import { getCurrentTime } from "../utils/utils.js";

const chatSchema = new Schema({
  // chat_id: { type: Schema.Types.ObjectId, auto: true },  // PK: 자동 생성
  // room_id: {type: String, required: true },
  match_id: { type: String, required: true },            // FK: Match 테이블 (임시 수동)
  user_id: { type: String, required: true },             // 내 ID
  target_id: { type: String, required: true },           // 상대 ID
  
  target_name: { type: String, required: true },         // 상대 ID로 찾은 상대 이름
  target_profile_img: { type: String, required: true },  // 상대 ID로 찾은 상대 프로필사진

  lastMessage: { type: String, default: "매칭되었습니다! 대화를 나눠보세요" },                         // 마지막 메시지
  lastMessageAt: { type: String, default: getCurrentTime },                         // 마지막 메시지 전송 시간
  unreadCounts: { type: Number, default: 1 },            // 안 읽은 메시지 수

  createdAt: { type: String, default: getCurrentTime },    // 생성 시간
}); 
 
export default model("Chat", chatSchema, "chat");
