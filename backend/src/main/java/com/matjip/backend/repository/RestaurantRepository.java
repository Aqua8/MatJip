package com.matjip.backend.repository;

import com.matjip.backend.domain.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
    Optional<Restaurant> findByKakaoPlaceId(String kakaoPlaceId);
    List<Restaurant> findByNameContainingOrAddressContaining(String name, String address);
}
