import mongoose from "mongoose";

const { Schema, model } = mongoose;

// User 스키마 정의 (ERD 기반)
const userSchema = new Schema({
    // 기본 회원 정보
    user_id: {
        type: String,
        required: true,
        unique: true,
        description: "회원 ID"
    },
    email: {
        type: String,
        required: false,
        description: "회원 이메일 (선택사항)"
    },
    password: {
        type: String,
        required: function() {
            // 일반회원(type: 'general')인 경우에만 비밀번호 필수
            return this.type === 'general';
        },
        description: "회원 비밀번호 (일반회원만 필수)"
    },
    // 소셜 로그인용 필드들
    googleId: {
        type: String,
        description: "구글 로그인 ID"
    },
    naverId: {
        type: String,
        description: "네이버 로그인 ID"
    },
    kakaoId: {
        type: String,
        description: "카카오 로그인 ID"
    },
    // 소셜 로그인 구분을 위한 필드 추가
    isSocialLogin: {
        type: Boolean,
        default: false,
        description: "소셜 로그인 여부"
    },
    provider: {
        type: String,
        enum: ['google', 'kakao', 'naver'],
        default: null,
        description: "소셜 로그인 제공자"
    },
    name: {
        type: String,
        required: true,
        description: "회원 이름"
    },
    tel: {
        type: Number,
        description: "회원 번호"
    },
    ad_yn: {
        type: Boolean,
        default: false,
        description: "마케팅동의 여부 (0: 동의안함, 1: 동의함)"
    },
    pri_yn: {
        type: Boolean,
        default: true,
        description: "개인정보 처리방침 동의 (0: 동의안함, 1: 동의함)"
    },
    type: {
        type: String,
        enum: ['general', 'social'],
        default: 'general',
        description: "회원타입 (general: 일반회원, social: 소셜회원)"
    },
    birth: {
        type: String,
        description: "회원 생년월일 (YYYY-MM-DD 형식)"
    },
    
    // 강아지 디비티아이 검사 결과 (선택사항)
    dogMbti: {
        isCompleted: {
            type: Boolean,
            default: false,
            description: "강아지 디비티아이 검사 완료 여부"
        },
        result: {
            type: String,
            default: null,
            description: "강아지 디비티아이 검사 결과 (예: ENFP, ISFJ 등)"
        },
        completedAt: {
            type: Date,
            default: null,
            description: "디비티아이 검사 완료 시간"
        }
    },
    
    // 프로필 완료 여부
    profileComplete: {
        type: Boolean,
        default: false,
        description: "프로필 등록 완료 여부"
    },
    
    // 강아지 프로필 정보
    dogProfile: {
        name: String,
        weight: String,
        birthDate: String, // YYYY-MM-DD 형식으로 저장
        gender: String,
        address: String,
        breed: String,
        custombreed: String,
        nickname: String,
        favoriteSnack: String,
        walkingCourse: String,
        messageToFriend: String,
        charactor: String, 
        favorites: [String], 
        cautions: [String], 
        neutralization: String,
        profileImage: String
    },
    
    // 건강정보 (새로 추가)
    healthProfile: {
        vaccine: [String],
        hospital: String,
        visitCycle: String,
        lastVisit: String,
        allergyCause: String,
        allergySymptom: [String]  
    }
}, {
    timestamps: true // 생성일시, 수정일시 자동 추가
});

// User 모델 생성 (컬렉션 이름을 "users"로 통일)
const User = model("User", userSchema, "users");

// User 모델 export
export default User;
