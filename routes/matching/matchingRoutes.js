import express from 'express';
import { getProfileCards, getProfileCardDetail } from '../../controllers/matching/matchingController.js';

const router = express.Router();

// 다른 사용자들의 프로필 카드 조회
router.get('/profile-cards/:user_id', getProfileCards);

// 특정 사용자의 프로필 카드 상세 조회
router.get('/profile-card/:user_id/:target_id', getProfileCardDetail);

export default router;
