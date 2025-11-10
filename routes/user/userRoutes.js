import express from "express";
import { registerUser, profileRegistration, modifyUser, removeUser, modifyPicture, checkUserId, getAllUsers, getUserById, deleteAllUsers, healthRegistration, completeRegistration, socialUserInfoRegistration, getMatchingUsers, updateDogMbti } from "../../controllers/user/userController.js";
import { signup } from "../../controllers/auth/authController.js";
import upload from "../../middleware/multer.js";

const userRouter = express.Router();

// 아이디 중복확인
userRouter.post("/check-userid", checkUserId);

// 1단계: 기본 회원가입 (임시 데이터만 반환)
userRouter.post("/register", registerUser);

// 1단계: 소셜 로그인 사용자용 회원정보 입력 (password 불필요)
userRouter.post("/social-register", socialUserInfoRegistration);

// 2단계: 프로필 등록 (임시 데이터만 반환)
userRouter.post("/profile-registration", upload.single('profileImage'), profileRegistration);

// 최종 단계: 모든 정보를 한번에 DB에 저장
userRouter.post("/complete-registration", completeRegistration);

// 4단계: 건강정보 등록 (이미 가입된 사용자용)
userRouter.post("/health-registration", healthRegistration);

// 로그인 - Passport local strategy 사용 (authRouter로 이동)

// 회원 목록 조회
userRouter.get("/", getAllUsers);

// 매칭용 사용자 목록 조회
userRouter.get("/matching", getMatchingUsers);

// 특정 회원 조회
userRouter.get("/:user_id", getUserById);

// 회원정보 수정
userRouter.put("/:user_id", modifyUser);

// 회원 탈퇴
userRouter.delete("/:user_id", removeUser);

// 전체 회원 삭제 (관리자용)
userRouter.delete("/", deleteAllUsers);

// 썸네일 이미지 변경
userRouter.put("/update-thumbnail", upload.single('profileImage'), modifyPicture);

// MBTI 결과 저장
userRouter.put("/update-mbti", updateDogMbti);

export default userRouter;