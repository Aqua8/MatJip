package com.matjip.backend.service;

import com.matjip.backend.domain.*;
import com.matjip.backend.dto.RestaurantResponse;
import com.matjip.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookmarkService {
    private final BookmarkRepository bookmarkRepository;
    private final RestaurantRepository restaurantRepository;
    private final UserRepository userRepository;
    private final LikeRepository likeRepository;
    private final ReviewRepository reviewRepository;
    private final ReviewImageRepository reviewImageRepository;

    @Transactional(readOnly = true)
    public List<RestaurantResponse> getBookmarks(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return bookmarkRepository.findByUserId(user.getId()).stream()
                .map(b -> new RestaurantResponse(b.getRestaurant(),
                        likeRepository.countByRestaurantId(b.getRestaurant().getId()),
                        reviewRepository.avgRatingByRestaurantId(b.getRestaurant().getId()),
                        likeRepository.existsByUserIdAndRestaurantId(user.getId(), b.getRestaurant().getId()),
                        reviewImageRepository.findFirstByReview_Restaurant_IdOrderByIdDesc(b.getRestaurant().getId())
                                .map(img -> img.getImageUrl()).orElse(null)))
                .collect(Collectors.toList());
    }

    @Transactional
    public Map<String, Boolean> toggle(Long restaurantId, String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new IllegalArgumentException("맛집을 찾을 수 없습니다."));
        Optional<Bookmark> existing = bookmarkRepository.findByUserIdAndRestaurantId(user.getId(), restaurantId);
        if (existing.isPresent()) {
            bookmarkRepository.delete(existing.get());
            return Map.of("bookmarked", false);
        } else {
            bookmarkRepository.save(new Bookmark(user, restaurant));
            return Map.of("bookmarked", true);
        }
    }
}
