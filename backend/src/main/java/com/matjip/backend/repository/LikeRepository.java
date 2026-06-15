package com.matjip.backend.repository;

import com.matjip.backend.domain.Like;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface LikeRepository extends JpaRepository<Like, Long> {
    Optional<Like> findByUserIdAndRestaurantId(Long userId, Long restaurantId);
    long countByRestaurantId(Long restaurantId);
}
