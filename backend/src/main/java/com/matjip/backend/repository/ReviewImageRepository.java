package com.matjip.backend.repository;

import com.matjip.backend.domain.ReviewImage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ReviewImageRepository extends JpaRepository<ReviewImage, Long> {
    Optional<ReviewImage> findFirstByReview_Restaurant_IdOrderByIdDesc(Long restaurantId);
}
