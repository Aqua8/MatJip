package com.matjip.backend.repository;

import com.matjip.backend.domain.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Collection;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByRestaurantId(Long restaurantId);
    List<Review> findByUserId(Long userId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.restaurant.id = :restaurantId")
    Double avgRatingByRestaurantId(@Param("restaurantId") Long restaurantId);

    // 목록 조회용: 맛집 여러 개의 평균 별점을 한 번에 집계 (행: [restaurantId, avg])
    @Query("SELECT r.restaurant.id, AVG(r.rating) FROM Review r WHERE r.restaurant.id IN :restaurantIds GROUP BY r.restaurant.id")
    List<Object[]> avgRatingGroupedByRestaurantIds(@Param("restaurantIds") Collection<Long> restaurantIds);
}
