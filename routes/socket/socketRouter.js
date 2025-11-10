// socketRouter.js
import Chat from '../../models/chatSchema.js';
import Message from '../../models/messageSchema.js';

// 메모리 상에 "온라인 사용자"를 관리하는 맵
const userSockets = new Map(); // userId -> Set<socketId>

// userId에 해당 소켓 추가
const addUserSocket = (userId, sid) => {
  if (!userSockets.has(userId)) userSockets.set(userId, new Set());
  userSockets.get(userId).add(sid);
};

// 소켓 연결이 끊긴 경우 해당 소켓을 가진 userId에서 제거
const removeSocket = (sid) => {
  for (const [uid, set] of userSockets.entries()) {
    if (set.has(sid)) {
      set.delete(sid);
      if (set.size === 0) userSockets.delete(uid);
      break;
    }
  }
};

const socketRouter = (io) => {
  // 클라가 소켓 연결을 맺을 때마다 실행 (각 소켓마다 한 번)
  io.on('connection', (socket) => {
    console.log(`새로운 연결: ${socket.id}`);

    // 1) 사용자 등록: 유저를 온라인 맵에 올려둔다.
    socket.on('register', ({ userId }) => {
      if (!userId) return; // 방어코드
      addUserSocket(String(userId), socket.id);          
      console.log(`등록: ${userId} (${socket.id})`);
    });

    // 2) 방 입장: 특정 채팅방(room)에 참가 (해당 roomId로 메시지를 받기 위함)
    socket.on('room:join', ({ roomId }) => {
      if (!roomId) return;
      socket.join(String(roomId));                       // 소켓.IO의 룸 기능 사용
      console.log(`join: ${socket.id} -> room ${roomId}`);
    });

    // 3) 채팅 전송(실전): 메시지 본문 및 이미지 URL(있으면)을 서버로 보냄
    socket.on('chat:send', async (payload, cb) => {
      try {
        const {
          roomId,         // 어떤 방(=대화)으로 보낼지
          sender_id,      // 보낸 사람(나)
          message,        // 텍스트 (없을 수도 있음)
          images_url = null, // 이미지 URL 배열 (없을 수도 있음)
          clientMessageId = null, // 낙관적 UI 치환/중복방지용 임시 ID(선택)
        } = payload || {};

        // 필수값 검증: roomId, sender_id, 그리고 message나 이미지 중 최소 1개
        if (!roomId || !sender_id || (!message && !images_url?.length)) {
          cb?.({ ok: false, error: 'bad_request' });
          return;
        }

        // (선택) 멱등성: 같은 clientMessageId로 들어온 메시지는 "중복 저장 방지"
        // - Message 스키마에 { chat_id, clientMessageId } 유니크 인덱스 권장
        let saved = null;
        if (clientMessageId) {
          saved = await Message.findOne({ match_id: roomId, clientMessageId }).lean();
        }

        // 저장된 게 없다면 새로 생성
        if (!saved) {
          saved = await Message.create({
            match_id: roomId,
            sender_id,
            message: message ?? '',
            images_url: Array.isArray(images_url) ? images_url : (images_url ? [images_url] : []),
            read: false,                           // 상대가 읽을 때까지 false
            clientMessageId: clientMessageId || undefined,
          });

          // 인박스/리스트 정렬을 위한 방 메타정보 갱신
          const last = message ?? (images_url?.length ? '[이미지]' : '');
          await Chat.updateMany(
            { match_id: String(roomId) },
            { $set: { lastMessage: last, lastMessageAt: saved.createdAt } },
          );
          // 상대 unreadCounts +1 하기
          await Chat.updateMany(
          { match_id: roomId, user_id: { $ne: sender_id } },
          { $inc: { unreadCounts: 1 } }
        );
        }

        // 보낸 사람에게 ACK 반환 (낙관적 메시지 → 서버 저장본으로 치환하는데 사용)
        cb?.({ ok: true, message: saved });

        // 같은 방의 모든 참가자에게 실시간 브로드캐스트
        io.to(String(roomId)).emit('chat:new', saved);
      } catch (e) {
        console.error(e);
        cb?.({ ok: false, error: 'server_error' });
      }
    });

    // 4) 읽음 처리: 내가 방을 열면, 상대 msg 읽음 처리, 내 채팅방도 읽음 처리
    socket.on('chat:read', async ({ roomId, userId }) => {
      try {
        if (!roomId || !userId) return;
        await Message.updateMany(
          { match_id: roomId, read: false, sender_id: { $ne: userId } }, // 내가 보낸 건 제외
          { $set: { read: true } }
        );
        await Chat.updateOne(
          { match_id: roomId, user_id: userId },
          { $set: { unreadCounts: 0 }}
        )
       
      } catch (e) {
        console.error('read update failed', e);
      }
    });

    // 소켓 연결 종료 시 정리
    socket.on('disconnect', () => {
      removeSocket(socket.id);
      console.log(`연결 종료: ${socket.id}`);
    });
  });
};

export default socketRouter;
