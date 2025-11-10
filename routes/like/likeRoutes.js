import express from "express";
import { toggleLike, getLikeCount, checkLikeStatus } from "../../controllers/like/likeController.js";

const likeRouter = express.Router();

// 좋아요 토글 (좋아요/취소)
likeRouter.post("/toggle", toggleLike);

// 특정 사용자의 좋아요 수 조회
likeRouter.get("/count/:target_id", getLikeCount);

// 특정 사용자가 특정 대상에게 좋아요를 눌렀는지 확인
likeRouter.get("/status", checkLikeStatus);

export default likeRouter;
