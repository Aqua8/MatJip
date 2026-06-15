package com.matjip.backend.service;

import com.matjip.backend.domain.Restaurant;
import com.matjip.backend.dto.RestaurantRequest;
import com.matjip.backend.dto.RestaurantResponse;
import com.matjip.backend.repository.LikeRepository;
import com.matjip.backend.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RestaurantService {
    private final RestaurantRepository restaurantRepository;
    private final LikeRepository likeRepository;

    public List<RestaurantResponse> search(String keyword) {
        List<Restaurant> list = (keyword == null || keyword.isBlank())
                ? restaurantRepository.findAll()
                : restaurantRepository.findByNameContainingOrAddressContaining(keyword, keyword);
        return list.stream()
                .map(r -> new RestaurantResponse(r, likeRepository.countByRestaurantId(r.getId())))
                .collect(Collectors.toList());
    }

    public RestaurantResponse getById(Long id) {
        Restaurant r = restaurantRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("맛집을 찾을 수 없습니다."));
        return new RestaurantResponse(r, likeRepository.countByRestaurantId(r.getId()));
    }

    public RestaurantResponse register(RestaurantRequest req) {
        Restaurant restaurant = restaurantRepository.findByKakaoPlaceId(req.getKakaoPlaceId())
                .orElseGet(() -> restaurantRepository.save(
                        new Restaurant(req.getKakaoPlaceId(), req.getName(), req.getAddress(),
                                req.getCategory(), req.getLat(), req.getLng())));
        return new RestaurantResponse(restaurant, likeRepository.countByRestaurantId(restaurant.getId()));
    }
}
