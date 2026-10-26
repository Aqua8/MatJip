package com.matjip.backend.repository;

import com.matjip.backend.domain.Like;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface LikeRepository extends JpaRepository<Like, Long> {
    Optional<Like> findByUserIdAndRestaurantId(Long userId, Long restaurantId);
    long countByRestaurantId(Long restaurantId);
    boolean existsByUserIdAndRestaurantId(Long userId, Long restaurantId);

    // 목록 조회용: 맛집 여러 개의 좋아요 수를 한 번에 집계 (행: [restaurantId, count])
    @Query("SELECT l.restaurant.id, COUNT(l) FROM Like l WHERE l.restaurant.id IN :restaurantIds GROUP BY l.restaurant.id")
    List<Object[]> countGroupedByRestaurantIds(@Param("restaurantIds") Collection<Long> restaurantIds);

    // 목록 조회용: 사용자가 좋아요한 맛집 id만 한 번에 조회
    @Query("SELECT l.restaurant.id FROM Like l WHERE l.user.id = :userId AND l.restaurant.id IN :restaurantIds")
    List<Long> findLikedRestaurantIds(@Param("userId") Long userId, @Param("restaurantIds") Collection<Long> restaurantIds);
}
