// 채팅 관련 라우터 (ES6 import/export)

import express from 'express';
import { getChatMessage, getChatPictures, getChattingRoom, getComingSchedules, getFriendsList, postChatMessage, postChatPic, postChattingRoom, putChatMessage, putChattingRoom } from '../../controllers/chatting/chatController.js';
import { upload } from '../../utils/multerConfig.js';

const chatRoutes = express.Router();

// rootRouter.use("/chatting/api", calendarRoutes)
// 등록: post, 조회: get, 수정: put, 삭제: delete

// 친구 목록 조회
// http://localhost:8000/chatting/api/get-friendsList
chatRoutes.get('/get-friendsList', getFriendsList);

// ------ChatList----------
// 채팅방 생성 - 필요 잇을까?
// http://localhost:8000/chatting/api/post-chattingRoom 
chatRoutes.post('/post-chattingRoom', postChattingRoom);

// 채팅방 수정 - lastMessage, lastMessageAt, unreadCounts 업데이트용
// http://localhost:8000/chatting/api/put-chattingRoom
chatRoutes.put('/put-chattingRoom', putChattingRoom);

// 채팅방 조회 
// http://localhost:8000/chatting/api/get-chattingRoom
chatRoutes.get('/get-chattingRoom/:user_id', getChattingRoom);


// ------ChatApp----------

// message 스키마 생성, 메시지 전송
// http://localhost:8000/chatting/api/post-chatMessage
chatRoutes.post('/post-chatMessage/:chat_id', postChatMessage);

// 채팅메시지 읽음 표시 - message 객체 read 수정
// http://localhost:8000/chatting/api/put-chatMessage
chatRoutes.put('/put-chatMessage/:chat_id', putChatMessage);

// 채팅메시지 내용 조회
// http://localhost:8000/chatting/api/get-chatMessage
chatRoutes.get('/get-chatMessage/:match_id', getChatMessage); 



// 메시지 사진 업로드
// http://localhost:8000/chatting/api/post-chatPic
chatRoutes.post('/post-chatPic', upload.single('messageImage'), postChatPic);

// ------ScheduleAlert--------
// 메시지 사진 모아보기
// http://localhost:8000/chatting/api/get-chatPictures
chatRoutes.get('/get-chatPictures', getChatPictures);

// 채팅 상대와의 일정 목록 조회
// http://localhost:8000/chatting/api/get-comingSchedules
chatRoutes.get('/get-comingSchedules', getComingSchedules);

export default chatRoutes; 


