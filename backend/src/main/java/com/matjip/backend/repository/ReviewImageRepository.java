package com.matjip.backend.repository;

import com.matjip.backend.domain.ReviewImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface ReviewImageRepository extends JpaRepository<ReviewImage, Long> {
    Optional<ReviewImage> findFirstByReview_Restaurant_IdOrderByIdDesc(Long restaurantId);

    // 목록 조회용: 맛집마다 가장 최근(id가 가장 큰) 리뷰 이미지 url을 한 번에 조회 (행: [restaurantId, imageUrl])
    @Query("SELECT i.review.restaurant.id, i.imageUrl FROM ReviewImage i WHERE i.id IN (" +
           "SELECT MAX(i2.id) FROM ReviewImage i2 WHERE i2.review.restaurant.id IN :restaurantIds GROUP BY i2.review.restaurant.id)")
    List<Object[]> findLatestImageUrlByRestaurantIds(@Param("restaurantIds") Collection<Long> restaurantIds);
}
