package com.matjip.backend.service;

import com.matjip.backend.domain.Restaurant;
import com.matjip.backend.domain.User;
import com.matjip.backend.dto.RestaurantRequest;
import com.matjip.backend.dto.RestaurantResponse;
import com.matjip.backend.repository.LikeRepository;
import com.matjip.backend.repository.RestaurantRepository;
import com.matjip.backend.repository.ReviewImageRepository;
import com.matjip.backend.repository.ReviewRepository;
import com.matjip.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RestaurantService {
    private final RestaurantRepository restaurantRepository;
    private final LikeRepository likeRepository;
    private final ReviewRepository reviewRepository;
    private final ReviewImageRepository reviewImageRepository;
    private final UserRepository userRepository;

    private String thumbnailOf(Long restaurantId) {
        return reviewImageRepository.findFirstByReview_Restaurant_IdOrderByIdDesc(restaurantId)
                .map(img -> img.getImageUrl())
                .orElse(null);
    }

    public List<RestaurantResponse> search(String keyword) {
        List<Restaurant> list = (keyword == null || keyword.isBlank())
                ? restaurantRepository.findAllWithBookmarks()
                : restaurantRepository.findWithBookmarksByKeyword(keyword);
        return list.stream()
                .map(r -> new RestaurantResponse(r,
                        likeRepository.countByRestaurantId(r.getId()),
                        reviewRepository.avgRatingByRestaurantId(r.getId()),
                        false,
                        thumbnailOf(r.getId())))
                .collect(Collectors.toList());
    }

    public RestaurantResponse getById(Long id, String email) {
        Restaurant r = restaurantRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("맛집을 찾을 수 없습니다."));
        boolean liked = false;
        if (email != null) {
            User user = userRepository.findByEmail(email).orElse(null);
            if (user != null) {
                liked = likeRepository.existsByUserIdAndRestaurantId(user.getId(), id);
            }
        }
        return new RestaurantResponse(r,
                likeRepository.countByRestaurantId(r.getId()),
                reviewRepository.avgRatingByRestaurantId(r.getId()),
                liked,
                thumbnailOf(r.getId()));
    }

    public RestaurantResponse register(RestaurantRequest req) {
        Restaurant restaurant = restaurantRepository.findByKakaoPlaceId(req.getKakaoPlaceId())
                .orElseGet(() -> restaurantRepository.save(
                        new Restaurant(req.getKakaoPlaceId(), req.getName(), req.getAddress(),
                                req.getCategory(), req.getLat(), req.getLng())));
        return new RestaurantResponse(restaurant,
                likeRepository.countByRestaurantId(restaurant.getId()),
                reviewRepository.avgRatingByRestaurantId(restaurant.getId()),
                false,
                thumbnailOf(restaurant.getId()));
    }
}
