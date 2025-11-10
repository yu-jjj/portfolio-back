import { Schema, model } from "mongoose";
import { getCurrentTime } from "../utils/utils.js";

const messageSchema = new Schema({
  
  chat_id: { type: String }, // FK
  // user_id: { type: String, required: true },               // 메시지 보낸 사람
  // room_id: { type: String, required: true },
  match_id: { type: String },
  sender_id: { type: String, required: true },              // 발신자 식별 ID, 0: 관리자
  message: { type: String },                               // 텍스트 내용
  images_url: { type: [String] },             // 이미지 배열
  read: { type: Boolean, default: false },                 // 읽음 여부
  createdAt: { type: String, default: getCurrentTime },      // 전송 시간
});

export default model("Message", messageSchema, "message");
