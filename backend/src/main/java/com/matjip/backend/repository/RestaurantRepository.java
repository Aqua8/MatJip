package com.matjip.backend.repository;

import com.matjip.backend.domain.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
    Optional<Restaurant> findByKakaoPlaceId(String kakaoPlaceId);
    List<Restaurant> findByNameContainingOrAddressContaining(String name, String address);

    @Query("SELECT r FROM Restaurant r WHERE EXISTS (SELECT b FROM Bookmark b WHERE b.restaurant = r)")
    List<Restaurant> findAllWithBookmarks();

    @Query("SELECT r FROM Restaurant r WHERE EXISTS (SELECT b FROM Bookmark b WHERE b.restaurant = r) AND (r.name LIKE %:keyword% OR r.address LIKE %:keyword%)")
    List<Restaurant> findWithBookmarksByKeyword(@Param("keyword") String keyword);
}
