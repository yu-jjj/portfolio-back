import Like from "../../models/likeSchema.js";

// 좋아요 토글 (좋아요/취소)
export const toggleLike = async (req, res) => {
    try {
        const { liker_id, target_id } = req.body;
        
        if (!liker_id || !target_id) {
            return res.status(400).json({
                success: false,
                message: "liker_id와 target_id가 필요합니다."
            });
        }

        if (liker_id === target_id) {
            return res.status(400).json({
                success: false,
                message: "자기 자신에게는 좋아요를 누를 수 없습니다."
            });
        }

        const isLiked = await Like.toggleLike(liker_id, target_id);
        const likeCount = await Like.getLikeCount(target_id);

        res.status(200).json({
            success: true,
            message: isLiked ? "좋아요를 눌렀습니다!" : "좋아요를 취소했습니다!",
            isLiked: isLiked,
            likeCount: likeCount
        });

    } catch (error) {
        console.error("좋아요 토글 오류:", error);
        res.status(500).json({
            success: false,
            message: "좋아요 처리 중 오류가 발생했습니다."
        });
    }
};

// 특정 사용자의 좋아요 수 조회
export const getLikeCount = async (req, res) => {
    try {
        const { target_id } = req.params;
        
        if (!target_id) {
            return res.status(400).json({
                success: false,
                message: "target_id가 필요합니다."
            });
        }

        const likeCount = await Like.getLikeCount(target_id);

        res.status(200).json({
            success: true,
            likeCount: likeCount
        });

    } catch (error) {
        console.error("좋아요 수 조회 오류:", error);
        res.status(500).json({
            success: false,
            message: "좋아요 수 조회 중 오류가 발생했습니다."
        });
    }
};

// 특정 사용자가 특정 대상에게 좋아요를 눌렀는지 확인
export const checkLikeStatus = async (req, res) => {
    try {
        const { liker_id, target_id } = req.query;
        
        if (!liker_id || !target_id) {
            return res.status(400).json({
                success: false,
                message: "liker_id와 target_id가 필요합니다."
            });
        }

        const hasLiked = await Like.hasLiked(liker_id, target_id);

        res.status(200).json({
            success: true,
            hasLiked: hasLiked
        });

    } catch (error) {
        console.error("좋아요 상태 확인 오류:", error);
        res.status(500).json({
            success: false,
            message: "좋아요 상태 확인 중 오류가 발생했습니다."
        });
    }
};
