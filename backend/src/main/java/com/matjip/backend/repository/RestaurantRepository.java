package com.matjip.backend.repository;

import com.matjip.backend.domain.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
    Optional<Restaurant> findByKakaoPlaceId(String kakaoPlaceId);

    @Query("SELECT r FROM Restaurant r WHERE EXISTS (SELECT b FROM Bookmark b WHERE b.restaurant = r) OR EXISTS (SELECT v FROM Review v WHERE v.restaurant = r)")
    List<Restaurant> findAllVisible();

    @Query("SELECT r FROM Restaurant r WHERE (EXISTS (SELECT b FROM Bookmark b WHERE b.restaurant = r) OR EXISTS (SELECT v FROM Review v WHERE v.restaurant = r)) AND (r.name LIKE %:keyword% OR r.address LIKE %:keyword%)")
    List<Restaurant> findVisibleByKeyword(@Param("keyword") String keyword);
}
