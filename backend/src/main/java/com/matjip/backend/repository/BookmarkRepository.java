package com.matjip.backend.repository;

import com.matjip.backend.domain.Bookmark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {
    Optional<Bookmark> findByUserIdAndRestaurantId(Long userId, Long restaurantId);
    List<Bookmark> findByUserId(Long userId);

    // 즐겨찾기 목록용: 맛집을 함께 가져와 맛집마다 추가 조회(N+1)가 나가지 않게 한다
    @Query("SELECT b FROM Bookmark b JOIN FETCH b.restaurant WHERE b.user.id = :userId")
    List<Bookmark> findByUserIdWithRestaurant(@Param("userId") Long userId);
}
