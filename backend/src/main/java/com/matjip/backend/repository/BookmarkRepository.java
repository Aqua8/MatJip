package com.matjip.backend.repository;

import com.matjip.backend.domain.Bookmark;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {
    Optional<Bookmark> findByUserIdAndRestaurantId(Long userId, Long restaurantId);
    List<Bookmark> findByUserId(Long userId);
}
