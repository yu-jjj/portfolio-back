import User from "../../models/userSchema.js";
import Matching from "../../models/matchingSchema.js";
import moment from "moment";

// 날짜 포맷팅 함수
const formatDate = (date) => {
    if (!date) return null;
    return moment(date).format('YYYY-MM-DD HH:mm:ss');
};

// 다른 사용자들의 프로필 카드 데이터 조회
export const getProfileCards = async (req, res) => {
    try {
        const { user_id } = req.params;
        
        // 현재 사용자 정보 조회
        const currentUser = await User.findOne({ user_id }).lean();
        if (!currentUser) {
            return res.status(404).json({
                success: false,
                message: "사용자를 찾을 수 없습니다."
            });
        }

        // 현재 사용자와 이미 매칭된 사용자들 조회 (친구 리스트)
        const friendsList = await Matching.getFriendsList(user_id);
        const matchedUserIds = friendsList.map(friend => 
            friend.user_id === user_id ? friend.target_id : friend.user_id
        );

        // 현재 사용자와 매칭 대기 중인 사용자들 조회
        const pendingMatches = await Matching.getPendingRequests(user_id);
        const pendingUserIds = pendingMatches.map(match => match.user_id);

        // 매칭 가능한 사용자들 조회 (본인, 이미 매칭된 사용자, 대기 중인 사용자 제외)
        const availableUsers = await User.find({
            user_id: { 
                $nin: [user_id, ...matchedUserIds, ...pendingUserIds] 
            },
            profileComplete: true, // 프로필 완료된 사용자만
            'dogProfile.name': { $exists: true } // 강아지 프로필이 있는 사용자만
        }, {
            user_id: 1,
            name: 1,
            profile_img: 1,
            'dogProfile.name': 1,
            'dogProfile.weight': 1,
            'dogProfile.birthDate': 1,
            'dogProfile.gender': 1,
            'dogProfile.breed': 1,
            'dogProfile.custombreed': 1,
            'dogProfile.neutralization': 1,
            'dogProfile.charactor': 1,
            'dogProfile.favorites': 1,
            'dogProfile.cautions': 1,
            'dogProfile.profileImage': 1
        }).lean();

        // 프로필 카드 데이터 형식으로 변환
        const profileCards = await Promise.all(availableUsers.map(async user => {
            const dogProfile = user.dogProfile || {};
            
            // 나이 계산
            const birthDate = dogProfile.birthDate;
            const age = birthDate ? calculateAge(birthDate) : null;
            
            // 성격 태그들 (charactor, favorites, cautions 조합)
            const personalityTags = [
                ...(dogProfile.charactor ? [dogProfile.charactor] : []),
                ...(dogProfile.favorites || []),
                ...(dogProfile.cautions || [])
            ].slice(0, 3); // 최대 3개만 표시

            return {
                user_id: user.user_id,
                name: user.name,
                profile_img: user.profile_img || dogProfile.profileImage,
                dog: {
                    name: dogProfile.name || "이름 없음",
                    breed: dogProfile.breed === '기타' ? dogProfile.custombreed : dogProfile.breed,
                    gender: dogProfile.gender === 'male' ? '수컷' : '암컷',
                    weight: dogProfile.weight ? `${dogProfile.weight}kg` : null,
                    age: age ? `${age}세` : null,
                    birthDate: birthDate,
                    neutralization: dogProfile.neutralization === 'yes' ? '완료' : '미완료',
                    personalityTags: personalityTags
                },
                statistics: await calculateUserStatistics(user.user_id),
                timestamps: {
                    createdAt: formatDate(user.createdAt),
                    updatedAt: formatDate(user.updatedAt)
                }
            };
        }));

        res.status(200).json({
            success: true,
            message: "프로필 카드 데이터를 성공적으로 조회했습니다.",
            data: {
                profileCards,
                totalCount: profileCards.length
            }
        });

    } catch (error) {
        console.error("프로필 카드 조회 오류:", error);
        res.status(500).json({
            success: false,
            message: "프로필 카드 조회 중 오류가 발생했습니다."
        });
    }
};

// 나이 계산 함수
const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    
    return age;
};

// 사용자 통계 계산 함수
const calculateUserStatistics = async (userId) => {
    try {
        // 매칭 성공 횟수 (양방향 매칭완료된 수)
        const matchSuccess = await Matching.countDocuments({
            $or: [
                { user_id: userId, status: 1, partner_status: 1 },
                { target_id: userId, status: 1, partner_status: 1 }
            ]
        });

        // 좋아요 수 (임시로 랜덤값 사용, 추후 Like 스키마와 연동)
        const likes = Math.floor(Math.random() * 50) + 10;

        // 궁합률 계산 (임시로 랜덤값 사용, 추후 알고리즘 구현)
        const compatibility = Math.floor(Math.random() * 20) + 80;

        return {
            matchSuccess,
            compatibility,
            likes
        };
    } catch (error) {
        console.error("통계 계산 오류:", error);
        return {
            matchSuccess: 0,
            compatibility: 0,
            likes: 0
        };
    }
};

// 특정 사용자의 프로필 카드 상세 조회
export const getProfileCardDetail = async (req, res) => {
    try {
        const { user_id, target_id } = req.params;
        
        // 현재 사용자 확인
        const currentUser = await User.findOne({ user_id }).lean();
        if (!currentUser) {
            return res.status(404).json({
                success: false,
                message: "사용자를 찾을 수 없습니다."
            });
        }

        // 대상 사용자 조회
        const targetUser = await User.findOne({ user_id: target_id }).lean();
        if (!targetUser) {
            return res.status(404).json({
                success: false,
                message: "대상 사용자를 찾을 수 없습니다."
            });
        }

        // 매칭 상태 확인
        const matchingStatus = await Matching.getMatchingStatus(user_id, target_id);

        const dogProfile = targetUser.dogProfile || {};
        const birthDate = dogProfile.birthDate;
        const age = birthDate ? calculateAge(birthDate) : null;

        const profileCard = {
            user_id: targetUser.user_id,
            name: targetUser.name,
            profile_img: targetUser.profile_img || dogProfile.profileImage,
            dog: {
                name: dogProfile.name || "이름 없음",
                breed: dogProfile.breed === '기타' ? dogProfile.custombreed : dogProfile.breed,
                gender: dogProfile.gender === 'male' ? '수컷' : '암컷',
                weight: dogProfile.weight ? `${dogProfile.weight}kg` : null,
                age: age ? `${age}세` : null,
                birthDate: birthDate,
                neutralization: dogProfile.neutralization === 'yes' ? '완료' : '미완료',
                personalityTags: [
                    ...(dogProfile.charactor ? [dogProfile.charactor] : []),
                    ...(dogProfile.favorites || []),
                    ...(dogProfile.cautions || [])
                ]
            },
            statistics: await calculateUserStatistics(targetUser.user_id),
            matchingStatus: matchingStatus,
            timestamps: {
                createdAt: formatDate(targetUser.createdAt),
                updatedAt: formatDate(targetUser.updatedAt)
            }
        };

        res.status(200).json({
            success: true,
            message: "프로필 카드 상세 정보를 성공적으로 조회했습니다.",
            data: profileCard
        });

    } catch (error) {
        console.error("프로필 카드 상세 조회 오류:", error);
        res.status(500).json({
            success: false,
            message: "프로필 카드 상세 조회 중 오류가 발생했습니다."
        });
    }
};
