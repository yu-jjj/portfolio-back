// import { getCurrentTime } from "../../utils/utils.js";
import moment from "moment";
import Chat from "../../models/chatSchema.js";
import Schedule from "../../models/scheduleSchema.js";
import User from "../../models/userSchema.js";
import { getCurrentTime } from "../../utils/utils.js";


// 월별 캘린더 - 다가오는 일정날 
export const getComingSchedules = async (req, res) => {
  try {
    const user_id = req.params.user_id || req.query.user_id;
    const match_id = req.params.match_id || req.query.match_id;

    if (!user_id) {
      return res.status(400).json({ message: "user_id가 필요합니다." });
    }

    let schedules = [];

    if (match_id) {
      // ✅ 특정 match_id의 일정만 조회
      schedules = await Schedule.find({ match_id: String(match_id) }).lean();
    } else {
      // ✅ 내가 속한 모든 match_id 조회
      const chats = await Chat.find({
        $or: [{ user_id }, { target_id: user_id }],
      }).lean();
      const matchIds = chats.map((c) => c.match_id);

      schedules = await Schedule.find({
        $or: [{ user_id }, { match_id: { $in: matchIds } }],
      }).lean();
    }

    const nowStr = getCurrentTime(); // "YYYY-MM-DD HH:mm:ss"
    const now = moment(nowStr, "YYYY-MM-DD HH:mm:ss");
    const today = now.format("YYYY-MM-DD");

    const comingSchedules = schedules
      .filter((s) => {
        if (!s.date) return false;

        if (s.time) {
          // date + time 모두 있는 경우
          const scheduleDateTime = moment(`${s.date} ${s.time}`, "YYYY-MM-DD HH:mm");
          return scheduleDateTime.isSameOrAfter(now);
        } else {
          // time이 없는 경우: date만 비교
          if (s.date > today) return true;       // 오늘 이후 날짜면 포함
          if (s.date === today) return true;     // 오늘 날짜면 시간 없어도 포함
          return false;
        }
      })
      .sort((a, b) => {
        // 정렬 기준: date 우선, 같으면 time 비교
        const aDateTime = a.time
          ? moment(`${a.date} ${a.time}`, "YYYY-MM-DD HH:mm")
          : moment(`${a.date} 23:59`, "YYYY-MM-DD HH:mm"); // time 없는 건 하루 끝으로 처리
        const bDateTime = b.time
          ? moment(`${b.date} ${b.time}`, "YYYY-MM-DD HH:mm")
          : moment(`${b.date} 23:59`, "YYYY-MM-DD HH:mm");

        return aDateTime - bDateTime;
      });

    return res.status(200).json({
      message: "투두를 정상적으로 불러왔습니다.",
      comingSchedules,
    });
  } catch (error) {
    console.log("calendarController getComingSchedules fetching error");
    console.error(error);
    return res.status(500).json({
      message: "다가오는 일정을 불러오는 동안 오류가 발생하였습니다.",
    });
  }
}; 

// 완료된 일정 - 일기쓰면 사라짐
export const getCompletedSchedules = async (req, res) => {
  const user_id = req.params.user_id || req.query.user_id;
  if (!user_id) {
    return res.status(400).json({ message: 'user_id가 필요합니다.' });
  }

  try {
    // 1) 내가 속한 match_id 전부 조회
    const chats = await Chat.find({
      $or: [{ user_id }, { target_id: user_id }],
    }).lean();
    const matchIds = chats.map((c) => c.match_id);

    // 2) 내 일정 + 같은 match_id 일정 조회
    const schedules = await Schedule.find({
      $or: [{ user_id }, { match_id: { $in: matchIds } }],
    }).lean();

    // 2) 현재 시각
    const nowStr = getCurrentTime(); // "YYYY-MM-DD HH:mm:ss"
    const now = moment(nowStr, 'YYYY-MM-DD HH:mm:ss');
    const today = now.format('YYYY-MM-DD');

    // 3) 과거 일정만 필터링
    const pastSchedules = schedules
      .filter((s) => {
        if (!s.date) return false;

        if (s.time) {
          // date + time 있는 경우
          const dt = moment(`${s.date} ${s.time}`, 'YYYY-MM-DD HH:mm');
          return dt.isBefore(now);
        } else {
          // time이 없는 경우 → date로만 비교
          if (s.date < today) return true;   // 오늘 이전 날짜 → 과거
          if (s.date === today) return false; // 오늘 날짜인데 time 없음 → 제외
          return false;
        }        
      })
      // 이미 일기가 작성된 일정 제외
      .filter((s) => !(s.diary_text || s.diary_photo_url))
      // 4) 최근순 정렬 (내림차순)
      .sort((a, b) => {
        const aTime = a.time
          ? moment(`${a.date} ${a.time}`, 'YYYY-MM-DD HH:mm')
          : moment(`${a.date} 23:59`, 'YYYY-MM-DD HH:mm'); // time 없으면 하루 끝으로 취급
        const bTime = b.time
          ? moment(`${b.date} ${b.time}`, 'YYYY-MM-DD HH:mm')
          : moment(`${b.date} 23:59`, 'YYYY-MM-DD HH:mm');
        return bTime - aTime;
      });

    return res.status(200).json({
      message: '지나간 일정 조회 성공',
      pastSchedules,
    });
  } catch (error) {
    console.error('getCompletedSchedules error', error);
    return res
      .status(500)
      .json({ message: '지나간 일정 조회 중 오류가 발생했습니다.😅' });
  }
};

export const getSchedulesNames = async (req, res) => {
  // 월별 캘린더 조회 - 일정
  const user_id = req.params.user_id;
  try {
    const chats = await Chat.find({
      $or: [
        { user_id: user_id },
        { target_id: user_id }
      ]
    }).lean();

    const matchIds = chats.map(c => c.match_id);

    const schedules = await Schedule.find({
      $or: [
        { user_id: user_id },
        { match_id: { $in: matchIds } }
      ]
    }).lean();

    res.status(200).json({
      message: "일정을 정상적으로 불러왔습니다.",
      schedules,
    })

  } catch (error) {
    console.log("todoController foundTodo fetching error")
    console.error(error)
    res.status(500).json({
      message: "일정을 불러오는 동안 오류가 발생했습니다.😅"
    })
  }

  res.send('일정 목록');
}; 

export const getBirthdays = async (req, res) => {
  // 월별 캘린더 - 생일 조회
  const user_id = req.params.user_id;
  try {
    const chats = await Chat.find({ user_id: user_id })
      .select('target_id')
      .lean();
    const targetIds = [...new Set(chats.map(c => c?.target_id).filter(Boolean))];

    if (targetIds.length === 0) {
      return res.status(200).json({ message: '생일을 정상적으로 불러왔습니다.', birthdays: [] });
    }

    const users = await User.find(
      { user_id: { $in: targetIds } },
      { user_id: 1, 'dogProfile.name': 1, 'dogProfile.birthDate': 1 }
    ).lean();

    const toMMDD = (v) =>
      !v ? null
        : /^\d{2}-\d{2}$/.test(v) ? v
        : /^\d{4}-\d{2}-\d{2}$/.test(v) ? v.slice(5)
        : (() => { const d = new Date(v); return isNaN(+d) ? null : 
          `${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` })();
    
    const birthdays = users
      .map(u => ({ user_id: u.user_id, name: u?.dogProfile?.name || '', date: toMMDD(u?.dogProfile?.birthDate), _id: u?._id }))
      .filter(b => b.date);
      
    res.status(200).json({
      message: "생일을 정상적으로 불러왔습니다.",
      birthdays,
    })

  } catch (error) {
    console.log("calendarController getBirthdays fetching error")
    console.error(error)
    res.status(500).json({
      message: "생일을 불러오는 동안 오류가 발생했습니다.😅"
    })
  }
};


// 일정
// export const getFriendsList = async (req, res) => {
//   // 친구 목록 조회 -> chat에서 진행
//   console.log("getFriendsList 요청~!")

//   res.send('일정 목록');
// }; 

export const postSchedules = async (req, res) => {
  // 일별 캘린더 일정 등록 로직
  console.log("postSchedules 요청~!")
  const { user_id, match_id, title, date, time, location } = req.body;

  const schedule = {
    user_id: user_id,
    match_id: match_id,
    title: title,
    date: date,
    time: time,
    location: location
  }

  try {
    await Schedule.create(schedule)
  } catch (error) {
    console.error(`calendarController postSchedules ${error}`)
    res.status(500).json({
      message: "데이터를 추가하는 중 오류 발생"
    })
  }
  
  res.status(200).json({
    message: "일정이 추가 완료되었습니다"
  })
}; 

export const getSchedules = async (req, res) => {
  // 일별 캘린더 일정 조회 로직
  const { user_id } = req.params;
  const { date } = req.query;
  
  try {
    const chats = await Chat.find({
      $or: [{ user_id }, { target_id: user_id }]
    }).lean();
    const matchIds = chats.map(c => c.match_id);

    const schedules = await Schedule.find({
      date: date,
      $or: [
        { user_id },
        { match_id: { $in: matchIds } }
      ]
    }).lean();

    res.status(200).json({
      message: "일정을 정상적으로 불러왔습니다.",
      schedules,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      message: "일정을 불러오는 동안 오류가 발생했습니다."
    })
  }
  res.send("일정");
}; 

export const putSchedules = async (req, res) => {
  // 일별 캘린더 일정 수정 로직
  const { user_id, schedule_id, schedule } = req.body;

  const update = {};
    if (schedule.title !== undefined) update.title = schedule.title;
    if (schedule.location !== undefined) update.location = schedule.location;
    if (schedule.date !== undefined) update.date = schedule.date;   // 필요시 포맷 보정
    if (schedule.time !== undefined) update.time = schedule.time;   // 필요시 포맷 보정
    if (schedule.chat_id !== undefined) update.chat_id = schedule.chat_id;   // 필요시 포맷 보정
    // if (Array.isArray(schedule.chat_id)) update.chat_id = schedule.chat_id;

  try {
    await Schedule.updateOne(
      {user_id, _id: schedule_id},
      {$set: update},
      { runValidators: true },
    )
    res.status(200).json({
      message: "일정을 정상적으로 수정했습니다.",
    })
  } catch (error){
    console.error(`calendarController postDiary ${error}`)
    res.status(500).json({
      message: "일정을 수정하는 중 오류 발생"
    })
  }
  res.send('일정 목록');
}; 

export const deleteSchedules = async (req, res) => {
  // 일별 캘린더 일정 삭제 로직
  const { user_id, schedule_id } = req.body;
  
  try {
    await Schedule.deleteOne({user_id: user_id, _id: schedule_id})
    res.status(200).json({
      message: "정상적으로 삭제가 완료되었습니다."
    })
  } catch (error) {
    console.log("calenderController remove error!😥")
    console.error(err)
    res.status(500).json({
      message : "삭제 시 오류가 발생했습니다."
    })
  }
  res.send('일정 목록');
};

// 일기
export const postDiary = async (req, res) => {
  // 일별 캘린더 일기 등록 로직
  const { user_id, _id, diary_text, diary_photo_url } = req.body;

  try {
    const schedule = await Schedule.findOne({ user_id: user_id, _id: _id })
    
    schedule.diary_text = diary_text;
    schedule.diary_photo_url = diary_photo_url;

    await schedule.save();

    res.status(200).json({
      message: "일기를 정상적으로 추가했습니다.",
      diary_text,
      diary_photo_url
    })
  } catch (error) {
    console.error(`calendarController postDiary ${error}`)
    res.status(500).json({
      message: "일기 데이터를 추가하는 중 오류 발생"
    })
  }
  
  res.send('일정 목록');
}; 

export const postDiaryPictures = async (req, res) => {
  // 일별 캘린더 일기 사진 등록 로직
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

export const getDiary = async (req, res) => {
  // 일별 캘린더 일기 조회 로직
  res.send('일정 목록');
}; 

export const putDiary = async (req, res) => {
  // 일별 캘린더 일기 수정 로직
  const { user_id, schedule_id, diary_text, diary_photo_url } = req.body;

  const update = {};
  if(diary_text !== undefined) update.diary_text = diary_text;
  if(diary_photo_url !== undefined) update.diary_photo_url = diary_photo_url;
  
  try {
    await Schedule.updateOne(
      {user_id, _id: schedule_id },
      {$set: update},
      { runValidators: true },
    )
    res.status(200).json({
        message: "일기를 정상적으로 수정했습니다.",
        diary_text,
        diary_photo_url
      })
    } catch (error){
      console.error(`calendarController putDiary ${error}`)
      res.status(500).json({
        message: "일기을 수정하는 중 오류 발생"
      })
    }
  res.send('일기 수정 성공');
}; 

export const deleteDiary = async (req, res) => {
  // 일별 캘린더 일기 삭제 로직
  const { user_id, schedule_id } = req.body;

  const update = {};
  update.diary_text = null;
  update.diary_photo_url = null;

  try {
    await Schedule.updateOne(
      {user_id, _id: schedule_id},
      {$set: update},
      { runValidators: true },
    )
    res.status(200).json({
        message: "일기를 정상적으로 삭제했습니다.",
      })
    } catch (error){
      console.error(`calendarController deleteDiary ${error}`)
      res.status(500).json({
        message: "일기을 삭제하는 중 오류 발생"
      })
    }
  res.send('일기 삭제 성공');
}; 

