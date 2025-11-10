// 캘린더 관련 라우터 (ES6 import/export)
 
import express from 'express';
import {
  deleteDiary, deleteSchedules,
  getBirthdays,
  getComingSchedules,
  getCompletedSchedules, getDiary, getSchedules, getSchedulesNames,
  postDiary, postDiaryPictures, postSchedules, putDiary, putSchedules
} from '../../controllers/calendar/calendarController.js';
import { upload } from '../../utils/multerConfig.js';


const calendarRoutes = express.Router();
// rootRouter.use("/calender/api", calendarRoutes)

// 등록: post, 조회: get, 수정: put, 삭제: delete 

// 월별 캘린더
// 다가오는 일정 조회 -> 일정날 이전일때 일정 찾아서 조회
// http://localhost:8000/calendar/api/coming-schedules
calendarRoutes.get('/coming-schedules/:user_id', getComingSchedules);
// 쿼리스트링 방식
calendarRoutes.get('/coming-schedules', getComingSchedules);

// 완료된 일정 조회 -> 일정날 이후, 일기 안쓴 일정 찾아서 조회
// http://localhost:8000/calendar/api/completed-schedules
calendarRoutes.get('/completed-schedules/:user_id', getCompletedSchedules);

// 월별 캘린더 조회 -> 모든 일정의 일정이름만 모아서 조회
// http://localhost:8000/calendar/api/month-schedules
calendarRoutes.get('/month-schedules/:user_id', getSchedulesNames);

// 월별 캘린더 친구 생일 조회 
// http://localhost:8000/calendar/api/birthdays
calendarRoutes.get('/birthdays/:user_id', getBirthdays);



// 일정
// 친구 목록 조회
// http://localhost:8000/calendar/api/get-friendsList
// calendarRoutes.get('/get-friendsList', getFriendsList);

// 일별 캘린더 일정 등록 - 월별 모달 이거 사용, 채팅 일정 모달에도 이거 사용
// http://localhost:8000/calendar/api/post-schedules
calendarRoutes.post('/post-schedules', postSchedules);

// 일별 캘린더 일정 조회
// http://localhost:8000/calendar/api/get-schedules
calendarRoutes.get('/get-schedules/:user_id', getSchedules);

// 일별 캘린더 일정 수정
// http://localhost:8000/calendar/api/put-schedules
calendarRoutes.put('/put-schedules', putSchedules);

// 일별 캘린더 일정 삭제
// http://localhost:8000/calendar/api/delete-schedules
calendarRoutes.delete('/delete-schedules', deleteSchedules);



// 일기
// 일별 캘린더 일기 등록
// http://localhost:8000/calendar/api/post-diary
calendarRoutes.post('/post-diary', postDiary);

// 일기에 사진 업로드
// http://localhost:8000/calendar/api/post-diaryPictures
calendarRoutes.post('/post-diaryPictures', upload.single('diary'), postDiaryPictures);

// 일별 캘린더 일기 조회
// http://localhost:8000/calendar/api/get-diary
calendarRoutes.get('/get-diary', getDiary);

// 일별 캘린더 일기 수정
// http://localhost:8000/calendar/api/put-diary
calendarRoutes.put('/put-diary', putDiary);

// 일별 캘린더 일기 삭제
// http://localhost:8000/calendar/api/delete-diary
calendarRoutes.put('/delete-diary', deleteDiary);


export default calendarRoutes; 