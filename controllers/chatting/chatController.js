
import Chat from '../../models/chatSchema.js';
import Message from '../../models/messageSchema.js';
import User from '../../models/user.js';

// 채팅 관련 컨트롤러 (채팅방, 메시지 등)
// 0. matching 스키마 status값이 매칭완료
// 1. postChattingRoom api호출 -> 프론트에서 해당 matching(matching 이름으로 보내기, 스키마에 있는 값 다 넣어서)객체 전부 백으로 넘겨주기
// 2. postChattingRoom -> 초기 채팅방, 메시지 생성
// 3. getChattingRoom -> 전체 채팅방 리스트 가지고 오기
// 4. 채팅방 클릭시 -> 채팅방 unreadCounts 변경: putChattingRoom
//               -> 해당 채팅방의 message 객체 가지고 오기: getChatMessage(useEffect)
//               -> message 객체의 read 읽음 변경: putChatMessage
// 5. 채팅 보낼시 ->  message 객체 생성: postChatMessage, message 조회 업데이트: getChatMessage(useEffect)
//             -> 채팅방 lastMessage 변경: putChattingRoom, 채팅방 조회(lastMessageAt 최신순으로 배열): getChattingRoom(useEffect)
// 6. 채팅보관함 -> 이미지 보아보기: getChatPictures, 일정 리스트 모아보기: getComingSchedules

export const getFriendsList = async (req, res) => {
  // 친구 목록 조회 로직 
  // -> 채팅방 목록에서 target_id의 프로필 이름과, 프로필사진 가지고 오기
  res.send('채팅 목록');
}; 

// chat - ChatList
// 1. 채팅방 생성, 초기 메시지 생성
export const postChattingRoom = async (req, res) => {
  try {
    
    const { user_id, target_id, match_id } = req.body;
    
    const targetUser = await User.findOne({ user_id: target_id });
    if (!targetUser) {
      return res.status(404).json({ error: '상대 유저 정보를 찾을 수 없습니다.' });
    }

    const user = await User.findOne({ user_id: user_id });
    if (!user) {
      return res.status(404).json({ error: '본인 유저 정보를 찾을 수 없습니다.' });
    }

    const target_name = targetUser.dogProfile.name;
    const target_profile_img = targetUser.dogProfile.profileImage;

    const user_name = user.dogProfile.name;
    const user_profile_img = user.dogProfile.profileImage;

    const chat = await Chat.create({
      user_id: user_id,
      match_id: match_id,
      target_id: target_id,
      target_name: target_name,
      target_profile_img: target_profile_img,
    });

    const targetChat = await Chat.create({
      user_id: target_id,
      match_id: match_id,
      target_id: user_id,
      target_name: user_name,
      target_profile_img: user_profile_img,
    })

    const message = await Message.create({
      match_id: match_id,
      sender_id: "system",
      message: "매칭되었습니다! 대화를 나눠보세요"
    });
    
    // await Chat.create(chat)
    return res.status(201).json({ message: "채팅방이 추가 완료"});
  } catch (error) {
    console.error('postChattingRoom 오류:', error);
    res.status(500).json({ error: '채팅방 생성 실패' });
  }
};


export const putChattingRoom = async (req, res) => {
  // 채팅방 수정 로직 -> lastMessage, lastMessageAt, unreadCounts 업데이트용
};

export const getChattingRoom = async (req, res) => {
  // 채팅방 조회 로직 -> 전체 채팅방 리스트 가지고 오기
  const user_id = req.params.user_id;
  try {
    const chats = await Chat.find({ user_id: user_id })
      .sort({ lastMessageAt: -1 });
      
    res.status(200).json({
      message: "채팅방목록을 정상적으로 불러왔습니다.",
      chats,
    })
  } catch (error){
    console.log("chatController getChattingRoom fetching error")
    console.error(error)
    res.status(500).json({
      message: "채팅방을 불러오는 동안 오류가 발생했습니다.😅"
    })
  }
  // res.send('채팅 목록');
}; 


// message - ChatApp
export const postChatMessage = async (req, res) => {
  // 채팅메시지 message스키마 생성
  // 메시지 전송
  res.send('채팅 목록');
}; 

export const putChatMessage = async (req, res) => {
  // 채팅메시지 읽음 표시 - message 객체 read 수정
  // 메시지 전송
  res.send('채팅 목록');
};

export const getChatMessage = async (req, res) => {
  // 채팅메시지 내용 리스트 조회 로직
  const match_id = req.params.match_id;
  try {
    const messages = await Message.find({ match_id: match_id })
      .sort({ createdAt: 1 });
    res.status(200).json({
      message: "메시지를 정상적으로 불러왔습니다.",
      messages,
    })
  } catch (error) {
    console.error("chatController getChatMessage fetching error", error);
    res.status(500).json({
      message: "메세지를 불러오는 동안 오류가 발생했습니다.😅" 
    })
  }
}; 

export const postChatPic = async (req, res) => {
  // 메시지 사진 업로드 로직
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    const normalizedPath = req.file.path.replace(/\\/g, '/'); // e.g. uploads/diary/2025/09/15/uuid-file.jpg
    const base = process.env.BACKEND_BASE_URL || `${req.protocol}://${req.get('host')}`;
    const imageUrl = `${base}/${normalizedPath}`;

    return res.status(200).json({
      message: '일기 이미지가 업로드되었습니다.',
      imageUrl,
      file: {
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size,
        destination: req.file.destination,
        path: req.file.path
      }
    });
  } catch (error) {
    console.error('[postDiaryPictures] error:', error); 
    return res.status(500).json({ message: '이미지 업로드 중 오류가 발생했습니다.' });
  }
}; 

// ScheduleAlert
export const getChatPictures = async (req, res) => {
  // 메시지 사진 모아보기 로직
  // const user_id = req.params.user_id || req.query.user_id;
  // const match_id = req.params.match_id || req.query.match_id;
  // try {
  //   const messages = awat
  // }
}; 

// 캘린더 다가오는 일정으로 대체
export const getComingSchedules = async (req, res) => {
  // 채팅 상대와의 일정 목록 조회 로직
  res.send('채팅 목록');
}; 